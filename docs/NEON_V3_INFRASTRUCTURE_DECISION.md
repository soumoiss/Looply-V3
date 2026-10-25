# Looply V3 — decisão de infraestrutura e estado real (2026-10-25)

> **Ambiente de homologação isolado. Nenhum serviço de produção foi modificado.**
>
> Toda informação de preço/cota depende do plano e pode mudar; esta página registra o estado verificado nesta execução, não garante disponibilidade futura.

## Decisão: Neon Free (PostgreSQL + Auth + Data API + Object Storage)

Organização Neon existente `org-royal-shape-81986230`, plano explicitamente identificado como **free**. Foi criado **um novo projeto**:

| Item | Estado verificado |
| --- | --- |
| Nome | `looply-v3-migration` |
| Project ID | `small-scene-81115187` |
| Branch principal | `br-round-fog-b7pseu7j` |
| Região | `aws-us-east-1` |
| Database | `neondb` / PostgreSQL 17.11 |
| Computação | mínimo/máximo 0,25 CU |
| Capacidade PostgreSQL **reportada pela API do projeto** | **536.870.912 bytes (512 MiB)** |
| Managed Better Auth | **ativado**; schema `neon_auth` |
| Data API | **ativa** apenas para schema `public`, sem `add_default_grants`, `db_max_rows=500` |
| Armazenamento de objetos | **habilitado**; sete buckets criados, todos privados |
| Realtime | **desabilitado** até revisão de autorização; beta não suporta RLS diretamente |
| Contas/arquivos da origem migrados | **nenhum**; apenas inventário de contagens não pessoais |

**URLs públicas, não credenciais:**
- Neon Auth: `https://ep-fancy-smoke-b7d6t1s6.neonauth.c-13.us-east-1.aws.neon.tech/neondb/auth`
- Data API: `https://ep-fancy-smoke-b7d6t1s6.apirest.c-13.us-east-1.aws.neon.tech/neondb/rest/v1`
- URL-base para SDK: `https://ep-fancy-smoke-b7d6t1s6.c-13.us-east-1.aws.neon.tech/neondb`
- S3/Storage: `https://br-round-fog-b7pseu7j.storage.c-13.us-east-1.aws.neon.tech`

**Buckets privados de destino existentes:** `looply-announcements`, `looply-avatars`, `looply-chat`, `looply-gallery`, `looply-letters`, `looply-media`, `looply-secret-messages`. O bucket `looply-announcements` permanece privado por padrão de segurança, mesmo que a origem esteja pública e vazia.

## Comparação de alternativas

| Alternativa | Condições gratuitas e obstáculos |
| --- | --- |
| **Neon Free** | Plano Free confirmado na conta; organização/projeto disponíveis. Docs de outubro de 2026 anunciam 1 GB por projeto para PostgreSQL, 5 GB de armazenamento de objetos, até 60.000 MAU Auth e 100 CU-h/mês. **A API deste projeto retornou apenas 512 MiB de capacidade PostgreSQL**, limite mais restritivo que prevalece para este projeto até atualização confirmada. Egress 5 GB/mês. Em Free, atingir cotas bloqueia operações/compute sem cobrar excedente automaticamente. |
| **Cloudflare R2** | Docs indicam 10 GB-mês, 1 milhão operações A e 10 milhões B gratuitas para Standard; excedentes podem ser cobrados. **R2 da conta conectada não está habilitado** (HTTP 403/10042). Não habilitar faturamento sem controle de cobrança. |
| **Cloudflare Workers + D1** | Workers Free tem 100.000 requisições/dia e 10 ms CPU/requisição, mas D1 é SQLite e não aceita nativamente as 128 migrações SQL PostgreSQL, políticas RLS e funções existentes; maior retrabalho. |
| **GitHub Pages** | Com GitHub Free, Pages em repositório privado **não é elegível**; requer repositório público ou plano compatível. Manter o código privado. |
| **Vercel** | Projetos Looply existentes na conta, sem mudanças efetuadas. Reutilização só após auditoria de plano, ambiente e preview, sem afetar domínio de produção. |
| **Oracle Cloud Always Free** | Conta/recursos não verificados por integração nesta etapa; não assumir capacidade provisionável nem custo zero. |

