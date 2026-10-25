# Looply V3 — estado de implantação independente (25/10/2026)

> **Não foi concluído um Looply V3 funcional idêntico ao original.** Esta é a posição verificada dos sistemas; não trate a página de homologação como aplicativo pronto.

## Acesso público realmente disponível

- **Cloudflare Worker de homologação:** https://looply-v3-staging.s0upoetamoiss.workers.dev/
- **Status JSON:** https://looply-v3-staging.s0upoetamoiss.workers.dev/health
- **Prova externa:** Cloudflare Browser Rendering HTTP 200 apresentou `Looply V3` e `Migração em andamento`. Worker implantado via API com subdomínio workers.dev habilitado.
- **Publicação separada:** NÃO aponta para o Looply original, não usa Supabase no runtime do Worker, não realiza login e não mostra dados pessoais. NÃO é a rede social completa.

## Serviços novos provisionados

- Neon Free projeto `small-scene-81115187`, branch `br-round-fog-b7pseu7j`, PostgreSQL 17, Auth, Data API, Object Storage privado em sete buckets e Neon Function `staginghealth`. Limite informado pela API do projeto: **512 MiB de PostgreSQL**, não ilimitado; 5 GB de objetos na franquia publicada, sujeito à elegibilidade/cotas.
- Banco de homologação: **56/56** tabelas da aplicação com 867 registros, conferidas contra a origem por contagem e digest; **174 índices e 291 constraints (99 FKs)**, cinco FKs legadas adaptadas ao esquema privado `looply_auth_compat`. A adaptação referencial não equivale à migração de autenticação.
- Neon Auth: **0 usuários ativados**, **0 vínculos** das seis contas legadas, email verification **NÃO exigido** na configuração atual; não habilitar auto-migração em produção antes de corrigir.
- Mídias: **277 arquivos (~369.296.700 bytes) apenas catalogados**, **0 binários transferidos**, **0 recibos SHA-256**.
- Neon SQL: `public.looply_legacy_uid()` (somente perfil validado via auth.uid), `public.v3_claim_legacy_profile()` (vínculo por e-mail verificado), `public.v3_self_profile` e `public.v3_feed_posts` (read-only, `security_invoker=true`). Testes com papel authenticated sem JWT retornaram zero registros; leitura anônima e acesso direto a chat não liberados.
- Cloudflare Worker `looply-v3-staging`: landing independente, `/health`, `/neon-health`, `/api/self-profile`, `/api/feed`, `POST /api/claim-profile`. Endpoints privados dependem de JWT Neon e regras RLS; **sem teste positivo com conta Neon real**, não afirmar API completa funcional.
- Testes de código acrescentados em `tests/cloudflare-gateway.test.mjs`. Não há resultado comprovado de suite CI e E2E do aplicativo.

## Hospedagem Cloudflare Pages e bloqueio de integração

- Projeto **`looply-v3-web`** criado no Cloudflare Pages, hostname reservado `looply-v3-web.pages.dev`; **0 implantações**, portanto hostname NÃO hospeda o Looply.
- Conectar o repositório privado `soumoiss/Looply-V3` via Pages API retornou **HTTP 401 / 8000011**, problema da instalação GitHub na conta Cloudflare. Corrigir pelo Dashboard Cloudflare > Workers & Pages > integração GitHub e conceder acesso ao repositório privado; não tornar repositório público.
- Direct Upload pelo conector recusado **HTTP 403 / 8000013**: API de upload de assets requer token de upload específico. A conexão atual não fornece header personalizado para usá-lo. Portanto não alegar que Pages publicou o frontend.
- R2 continua não habilitado na conta Cloudflare (`HTTP 403 / 10042`); Neon Object Storage é o destino gratuito escolhido.

## Obstáculos reais à equivalência funcional

1. **Ativação de login:** password hashing Supabase e Neon Managed Better Auth não são intercambiáveis; as seis contas precisarão de nova credencial ou outro fluxo de verificação real. Neon Auth ainda não exige e-mail verificado; habilitar essa segurança no Console antes de permitir auto-cadastro e auto-vinculação. O conector `update_auth_config` só permite renomear a configuração, não alterar exigência de verificação.
2. **Mídias privadas:** o conector Supabase disponível permite SQL e metadados, mas não fornece download autenticado dos objetos binários, nem tokens administrativos de leitura. Exige mecanismo de exportação/assinaturas temporárias com permissão administrativa segura **sem enviar segredo ao chat ou GitHub**. Há ferramenta `backend/neon/scripts/media-transfer.mjs` com SHA-256 e recibos privados, sem execução real.
3. **Lógica de negócio:** 157 políticas RLS públicas, 33 de storage, 44 funções SQL (38 SECURITY DEFINER), 36 triggers e 30 tabelas de Realtime a portar/auditar. Apenas duas políticas de leitura restritas no esquema candidato foram implementadas nesta etapa.
4. **Frontend original:** continua importando `@supabase/supabase-js` e usando Supabase para muitas funcionalidades. O Worker de teste é independente, mas o frontend original NÃO foi convertido/publicado no Pages. Copiar o site original diretamente preservaria dependência e quebraria login, mídia, chamadas e realtime.
5. **Qualidade:** testes E2E reais de usuário, arquivos, chat, admin, Stories, playlists, push, Android, dados, privacidade, uso gratuito e rollback ainda não concluídos.

## Preservação da produção original

- Projeto Supabase `Looply V2` `qixocgetiwlrsbadpbvh` permanece `ACTIVE_HEALTHY`.
- Repositório `soumoiss/Looply` permanece no commit `d96527dd71a28aa3efb535615fe827dfaacba5d9`.
- Nenhum domínio original/Vercel, chave de produção, política RLS original, objeto de storage original ou login de produção foi modificado. Nenhuma contratação de plano pago foi efetuada.

## Sequência restante e critérios para declarar 100%

1. Ativar e verificar fluxo de e-mail/sessões Neon, com reativação das seis contas e mapeamento auditado.
2. Obter acesso autorizado aos arquivos privados e transferir 277/277 com verificação SHA-256; manter backup criptografado independente.
3. Converter frontend e 100% das dependências Supabase para Neon/Cloudflare, incluindo imagens/vídeos/áudios, chat/realtime, Stories, galerias, cartas, notificações, playlists e permissões admin.
4. Corrigir instalação GitHub na Cloudflare Pages ou disponibilizar uma via equivalente de upload de assets e publicar frontend privado, separado do original.
5. Executar todos os testes E2E e negativos de acesso cruzado; só então alterar o status do V3 para `production_ready=true`.

**Sem cumprir esses critérios, nenhuma equipe deveria afirmar que o V3 opera como o original.**
