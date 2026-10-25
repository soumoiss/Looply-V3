// Secure, operator-gated Supabase -> Neon media transfer using short-lived URLs.
// Never commit manifests containing signed URLs, passwords or private file contents.
import { createHash } from "node:crypto";
import { open, readFile } from "node:fs/promises";

const SOURCE_HOST = "qixocgetiwlrsbadpbvh.supabase.co";
const NEON_HOST = "br-round-fog-b7pseu7j.storage.c-13.us-east-1.aws.neon.tech";
const BUCKETS = new Set([
  "looply-announcements", "looply-avatars", "looply-chat",
  "looply-gallery", "looply-letters", "looply-media",
  "looply-secret-messages"
]);
const MAX_ITEM_BYTES = 256 * 1024 * 1024;
const MAX_MANIFEST_BYTES = 2 * 1024 * 1024;

export function assertSignedUrl(value, hostname) {
  if (typeof value !== "string" || value.length > 8192) throw new Error("Signed URL missing or too large");
  let u;
  try { u = new URL(value); } catch { throw new Error("Invalid signed URL"); }
  if (u.protocol !== "https:" || u.hostname !== hostname || u.username || u.password || u.hash)
    throw new Error("Signed URL host/protocol mismatch");
  return u;
}

export function validateManifest(document, requireUrls = false) {
  if (!document || !Array.isArray(document.items) || document.items.length > 1500)
    throw new Error("Invalid media manifest");
  const seen = new Set();
  let total = 0;
  for (const item of document.items) {
    if (!item || !BUCKETS.has(item.bucket) ||
        typeof item.key !== "string" || !item.key || item.key.length > 1024 ||
        item.key.startsWith("/") || item.key.includes("\\") ||
        item.key.split("/").some(segment => segment === "." || segment === ".." || !segment) ||
        /[\u0000-\u001f]/.test(item.key)) throw new Error("Invalid media bucket/object key");
    if (!Number.isSafeInteger(item.sizeBytes) || item.sizeBytes < 0 || item.sizeBytes > MAX_ITEM_BYTES)
      throw new Error("Invalid media size");
    if (typeof item.contentType !== "string" ||
        !/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/i.test(item.contentType))
      throw new Error("Invalid media content type");
    const id = item.bucket + "/" + item.key;
    if (seen.has(id)) throw new Error("Duplicate media key");
    seen.add(id);
    total += item.sizeBytes;
    if (requireUrls) {
      const source = assertSignedUrl(item.sourceUrl, SOURCE_HOST);
      const upload = assertSignedUrl(item.uploadUrl, NEON_HOST);
      const verify = assertSignedUrl(item.verifyUrl, NEON_HOST);
      const expectedSourcePath = `/storage/v1/object/sign/${item.bucket}/${item.key}`;
      const expectedTargetPath = `/${item.bucket}/${item.key}`;
      for (const [label, actual, expected] of [
        ["source", source, expectedSourcePath],
        ["upload", upload, expectedTargetPath],
        ["verification", verify, expectedTargetPath]
      ]) {
        let decoded;
        try { decoded = decodeURIComponent(actual.pathname); }
        catch { throw new Error(`Invalid ${label} path encoding`); }
        if (decoded !== expected) throw new Error(`Signed ${label} URL does not match object key`);
      }
      if (!source.searchParams.has("token") ||
          !upload.searchParams.has("X-Amz-Signature") ||
          !verify.searchParams.has("X-Amz-Signature")) {
        throw new Error("Missing signed URL verification parameters");
      }
    }
  }
  if (total > 5 * 1024 * 1024 * 1024) throw new Error("Manifest exceeds Neon Free storage budget");
  return { objects: document.items.length, totalBytes: total };
}

async function readExactBody(response, expectedSize) {
  if (!response?.ok || !response.body) throw new Error("Object transfer HTTP request failed");
  const hash = createHash("sha256");
  const chunks = [];
  let length = 0;
  for await (const bytes of response.body) {
    length += bytes.byteLength;
    if (length > expectedSize || length > MAX_ITEM_BYTES) throw new Error("Object exceeds inventory size");
    const data = Buffer.from(bytes);
    hash.update(data);
    chunks.push(data);
  }
  if (length !== expectedSize) throw new Error("Object size differs from inventory");
  return { bytes: Buffer.concat(chunks), hash: hash.digest("hex") };
}

export async function transferOne(item, transport = fetch) {
  validateManifest({ items: [item] }, true);
  const source = await transport(item.sourceUrl, { method: "GET", redirect: "error" });
  const sourceContent = await readExactBody(source, item.sizeBytes);
  const upload = await transport(item.uploadUrl, {
    method: "PUT", redirect: "error",
    headers: { "content-type": item.contentType },
    body: sourceContent.bytes
  });
  if (!upload.ok) throw new Error("Target upload failed");
  const verification = await transport(item.verifyUrl, { method: "GET", redirect: "error" });
  const targetContent = await readExactBody(verification, item.sizeBytes);
  if (targetContent.hash !== sourceContent.hash) throw new Error("Uploaded object failed SHA-256 verification");
  return { bytes: item.sizeBytes, sha256: targetContent.hash, verified: true };
}

export async function run(args = process.argv.slice(2)) {
  const execute = args.includes("--execute");
  if (args.some(arg => arg !== "--execute" && arg !== "--dry-run" && !arg.startsWith("--manifest=") && !arg.startsWith("--receipt-file=")))
    throw new Error("Allowed arguments: --dry-run --manifest=FILE | --execute --manifest=FILE --receipt-file=FILE");
  if (execute && process.env.LOOPLY_V3_ALLOW_MEDIA_UPLOAD !== "YES")
    throw new Error("Execution is locked; set explicit staging upload permission");
  const receiptArg = args.find(arg => arg.startsWith("--receipt-file="));
  if (execute && (!receiptArg || receiptArg.length <= "--receipt-file=".length))
    throw new Error("Secure local receipt file is required for uploads");
  const pathArg = args.find(arg => arg.startsWith("--manifest="));
  if (!pathArg) throw new Error("Signed media manifest path is required");
  const filename = pathArg.slice("--manifest=".length);
  const raw = await readFile(filename);
  if (raw.byteLength > MAX_MANIFEST_BYTES) throw new Error("Manifest too large");
  const manifest = JSON.parse(raw.toString("utf8"));
  const summary = validateManifest(manifest, execute);
  if (!execute) {
    process.stdout.write(JSON.stringify({ mode: "dry-run", ...summary }) + "\n");
    return summary;
  }
  let verified = 0;
  let bytes = 0;
  // Exclusive create prevents clobbering; local JSONL never stores signed URLs.
  const receiptHandle = await open(receiptArg.slice("--receipt-file=".length), "wx", 0o600);
  try {
    for (const item of manifest.items) {
      const result = await transferOne(item);
      verified++;
      bytes += result.bytes;
      await receiptHandle.writeFile(JSON.stringify({
        bucket_id: item.bucket, object_name: item.key,
        size_bytes: result.bytes, sha256: result.sha256
      }) + "\\n");
      // Never log object keys, private URLs, credentials or file bytes.
      process.stdout.write(JSON.stringify({ mode: "upload", verified, total: summary.objects }) + "\\n");
    }
  } finally {
    await receiptHandle.close();
  }
  return { verified, bytes };
}

if (process.argv[1] && import.meta.url === new URL("file://" + process.argv[1]).href) {
  run().catch(err => {
    console.error("Staging media migration stopped:", err.message);
    process.exitCode = 1;
  });
}