Fontes:
- https://neon.com/docs/introduction/plans
- https://neon.com/docs/storage/overview
- https://neon.com/docs/auth/migrate/from-supabase
- https://neon.com/docs/realtime/overview
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/workers/platform/limits/
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

## Inventário auditado da origem (leitura, sem extração de dados pessoais)

Supabase provável produção: `qixocgetiwlrsbadpbvh` (o arquivo `config.js` da origem confirma essa URL).
- PostgreSQL: **21.452.467 bytes** (cerca de 20 MiB).
- **56** tabelas `public` com RLS, **867** linhas totais nas 56 tabelas, por `count(*)` em 2026-10-25. Contagens podem mudar com a atividade dos usuários.
- `auth.users`: **6** contas.
- `storage.objects`: **277** objetos e metadados de tamanho somando **369.296.700 bytes**.
- Uma tabela interna `looply_migration.source_table_inventory` foi criada no **Neon** fora do schema exposto; ela contém somente nomes e contagens das 56 tabelas, não dados pessoais. Consulta de verificação: 56 registros, soma 867, nenhuma linha de produção copiada para tabelas da aplicação.

## Incompatibilidades a resolver antes do corte

1. **Senhas existentes:** a própria documentação do Neon informa que os verificadores de senha Supabase não podem ser importados diretamente para Managed Better Auth. Preparar fluxo de redefinição/verificação seguro, ou um processo específico de migração de credenciais testado. Não afirmar que as seis contas entrarão com a mesma senha antes de validar.
2. **Login por nome de usuário:** `src/login.js` chama `functions.invoke('looply-login')`, usa RPC de fallback e `auth.updateUser({password})` nos convites; o SDK Neon não substitui estes serviços automaticamente.
3. **Schema:** migrações `supabase/migrations` contêm dependências de `auth.users`, `storage.objects`, funções privilegiadas, triggers e políticas. Não executá-las diretamente no Neon sem revisão/portabilidade.
4. **Mídias:** API Neon Storage é **S3**, não possui diretamente o mesmo `supabase.storage.from(bucket).createSignedUrl/upload/download`. Implementar gateway autenticado, autorização por objeto e URLs assinadas **no servidor**; nunca enviar credenciais S3 ao navegador.
5. **Realtime privado:** Neon Realtime beta **não suporta RLS**. Proteger/selar consultas por identidade de usuário no backend e testar conversas privadas, Stories e notificações; não habilitar exposição direta.
6. **Funções:** migrar as Edge Functions `looply-login`, `looply-chat`, `looply-admin`, `looply-push` e demais endpoints, incluindo push, rate limits e checagens administrativas.
7. **Frontend:** aplicativo atual é HTML/JS sem bundler: `src/supabase.js` importa CDN Supabase diretamente; não trocar por URL Neon sem adaptar métodos e sem testar build, login, storage e realtime.
8. **Testes/corte:** backup consistente fora do GitHub, exportação de dados e objetos com hashes, restauração isolada, testes com as seis contas, checks de autorização por usuário e rollback; só então alterar domínio/hospedagem.

## Postura de segurança e custos

- Nada em `main` da origem ou no Supabase foi excluído/atualizado.
- Nenhuma credencial S3, string de conexão PostgreSQL com senha, JWT ou senha de usuário foi salva no GitHub.
- Não usar R2 até haver habilitação e limites de cobrança auditados.
- **Neon Free não é armazenamento ilimitado.** Se a aplicação crescer, o limite de storage e egress pode impedir novas operações; ampliar exige decisão explícita, não upgrade automático.
- Ambiente de homologação novo e separado: não trocar variáveis de produção, domínio, scripts de deploy nem chaves públicas enquanto testes E2E não passarem.

## Atualização — inventário e cópia privada de dados

