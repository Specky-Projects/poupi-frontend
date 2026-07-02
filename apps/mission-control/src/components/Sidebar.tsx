"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV } from "@/lib/nav";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 flex w-60 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-14 items-center gap-2 border-b border-zinc-200 px-5">
        <div className="h-2.5 w-2.5 rounded-full bg-zinc-950" />
        <span className="text-sm font-semibold tracking-tight">Poupi Mission Control</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((group) => (
          <div key={group.title} className="mb-5">
            <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {group.title}
            </div>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((entry) => {
                const active = pathname === entry.href;
                return (
                  <li key={entry.slug}>
                    <Link
                      href={entry.href}
                      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition ${
                        active ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      <span>{entry.label}</span>
                      {!entry.live ? (
                        <span
                          className={`rounded px-1 text-[10px] font-medium ${
                            active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-400"
                          }`}
                        >
                          soon
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-zinc-200 px-5 py-3 text-[11px] text-zinc-400">
        V1 · Phase 1
      </div>
    </aside>
  );
}
