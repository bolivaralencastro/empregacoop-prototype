"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";

const NAV = [
  { key: "assistente" as const, label: "Assistente", href: "/assistente" },
  { key: "emprecards" as const, label: "EmpreCards", href: "/emprecards/1" },
];

export function TopbarA({ activeSection = "assistente" }: { activeSection?: "assistente" | "emprecards" }) {
  return (
    <header className="flex-none bg-background border-b border-border" style={{ height: "var(--header-h)" }}>
      <div className="w-full h-full px-6 flex items-center">
        <Link href="/assistente" className="flex items-center h-9 mr-10 transition-opacity hover:opacity-80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://b2c.empregacoop.xyz/brand/empregacoop-logo-cor.png"
            alt="EmpregaCOOP"
            className="h-5 w-auto sm:h-9 object-contain"
          />
        </Link>

        <nav className="flex items-center gap-1 flex-1 justify-center">
          {NAV.map(({ key, label, href }) => (
            <Link
              key={key}
              href={href}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === key
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden md:block max-w-[180px] truncate">
            bolivar@alencastro.com.br
          </span>
          <button
            type="button"
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
