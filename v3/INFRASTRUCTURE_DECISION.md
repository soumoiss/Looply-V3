# Looply V3 — infraestrutura selecionada e acesso verificado (2026-10-25)

## Decisão
- Banco: **Neon PostgreSQL 18**, organização Free verificada, projeto criado `wispy-mountain-71258224`, branch `br-damp-dream-b8b0op2i`, database `neondb`, região `aws-us-east-1`.
- A API do projeto informa `branch_logical_size_limit_bytes=536870912` (512 MiB) e `subscription_type=free_v3`. Respeitar o limite **real da conta**, mesmo quando a documentação geral anuncia 1 GB por projeto.
- Armazenamento: **Cloudflare R2 Standard como candidato**, não provisionado. Cota documentada: 10 GB-mês, 1M operações A, 10M B por mês; excedentes são faturáveis. Não ativar sem confirmar conta, faturamento, controles e acesso.
- Backend: serviço HTTP seguro a definir após verificar provedor gratuito de execução e integração com Neon e R2. Não colocar URL de conexão, senha, chaves privadas ou tokens em repositório ou frontend.
- Frontend: GitHub Pages requer repositório público no GitHub Free; o V3 permanece privado. Não expor código e dados privados para contornar o requisito. Vercel é alternativa a auditar, não implantação concluída.

## Implementado e testado
- `migration_control.checkpoints` criada em Neon e verificada com SELECT.
- Cinco registros: `source_git_snapshot=verified`, `database_export=pending`, `auth_migration=pending`, `private_media_copy=pending`, `frontend_cutover=blocked`.
- SQL idempotente versionado em `v3/database/0001_migration_control.sql`.
- Original Supabase, contas, armazenamento, políticas e frontend em produção **não foram alterados**.

## Próximas condições obrigatórias
1. Verificar acesso ao Cloudflare R2 e controles de cobrança antes de criar bucket.
2. Obter backup consistente e seguro do Supabase; nunca publicar dados de usuários no GitHub.
3. Validar restauração em ambiente isolado e dimensionamento para o limite real de 512 MiB do Neon.
4. Projetar autorização, autenticação, realtime e APIs para preservar privacidade.
5. Executar testes, fazer migração incremental, cutover reversível e somente depois aposentar serviços antigos.

## Referências
- https://neon.com/pricing
- https://developers.cloudflare.com/r2/pricing/
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
