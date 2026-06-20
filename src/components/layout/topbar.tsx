"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { LogOut } from "lucide-react";

export function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <header
      className="flex-none bg-card border-b border-border"
      style={{ height: "var(--header-h)" }}
    >
      <div className="w-full h-full px-5 flex items-center justify-between gap-5">
        <Link
          href="/assistente"
          aria-label="EmpregaCOOP — ir para o assistente"
          className="flex items-center w-[190px] h-9 transition-opacity hover:opacity-80 max-sm:w-9 max-sm:overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://b2c.empregacoop.xyz/brand/empregacoop-logo-cor.png"
            alt="EmpregaCOOP"
            className="block w-[190px] max-h-9 object-contain object-left max-sm:w-9 max-sm:h-9"
          />
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Conta do usuário"
            data-tooltip="Minha conta"
            data-tooltip-dir="down-left"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-full bg-card shadow-sm hover:bg-muted transition-colors"
          >
            <span className="w-7 h-7 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              BA
            </span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              aria-label="Menu da conta"
              className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-60 p-1.5 border border-border rounded-xl bg-card shadow-md"
            >
              <div className="px-2.5 pt-2 pb-2.5">
                <p className="text-sm font-semibold">Bolivar Alencastro</p>
                <p className="mt-0.5 text-xs text-muted-foreground break-words">
                  bolivar@alencastro.com.br
                </p>
              </div>
              <div className="h-px mx-1 bg-border" />
              <button
                type="button"
                role="menuitem"
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm hover:bg-muted text-left"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
