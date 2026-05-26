import "./globals.css";

export const metadata = {
  title: "Real Estate Dashboard",
  description: "Lab de imoveis para anuncios, historico, score de oportunidade e mapa futuro.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
