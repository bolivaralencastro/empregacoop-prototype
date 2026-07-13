"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Settings2, RotateCcw, Play, StepForward, Layers,
  LogIn, BookOpen, MessageSquare, ChevronRight,
} from "lucide-react";

export const PROTO_TOTAL = 24;

export type CoursePreset = "initial" | "progress" | "done";

export const PROTO_STAGES = [
  { label: "Boas-vindas da IA", count: 1 },
  { label: "Nome respondido", count: 2 },
  { label: "Currículo solicitado", count: 3 },
  { label: "Preferências coletadas", count: 4 },
  { label: "Vagas encontradas", count: 5 },
  { label: "Localização confirmada", count: 8 },
  { label: "Objetivo profissional", count: 10 },
  { label: "Experiência detalhada", count: 14 },
  { label: "Vagas compatíveis", count: 15 },
  { label: "Pré-requisitos · curso", count: 17 },
  { label: "Candidatura confirmada", count: 20 },
  { label: "Reativação · retorno", count: 21 },
  { label: "Nova candidatura", count: 23 },
  { label: "2ª candidatura · vaga liberada", count: 24 },
] as const;

const PAGES = [
  { label: "Login",        path: "/entrar",      Icon: LogIn },
  { label: "Onboarding",  path: "/onboarding",   Icon: BookOpen },
  { label: "Assistente",  path: "/assistente",   Icon: MessageSquare },
  { label: "Fluxogramas", path: "/fluxogramas",  Icon: Layers },
] as const;

export type ProtoMode = "complete" | "animated" | "manual";

