import "./globals.css";

export const metadata = {
  title: "Crypto Dashboard",
  description: "Painel pessoal para precos, alertas, graficos e historico de cripto.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
