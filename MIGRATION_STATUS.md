# Looply V3 — Migração controlada

> Estado: preparação. **Não é uma versão publicada nem migrada.**

## Origem
- Código principal: https://github.com/soumoiss/Looply
- Branch de auditoria: migration/looply-v3-audit-20261025
- PR de Stories ainda não mesclado: https://github.com/soumoiss/Looply/pull/115
- Código principal identificado em main (referência inicial d96527dd71a28aa3efb535615fe827dfaacba5d9).
- Inventário de origem: 385 entradas Git, 125 migrações SQL, 49 arquivos de testes.

## Segurança
Este repositório foi detectado como **público**. Não publicar backups de banco, dados pessoais, cartas privadas, mídias privadas, hashes, credenciais ou variáveis de ambiente secretas. O código-fonte precisa de revisão antes de uma cópia integral.

## Arquitetura candidata, sujeita a verificação de cotas
- Frontend: GitHub Pages, somente conteúdo estático autorizado.
- Backend: Oracle Cloud Always Free se a instância existente tiver acesso, recursos e cotas disponíveis.
- Banco: PostgreSQL isolado do navegador, com migração de esquema e autorização por API.
- Objetos: Cloudflare R2 apenas se conta, cotas e condição de cobrança forem verificadas; considerar alternativas sem custo.
- Sessões, chat e realtime: serviços próprios com autorização e controles de acesso.

## Progresso
- [x] Localizar novo repositório e verificar permissões.
- [x] Identificar origem, build, testes e PR de Stories.
- [x] Criar registro de auditoria isolado na origem.
- [ ] Revisar presença de dados privados/segredos no histórico antes da cópia.
- [ ] Copiar código e histórico integralmente para o V3.
- [ ] Confirmar qual projeto Supabase serve a produção.
- [ ] Exportar backups privados e validar restauração.
- [ ] Validar acesso Oracle e opções de mídia sem custos.
- [ ] Implementar APIs, autenticação, autorização e realtime sem Supabase.
- [ ] Migrar dados com verificação de integridade e plano de sincronização.
- [ ] Executar testes automatizados e E2E reais.
- [ ] Publicar ambiente de testes e validar rollback.
- [ ] Efetuar corte definitivo somente após validação.

## Limites verificados
A conexão GitHub desta conversa oferece criação e edição de arquivos, branches e objetos Git, mas não disponibiliza operação de espelhamento completo do histórico de outro repositório. Não se deve fingir que a cópia já foi concluída.

## Regra de rollback
Até confirmação de equivalência funcional e integridade de dados, manter os serviços atuais e o repositório original intactos. Nenhuma exclusão é autorizada.

## Auditoria de dados — 2026-10-25 (somente leitura)
- Projeto Supabase com inventário mais completo: Looply V2 (`qixocgetiwlrsbadpbvh`); confirmar associação à produção antes de migrar.
- Outro projeto ativo `kgrxvsizfmaxlosiitec`: três tabelas públicas identificadas.
- Looply V2: 6 usuários auth, 6 perfis, 25 posts, 31 mensagens de chat, 97 cartas arquivadas, 228 registros de archive_media, 189 notificações, 2 stories.
- Storage: 7 buckets cadastrados, seis privados; 277 objetos contabilizados nas seis coleções com objetos.
- Objetos por bucket: avatars 24; chat 9; gallery 5; letters 2; media 236; secret-messages 1; announcements 0.
- Soma dos tamanhos declarados em metadados: 369296700 bytes (~369,3 MB decimal); não é verificação dos bytes físicos nem checksum.
- Nenhum conteúdo de usuários, credencial ou mídia foi exportado ou incluído no GitHub.
- **Importante:** listagem de tabelas e contagem de objetos NÃO constitui backup, validação de restauração ou migração de dados.

## Importação de código — andamento
- Branch `migration/import-source-20261025`: 34 arquivos originais copiados e confirmados por operações Git; commits recentes `b6a196b`, `4c7746d`, `882bb52`.
- Ainda falta copiar o restante da árvore Git e o histórico; o build e os testes ainda não foram executados.

