import test from "node:test";
import assert from "node:assert/strict";
import { normalizeIdentity, authenticateOriginal, getOwnOriginalProfile } from "../src/alternate-login-core.js";

const userId = "11111111-1111-4111-8111-111111111111";

test("secondary login accepts prior username or e-mail without any stored passwords", () => {
  assert.deepEqual(normalizeIdentity("  PATATI "), { kind: "username", value: "patati" });
  assert.deepEqual(normalizeIdentity("  FRIEND@EXAMPLE.COM "), { kind: "email", value: "friend@example.com" });
  for (const identity of ["", "a", "bad@@example.com", "not an account"]) {
    assert.throws(() => normalizeIdentity(identity), /invalid_identity/);
  }
});

test("legacy username must pass original server verification before profile can be loaded", async () => {
  const calls = [];
  const client = {
    functions: { invoke: async (slug,payload) => {
      calls.push(["invoke",slug,payload.body.username]);
      return {data:{access_token:"example.jwt.sig",refresh_token:"refresh"}};
    }},
    auth: {
      setSession: async tokens => {calls.push(["setSession",tokens.access_token]);return {data:{session:{access_token:tokens.access_token}}};},
      getUser: async() => {calls.push(["getUser"]);return {data:{user:{id:userId}}};}
    }
  };
  const user=await authenticateOriginal(client," PATATI ","correct-password-entered-at-runtime");
  assert.equal(user.id,userId);
  assert.deepEqual(calls.map(v=>v[0]),["invoke","setSession","getUser"]);
});

test("e-mail login validates against Auth directly", async()=>{
  let sent;
  const client={auth:{
    signInWithPassword:async payload=>{sent=payload;return {data:{session:{access_token:"test"}}};},
    getUser:async()=>({data:{user:{id:userId}}})
  }};
  await authenticateOriginal(client,"USER@EXAMPLE.COM","entered-secret");
  assert.deepEqual(sent,{email:"user@example.com",password:"entered-secret"});
});

test("invalid password cannot create an account session",async()=>{
  let sessionCalled=false;
  const client={
    functions:{invoke:async()=>({error:new Error("401")})},
    auth:{setSession:async()=>{sessionCalled=true;return {};}}
  };
  await assert.rejects(authenticateOriginal(client,"patati","bad"),/invalid_credentials/);
  assert.equal(sessionCalled,false);
});

test("profile query is bound to the verified identity, never an arbitrary username",async()=>{
  let queriedId;
  const client={from:table=>{
    assert.equal(table,"profiles");
    return {select:columns=>{
      assert.ok(columns.includes("username"));
      return {eq:(field,id)=>{
        assert.equal(field,"id");queriedId=id;
        return {maybeSingle:async()=>({data:{id:userId,username:"patati",display_name:"Minha conta",bio:"Oi"}})};
      }};
    }};
  }};
  const result=await getOwnOriginalProfile(client,userId);
  assert.equal(queriedId,userId);
  assert.equal(result.username,"patati");
  assert.equal(result.display_name,"Minha conta");
  assert.equal(result.id,userId);
});

test("profile loader rejects mismatched or unauthenticated identities",async()=>{
  await assert.rejects(getOwnOriginalProfile({}, "patati"),/invalid_user/);
  const client={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{id:"22222222-2222-4222-8222-222222222222"}})})})})};
  await assert.rejects(getOwnOriginalProfile(client,userId),/profile_not_found/);
});
