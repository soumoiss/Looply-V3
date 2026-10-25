# Looply V3 — transferência de arquivos privados para Neon (homologação)

**Estado:** ferramenta e registro SQL privados implementados; **0/277 arquivos reais transferidos**. A execução exige URLs assinadas emitidas por provedores autorizados. Não salve essas URLs no GitHub, CI, logs nem em chats.

## Destino e limites

- Neon Free `small-scene-81115187`, branch `br-round-fog-b7pseu7j`. Sete buckets com nomes equivalentes aos da origem, **todos privados**.
- Inventário de origem em `looply_migration.storage_object_inventory`: 277 arquivos, 369.296.700 bytes, maior arquivo de 15.926.565 bytes. Franquia gratuita publicada: 5 GB por projeto, sujeita a limites de transferência e operações.
- A tabela `looply_migration.verified_media_receipts` registra somente bucket, caminho, tamanho e SHA-256. Nenhum recibo é aceito como autenticação nem dá permissão de acesso.

## Manifeste seguro (exemplo fictício — não contém URLs funcionais)

Armazene o JSON exclusivamente fora do repositório, em pasta privada do operador:

```json
{
  "items": [
    {
      "bucket": "looply-media",
      "key": "imagem-exemplo.jpg",
      "sizeBytes": 1234,
      "contentType": "image/jpeg",
      "sourceUrl": "https://qixocgetiwlrsbadpbvh.supabase.co/storage/v1/object/sign/looply-media/imagem-exemplo.jpg?token=ASSINATURA_TEMPORARIA",
      "uploadUrl": "https://br-round-fog-b7pseu7j.storage.c-13.us-east-1.aws.neon.tech/looply-media/imagem-exemplo.jpg?X-Amz-Signature=ASSINATURA_TEMPORARIA",
      "verifyUrl": "https://br-round-fog-b7pseu7j.storage.c-13.us-east-1.aws.neon.tech/looply-media/imagem-exemplo.jpg?X-Amz-Signature=ASSINATURA_TEMPORARIA"
    }
  ]
}
```

**Não copie este exemplo literalmente.** As URLs são fictícias. O operador precisa obter um link de **download privado** do Supabase com autorização, um link **PUT** e outro **GET** do Neon, todos válidos no momento da transferência. O utilitário verifica domínio exato, bucket/caminho correto, tokens presentes, tamanho inventariado e hash SHA-256 do arquivo lido novamente do destino. Os links assinados devem expirar rapidamente e ficam fora de logs.

## Comandos para operador autorizado

```bash
node backend/neon/scripts/media-transfer.mjs --dry-run --manifest=/secure/looply-v3-manifest.json

LOOPLY_V3_ALLOW_MEDIA_UPLOAD=YES node backend/neon/scripts/media-transfer.mjs \
  --execute \
  --manifest=/secure/looply-v3-manifest.json \
  --receipt-file=/secure/looply-v3-verified.jsonl
```

A execução requer consentimento explícito por variável de ambiente e arquivo de recibos exclusivo (modo `0600`), sem substituição de arquivo preexistente. Cada linha de recibo contém apenas identificadores de mídia e hash verificado, não links assinados. **Não executar migração antes de possuir backup independente**. Se houver falha, arquivos já transferidos não devem ser marcados como verificados sem um novo download e conferência.

Os recibos devem ser importados à tabela de migração usando somente `looply_migration.record_verified_media(bucket,object,bytes,sha256)` pelo proprietário administrativo do banco. A função verifica existência no inventário e tamanho idêntico, mas ela **não revalida sozinha os bytes remotos**; por isso o script faz download e compara SHA-256 antes de gerar o recibo. A consulta `backend/neon/sql/staging-readiness.sql` reprova o corte enquanto faltar algum recibo.

## Proteções que continuam obrigatórias

- A cópia não deve alterar/excluir qualquer objeto Supabase original.
- Não tornar públicos os buckets para facilitar a transferência.
- Não persistir service-role, S3 secrets, URLs assinadas, tokens ou arquivos privados em repositório.
- Não permitir upload/download pelo browser sem autorização por objeto e usuário no servidor.
- Não habilitar página V3, api de dados ou produção antes de testes de acesso cruzado e backups.
- A ferramenta ainda requer um método seguro para obtenção das URLs assinadas do Supabase; o conector disponível nesta sessão não expõe binários/assinaturas dos objetos privados para uma migração executável de ponta a ponta.
