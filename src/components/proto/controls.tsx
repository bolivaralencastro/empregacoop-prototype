"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Settings2, RotateCcw, Play, StepForward, Layers } from "lucide-react";

export const PROTO_TOTAL = 15;

export type CoursePreset = "initial" | "progress" | "done";

export const PROTO_STAGES = [
  { label: "Chat vazio", count: 0 },
  { label: "Boas-vindas da IA", count: 1 },
  { label: "Nome respondido", count: 3 },
  { label: "Localização e currículo", count: 5 },
  { label: "Objetivo profissional", count: 7 },
  { label: "Experiência detalhada", count: 11 },
  { label: "EmpreCard gerado", count: 12 },
  { label: "Vagas compatíveis", count: 13 },
  { label: "Pré-requisitos · curso", count: 15 },
] as const;

export type ProtoMode = "complete" | "animated" | "manual";

export function ProtoControls() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState(PROTO_TOTAL);
  const [mode, setMode] = useState<ProtoMode>("complete");
  const [coursePreset, setCoursePreset] = useState<CoursePreset>("initial");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const s = localStorage.getItem("proto_stage");
    const m = localStorage.getItem("proto_mode") as ProtoMode | null;
    const cp = localStorage.getItem("proto_courses") as CoursePreset | null;
    if (s !== null) setStage(parseInt(s));
    if (m) setMode(m);
    if (cp) setCoursePreset(cp);
  }, []);

  function selectCoursePreset(preset: CoursePreset) {
    localStorage.setItem("proto_courses", preset);
    setCoursePreset(preset);
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
    // Selecting a specific stage while in "complete" mode switches to "manual"
    // so the user can see the exact cut-off point and advance from there
    const effectiveMode = mode === "complete" && count < PROTO_TOTAL ? "manual" : mode;
    dispatch(count, effectiveMode);
  }

  function selectMode(m: ProtoMode) {
    dispatch(stage, m);
  }

  function reset() {
    localStorage.setItem("proto_stage", "0");
    localStorage.setItem("proto_mode", "animated");
    setStage(0);
    setMode("animated");
    router.push("/entrar");
    setOpen(false);
  }

  const modes: { id: ProtoMode; label: string; icon: React.ReactNode }[] = [
    { id: "complete", label: "Completo", icon: <Layers className="w-3 h-3" /> },
    { id: "animated", label: "Animado", icon: <Play className="w-3 h-3" /> },
    { id: "manual", label: "Manual", icon: <StepForward className="w-3 h-3" /> },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col items-end gap-2">
      {open && (
        <div className="w-[240px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 border-b border-border bg-muted/40 flex items-center justify-between">
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

          {/* Mode */}
          <div className="px-3 pt-2.5 pb-2 border-b border-border">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1.5">
              Modo
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

          {/* Stage selector */}
          <div className="py-1">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide px-3 pt-1.5 pb-1">
              Pular para etapa
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

          {/* Course preset */}
          <div className="px-3 pt-2.5 pb-2 border-t border-border">
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

          {/* Reset */}
          <div className="px-2 py-2 border-t border-border">
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