## Continuação verificada — importação e espelhamento
- Repositório de destino confirmado privado via API GitHub.
- Branch `migration/import-source-20261025`: 151 dos 338 arquivos originais presentes na árvore, todos os testes originais copiados; restantes: Android 36, docs 11, Supabase 140.
- Último commit de importação: `b48a4de1167b47391805ac525bd43f715e5a7048`.
- Criado workflow de acionamento **manual** `.github/workflows/import-original-history.yml` na main, commit `1d4c4da43bce357d24c0d102523e39cb5fb7c9d5`. Se executado, faz clone completo da origem, valida SHA de main e cria branch isolada `source-snapshot-20261025` com histórico original. Nunca altera a main do V3 nem a branch incremental. Não executado nem testado ainda.
- Atenção: a cópia integral do histórico também pode conter credenciais históricas. Antes de tornar público ou implantar, realizar auditoria de segredos e rotação de credenciais afetadas.
- Build, testes funcionais, exportação e restauração de dados ainda não realizados.

## Continuação verificada — 2026-10-25
- Branch `migration/import-source-20261025`: 210/338 arquivos originais presentes, conferidos por caminhos e hashes Git. README.md é a única diferença de hash entre os caminhos presentes e deve ser reconciliado sem sobrescrever a documentação V3.
- Os 128 arquivos faltantes pertencem todos a `supabase/` (migrações SQL e SQL manual).
- Aplicação Android completa (36 arquivos) e documentação complementar (11 arquivos) transferidas, commit `2695858e347850c62469d2777db21accf75a9aaa`.
- Funções Edge legadas (6) e configurações copiadas, commit `3e71026e874d804ca8196032eab8bf56ec0efd83`.
- O código transferido **ainda depende do Supabase**. Não publicar nem anunciar como backend migrado.
- O workflow de espelhamento do histórico permanece manual, não executado. Não foi comprovada a viabilidade do backend Oracle/R2, nem backup ou restauração.

## Atualização incremental — SQL
- Branch `migration/import-source-20261025`: 235/338 arquivos da origem presentes; 103 SQL migrations ainda ausentes. Verificação por hash Git mostra diferença apenas no README.md.
- Migrações iniciais de perfis, posts, conversas, arquivo histórico, mídias e notificações preservadas em commits `1feae9e9c9c089efdc4ad166eaf55b8c5e091c77` e `04ea788d457a94df107db55ff854a0a6436c2a8e`.
- Corrigido workflow manual de histórico para usar o commit auditado exato, commit `87239f86974cf3f45e3827a54e91dcd26034678a`.
- Sem implantação, testes E2E ou migração de dados nesta etapa.

## Importação da árvore original concluída — 2026-10-25
- A automação `.github/workflows/complete-source-import.yml` gerou o commit `f00c3e838f7f65e77d645685085278369a63eb9b` na branch `migration/import-source-20261025`.
- Auditoria via API GitHub: **338 de 338 caminhos originais presentes**; os hashes Git de todos coincidem exceto `README.md` (conteúdo específico V3).
- Isso é uma cópia de arquivos, **não** uma migração do histórico Git completo, do banco de dados, de usuários ou de mídias.
- A branch de migração ainda não foi incorporada à main nem publicada. O frontend continua dependente de Supabase.
- O workflow de importação de histórico completo continua não executado. Sem build/E2E ou implantação de backend novo comprovados.

## Histórico original e validação
- Branch `source-snapshot-20261025` verificada via API GitHub: head `d96527dd71a28aa3efb535615fe827dfaacba5d9`, correspondente ao commit auditado do repositório original.
- README original preservado em `docs/ORIGINAL_LOOPLY_README.md` na branch de importação, commit `7eb8cf67fb86fcd70dfb3dcc43164ccf2c24396d`.
- Workflow `v3-baseline-verify.yml` criado, commit `74066ffe0247e4684dd79a7b03f8d03a57e52dd1`; **sem resultado de execução confirmado**.
- Inventário de esquema por consulta SQL de leitura: 56 tabelas base public, 27 auth, 8 storage. Sem exportação de dados.
- Documento de segurança e pré-requisitos `docs/DATA_MIGRATION_GATES.md` criado na branch, commit `08821100ba3f814acccbf69ce3ef5b552b339d71`.
- **Migração de backend, autenticação, banco, storage, realtime e publicação V3 ainda não realizadas.**

