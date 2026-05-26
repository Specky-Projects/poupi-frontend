import "./globals.css";

export const metadata = {
  title: "Sports Dashboard",
  description: "Lab de odds esportivas para odds, CLV, EV, historico e tracking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
