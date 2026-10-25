# Looply V3 — critérios de migração de dados e corte seguro

> Documento operacional. Nenhuma etapa abaixo equivale a uma migração executada.

## Inventário de origem (consulta somente leitura, 2026-10-25)
- Supabase `Looply V2`: `qixocgetiwlrsbadpbvh`, provável fonte dos dados. Confirmar URL de produção e chaves públicas antes de considerar fonte definitiva.
- 56 tabelas base em `public`, 27 em `auth` e 8 em `storage` (não significa que todas tenham registros).
- 6 usuários de autenticação e 277 objetos em buckets (~369,3 MB segundo metadados).
- Regras de acesso: RLS, funções `SECURITY DEFINER`, triggers, políticas de storage e permissões privadas exigem reconstrução e testes.
- Cópia de SQL versionado em `supabase/migrations` **não** é dump do estado atual, nem substitui migração de `auth.users`, políticas ou objetos.

## Bloqueios objetivos antes de qualquer escrita de dados
1. Confirmar destino operacional: instância de banco, armazenamento de objetos, API/Auth, DNS, segredos e capacidade gratuita verificável. Não assumir cotas ilimitadas.
2. Confirmar permissões para exportar/restaurar banco e objetos privados sem torná-los públicos.
3. Produzir backup consistente e criptografado fora do GitHub, com hashes SHA-256, inventário de tabelas, contagens, tamanhos e referências de objetos. Validar restauração em ambiente isolado.
4. Mapear identidades: preservar UUIDs, verificar hashes/salt de senha e algoritmo de autenticação. Nunca exportar senhas em claro; se não for possível preservar verificadores, preparar redefinição segura.
5. Implementar API que valide autenticação e autorização no servidor. Nunca expor credenciais de banco/storage no navegador.
6. Migrar dados com consistência referencial, mensagens, Stories, cartas, mídias, posts, notificações, preferências, playlists, push e tarefas de limpeza.
7. Replicar regras de privacidade e acesso por usuário/grupo; validar links assinados e expiração de mídia.
8. Executar testes unitários, integração, E2E, acessibilidade e segurança; confirmar uploads/downloads de arquivos reais sem vazamento.
9. Estabelecer janela de corte, sincronização incremental, teste de login por conta, rollback e observabilidade. **Não apagar Supabase** antes de retenção e restauração comprovada.

## Estado da cópia Git
- Arquivos originais: 338/338 caminhos presentes em `migration/import-source-20261025`, hashes idênticos exceto `README.md`, preservado em `docs/ORIGINAL_LOOPLY_README.md`.
- Histórico original: `source-snapshot-20261025` aponta para o commit auditado `d96527dd71a28aa3efb535615fe827dfaacba5d9`.
- `main` ainda é branch de documentação, sem produção V3.
- Workflow `v3-baseline-verify.yml` criado para executar build e testes; nenhum resultado de execução confirmado no momento deste registro.

## Garantias não demonstradas
- Não há prova de backend gratuito de capacidade ilimitada.
- Não há backup/restauração validado.
- Não há testes funcionais aprovados nem implantação V3 independente do Supabase.
