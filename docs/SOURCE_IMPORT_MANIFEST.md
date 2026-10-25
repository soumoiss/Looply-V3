# Importação incremental do Looply original

Origem: `soumoiss/Looply`, branch `main` (referência auditada: `d96527dd71a28aa3efb535615fe827dfaacba5d9`).
Destino: `soumoiss/Looply-V3`, branch `migration/import-source-20261025`.

## Arquivos copiados e confirmados na árvore Git do destino
- package.json
- scripts/build.mjs
- src/story-text-style.js
- src/date-parser.js
- src/publication-validation.js
- src/pagination.js
- src/call-protocol.js
- src/media-urls.js
- src/notification-bus.js
- src/storage-url-cache.js

## Estado e limites
- Transferência parcial, não constitui cópia completa do repositório ou histórico.
- Não houve execução de build ou testes nesta etapa.
- Não migrados: páginas HTML, estilos principais, módulos maiores, imagens, Android, SQL, dados, mídias e históricos.
- Não foram realizadas alterações na produção ou no Supabase.
- PR #115 permanece separado e não integrado.
- O branch não deve ser usado como publicação do aplicativo.

## Critérios para a próxima importação
- Copiar arquivos restantes por grupos verificáveis.
- Confirmar o SHA/blob ou conteúdo de cada arquivo.
- Não inserir segredos ou dados pessoais no repositório.
- Para preservação integral do histórico, realizar espelhamento Git por um ambiente com acesso de clone/push e credenciais autorizadas, depois reconciliar esta ramificação.
