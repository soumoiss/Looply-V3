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

## Atualização verificada — 2026-10-25
- 58 arquivos de código original transferidos (61 blobs no branch, incluindo README e 2 documentos próprios).
- Tree Git do destino consultada: 68 entradas, 61 blobs; importação ainda incompleta frente aos 338 blobs da origem.
- Commits adicionais: b6a196b, 4c7746d, 882bb52, f1c92a1, 3d398b9, fe673df.
- Inventário Supabase de leitura: projeto Looply V2 tem 6 usuários Auth e 277 objetos Storage (~369,3 MB declarados); ainda sem backup ou cópia de dados.
- Nenhum teste de build, integração ou E2E executado.
