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