## Infraestrutura verificada — 2026-10-25
- Infraestrutura proposta: Neon PostgreSQL + Cloudflare Workers + Cloudflare R2 (pendente de habilitação R2 e testes de compatibilidade).
- Neon existente `looply-v3-migration` contém 56 tabelas candidatas, 867 linhas no inventário, 6 contas inventariadas e 277 objetos de mídia inventariados. Nenhuma das 56 tabelas tem `data_verified_at` definido, nenhum usuário tem `target_user_id` e nenhum objeto está marcado `target_verified`.
- Cloudflare R2 respondeu 403/10042 solicitando habilitação via Dashboard. Nenhum bucket R2 criado.
- Comparação de cotas e riscos documentada em `docs/INFRASTRUCTURE_DECISION_20261025.md` (branch de migração).
- Produção Supabase e implantação existente não foram alteradas.

## Atualização — ambiente de homologação Neon Free (2026-10-25)

**Infraestrutura isolada criada e verificada:** projeto Neon `small-scene-81115187` (`looply-v3-migration`, região `aws-us-east-1`, PostgreSQL 17), branch `br-round-fog-b7pseu7j`, autenticação Managed Better Auth ativa, Data API ativa sem permissões públicas padrão, sete buckets de armazenamento **privados**. Neon Realtime desligado por não suportar RLS diretamente durante o beta. Neon organização identificada como plano Free; quota PostgreSQL **efetivamente reportada neste projeto é 512 MiB** (menor que 1 GB divulgado nas páginas do serviço). Cloudflare R2 da conta conectada indisponível/sem habilitação (erro HTTP 403 10042); não foi ativado faturamento.

**Dados de produção preservados em homologação:** 56 tabelas da aplicação, 867 registros copiados como JSONB completo para schema privado `looply_migration`. Mais seis registros mínimos de identidade e metadados de 277 objetos (~369,3 MB) catalogados, sem copiar verificadores de senha nem bytes dos arquivos.

**Restauração relacional privada:** 56 tabelas tipadas (`looply_candidate`) com todos os 867 registros. Recuperados 174 índices, 312 restrições NOT NULL, 161 defaults, **286/291 constraints** (56 PK, 17 UNIQUE, 119 CHECK, 94 FKs internas). **Cinco FKs para `auth.users` pendentes**. Validação executada via `looply_migration.verify_candidate_snapshot()`: **56/56 hashes e contagens correspondentes** à origem. As tabelas de homologação não são expostas à Data API e não têm privilégios públicos de leitura.

**Ainda NÃO concluído:** migração dos 277 arquivos reais; migração/redefinição segura do login das seis contas para Neon Auth; port de funções SQL, políticas RLS, triggers, funções de borda, realtime seguro e demais regras de negócio; restauração funcional em `public`; build/E2E em produção independente; delta de dados, backups offsite, publicação/cutover. O Looply original no Supabase e na Vercel continua intocado. Não foi criado plano pago nem realizada cobrança deliberada.

