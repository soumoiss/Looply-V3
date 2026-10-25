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
