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
    if(path==="/"){
      const headers={...responseHeaders,"content-type":"text/html; charset=utf-8",
        "content-security-policy":"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"};
      return new Response(request.method==="HEAD"?null:"<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>Looply V3 • Homologação</title>\n<meta name=\"robots\" content=\"noindex,nofollow\">\n<style>\n:root{color-scheme:light;--paper:#f5f1e9;--ink:#171717;--accent:#20b99a;--soft:#d6d0c4}\n*{box-sizing:border-box}body{margin:0;padding:24px;background:#fff;color:var(--ink);font-family:system-ui,-apple-system,Segoe UI,sans-serif}\nmain{max-width:760px;margin:5vh auto;background:var(--paper);border:4px solid var(--ink);border-radius:34px;box-shadow:8px 9px 0 var(--soft);padding:clamp(22px,5vw,50px)}\n.mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.05em;font-size:12px;text-transform:uppercase}\n.tag{display:inline-block;border:2px solid var(--ink);padding:8px 10px;border-radius:10px;background:var(--accent);font-weight:700}\nh1{font-family:Georgia,serif;font-size:clamp(44px,7vw,78px);line-height:1.05;margin:26px 0 14px}p{font-size:17px;line-height:1.65;max-width:630px}\nhr{height:2px;background:var(--ink);border:0;margin:28px 0}.info{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}\n.item{padding:16px;border:2px solid var(--ink);border-radius:14px;background:#fff}.item strong{display:block;font-size:17px;margin-top:6px}\nsmall{color:#555}a{color:var(--ink);font-weight:750;text-underline-offset:3px}a:focus-visible{outline:3px solid var(--accent)}\n.links{display:flex;gap:16px;flex-wrap:wrap;margin-top:28px}\n</style>\n</head>\n<body><main>\n<div class=\"mono\">Ambiente independente de homologação • 2026</div>\n<h1>Looply <span style=\"color:#008e74\">V3</span></h1>\n<div class=\"tag\">Migração em andamento</div>\n<p>Esta versão está sendo reconstruída com <strong>Neon</strong> e <strong>Cloudflare</strong>, separada do aplicativo original. O serviço técnico já está publicado, mas o login, as mídias e as funcionalidades sociais ainda estão em validação.</p>\n<hr><div class=\"info\">\n<div class=\"item\"><span class=\"mono\">Hospedagem</span><strong>Cloudflare Workers</strong><small>Serviço de testes publicado</small></div>\n<div class=\"item\"><span class=\"mono\">Banco de dados</span><strong>Neon PostgreSQL</strong><small>Cópia privada verificada</small></div>\n<div class=\"item\"><span class=\"mono\">Acesso</span><strong>Ainda não liberado</strong><small>Contas exigem ativação segura</small></div>\n</div>\n<p><strong>Importante:</strong> esta página não representa o aplicativo completo. Nenhum dado privado é exibido aqui.</p>\n<div class=\"links\"><a href=\"/health\">Ver status técnico</a><a href=\"/neon-health\">Verificar conexão Neon</a></div>\n</main></body></html>", {status:200,headers});
    }
    if (path==="/health"){
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