Documentação detalhada na branch `migration/import-source-20261025`: [NEON_V3_INFRASTRUCTURE_DECISION.md](https://github.com/soumoiss/Looply-V3/blob/migration/import-source-20261025/docs/NEON_V3_INFRASTRUCTURE_DECISION.md).

## Continuação executada: infraestrutura gratuita + mecanismos de homologação (2026-10-25)

**Decisão técnica:** Neon Free como destino integrado de PostgreSQL + Managed Better Auth + Object Storage + Functions. A organização Neon é Free; o projeto que contém a restauração é **`small-scene-81115187`** (branch **`br-round-fog-b7pseu7j`**). Há outro projeto Neon `looply-v3` (`wispy-mountain-71258224`) sem schemas de aplicação, buckets ou Auth; foi inspecionado somente e **não** substitui a homologação com dados. Não apagar nenhum dos dois automaticamente.

**Cotas e acesso verificados:** documentos públicos de outubro/2026 anunciam 1 GB PostgreSQL/projeto, 5 GB Neon Storage, 100 CU-h/mês, Auth 60 mil MAU e 1 milhão de invocações Functions. Porém o limite PostgreSQL real retornado para o projeto de migração é **512 MiB**; respeitar o menor limite. Banco ocupa **14.172.160 bytes**. Cloudflare R2 conectado retorna `HTTP 403 / código 10042` (R2 não habilitado, exige assinatura na conta). Não houve tentativa de habilitar billing nem upgrade. GitHub Pages privado exige plano elegível e não foi publicado.

**Migração dos dados e integridade:** 56/56 tabelas, **867** registros, 174 índices, 286/291 constraints, 312 NOT NULL e 161 defaults reproduzidos em `looply_candidate`. Consulta de auditoria `backend/neon/sql/staging-readiness.sql` executada: 56/56 tabelas conferem no snapshot, 56/56 RLS ON, **zero grants públicos**; **6 identidades legadas vs. zero contas no Neon Auth**, **277 objetos catalogados vs. zero arquivos transferidos/validados**. Cinco FKs para `auth.users` permanecem pendentes. `production_cutover_approved=false`. O snapshot de dados na homologação **não** é um backup consistente offsite.

**Lógica ainda faltante em comparação com Supabase:** **44** funções SQL de `public`, **36** triggers, **157** políticas RLS públicas, **33** policies `storage` e **30** tabelas Realtime. Nenhuma dessas regras operacionais foi migrada; não liberar a Data API privada nem habilitar Realtime irrestrito.

**Código e implantação experimental:** função Node 24 `staginghealth` versionada em `backend/neon/functions/staginghealth/index.mjs` e implantada no Neon no deployment **2**, status `completed`; responde somente mensagens públicas de estado e diz que não está pronta para produção. Teste HTTP externo ainda sem resultado verificado. Ferramenta `backend/neon/scripts/media-transfer.mjs` criada para transferir objetos com URLs assinadas efêmeras, bloqueio de execução e verificação SHA-256; testes estáticos escritos em `tests/neon-media-transfer.test.mjs` e `tests/neon-staging-health.test.mjs`. Workflow CI `.github/workflows/staging-smoke.yml` criado, **nenhum run comprovado pelo conector**. Não declarar os testes aprovados.

**Snapshot manual interno Neon:** `snap-curly-shape-b7es25v7`, do estágio anterior a migração de auth; criado e confirmado na listagem, dentro do 1 snapshot Free publicado. **Não** inclui os 277 arquivos binários nem substitui backup externo.

**Produção preservada:** Supabase `Looply V2` `qixocgetiwlrsbadpbvh` permanece `ACTIVE_HEALTHY`; commit da origem `soumoiss/Looply` em `main` continua `d96527dd71a28aa3efb535615fe827dfaacba5d9`. V3 mantém branch de migração isolada, repo privado e sem corte de tráfego, sem mudança de variáveis de produção e sem exclusões. Nenhum plano pago foi contratado nesta execução.

**Bloqueios do cutover:** transferir bytes privados com credenciais delegadas seguras fora do GitHub; cadastrar/validar contas preservando identidade com fluxo de senha novo (Neon diz que hash Supabase não é importável diretamente); portar autenticação/autorizações, funções/triggers/storage/realtime; E2E + auditoria de permissão por usuário, backup offsite e delta antes do corte. Detalhamento em [docs/NEON_V3_INFRASTRUCTURE_DECISION.md](https://github.com/soumoiss/Looply-V3/blob/migration/import-source-20261025/docs/NEON_V3_INFRASTRUCTURE_DECISION.md).

## Continuação: integração estrutural de identidades e validação criptográfica de mídias (2026-10-25)

**Ambiente alterado:** somente a branch privada `migration/import-source-20261025` e o Neon de homologação `small-scene-81115187` / `br-round-fog-b7pseu7j`. A produção Supabase permanece `ACTIVE_HEALTHY`, `soumoiss/Looply` ainda em `d96527dd71a28aa3efb535615fe827dfaacba5d9`, e o destino GitHub é **privado**.

**Migração SQL relacional:** todas as **291/291** constraints do modelo inicial de aplicação foram restabelecidas no esquema privado `looply_candidate` (56 PK, 17 UNIQUE, 119 CHECK, **99/99 FKs**). As 5 FKs de `auth.users` foram reconstruídas apontando a uma **tabela de identidades legadas**, `looply_auth_compat.legacy_principals`, não a usuários reais do Neon Auth; esse ajuste preserva a integridade referencial, **não equivale a autenticação**. Seis IDs legados guardados sem e-mails expostos; 56/56 tabelas e 867 registros continuam consistentes.

**Ativação segura de contas:** criada `looply_migration.verified_identity_links`, tabela privada 1:1; função `looply_migration.link_verified_identity(uuid)` `SECURITY INVOKER` só associa quando o e-mail de destino e o legado são iguais, ambos verificados, o perfil antigo existe e não há conflito. Função sem acesso público, RLS ligado, teste de identidade inexistente retornou false. **Seis contas antigas, zero contas Neon Auth, zero associações realizadas**. Sem envios de e-mails ou criação de contas em nome de terceiros.

**Mídias:** criada `looply_migration.verified_media_receipts` com SHA-256, tamanho e chave do inventário, acesso público negado e função administrativa `record_verified_media()` que recusa objetos inexistentes e tamanhos falsos. Verificado via SQL: **277 objetos (369.296.700 bytes) catalogados; zero recibos; zero mídias efetivamente transferidas**. O utilitário de migração confere domínio, bucket, caminho, token temporário, tamanho e SHA-256 de ida/volta e produz recibos JSONL locais `0600` sem links ou segredos. Executar somente com URLs privadas assinadas verdadeiras e backup independente, ainda não disponíveis pelo conector. Guia `docs/PRIVATE_MEDIA_MIGRATION.md`.

**Inventário extra de alto risco da origem:** 157 políticas RLS `public`, das quais **111 referenciam `auth.uid()`**; 44 funções SQL, das quais **38 são `SECURITY DEFINER`**; 36 triggers, 33 policies de `storage` e 30 tabelas Realtime. Plano e testes negativos documentados em `docs/SECURITY_PORTING_PLAN.md`. Não portar funções privilegiadas cegamente.

**Verificador de prontidão atualizado e executado:** `backend/neon/sql/staging-readiness.sql` retorna `private_snapshot_integrity_passed=true`, `applied_constraints=291`, `applied_foreign_keys=99`, `public_grants=0`; **`identity_link_gate=false`**, **`media_sha256_gate=false`**, **`authorization_and_realtime_gate=false`**, **`production_cutover_approved=false`**. A função experimental Neon `staginghealth` está implantada (deployment 2, status completed), mas acesso HTTP externo e os testes CI ainda não foram confirmados; **não declarar V3 funcional**.

**Custos e preservação:** Neon organização Free, projeto de homologação reporta limite PostgreSQL 512 MiB, objeto 5 GB Free publicado, funções limitadas; Cloudflare R2 segue bloqueado `403/10042`, sem habilitar cobrança. Snapshot manual interno `snap-curly-shape-b7es25v7` existente, não constitui backup completo de usuários/mídias. Nenhum deploy/endpoint de produção alterado, nenhum projeto apagado, nenhum plano pago contratado.

**Próximos bloqueios:** acesso delegado seguro aos bytes do Storage Supabase e presigned URLs Neon para transferência verificada; fluxo de reautenticação/redefinição de senha das seis contas; adaptação segura de 111 policies de identidade e 38 funções privilegiadas; APIs, realtime, mídia privada, E2E por usuário, backup offsite, delta e corte planejado. Código/planos na branch de migração; não consolidar em `main` ou colocar no ar antes da aprovação dos testes.

### Verificação adicional de integridade contra a produção (2026-10-25)

Consulta read-only direta no Supabase origin calculou, **em um único statement**, contagens e hash MD5 do JSONB canônico de cada uma das 56 tabelas `public`; comparação com o inventário persistido no Neon confirmou **56/56 hashes e contagens coincidentes, 867 registros, zero divergências detectadas no instante da consulta**. SQL reproduzível salvo na branch de migração: `backend/neon/sql/audit-supabase-origin-readonly.sql` (commit `503fc8de02d5adc32e089dc0689d73e7e5594c08`). Isto **não substitui um snapshot transacional/backup offsite** e não garante ausência de alterações depois da consulta.

A ferramenta de transferência de mídias agora exige arquivo de recibos local exclusivo `--receipt-file`, permissões `0600` e produz uma linha JSONL por objeto SHA-256 verificado, sem tokens/URLs; ref `backend/neon/scripts/media-transfer.mjs`. Foram acrescentados testes `tests/neon-media-run.test.mjs`. **Testes unitários via execução real do Node e transferência real de arquivos não confirmados.**


## Continuação: serviço público Cloudflare + identidade Neon JWT (2026-10-25)

**Publicação independente comprovada:** `looply-v3-staging.s0upoetamoiss.workers.dev` executa um Cloudflare Worker separado do app original, código `backend/cloudflare/worker.mjs`, sem qualquer requisição ao Supabase. A página principal exibe **explicitamente** que a aplicação completa ainda está em homologação. Testes HTTP reais via Cloudflare Browser Rendering confirmaram `/health` e o HTML público da página inicial; implantação de Worker confirmada na API Cloudflare.

**Integração de dados operacional parcial:** o Worker inclui `GET /api/self-profile`, rejeita requisições sem Bearer, repassa o JWT somente à URL fixa da Neon Data API e expõe somente campos selecionados do próprio perfil. Endpoint `public.v3_self_profile` no Neon foi criado com `security_invoker=true`, `SELECT` somente ao papel `authenticated` e política RLS `id=public.looply_legacy_uid()` na tabela candidata. `public.looply_legacy_uid()` usa o `auth.uid()` do JWT validado pela Neon Data API para mapear a identidade moderna para o perfil antigo validado. Com `SET LOCAL ROLE authenticated` e **sem JWT**, consulta do perfil retornou **0 registros**. Nenhum dado pessoal foi publicado neste estágio. A rota HTTP do perfil **não** foi testada com login real porque Neon Auth possui **zero usuários ativos de migração**.

**Vinculação por posse do e-mail:** `public.v3_claim_legacy_profile()` permite ao usuário com token JWT Neon e `emailVerified=true` vincular seu próprio perfil correspondente ao e-mail confirmado no inventário; nenhum UUID/email enviado pelo navegador é aceito como identidade. A função rejeitou teste sem sessão; sem EXECUTE para `anonymous`. **Nenhum vínculo foi criado**.

**Bloqueio crucial de segurança do Neon Auth:** leitura da configuração administrativa revelou `email_password.verify_email_on_sign_up=false` e `require_email_verification=false`. **Não abrir cadastro de usuários antigos antes de habilitar/verificar autenticação por e-mail**. A conexão Neon atualmente disponível permite ler configuração, mas a ação `update_auth_config` aceita somente `name`, sem oferecer controle de verificação por e-mail. Necessária alteração na Neon Console ou extensão específica de acesso autorizado. Também há incompatibilidade de hashes de senha Supabase → Neon Auth: usuários precisarão verificar posse do e-mail e criar nova senha; não prometer continuidade das senhas antigas.

**Infraestrutura de frontend separada:** Cloudflare Pages `looply-v3-web` criado sem fonte Git, domínio reservado `looply-v3-web.pages.dev`, com **zero deploys**. Integração GitHub privada pela API Cloudflare recusada com `HTTP 401 8000011` (instalação GitHub Pages/Cloudflare com problema; exige reinstalar/reconectar a instalação GitHub na Cloudflare). A API de Direct Upload `/pages/assets/upload` recusou `HTTP 403 8000013` com credenciais do conector; o endpoint exige token específico que o conector não permite repassar como header. **Não afirmar que o endereço Pages já está publicando o app**. A publicação efetiva nesta etapa foi via Cloudflare Worker.

**Privacidade/produção:** projeto original GitHub `soumoiss/Looply` e Supabase `qixocgetiwlrsbadpbvh` não foram alterados nem substituídos; nenhum domínio/ambiente Vercel redirecionado. Cloudflare Worker/Neon não dependem de Supabase em execução, mas os **dados de aplicação ainda não são funcionalmente servidos em todas as telas**. As 277 mídias privadas continuam sem cópia de bytes; faltam 157 policies originais, 44 funções, 36 triggers, realtime seguro, testes E2E e autenticação das 6 contas. **Looply V3 NÃO está 100% funcional.**

**URLs:** página pública de homologação `https://looply-v3-staging.s0upoetamoiss.workers.dev/`, status `/health`, conexão `/neon-health`. `looply-v3-web.pages.dev` está reservado sem deploy.