Foi executada **cópia lógica inicial dos dados públicos de aplicação** (incluindo dados sensíveis de aplicação, como mensagens privadas, tratados em esquema privado) do Supabase para o Neon, sem alterar a origem. Snapshot lógico `v3-stage-20261025-a`, destino `looply_migration.source_rows`:
- **56/56** tabelas originais inventariadas, inclusive tabelas sem linhas;
- **867/867** linhas copiadas como objetos JSONB completos, organizados por tabela e ordinal;
- verificação independente de soma de registros: **0 divergências**;
- verificação de MD5 sobre a serialização JSONB canônica ordenada, calculado tanto na origem quanto no destino: **56/56 hashes iguais**. MD5 aqui é uma checagem de consistência, não uma assinatura criptográfica de backup.
- informações mínimas de **6/6** identidades antigas em `looply_migration.auth_user_inventory`, sem importar hashes de senhas, sessões ou tokens. **0 contas mapeadas ao Neon Auth** neste estágio;
- catálogo de **277/277** objetos e seus metadados em `looply_migration.storage_object_inventory`, totalizando **369.296.700 bytes referenciados**. **0 objetos binários efetivamente enviados ou verificados no Neon Storage**.
- todas as quatro tabelas privadas de migração têm RLS habilitado; permissões conferidas: `anonymous` e `authenticated` não possuem USAGE no schema nem SELECT nas tabelas (consultado diretamente no PostgreSQL).

**ATENÇÃO:** esta é cópia JSONB isolada para restauração posterior, não restauração em tabelas operacionais. Não é transação consistente com a aplicação em escrita contínua; requer novo delta/corte e backup independente antes de produção. O arquivo privado ainda depende do Supabase para o conteúdo binário; Neon Auth ainda não tem as seis contas migradas.

## Atualização — restauração tipada privada concluída (homologação)

A estrutura física de **56 tabelas de aplicação** foi reconstituída no schema privado `looply_candidate` do Neon com **351 colunas** e tipos PostgreSQL preservados (`uuid`, `text`, `timestamptz`, `jsonb`, `date`, números e booleanos). O processo fez:

1. Leitura das definições de coluna na origem (somente leitura);
2. Criação isolada de 56 tabelas em `looply_candidate` com RLS ligado, sem políticas de leitura e **sem GRANT** a `authenticated`/`anonymous`;
3. Recuperação dos dados por `jsonb_populate_record` a partir do snapshot `looply_migration.source_rows`;
4. Checagem tipada independente: **867 registros reconstituídos, 56/56 contagens e hashes JSONB iguais** ao inventário verificado da origem;
5. Checagem SQL de permissões: **56/56 tabelas RLS ON, zero tabelas legíveis aos papéis públicos**.

**Limite da fidelidade de esquema:** colunas e tipos foram preservados; índices, constraints FK/UNIQUE/CHECK, defaults, triggers, policies, grants, funções SQL, views e autenticação do Supabase ainda **não** foram reproduzidos no novo backend. Por isso as tabelas estão **fora do schema `public`** e não são consumidas pelo frontend. Não executar ainda cutover.

## Atualização — DDL relacional isolado (ainda não ativado)

No schema privado `looply_candidate` foram reproduzidos, com consultas apenas de leitura à origem e alterações **somente no Neon novo**:

- **174/174 índices** originais (incluindo 76 índices UNIQUE);
- **312/312 colunas NOT NULL**;
- **161/161 DEFAULTs**;
- **286/291 constraints** do esquema original: 56 PKs, 17 UNIQUE, 119 CHECK e **94/99** FKs;
- as **5 FKs restantes** apontam a `auth.users` do Supabase e ficam explicitamente pendentes até a migração/compatibilidade de identidades;
- validação pós-DDL através de função interna `looply_migration.verify_candidate_snapshot()`: **56/56 tabelas idênticas ao snapshot de origem por contagem e digest**.

Importante: funções SQL, triggers, views, RLS policies da aplicação, `SECURITY DEFINER`, esquemas operacionais `auth/storage`, autenticação real, bytes de mídia e tempo real **não foram portados**. As tabelas candidatas seguem inacessíveis pela Data API. A função de validação é `SECURITY INVOKER` e o schema privado não tem GRANT público.

## Atualização operacional — Neon Functions, snapshot e plano de transferência (2026-10-25)

