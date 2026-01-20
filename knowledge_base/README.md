# Knowledge Base para RAG Veterinário

Esta pasta contém os documentos (PDFs, TXTs) que serão utilizados pela Inteligência Artificial do Gestor Vetsmart para enriquecer os diagnósticos (RAG - Retrieval-Augmented Generation).

## Como adicionar novos documentos

1.  **Coloque seus arquivos aqui**: Salve artigos científicos, protocolos ou bulas nesta pasta.
    *   Formatos suportados: `.pdf`, `.txt`.
    *   Exemplo: `protocolo_dermatite_2025.txt`.

2.  **Sincronize com a Nuvem**: Para que a IA tenha acesso a esses novos arquivos, você precisa enviá-los para o Google Cloud Storage. Execute o seguinte comando na raiz do projeto:

    ```bash
    npm run sync-docs
    ```

3.  **Pronto!**: A IA passará a considerar esses documentos nas próximas consultas.

## Estrutura
Os arquivos são enviados para um Bucket no Google Cloud Storage (`[PROJECT_ID]-knowledge-base`) dentro da pasta `docs/`.
