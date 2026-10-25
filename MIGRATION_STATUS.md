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


## Continuação verificada — login visual e CI V3 (25/10/2026)

- **Infraestrutura em execução mais recente que esta documentação inicial:** Cloudflare Worker `looply-v3-staging` teve publicação confirmada em 2026-10-25T17:11:02Z. A URL pública de homologação agora entrega os arquivos originais do frontend via Assets, com `config.js` Neon e `src/supabase.js` como adaptador de compatibilidade usando `@neondatabase/neon-js`. **Não confundir a volta da interface com 100% de funcionalidade.**
- **Teste visual em navegador real:** Cloudflare Browser Rendering, viewport móvel 390×844: splash original exibido; após 8,2 segundos, redirect para `/login.html` confirmado; formulário, logotipo e campos visualizados. Tela desktop `/login.html` carregou e árvore de acessibilidade expôs usuário, senha, alternância de senha e botão Entrar. Não houve login positivo com conta real, teste de feed autenticado ou testes E2E completos.
- **Falha de CI corrigida:** commit `03cf8596c6f7a17c47852336b295bb78b5143106` instala pnpm 10 + `pnpm install --frozen-lockfile` antes de executar o build e a suite. Run anterior 40215328082 falhava com `ERR_MODULE_NOT_FOUND: esbuild`; novo run **40216601156 passou**, incluindo build e testes automatizados. Somente o arquivo de workflow foi alterado; nenhuma migração destrutiva, produção ou credencial foi tocada.
- **Estado Neon lido novamente:** 56 tabelas de aplicação agora no esquema `public` do destino; `looply_migration.verified_identity_links` registrou **1 vínculo**, enquanto `verified_media_receipts` continua **0**. Auth continua com `verify_email_on_sign_up=false` e `require_email_verification=false`; Realtime **desabilitado**. Não ampliar automaticamente cadastro ou vinculação sem reparar a verificação de e-mail e testar proteção de dados. As 277 mídias catalogadas seguem sem comprovante de cópia.
- **Pontos ainda bloqueados:** autenticação de usuário/senha legado, permissões/CRUD e isolamento multiusuário, mídia privada SHA-256, chat/WebRTC, Stories, galerias, notificações, administração, canais realtime, segurança e testes visuais pós-login. Não alterar produção original nem declarar o sistema pronto antes de validar esses itens.
