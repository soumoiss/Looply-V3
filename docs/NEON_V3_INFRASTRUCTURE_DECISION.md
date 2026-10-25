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
