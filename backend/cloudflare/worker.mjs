// Cloudflare Workers staging-only gateway for Looply V3.
// No old Supabase endpoints, production domains, private data or secrets.
const NEON_HEALTH = "https://br-round-fog-b7pseu7j-staginghealth.compute.c-13.us-east-1.aws.neon.tech/health";
const responseHeaders = {
  "content-type":"application/json; charset=utf-8",
  "cache-control":"no-store",
  "x-content-type-options":"nosniff",
  "referrer-policy":"no-referrer",
  "content-security-policy":"default-src 'none'; frame-ancestors 'none'",
  "x-robots-tag":"noindex, nofollow"
};
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method!=="GET"&&request.method!=="HEAD")
      return new Response(JSON.stringify({error:"method_not_allowed"}),{status:405,headers:responseHeaders});
    if (path==="/health"||path==="/"){
      const data={service:"looply-v3-cloudflare",environment:"staging",production_ready:false,backend:"neon",media_migrated:false,auth_migrated:false};
      const text=JSON.stringify(data);
      return new Response(request.method==="HEAD"?null:text,{status:200,headers:responseHeaders});
    }
    if(path==="/api/self-profile"){
      const bearer=request.headers.get("authorization")||"";
      if(!/^Bearer [A-Za-z0-9._~-]+$/.test(bearer)||bearer.length>4096)
        return new Response(JSON.stringify({error:"authentication_required"}),{status:401,headers:responseHeaders});
      try {
        const endpoint="https://ep-fancy-smoke-b7d6t1s6.apirest.c-13.us-east-1.aws.neon.tech/neondb/rest/v1/v3_self_profile?select=id,username,display_name,bio,theme,avatar_path";
        const upstream=await fetch(endpoint,{method:"GET",headers:{"authorization":bearer,"accept":"application/json"},redirect:"error",signal:AbortSignal.timeout(7000)});
        if(upstream.status===401||upstream.status===403)
          return new Response(JSON.stringify({error:"authentication_required"}),{status:401,headers:responseHeaders});
        if(!upstream.ok) throw new Error("data_api");
        const body=await upstream.text();
        if(body.length>12000) throw new Error("response_size");
        let data=JSON.parse(body);
        if(!Array.isArray(data)||data.length>1) throw new Error("unexpected_result");
        data=data.map(v=>({
          id:v.id,username:v.username,display_name:v.display_name,
          bio:v.bio,theme:v.theme,avatar_path:v.avatar_path
        }));
        return new Response(request.method==="HEAD"?null:JSON.stringify({profiles:data}),{status:200,headers:responseHeaders});
      }catch {
        return new Response(JSON.stringify({error:"profile_service_unavailable"}),{status:503,headers:responseHeaders});
      }
    }
    if(path==="/neon-health"){
      try {
        const upstream=await fetch(NEON_HEALTH,{method:"GET",redirect:"error",headers:{"accept":"application/json"},signal:AbortSignal.timeout(5000)});
        if(!upstream.ok) throw new Error("backend");
        const payload=await upstream.json();
        if(payload?.service!=="looply-v3-backend"||payload?.ready_for_production!==false) throw new Error("invalid_backend");
        return new Response(request.method==="HEAD"?null:JSON.stringify({connected:true,environment:"staging",production_ready:false}),{status:200,headers:responseHeaders});
      } catch {
        return new Response(request.method==="HEAD"?null:JSON.stringify({connected:false,environment:"staging",production_ready:false}),{status:503,headers:responseHeaders});
      }
    }
    return new Response(JSON.stringify({error:"not_found"}),{status:404,headers:responseHeaders});
  }
};