### Infraestrutura Free confirmada

- Organização `org-royal-shape-81986230` no plano Free.
- PostgreSQL atual da homologação: cerca de **14.172.160 bytes**; a API do projeto ainda indica teto **512 MiB**, embora o site oficial informe **1 GB/projeto** desde outubro de 2026. Adotar **512 MiB** como limite operacional até a API confirmar outro valor.
- Neon Object Storage ativo com sete buckets privados: **5 GB/projeto** anunciados para plano Free. Os 277 objetos originais (369.296.700 bytes de metadados) cabem em volume nominal, sem garantia de velocidade, largura de banda ilimitada ou operação futura sem limites.
- Neon Functions no Free: até **1 milhão de invocações/mês**, 10 active/400 waiting Capacity-Hours. Função `staginghealth` implantada na branch isolada, **deployment ID 2, status completed**, Node.js 24, sem acesso a tabelas ou dados privados. Endpoint `https://br-round-fog-b7pseu7j-staginghealth.compute.c-13.us-east-1.aws.neon.tech/health`; validação HTTP externa ainda sem comprovação. Código `backend/neon/functions/staginghealth/index.mjs`, testes locais/CI propostos em `tests/neon-staging-health.test.mjs`.
- Cloudflare R2 permanece indisponível: `403/10042 NotEntitled`, exigindo habilitação de R2 na conta. **Não** foi ativada assinatura nem faturamento. Escolha de infraestrutura: Neon Storage, enquanto as cotas gratuitas forem suficientes.
- Não foi feito upgrade ou assinatura de plano pago.

### Snapshot Neon protegido

- Backup interno manual criado com ID **`snap-curly-shape-b7es25v7`**, nome `looply-v3-staging-pre-auth-20261025` da branch `br-round-fog-b7pseu7j`; listado e confirmado pelo Neon. Plano Free inclui **um** snapshot manual.
- **Não** é backup offsite e **não** contém bytes de imagens, vídeos ou áudios não migrados. Antes do corte ainda será obrigatório backup externo seguro e teste de restauração.

### Verificador executável e transferência de mídia em preparação

- `backend/neon/sql/staging-readiness.sql` executado no Neon: 56/56 tabelas com RLS, hashes iguais, zero grants públicos, 867 linhas, **6 contas legadas vs. 0 no Neon Auth, 277 objetos catalogados vs. 0 efetivamente verificados, cutover_approved=false**.
- `backend/neon/scripts/media-transfer.mjs`: execução explicitamente bloqueada por padrão; exige manifesto privado com URLs assinadas de download, upload e verificação; compara tamanho e SHA-256 pós-transferência e não registra tokens em logs. `tests/neon-media-transfer.test.mjs` cobre entradas inválidas, conteúdo divergente e transferência simulada. Nenhuma transferência real executada e nenhuma credencial armazenada no repositório.
- Workflow `.github/workflows/staging-smoke.yml` criado para `npm test` e consulta HTTP real; **nenhum resultado de run confirmado pelo conector no momento deste registro**, logo testes não devem ser chamados de aprovados.

### Inventário adicional de lógica faltante (consulta somente leitura à produção)

- Funções SQL no schema `public`: **44**; triggers não internos: **36**.
- Políticas RLS `public`: **157**; policies `storage`: **33**.
- Publicações Realtime `public`: **30** tabelas.
- Na homologação privada, **zero** dessas funções/triggers/policies foram portadas. RLS ON com políticas de negação, sem exposição por Data API. Essas lógicas são pré-requisitos de segurança antes de abrir a API de dados da aplicação.
- A documentação atual de migração Supabase→Neon declara que hashes de senha legados **não migram diretamente** para Managed Better Auth e que `auth.updateUser({password})` não é suportado. Preparar fluxo novo de ativação/redefinição com provas de posse, mantendo os UUIDs legados vinculados de forma segura sem criar perfis duplicados. Não criar contas reais silenciosamente nem enviar convites nesta etapa.

### Referências oficiais

- https://neon.com/docs/introduction/plans
- https://neon.com/docs/auth/migrate/from-supabase
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/r2/api/error-codes/
