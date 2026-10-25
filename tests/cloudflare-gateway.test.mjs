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
