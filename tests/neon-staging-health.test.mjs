import test from "node:test";
import assert from "node:assert/strict";
import handler from "../backend/neon/functions/staginghealth/index.mjs";

test("staging health is explicit and contains no production readiness claim", async () => {
  const response = await handler.fetch(new Request("https://staging.example.invalid/health"));
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/json/);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  const payload = await response.json();
  assert.deepEqual(payload, {
    service: "looply-v3-backend",
    environment: "staging",
    probe: "function-runtime",
    ready_for_production: false
  });
  assert.equal(Object.keys(payload).length, 4);
});

test("staging probe refuses data access, writes and unknown routes", async () => {
  for (const [method,path,expected] of [
    ["POST","/health",405],
    ["PUT","/health",405],
    ["DELETE","/health",405],
    ["GET","/profiles",404],
    ["GET","/admin",404],
  ]) {
    const response = await handler.fetch(new Request("https://staging.example.invalid"+path,{method}));
    assert.equal(response.status, expected, method+" "+path);
  }
});

test("HEAD omits body", async () => {
  const response=await handler.fetch(new Request("https://staging.example.invalid/health",{method:"HEAD"}));
  assert.equal(response.status,200);
  assert.equal(await response.text(),"");
});
