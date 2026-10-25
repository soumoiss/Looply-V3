import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { run } from "../backend/neon/scripts/media-transfer.mjs";

const file = {
  bucket: "looply-media",
  key: "demo-item",
  sizeBytes: 4,
  contentType: "text/plain",
  sourceUrl: "https://qixocgetiwlrsbadpbvh.supabase.co/storage/v1/object/sign/looply-media/demo-item?token=test",
  uploadUrl: "https://br-round-fog-b7pseu7j.storage.c-13.us-east-1.aws.neon.tech/looply-media/demo-item?X-Amz-Signature=test",
  verifyUrl: "https://br-round-fog-b7pseu7j.storage.c-13.us-east-1.aws.neon.tech/looply-media/demo-item?X-Amz-Signature=test"
};

test("media runner refuses execution without explicit authorization", async () => {
  const previous = process.env.LOOPLY_V3_ALLOW_MEDIA_UPLOAD;
  delete process.env.LOOPLY_V3_ALLOW_MEDIA_UPLOAD;
  try {
    await assert.rejects(
      run(["--execute","--manifest=/nonexistent","--receipt-file=/nonexistent"]),
      /Execution is locked/
    );
  } finally {
    if (previous === undefined) delete process.env.LOOPLY_V3_ALLOW_MEDIA_UPLOAD;
    else process.env.LOOPLY_V3_ALLOW_MEDIA_UPLOAD = previous;
  }
});

test("media runner supports safe dry-run without signed URLs or transfer", async () => {
  const folder = await mkdtemp(join(tmpdir(), "looply-media-test-"));
  try {
    const manifestPath=join(folder,"manifest.json");
    await writeFile(manifestPath,JSON.stringify({items:[{
      bucket:"looply-media",key:"demo-item",sizeBytes:4,contentType:"text/plain"
    }]}));
    const result=await run(["--dry-run",`--manifest=${manifestPath}`]);
    assert.deepEqual(result,{objects:1,totalBytes:4});
  } finally {
    await rm(folder,{recursive:true,force:true});
  }
});

test("mocked binary transfer writes a private digest receipt without leaking URL tokens", async () => {
  const folder = await mkdtemp(join(tmpdir(), "looply-media-test-"));
  const previousFetch=globalThis.fetch;
  const previousPermit=process.env.LOOPLY_V3_ALLOW_MEDIA_UPLOAD;
  const originalWrite=process.stdout.write;
  try {
    const manifestPath=join(folder,"manifest.json");
    const receiptPath=join(folder,"receipts.jsonl");
    await writeFile(manifestPath,JSON.stringify({items:[file]}));
    process.env.LOOPLY_V3_ALLOW_MEDIA_UPLOAD="YES";
    globalThis.fetch=async (_url,options)=>{
      if(options.method==="PUT") return new Response(null,{status:200});
      return new Response("data",{status:200});
    };
    process.stdout.write=()=>true;
    const result=await run(["--execute",`--manifest=${manifestPath}`,`--receipt-file=${receiptPath}`]);
    assert.deepEqual(result,{verified:1,bytes:4});
    const raw=await readFile(receiptPath,"utf8");
    const row=JSON.parse(raw.trim());
    assert.deepEqual(Object.keys(row),["bucket_id","object_name","size_bytes","sha256"]);
    assert.equal(row.bucket_id,"looply-media");
    assert.equal(row.object_name,"demo-item");
    assert.equal(row.size_bytes,4);
    assert.match(row.sha256,/^[a-f0-9]{64}$/);
    assert.ok(raw.endsWith("\n"));
    assert.ok(!raw.includes("token=test") && !raw.includes("X-Amz-Signature"));
    if(process.platform!=="win32") assert.equal((await stat(receiptPath)).mode & 0o777,0o600);
    await assert.rejects(
      run(["--execute",`--manifest=${manifestPath}`,`--receipt-file=${receiptPath}`]),
      /EEXIST/
    );
  } finally {
    globalThis.fetch=previousFetch;
    process.stdout.write=originalWrite;
    if(previousPermit===undefined) delete process.env.LOOPLY_V3_ALLOW_MEDIA_UPLOAD;
    else process.env.LOOPLY_V3_ALLOW_MEDIA_UPLOAD=previousPermit;
    await rm(folder,{recursive:true,force:true});
  }
});
