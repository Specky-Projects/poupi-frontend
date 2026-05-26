# Poupi Frontend

Monorepo frontend com apps independentes e pacotes compartilhados.

## Apps

- `apps/poupi-baby`: frontend principal do Poupi Baby.
- `apps/crypto-dashboard`: dashboard pessoal de cripto.
- `apps/real-estate-dashboard`: dashboard/lab de imoveis.
- `apps/sports-dashboard`: dashboard/lab de odds esportivas.
- `apps/quant-dashboard`: dashboard quantitativo/lab futuro.

## Packages

- `packages/ui`: componentes compartilhados.
- `packages/api-client`: cliente HTTP para o Data Core.
- `packages/types`: types compartilhados.
- `packages/utils`: funcoes reutilizaveis.
- `packages/config`: ESLint, TypeScript, Tailwind e Prettier compartilhados.

## Comandos

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
```

## Ambiente

Cada app deve ter seu proprio `.env.local` baseado em `.env.example`:

```env
NEXT_PUBLIC_API_URL=https://api.seudominio.com
```

Nenhum app acessa banco diretamente. Todos consomem o Data Core via API.
