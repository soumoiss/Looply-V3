// Looply V3 isolated staging probe. Public response contains no user or database data.
// This is NOT an application API, session provider, or production readiness check.
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","access-control-allow-origin":"null"}});
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method !== "GET" && request.method !== "HEAD") return json({error:"method_not_allowed"},405);
    if (url.pathname !== "/health" && url.pathname !== "/") return json({error:"not_found"},404);
    const response = json({service:"looply-v3-backend",environment:"staging",probe:"function-runtime",ready_for_production:false});
    return request.method === "HEAD" ? new Response(null,{status:200,headers:response.headers}) : response;
  }
};
