"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { LogOut, User, CreditCard, Briefcase, GraduationCap } from "lucide-react";

function progressHint(p: number): string {
  if (p < 10)  return "Comece agora — leva menos de 5 minutos!";
  if (p < 40)  return "Continue a conversa para avançar.";
  if (p < 70)  return "Mais vagas com o perfil mais completo!";
  if (p < 90)  return "Quase lá — finalize para se destacar.";
  if (p < 100) return "Perfil quase completo. Você está perto!";
  return "Perfil completo. Você está pronto para as melhores vagas!";
}

interface TopbarProps {
  onOpenProfile?: () => void;
  onOpenEmpreCard?: () => void;
  onOpenJourney?: () => void;
  onOpenJobs?: () => void;
  onOpenCourses?: () => void;
  profileProgress?: number;
}

export function Topbar({ onOpenProfile, onOpenEmpreCard, onOpenJourney, onOpenJobs, onOpenCourses, profileProgress = 0 }: TopbarProps = {}) {
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

  function act(fn?: () => void) {
    setMenuOpen(false);
    fn?.();
  }

  return (
    <header
      className="flex-none bg-background"
      style={{ height: "var(--header-h)" }}
    >
      <div className="w-full h-full px-5 flex items-center justify-between gap-5">
        <Link
          href="/assistente"
          aria-label="EmpregaCOOP — ir para o assistente"
          className="flex items-center h-9 transition-opacity hover:opacity-80"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://b2c.empregacoop.xyz/brand/empregacoop-logo-cor.png"
            alt="EmpregaCOOP"
            className="h-5 w-auto sm:h-9 object-contain"
          />
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Minha conta"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-border hover:border-primary/40 transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://i.pravatar.cc/64?img=12"
              alt="Bolivar"
              className="w-full h-full object-cover"
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              aria-label="Menu da conta"
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 p-1.5 border border-border rounded-xl bg-card shadow-md"
            >
              {/* User info */}
              <div className="px-2.5 pt-2 pb-2.5">
                <p className="text-sm font-semibold">Bolivar Alencastro</p>
                <p className="mt-0.5 text-xs text-muted-foreground break-words">bolivar@alencastro.com.br</p>
              </div>

              <div className="h-px mx-1 bg-border" />

              {/* Progress — clickable → opens journey drawer */}
              <button
                type="button"
                onClick={() => act(onOpenJourney)}
                className="w-full px-2.5 py-3 rounded-lg text-left hover:bg-muted/60 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold">Perfil</p>
                  <span className="text-xs font-bold text-primary">{profileProgress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${profileProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                  {progressHint(profileProgress)}
                </p>
                <p className="text-[11px] text-primary/80 font-medium mt-1">
                  Ver etapas em aberto →
                </p>
              </button>

              <div className="h-px mx-1 bg-border" />

              {onOpenProfile && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => act(onOpenProfile)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-muted text-left"
                >
                  <User className="w-4 h-4 text-muted-foreground flex-none" />
                  Ver perfil completo
                </button>
              )}
              {onOpenEmpreCard && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => act(onOpenEmpreCard)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-muted text-left"
                >
                  <CreditCard className="w-4 h-4 text-muted-foreground flex-none" />
                  Ver EmpreCard
                </button>
              )}
              {onOpenJobs && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => act(onOpenJobs)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-muted text-left"
                >
                  <Briefcase className="w-4 h-4 text-muted-foreground flex-none" />
                  Minhas candidaturas
                </button>
              )}
              {onOpenCourses && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => act(onOpenCourses)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-muted text-left"
                >
                  <GraduationCap className="w-4 h-4 text-muted-foreground flex-none" />
                  Meus cursos
                </button>
              )}

              <div className="h-px mx-1 bg-border" />

              <button
                type="button"
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-muted text-left"
              >
                <LogOut className="w-4 h-4 text-muted-foreground flex-none" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
