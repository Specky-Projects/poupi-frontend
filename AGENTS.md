# Agent Guide

Este repositorio e somente frontend. O backend/Data Core vive fora daqui.

- Apps em `apps/*` devem ser independentes e deployaveis separadamente.
- Nao acessar banco diretamente em nenhum app.
- Usar `NEXT_PUBLIC_API_URL` para falar com o Data Core.
- Componentes reutilizaveis ficam em `packages/ui`.
- Cliente HTTP centralizado fica em `packages/api-client`.
- Types compartilhados ficam em `packages/types`.
- Utils puras ficam em `packages/utils`.
- Config compartilhada fica em `packages/config`.
- Nao colocar regra de negocio especifica em `packages/ui`.