export function ProtoControls() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState(() => {
    if (typeof window === "undefined") return PROTO_TOTAL;
    const value = window.localStorage.getItem("proto_stage");
    return value !== null ? parseInt(value, 10) : PROTO_TOTAL;
  });
  const [mode, setMode] = useState<ProtoMode>(() => {
    if (typeof window === "undefined") return "complete";
    return (window.localStorage.getItem("proto_mode") as ProtoMode | null) ?? "complete";
  });
  const [coursePreset, setCoursePreset] = useState<CoursePreset>(() => {
    if (typeof window === "undefined") return "initial";
    return (window.localStorage.getItem("proto_courses") as CoursePreset | null) ?? "initial";
  });
  const [layoutVariant, setLayoutVariant] = useState<"a" | "b">(() => {
    if (typeof window === "undefined") return "a";
    return (window.localStorage.getItem("proto_layout") as "a" | "b" | null) ?? "a";
  });
  const router = useRouter();
  const pathname = usePathname();

  function selectCoursePreset(preset: CoursePreset) {
    localStorage.setItem("proto_courses", preset);
    setCoursePreset(preset);
    window.dispatchEvent(new CustomEvent("proto-update", { detail: {} }));
  }

  function selectLayout(v: "a" | "b") {
    localStorage.setItem("proto_layout", v);
    setLayoutVariant(v);
    window.dispatchEvent(new CustomEvent("proto-update", { detail: {} }));
  }

  function dispatch(newStage: number, newMode: ProtoMode) {
    localStorage.setItem("proto_stage", String(newStage));
    localStorage.setItem("proto_mode", newMode);
    setStage(newStage);
    setMode(newMode);
    window.dispatchEvent(
      new CustomEvent("proto-update", { detail: { stage: newStage, mode: newMode } })
    );
    if (pathname !== "/assistente") {
      router.push("/assistente");
    }
    setOpen(false);
  }

  function selectStage(count: number) {
    dispatch(count, mode);
  }

  function selectMode(m: ProtoMode) {
    dispatch(stage, m);
  }

  function navigateTo(path: string) {
    router.push(path);
    setOpen(false);
  }

  function reset() {
    localStorage.setItem("proto_stage", "0");
    localStorage.setItem("proto_mode", "animated");
    setStage(0);
    setMode("animated");
    router.push("/entrar");
    setOpen(false);
  }

  function isCurrentPage(path: string) {
    if (path === "/emprecards/1/editar") return pathname.includes("/editar");
    if (path === "/emprecards/1") return !!pathname.match(/\/emprecards\/[^/]+$/) && !pathname.includes("/editar");
    if (path === "/emprecards") return pathname === "/emprecards";
    if (path === "/assistente") return pathname.startsWith("/assistente");
    return pathname === path;
  }

  const modes: { id: ProtoMode; label: string; icon: React.ReactNode }[] = [
    { id: "complete", label: "Completo", icon: <Layers className="w-3 h-3" /> },
    { id: "animated", label: "Animado", icon: <Play className="w-3 h-3" /> },
    { id: "manual", label: "Manual", icon: <StepForward className="w-3 h-3" /> },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col items-end gap-2">
      {open && (
        <div className="w-[260px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: "min(600px, 85dvh)" }}>
          {/* Header */}
          <div className="flex-none px-3 py-2 border-b border-border bg-muted/40 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Protótipo
            </p>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground text-xs leading-none"
            >
              ✕
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 min-h-0 overflow-y-auto">

            {/* Layout — only on /assistente, not on /emprecards where B doesn't exist */}
            {!pathname.startsWith("/emprecards") && (
              <div className="px-3 pt-2.5 pb-2 border-b border-border">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1.5">
                  Layout
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {(["a", "b"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => selectLayout(v)}
                      className={`flex items-center justify-center h-7 rounded-lg text-[11px] font-medium transition-colors ${
                        layoutVariant === v
                          ? "bg-primary text-white shadow-sm"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {v === "a" ? "Versão A" : "Versão B"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modo do assistente */}
            <div className="px-3 pt-2.5 pb-2 border-b border-border">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1.5">
                Modo do assistente
              </p>
              <div className="grid grid-cols-3 gap-1">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => selectMode(m.id)}
                    className={`flex items-center justify-center gap-1 h-7 rounded-lg text-[11px] font-medium transition-colors ${
                      mode === m.id
                        ? "bg-primary text-white shadow-sm"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {m.icon}
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Telas — navigate to any page */}
            <div className="px-3 pt-2.5 pb-2 border-b border-border">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1.5">
                Telas
              </p>
              <div className="space-y-0.5">
                {PAGES.map(({ label, path, Icon }) => {
                  const current = isCurrentPage(path);
                  return (
                    <button
                      key={path}
                      onClick={() => navigateTo(path)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                        current
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-none" />
                      <span className="flex-1">{label}</span>
                      {current && <ChevronRight className="w-3 h-3 opacity-50" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Etapa do chat */}
            <div className="py-1 border-b border-border">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide px-3 pt-1.5 pb-1">
                Etapa do chat
              </p>
              {PROTO_STAGES.map((s) => (
                <button
                  key={s.count}
                  onClick={() => selectStage(s.count)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-muted/40 ${
                    stage === s.count ? "text-primary" : "text-foreground"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-none border-[1.5px] transition-colors ${
                      stage === s.count
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/35"
                    }`}
                  />
                  <span className="text-xs">{s.label}</span>
                  {stage === s.count && (
                    <span className="ml-auto text-[10px] text-primary/70 font-medium">
                      atual
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Pré-requisitos */}
            <div className="px-3 pt-2.5 pb-2">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1.5">
                Pré-requisitos
              </p>
              <div className="grid grid-cols-3 gap-1">
                {([
                  { id: "initial" as CoursePreset, label: "Bloqueado" },
                  { id: "progress" as CoursePreset, label: "Andamento" },
                  { id: "done" as CoursePreset, label: "Liberado" },
                ]).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectCoursePreset(p.id)}
                    className={`flex items-center justify-center h-7 rounded-lg text-[11px] font-medium transition-colors ${
                      coursePreset === p.id
                        ? "bg-primary text-white shadow-sm"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reset — pinned to bottom */}
          <div className="flex-none px-2 py-2 border-t border-border">
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-1.5 h-8 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/8 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reiniciar fluxo completo
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Controles do protótipo"
        className={`w-9 h-9 rounded-full border border-border bg-card shadow-md flex items-center justify-center transition-all duration-200 ${
          open
            ? "opacity-100 text-primary border-primary/40 bg-primary/8 rotate-45"
            : "opacity-20 hover:opacity-100 text-muted-foreground"
        }`}
      >
        <Settings2 className="w-4 h-4" />
      </button>
    </div>
  );
}
