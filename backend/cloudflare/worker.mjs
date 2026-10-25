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
