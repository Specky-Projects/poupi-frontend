import './globals.css';

import Provider from '../providers/session-provider';

export const metadata = {
  title: 'Poupi — Monitor de Preços',
  description: 'Rastreie preços e receba alertas automaticamente.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
      </head>
      <body>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}