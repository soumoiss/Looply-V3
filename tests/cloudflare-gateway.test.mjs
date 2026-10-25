import test from "node:test";
import assert from "node:assert/strict";
import worker from "../backend/cloudflare/worker.mjs";

const BASE="https://looply-v3-staging.s0upoetamoiss.workers.dev";

test("status route never claims V3 production readiness", async()=>{
 const r=await worker.fetch(new Request(BASE+"/health"));
 assert.equal(r.status,200);
 const json=await r.json();
 assert.equal(json.backend,"neon");
 assert.equal(json.production_ready,false);
 assert.equal(json.media_migrated,false);
 assert.equal(json.auth_migrated,false);
});

test("self profile requires bearer JWT before any database request", async()=>{
 const original=globalThis.fetch;
 let called=0;
 globalThis.fetch=async()=>{called++;throw Error("not allowed")};
 try{
  for(const headers of [{}, {authorization:"Bearer malformed token"},{authorization:"Basic hack"}]){
   const r=await worker.fetch(new Request(BASE+"/api/self-profile",{headers}));
   assert.equal(r.status,401);
  }
  assert.equal(called,0);
 }finally{globalThis.fetch=original;}
});

test("authenticated profile fetch uses only fixed Neon Data API endpoint and sanitizes fields",async()=>{
 const original=globalThis.fetch;
 let url,authorization;
 globalThis.fetch=async (u,opts)=>{
  url=String(u);authorization=opts.headers.authorization;
  return new Response(JSON.stringify([{id:"uuid",username:"me",display_name:"Me",bio:null,theme:"dark",avatar_path:null,secret_admin_token:"MUST_NOT_LEAK"}]),{status:200});
 };
 try{
  const r=await worker.fetch(new Request(BASE+"/api/self-profile?select=*",{headers:{authorization:"Bearer a.b.c"}}));
  assert.equal(r.status,200);
  const json=await r.json();
  assert.deepEqual(json.profiles,[{id:"uuid",username:"me",display_name:"Me",bio:null,theme:"dark",avatar_path:null}]);
  assert.equal(authorization,"Bearer a.b.c");
  assert.ok(url.includes(".apirest.") && url.includes("/v3_self_profile?select=id,username"));
  assert.ok(!url.includes("select=*"));
  assert.equal(r.headers.get("cache-control"),"no-store");
 }finally{globalThis.fetch=original;}
});

test("other protected resources fail closed",async()=>{
 for(const [method,path,status] of [["POST","/api/self-profile",405],["GET","/api/admin",404],["GET","/api/chat",404]]){
  const r=await worker.fetch(new Request(BASE+path,{method}));
  assert.equal(r.status,status);
 }
});

test("upstream failures return no internal details",async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async()=>new Response(JSON.stringify({message:"private backend error"}),{status:500});
 try{
  const r=await worker.fetch(new Request(BASE+"/api/self-profile",{headers:{authorization:"Bearer a.b.c"}}));
  assert.equal(r.status,503);
  assert.equal((await r.text()).includes("private backend error"),false);
 }finally{globalThis.fetch=original;}
});

test("feed rejects requests without JWT before any data API call",async()=>{
 const orig=globalThis.fetch;
 let calls=0;
 globalThis.fetch=async()=>{calls++;throw Error("network should not run")};
 try{
  const r=await worker.fetch(new Request(BASE+"/api/feed"));
  assert.equal(r.status,401);
  assert.equal(calls,0);
 }finally{globalThis.fetch=orig}
});

test("feed request pins read-only Neon query and sanitizes response fields",async()=>{
 const orig=globalThis.fetch;
 let endpoint,method,authorization;
 globalThis.fetch=async (url,opts)=>{
  endpoint=String(url);method=opts.method;authorization=opts.headers.authorization;
  return new Response(JSON.stringify([{id:"post-1",author_id:"user-1",body:"Hello",visibility:"public",created_at:"2026-10-25T00:00:00Z",updated_at:null,external_url:null,secret:"must-not-leak"}]),{status:200});
 };
 try{
  const r=await worker.fetch(new Request(BASE+"/api/feed?select=*&limit=9999",{headers:{authorization:"Bearer test.jwt.signature"}}));
  assert.equal(r.status,200);
  const body=await r.json();
  assert.equal(body.posts.length,1);
  assert.equal(body.posts[0].secret,undefined);
  assert.ok(endpoint.includes("/v3_feed_posts?select=id,author_id") && endpoint.includes("limit=25"));
  assert.equal(endpoint.includes("9999"),false);
  assert.equal(method,"GET");
  assert.equal(authorization,"Bearer test.jwt.signature");
 }finally{globalThis.fetch=orig}
});

test("claim endpoint requires same origin and explicit bearer JWT",async()=>{
 const orig=globalThis.fetch;
 let calls=0;
 globalThis.fetch=async()=>{calls++;throw Error("network should not run")};
 try{
  const one=await worker.fetch(new Request(BASE+"/api/claim-profile",{method:"POST",headers:{origin:"https://evil.example",authorization:"Bearer test.jwt.signature"}}));
  assert.equal(one.status,403);
  const two=await worker.fetch(new Request(BASE+"/api/claim-profile",{method:"POST",headers:{origin:BASE}}));
  assert.equal(two.status,401);
  assert.equal(calls,0);
 }finally{globalThis.fetch=orig}
});

test("claim endpoint passes JWT only to fixed Neon RPC and returns boolean",async()=>{
 const orig=globalThis.fetch;
 let endpoint,method;
 globalThis.fetch=async(url,opts)=>{
  endpoint=String(url);method=opts.method;
  assert.equal(opts.body,"{}");
  return new Response("false",{status:200});
 };
 try{
  const r=await worker.fetch(new Request(BASE+"/api/claim-profile",{method:"POST",headers:{origin:BASE,authorization:"Bearer valid.jwt.token"}}));
  assert.equal(r.status,200);
  assert.deepEqual(await r.json(),{claimed:false});
  assert.ok(endpoint.endsWith("/rpc/v3_claim_legacy_profile"));
  assert.equal(method,"POST");
 }finally{globalThis.fetch=orig}
});
