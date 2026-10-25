-- Private ledger: contains only verified object IDs, sizes and SHA-256 digests.
-- No credentials, signed URLs or file contents are persisted.
-- A ledger entry is meaningful only after an actual binary round-trip check.
CREATE TABLE IF NOT EXISTS looply_migration.verified_media_receipts (
  bucket_id text NOT NULL,
  object_name text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes >= 0),
  sha256 text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  verification_method text NOT NULL DEFAULT 'source-target-sha256'
    CHECK (verification_method='source-target-sha256'),
  verified_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (bucket_id, object_name),
  FOREIGN KEY (bucket_id, object_name)
    REFERENCES looply_migration.storage_object_inventory(bucket_id, object_name)
    ON DELETE RESTRICT
);
ALTER TABLE looply_migration.verified_media_receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE looply_migration.verified_media_receipts FROM PUBLIC, anonymous, authenticated;

-- Owner-only insert guard checks inventoried size; no unverifiable upsert.
CREATE OR REPLACE FUNCTION looply_migration.record_verified_media(
  p_bucket_id text, p_object_name text, p_size_bytes bigint, p_sha256 text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
AS $func$
DECLARE
  v_size bigint;
BEGIN
  IF p_bucket_id IS NULL OR p_object_name IS NULL OR p_size_bytes IS NULL
     OR p_size_bytes < 0 OR p_sha256 !~ '^[0-9a-f]{64}$' THEN
    RETURN false;
  END IF;
  SELECT (source_object->'metadata'->>'size')::bigint
  INTO v_size
  FROM looply_migration.storage_object_inventory
  WHERE bucket_id = p_bucket_id AND object_name = p_object_name;
  IF v_size IS NULL OR v_size <> p_size_bytes THEN
    RETURN false;
  END IF;
  INSERT INTO looply_migration.verified_media_receipts
    (bucket_id,object_name,size_bytes,sha256)
  VALUES (p_bucket_id,p_object_name,p_size_bytes,p_sha256)
  ON CONFLICT (bucket_id,object_name) DO NOTHING;
  RETURN EXISTS(
    SELECT 1 FROM looply_migration.verified_media_receipts
    WHERE bucket_id=p_bucket_id AND object_name=p_object_name
      AND size_bytes=p_size_bytes AND sha256=p_sha256
  );
END;
$func$;
REVOKE ALL ON FUNCTION looply_migration.record_verified_media(text,text,bigint,text)
  FROM PUBLIC, anonymous, authenticated;

CREATE OR REPLACE VIEW looply_migration.media_integrity_readiness
WITH (security_invoker=true)
AS
SELECT count(*)::integer AS catalogued_objects,
       count(receipt.sha256)::integer AS verified_sha256_receipts,
       count(receipt.sha256) FILTER(
         WHERE receipt.size_bytes=(inventory.source_object->'metadata'->>'size')::bigint
       )::integer AS verified_size_and_hash_records,
       coalesce(sum((inventory.source_object->'metadata'->>'size')::bigint),0)::bigint AS inventoried_bytes
FROM looply_migration.storage_object_inventory AS inventory
LEFT JOIN looply_migration.verified_media_receipts AS receipt
  ON receipt.bucket_id=inventory.bucket_id AND receipt.object_name=inventory.object_name;
REVOKE ALL ON TABLE looply_migration.media_integrity_readiness
  FROM PUBLIC, anonymous, authenticated;
