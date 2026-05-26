import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const variants = {
    primary: "bg-zinc-950 text-white hover:bg-zinc-800",
    secondary: "bg-white text-zinc-950 ring-1 ring-zinc-200 hover:bg-zinc-50",
    ghost: "text-zinc-700 hover:bg-zinc-100",
  };

  return (
    <button
      className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-lg border border-zinc-200 bg-white p-5 shadow-sm ${className}`} {...props} />;
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-zinc-900 transition focus:ring-2 ${className}`}
      {...props}
    />
  );
}

export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-col gap-1 border-b border-zinc-200 pb-5">
          <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
          {subtitle ? <p className="text-sm text-zinc-600">{subtitle}</p> : null}
        </header>
        {children}
      </div>
    </main>
  );
}

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <Card>
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {detail ? <div className="mt-1 text-sm text-zinc-500">{detail}</div> : null}
    </Card>
  );
}
