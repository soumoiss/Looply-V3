# Looply V3 — Plano de adaptação segura de autorização

> Status: levantamento de riscos e mecanismos privados implantados em homologação. **Não habilitar leitura pública nem realizar cutover.**

## Origem verificada (consultas somente leitura, 2026-10-25)

| Área | Quantidade | Risco na migração |
|---|---:|---|
| Tabelas da aplicação com RLS | 56 | Isolamento entre contas, grupos e administradores |
| Políticas de acesso em `public` | 157 | 111 referenciam `auth.uid()` do Supabase |
| Políticas em `storage` | 33 | Caminhos e proprietários de mídias privadas |
| Funções SQL em `public` | 44 | 38 são `SECURITY DEFINER`, potencialmente privilegiadas |
| Triggers de aplicação | 36 | Ações e notificações automáticas |
| Tabelas publicadas no Supabase Realtime | 30 | Privacidade dos eventos e mensagens |
| Tabelas copiadas e verificadas no Neon | 56/56 | Somente schema privado `looply_candidate` |
| Índices/restraints PostgreSQL | 174 índices / 291 constraints | Cinco FKs apontam a tabela privada `looply_auth_compat.legacy_principals` (proxy), **não** ao Neon Auth |
| Contas antigas catalogadas | 6 | 0 contas de usuário ativadas no Neon Auth |
| Objetos de mídia catalogados | 277 | 0 transferidos e com digest validado |

### Regras de segurança já implantadas no Neon

1. Os 56 conjuntos de dados restaurados em `looply_candidate` têm RLS ligado **e nenhuma política/grant de leitura aos papéis públicos**; estão ausentes da Data API pública.
2. `looply_auth_compat.legacy_principals`: tabela privada de seis UUIDs antigos, referenciada pelos cinco relacionamentos antes dependentes de `auth.users`. **A equivalência é apenas estrutural**: ela não autentica ninguém. Mantém-se a proteção de que nenhuma conta nova é associada automaticamente.
3. `looply_migration.verified_identity_links`: relação administrativa 1:1 entre UUID antigo e UUID Neon; `link_verified_identity(uuid)` é `SECURITY INVOKER`, sem EXECUTE público. Ela exige os dois e-mails verificados e iguais, existência do perfil antigo e ausência de vínculo concorrente. Tentativa com identidade inexistente retornou false.
4. `looply_migration.verified_media_receipts`: ledger privado de SHA-256 e tamanhos dos arquivos. `record_verified_media` recusa objetos desconhecidos e tamanhos divergentes; EXECUTE público bloqueado. **Nenhuma entrada de transferência existe ainda**.
5. `backend/neon/sql/staging-readiness.sql` executado no destino: `private_snapshot_integrity_passed=true`, `identity_link_gate=false`, `media_sha256_gate=false`, `authorization_and_realtime_gate=false` e `production_cutover_approved=false`.

## Sequência recomendada de implementação funcional

1. **Autenticação Neon:** preparar ativação por posse do e-mail, novo fluxo de senha e sessão; o Neon Managed Better Auth não importa diretamente o hash Supabase. Preservar perfis originais por UUID sem sobrescrever o ID de `neon_auth.user`; associar somente após `emailVerified`.
2. **Identidade do request:** usar os métodos oficiais do Neon Auth para validar sessão/issuer/expiração no servidor. Resolver o legado por `verified_identity_links` **após** autenticação; nunca aceitar UUID legado vindo do cliente como prova de identidade. Criar limites de taxa e logs sem segredos.
3. **API por recurso:** migrar primeiro leituras seguras do próprio perfil e apenas depois posts, comentários, galeria, cartas, chat e administração. Cada endpoint precisa validar dono, participante, visibilidade e grupo; não basta estar autenticado.
4. **RLS e funções privilegiadas:** não copiar as 38 funções `SECURITY DEFINER` literalmente. Revisar `search_path`, privilégios, `EXECUTE` e condições de autorização; preferir `SECURITY INVOKER`. Para visões, usar `security_invoker=true`. Testar políticas de cada operação SELECT/INSERT/UPDATE/DELETE.
5. **Mídias:** gerar URLs de curta duração no servidor após autorizar arquivo e usuário; bucket privado por padrão. Cada objeto só é contado quando seus bytes são transferidos e o digest SHA-256 é conferido após download do destino. Não disponibilizar credenciais S3 no frontend.
6. **Realtime:** Neon Realtime beta não oferece o isolamento RLS equivalente ao Supabase; construir gateway com autenticação e filtro de eventos no servidor ou solução alternativa comprovada. Não assinar feeds privados diretamente.
7. **Testes negativos obrigatórios:** tentar ler/consertar dados com UUID de outra conta, acessar arquivos com link inválido/expirado, efetuar operações de administração sem papel, chamar funções SQL com papel anônimo, e escutar eventos privados de outros participantes.
8. **Backup e corte:** snapshot Neon existente é interno e não inclui arquivos. Fazer backup criptografado fora dos dois serviços, restaurar isoladamente, reconciliar delta da origem, executar todos os testes, preservar opção de rollback; apenas então redirecionar tráfego.

## Evidências e limites

- Inventário de policies foi contado na origem; **não é autorização para reproduzi-las sem revisão**.
- As seis contas são antigas e confirmadas na origem, mas `neon_auth.user` continua com 0 registros. Não disparar e-mails/invites nem fazer auto-cadastro silencioso.
- Referências de mídia: 277 objetos / 369.296.700 bytes; todos aguardam transferência física e comprovante.
- Branch de código: `migration/import-source-20261025`; produção `soumoiss/Looply`, Supabase `qixocgetiwlrsbadpbvh` e domínios Vercel permanecem inalterados.
- **Nenhum plano pago, armazenamento ilimitado ou compatibilidade funcional completa está garantido**.
