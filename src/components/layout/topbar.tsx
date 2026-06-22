"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LogOut, User, CreditCard, Briefcase, GraduationCap } from "lucide-react";

export type PanelKey = "journey" | "curriculo" | "emprecard" | "vagas" | "cursos";

function ProfileRing({ progress }: { progress: number }) {
  const prevRef = useRef(progress);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (progress <= prevRef.current) { prevRef.current = progress; return; }
    prevRef.current = progress;
    setPulsing(true);
    const t = setTimeout(() => setPulsing(false), 700);
    return () => clearTimeout(t);
  }, [progress]);

  const size = 36;
  const sw = 2.5;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - progress / 100);

  return (
    <span
      className={`relative flex-none${pulsing ? " avatar-pop" : ""}`}
      style={{ width: size, height: size }}
    >
      <svg
        className="absolute inset-0 -rotate-90"
        width={size}
        height={size}
        style={{ overflow: "visible" }}
      >
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={sw} />
        {progress > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--success)"
            strokeWidth={sw}
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className={pulsing ? "arc-glow" : ""}
            style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        )}
      </svg>
      <span className="absolute rounded-full overflow-hidden" style={{ inset: sw + 2 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://i.pravatar.cc/64?img=12" alt="Bolivar" className="w-full h-full object-cover" />
      </span>
    </span>
  );
}

function progressHint(p: number): string {
  if (p < 10)  return "Comece agora — leva menos de 5 minutos!";
  if (p < 40)  return "Continue a conversa para avançar.";
  if (p < 70)  return "Mais vagas com o perfil mais completo!";
  if (p < 90)  return "Quase lá — finalize para se destacar.";
  if (p < 100) return "Perfil quase completo. Você está perto!";
  return "Perfil completo. Você está pronto para as melhores vagas!";
}

interface TopbarProps {
  profileProgress?: number;
  renderPanel?: (key: PanelKey, onBack: () => void) => React.ReactNode;
  forcedPanel?: PanelKey | null;
  onForcedPanelDismiss?: () => void;
}

export function Topbar({
  profileProgress = 0,
  renderPanel,
  forcedPanel,
  onForcedPanelDismiss,
}: TopbarProps = {}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelKey | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const onDismissRef = useRef(onForcedPanelDismiss);
  const forcedPanelRef = useRef(forcedPanel);
  useEffect(() => { onDismissRef.current = onForcedPanelDismiss; }, [onForcedPanelDismiss]);
  useEffect(() => { forcedPanelRef.current = forcedPanel; }, [forcedPanel]);

  // Open menu automatically when parent forces a panel (e.g. EmpreCardMessage)
  useEffect(() => {
    if (forcedPanel) setMenuOpen(true);
  }, [forcedPanel]);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setActivePanel(null);
        if (forcedPanelRef.current) onDismissRef.current?.();
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  function goBack() {
    setActivePanel(null);
    if (forcedPanelRef.current) onDismissRef.current?.();
  }

  function closeAll() {
    setMenuOpen(false);
    setActivePanel(null);
    if (forcedPanelRef.current) onDismissRef.current?.();
  }

  const effectivePanel = forcedPanel ?? activePanel;

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
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-0.5 pr-3 py-1 rounded-full border border-border bg-muted/50 hover:bg-muted hover:border-primary/40 transition-colors"
          >
            <ProfileRing progress={profileProgress} />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-foreground leading-none">Bolivar</span>
              <span className="text-[11px] font-bold text-primary leading-none">{profileProgress}% preenchido</span>
            </div>
          </button>

          {menuOpen && (
            <div
              className={`absolute right-0 top-[calc(100%+8px)] z-50 border border-border rounded-xl bg-card shadow-md overflow-hidden flex flex-col transition-[width] duration-150 ${effectivePanel ? "w-80" : "w-72"}`}
              style={{ maxHeight: "calc(100svh - var(--header-h) - 24px)" }}
            >
              {effectivePanel ? (
                /* ── Second level: panel content ── */
                <div className="flex flex-col flex-1 min-h-0">
                  {renderPanel?.(effectivePanel, goBack)}
                </div>
              ) : (
                /* ── First level: main menu ── */
                <div role="menu" aria-label="Menu da conta" className="p-1.5">
                  {/* User info */}
                  <div className="px-2.5 pt-2 pb-2.5">
                    <p className="text-sm font-semibold">Bolivar Alencastro</p>
                    <p className="mt-0.5 text-xs text-muted-foreground break-words">bolivar@alencastro.com.br</p>
                  </div>

                  <div className="h-px mx-1 bg-border" />

                  {/* Progress hint */}
                  <button
                    type="button"
                    onClick={() => setActivePanel("journey")}
                    className="w-full px-2.5 py-3 rounded-lg text-left hover:bg-muted/60 transition-colors"
                  >
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {progressHint(profileProgress)}
                    </p>
                    <p className="text-[11px] text-primary/80 font-medium mt-1">
                      Ver etapas em aberto →
                    </p>
                  </button>

                  <div className="h-px mx-1 bg-border" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => setActivePanel("curriculo")}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-muted text-left"
                  >
                    <User className="w-4 h-4 text-muted-foreground flex-none" />
                    Ver perfil
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => setActivePanel("emprecard")}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-muted text-left"
                  >
                    <CreditCard className="w-4 h-4 text-muted-foreground flex-none" />
                    Ver EmpreCard
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => setActivePanel("vagas")}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-muted text-left"
                  >
                    <Briefcase className="w-4 h-4 text-muted-foreground flex-none" />
                    Minhas candidaturas
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => setActivePanel("cursos")}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-muted text-left"
                  >
                    <GraduationCap className="w-4 h-4 text-muted-foreground flex-none" />
                    Meus cursos
                  </button>

                  <div className="h-px mx-1 bg-border" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={closeAll}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-muted text-left"
                  >
                    <LogOut className="w-4 h-4 text-muted-foreground flex-none" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
