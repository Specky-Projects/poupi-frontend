import "./globals.css";

import { Sidebar } from "@/components/Sidebar";

export const metadata = {
  title: "Poupi Mission Control",
  description: "Central de operações unificada do ecossistema Poupi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Sidebar />
        <div className="min-h-screen bg-zinc-50 pl-60 text-zinc-950">{children}</div>
      </body>
    </html>
  );
}
