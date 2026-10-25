# Decisão de infraestrutura e auditoria — 2026-10-25

## Escolha provisória com limites explícitos
- **Banco:** Neon PostgreSQL existente `looply-v3-migration` (`small-scene-81115187`, PostgreSQL 17, projeto free_v3). Preferível ao D1 para reduzir incompatibilidade com a origem PostgreSQL.
- **API:** Cloudflare Workers Free como candidato, não implantado. Limites publicados: 100.000 requisições/dia e 10 ms de CPU por requisição no Free. Exige arquitetura compatível, autenticação segura e testes.
- **Mídias:** Cloudflare R2 Standard como candidato, 10 GB-mês gratuitos, 1 milhão de operações Class A e 10 milhões Class B mensais. **BLOQUEADO:** API devolve HTTP 403 código 10042, exigindo habilitar R2 no Dashboard. Não foi possível criar bucket.
- **Alternativa D1:** 5 GB de armazenamento gratuito total, mas usa SQLite, incompatível diretamente com funções, triggers e SQL PostgreSQL existentes.
- **Frontend:** GitHub Pages em repositório privado não é oferecido pelo GitHub Free; requer elegibilidade de plano ou repositório público. Manter Vercel atual sem alterar produção enquanto alternativa é validada.
- **Não há capacidade ilimitada garantida, e limites ou mudanças de plano podem interromper serviços.** Não habilitar pagamento, upgrades ou excedentes sem autorização.

## Inventário de conexões realmente verificadas
- Cloudflare: conta conectada, leitura de Workers e D1 funcionou; 0 Workers e 0 bancos D1 listados. R2 bloqueado por ativação da conta.
- Neon: projetos existentes `looply-v3-migration` (PG17) e `looply-v3` (PG18). Ambos identificados como `free_v3`.
- Neon `looply-v3-migration`: 56 tabelas em `looply_candidate`, 4 em `looply_migration`, 9 em `neon_auth`.
- `looply_migration.source_rows`: 867 registros; `source_table_inventory`: 56 tabelas, total de origem registrado 867, hashes de inventário presentes para 56 tabelas.
- Dados presentes na área candidata: `profiles` 6, `posts` 25, `chat_messages` 31, `archived_cards` 97, `archive_media` 227, `notifications` 189, `stories` 2.
- **Atenção:** `source_table_inventory.destination_row_count` está nulo em todas as tabelas, e `data_verified_at` está nulo nas 56; portanto, restauração ainda não certificada.
- `auth_user_inventory`: 6 usuários inventariados, **0 mapeados** em `target_user_id`.
- `storage_object_inventory`: 277 objetos inventariados, **0 marcados como verificados no destino**.
- As contagens são fotografia de inventário, não prova de sincronização em tempo real com produção. A discrepância de `archive_media` (227 na candidata contra 228 em levantamento anterior) exige apuração antes do corte.

## Próximos bloqueios de conclusão
1. Habilitar R2 no painel Cloudflare e confirmar se requer método de pagamento. **Não autorizar cobrança nem ativação de plano pago automaticamente.**
2. Validar cópia binária de cada objeto com tamanho, hash e acesso privado. Nunca colocar mídia privada ou dados de usuários no Git.
3. Completar migração de identidades e sessões com UUIDs, verificadores de senha compatíveis ou redefinição segura.
4. Implementar endpoints autenticados e políticas de autorização, preservar realtime e todos os fluxos do frontend.
5. Auditar integridade de todas as 56 tabelas e executar testes end-to-end antes de promover branch ou alterar DNS/produção.
6. Só desativar Supabase após backup, validação, período de retenção e rollback.

## Fontes oficiais consultadas
- https://neon.com/docs/introduction/pro-plan
- https://github.com/neondatabase/website/blob/main/content/faqs/free-plan-limits-and-quotas.md
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
