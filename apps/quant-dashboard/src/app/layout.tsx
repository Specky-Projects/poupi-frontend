import "./globals.css";

export const metadata = {
  title: "Quant Dashboard",
  description: "Lab quantitativo para sinais, simulacoes, risco e performance futura.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
