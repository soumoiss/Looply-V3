import test from "node:test";
import assert from "node:assert/strict";
import { assertSignedUrl, validateManifest, transferOne } from "../backend/neon/scripts/media-transfer.mjs";

const original = "https://qixocgetiwlrsbadpbvh.supabase.co/storage/v1/object/sign/looply-media/preview.jpg?token=test";
const target = "https://br-round-fog-b7pseu7j.storage.c-13.us-east-1.aws.neon.tech/looply-media/preview.jpg?X-Amz-Signature=test";
const item = {
  bucket: "looply-media", key: "preview.jpg", sizeBytes: 7,
  contentType: "image/jpeg", sourceUrl: original, uploadUrl: target, verifyUrl: target
};

test("media manifest permits exact approved staging endpoints only", () => {
  assert.deepEqual(validateManifest({ items: [item] }, true), { objects: 1, totalBytes: 7 });
  assert.throws(() => assertSignedUrl("http://qixocgetiwlrsbadpbvh.supabase.co/private", "qixocgetiwlrsbadpbvh.supabase.co"));
  assert.throws(() => assertSignedUrl("https://evil.example/private", "qixocgetiwlrsbadpbvh.supabase.co"));
  assert.throws(() => validateManifest({ items: [{ ...item, uploadUrl: "https://attacker.example/file" }] }, true));
  assert.throws(() => validateManifest({ items: [{ ...item, uploadUrl: target.replace("preview.jpg", "some-other-user.jpg") }] }, true));
  assert.throws(() => validateManifest({ items: [{ ...item, sourceUrl: original.replace("preview.jpg", "some-other-user.jpg") }] }, true));
  assert.throws(() => validateManifest({ items: [{ ...item, sourceUrl: original.replace("token=test", "not-a-token=test") }] }, true));
  assert.throws(() => validateManifest({ items: [{ ...item, verifyUrl: target.replace("X-Amz-Signature=test", "signature=test") }] }, true));
  assert.throws(() => validateManifest({ items: [{ ...item, key: "../secret" }] }, true));
  assert.throws(() => validateManifest({ items: [item, item] }, true));
});

test("binary source to Neon upload verifies identical destination bytes with SHA-256", async () => {
  const input=Buffer.from("1234567");
  const events = [];
  const transport=async (url, options) => {
    events.push({ method: options.method, url });
    if (options.method === "PUT") {
      assert.equal(options.headers["content-type"], "image/jpeg");
      assert.deepEqual(Buffer.from(options.body), input);
      return new Response(null, { status: 200 });
    }
    return new Response(input, { status: 200 });
  };
  const result = await transferOne(item, transport);
  assert.equal(result.verified, true);
  assert.equal(result.bytes, 7);
  assert.match(result.sha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(events.map(x=>x.method), ["GET","PUT","GET"]);
});

test("migration rejects truncated source and mismatched stored media", async () => {
  await assert.rejects(transferOne(item, async()=>new Response("tiny",{status:200})),/size differs/);
  let requests=0;
  await assert.rejects(transferOne(item, async (_url, options)=>{
    requests++;
    if (options.method==="PUT") return new Response(null,{status:200});
    return new Response(requests>2?"7654321":"1234567",{status:200});
  }),/SHA-256 verification/);
});

test("no transfer occurs without proper destination URL and size", async () => {
  const oversized={ ...item, sizeBytes: 300 * 1024 * 1024 };
  await assert.rejects(transferOne(oversized, async()=>{throw new Error("network must not run")}),/Invalid media size/);
});
