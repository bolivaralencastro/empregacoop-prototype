"use client";

import { useState, useEffect, useRef } from "react";
import type { ProtoMode, CoursePreset } from "@/components/proto/controls";
import { PROTO_TOTAL } from "@/components/proto/controls";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Lock,
  GraduationCap,
  Briefcase,
  FileText,
  Send,
  Paperclip,
  Mic,
  PhoneOff,
  ArrowRight,
  Sparkles,
  Clock,
  Pencil,
  CheckCircle,
  RefreshCw,
  Zap,
  Wand2,
  Star,
  X,
  User,
  MapPin,
  Download,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { TopbarA } from "@/components/layout/topbar-a";
import { generateCurriculoPdf } from "@/lib/generateCurriculoPdf";

const COMMAND_ITEMS: { cmd: string; Icon: LucideIcon; desc: string; href?: string }[] = [
  { cmd: "/perfil", Icon: User, desc: "Completar ou atualizar dados do perfil" },
  { cmd: "/vagas", Icon: Briefcase, desc: "Explorar vagas compatíveis com seu perfil" },
  { cmd: "/cursos", Icon: GraduationCap, desc: "Acessar sua trilha de capacitação" },
  { cmd: "/anexar", Icon: Paperclip, desc: "Enviar um arquivo ou currículo" },
];

/* ── Data ─────────────────────────────────────────────────────────────── */

type StepSub = { label: string; done: boolean; current?: boolean };
type JStep =
  | { id: number; label: string; description?: string; status: "done" }
  | { id: number; label: string; status: "locked"; unlocks?: string }
  | { id: number; label: string; status: "current"; count?: string; context?: string; substeps?: StepSub[] };

function getJourneySteps(n: number, cp: CoursePreset | null): JStep[] {
  const d = (id: number, label: string, description?: string): JStep => ({ id, label, description, status: "done" });
  const l = (id: number, label: string, unlocks?: string): JStep => ({ id, label, status: "locked", unlocks });
  const TAIL: JStep[] = [
    l(4, "Capacitação", "Disponível em breve"),
    l(5, "Vagas", "Disponível após completar o perfil"),
    l(6, "Candidaturas", "Envie seu EmpreCard para vagas"),
    l(7, "Reativação", "Retorne quando quiser"),
  ];
  const subLabels = ["Dados pessoais", "Localização", "Objetivo profissional", "Experiência profissional", "Formação acadêmica", "Habilidades e idiomas"];
  const subs = (nDone: number, cur: number): StepSub[] =>
    subLabels.map((label, i) => ({ label, done: i < nDone, current: i === cur }));

  const DA = d(1, "Acesso", "Conta criada e verificada");
  const DO = d(2, "Onboarding", "Boas-vindas concluídas");
  const DP = d(3, "Perfil", "Perfil construído");
  const DC = d(4, "Capacitação", "Cursos concluídos");
  const DV = d(5, "Vagas", "Vagas encontradas");
  const DCA = d(6, "Candidaturas", "Candidatura enviada");

  if (n < 6) {
    const ctx = n === 0 ? "Iniciando conversa"
               : n < 3  ? "Apresentando o EmpregaCOOP"
               : n === 3 ? "Solicitando currículo"
               : n === 4 ? "Coletando preferências"
               : "Identificando vagas compatíveis";
    return [DA, { id: 2, label: "Onboarding", status: "current", context: ctx }, l(3, "Perfil", "Construção do seu perfil"), ...TAIL];
  }
  if (n < 8)  return [DA, DO, { id: 3, label: "Perfil", status: "current", count: "1/6", context: "Coletando dados pessoais",        substeps: subs(0, 0) }, ...TAIL];
  if (n < 10) return [DA, DO, { id: 3, label: "Perfil", status: "current", count: "2/6", context: "Coletando localização",             substeps: subs(1, 1) }, ...TAIL];
  if (n < 14) return [DA, DO, { id: 3, label: "Perfil", status: "current", count: "3/6", context: "Coletando objetivo profissional",   substeps: subs(2, 2) }, ...TAIL];
  if (n < 15) return [DA, DO, { id: 3, label: "Perfil", status: "current", count: "4/6", context: "Coletando experiência profissional", substeps: subs(3, 3) }, ...TAIL];
  if (n < 16) return [DA, DO, { id: 3, label: "Perfil", status: "current", count: "6/6", context: "Perfil completo",                   substeps: subs(6, -1) }, ...TAIL];
  // Reativação: fortalecer perfil e nova candidatura
  if (n >= 22) {
    return [
      DA, DO, DP, DC, DV, DCA,
      { id: 7, label: "Reativação", status: "current" as const,
        context: n >= 24 ? "Nova candidatura disponível" : "Fortalecendo perfil" },
    ];
  }
  // Candidatura em acompanhamento
  if (n >= 19) {
    return [
      DA, DO, DP, DC, DV,
      { id: 6, label: "Candidaturas", status: "current" as const,
        context: "Candidatura em acompanhamento" },
      l(7, "Reativação", "Retorne quando quiser"),
    ];
  }

  const c2done = cp === "done";
  const c2progress = cp === "progress";
  const capSubs: StepSub[] = [
    { label: "Cooperativismo - Primeiras Licoes", done: true },
    { label: "Gestao Estrategica de Financas", done: c2done, current: c2progress },
  ];
  return [
    DA, DO, DP,
    { id: 4, label: "Capacitação", status: "current",
      context: c2done ? "Pré-requisito concluído" : c2progress ? "Curso em andamento" : "Analisando pré-requisitos",
      substeps: capSubs },
    c2done ? DV : l(5, "Vagas", "1 vaga compatível identificada"),
    l(6, "Candidaturas", c2done ? "Candidatura disponível →" : "Envie seu EmpreCard para vagas"),
    l(7, "Reativação", "Retorne quando quiser"),
  ];
}

/* ── Profile progress ─────────────────────────────────────────────────── */

function getProfileProgress(n: number): number {
  if (n <= 1)  return 0;
  if (n <= 2)  return 8;   // nome dado
  if (n <= 4)  return 28;  // CV + preferências
  if (n <= 7)  return 44;  // localização confirmada
  if (n <= 9)  return 60;  // objetivo profissional
  if (n <= 14) return 76;  // experiência detalhada
  if (n <= 15) return 88;  // EmpreCard gerado
  return 94;
}

/* ── PrereqCard helpers ────────────────────────────────────────────────── */

const C1 = "Cooperativismo - Primeiras Lições";
const C2 = "Gestão Estratégica de Finanças em Cooperativas";

type CourseStatus = "idle" | "progress" | "done";

function statusFromPreset(preset: CoursePreset | null): Record<string, CourseStatus> {
  if (preset === "progress") return { [C1]: "done", [C2]: "progress" };
  if (preset === "done")     return { [C1]: "done", [C2]: "done" };
  return                            { [C1]: "done", [C2]: "idle" };
}

/* ── Avatars ───────────────────────────────────────────────────────────── */

function AIAvatar() {
  return (
    <span className="w-8 h-8 flex-none rounded-full bg-primary overflow-hidden flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="https://b2c.empregacoop.xyz/brand/empregacoop-mark.png" alt="EmpregaCOOP" className="w-full h-full object-cover" />
    </span>
  );
}

function UserAvatar() {
  return (
    <span className="w-9 h-9 flex-none rounded-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="https://i.pravatar.cc/64?img=12" alt="Bolivar" className="w-full h-full object-cover" />
    </span>
  );
}

/* ── Sub-components ────────────────────────────────────────────────────── */

function JourneyPanel({ count, coursePreset, progress, onClose }: { count: number; coursePreset: CoursePreset | null; progress?: number; onClose?: () => void }) {
  const steps = getJourneySteps(count, coursePreset);
  const p = progress ?? 0;

  return (
    <aside className="flex flex-col w-full overflow-hidden bg-muted/20 border-r border-border" aria-label="Sua jornada">
      {/* Header */}
      <div className="flex-none px-4 pt-3.5 pb-3 border-b border-border flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Sua jornada</h2>
          <p className="text-[11px] text-muted-foreground">Acompanhe seu progresso</p>
        </div>
        <div className="flex items-center gap-1">
          {onClose && (
            <button type="button" aria-label="Recolher jornada" onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2">
        {/* Progress card */}
        {progress !== undefined && (
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Progresso geral</p>
              <span className="text-base font-bold text-primary">{p}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
              <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${p}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{progressMotivation(p)}</p>
          </div>
        )}

        {/* Step cards */}
        {steps.map((step) => {
          if (step.status === "done") return (
            <div key={step.id} className="rounded-xl border border-border bg-card p-3 flex items-center gap-2.5 shadow-sm">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-success/15 text-success flex-none">
                <Check className="w-3.5 h-3.5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{step.id}. {step.label}</p>
                {step.description && <p className="text-[11px] text-muted-foreground mt-0.5">{step.description}</p>}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/30 flex-none" />
            </div>
          );

          if (step.status === "current") return (
            <div key={step.id} className="rounded-xl border border-primary/40 bg-primary/[0.04] p-3.5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary text-white text-xs font-bold flex-none">
                  {step.id}
                </span>
                <span className="text-xs font-semibold flex-1">{step.label}</span>
                {step.count && <span className="text-xs font-semibold text-primary">{step.count}</span>}
              </div>
              {step.substeps && (
                <div className="ml-[34px] space-y-1.5">
                  {step.substeps.map((sub) => (
                    <div key={sub.label} className="flex items-center gap-2">
                      <span className={`w-4 h-4 flex items-center justify-center rounded-full border flex-none transition-colors ${
                        sub.done && !sub.current ? "border-success bg-success text-white" :
                        sub.current ? "border-primary bg-primary text-white" :
                        "border-border"
                      }`}>
                        {(sub.done || sub.current) && <Check className="w-2.5 h-2.5" />}
                      </span>
                      <span className={`text-[11px] leading-4 ${
                        sub.current ? "font-semibold text-foreground" :
                        sub.done ? "text-muted-foreground" : "text-muted-foreground/40"
                      }`}>{sub.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {step.context && !step.substeps && (
                <p className="text-[11px] text-primary/70 font-medium ml-[34px]">{step.context}</p>
              )}
            </div>
          );

          return (
            <div key={step.id} className="rounded-xl border border-border bg-card p-3 flex items-center gap-2.5 shadow-sm opacity-45">
              <span className="w-6 h-6 flex items-center justify-center rounded-full border border-border flex-none">
                <Lock className="w-3 h-3 text-muted-foreground" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{step.id}. {step.label}</p>
                {step.unlocks && <p className="text-[11px] text-muted-foreground mt-0.5">{step.unlocks}</p>}
              </div>
            </div>
          );
        })}

        {/* CTA */}
        {p < 100 && (
          <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-3.5 h-3.5 text-primary flex-none" />
              <p className="text-xs font-semibold text-primary">Complete seu perfil</p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Perfis completos têm 3x mais chances de serem selecionados para vagas!
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ── Contextual Panel (Versão A · fase ativa) ──────────────────────────── */

function ContextualPanel({ count, progress, coursePreset }: { count: number; progress: number; coursePreset: CoursePreset | null }) {
  const c2done          = coursePreset === "done";
  const c2progress      = coursePreset === "progress";
  const postCandidature = count >= 19;
  const isReactivation  = count >= 22;

  return (
    <aside className="flex flex-col w-full overflow-hidden bg-muted/20 border-r border-border" aria-label="Seu espaço">
      <div className="flex-none px-4 pt-3.5 pb-3 border-b border-border">
        <h2 className="text-sm font-semibold">Seu espaço</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3">

        {/* Perfil completo — só enquanto não concluiu a primeira fase */}
        {!postCandidature && (
          <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] text-muted-foreground">Perfil completo</p>
              <span className="text-xs font-bold text-primary">{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* ── CURSOS ─────────────────────────────────────── */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground px-1 mb-1.5">Cursos</p>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Cooperativismo — sempre concluído neste estágio */}
            <div className={`flex items-center gap-2.5 px-3 py-2.5 border-b border-border/50 ${postCandidature ? "opacity-50" : ""}`}>
              <CheckCircle className="w-3.5 h-3.5 text-success flex-none" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium leading-4 truncate">Cooperativismo</p>
                <p className="text-[10px] text-success/80 leading-4">Concluído · 4H</p>
              </div>
            </div>

            {/* Gestão Financeira — estado dinâmico */}
            {(c2done || postCandidature) ? (
              <div className={`flex items-center gap-2.5 px-3 py-2.5 ${postCandidature ? "opacity-50" : ""}`}>
                <CheckCircle className="w-3.5 h-3.5 text-success flex-none" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-4 truncate">Gestão Financeira</p>
                  <p className="text-[10px] text-success/80 leading-4">Concluído · 13H</p>
                </div>
              </div>
            ) : c2progress ? (
              <button type="button" className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-primary/[0.03] hover:bg-primary/[0.06] transition-colors text-left">
                <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-primary/12 flex-none">
                  <RefreshCw className="w-3 h-3 text-primary" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-primary leading-4 truncate">Gestão Financeira</p>
                  <p className="text-[10px] text-primary/60 leading-4">Em andamento · continuar</p>
                </div>
                <ArrowRight className="w-3 h-3 text-primary/50 flex-none" />
              </button>
            ) : (
              <button type="button" className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/40 transition-colors text-left">
                <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-muted flex-none">
                  <GraduationCap className="w-3 h-3 text-muted-foreground" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-4 truncate">Gestão Financeira</p>
                  <p className="text-[10px] text-muted-foreground leading-4">Pré-requisito · começar</p>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground/40 flex-none" />
              </button>
            )}

            {/* Novos cursos disponíveis — só após candidatura */}
            {postCandidature && (
              <button type="button" className="w-full flex items-center justify-between px-3 py-2.5 border-t border-border/50 hover:bg-muted/40 transition-colors text-left">
                <span className="text-xs font-semibold text-primary">2 novos cursos disponíveis</span>
                <ArrowRight className="w-3 h-3 text-primary flex-none" />
              </button>
            )}
          </div>
        </div>

        {/* ── VAGAS ──────────────────────────────────────── */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground px-1 mb-1.5">Vagas</p>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {isReactivation ? (
              <>
                <button type="button" className="w-full flex items-center gap-2.5 px-3 py-2.5 border-b border-border/50 hover:bg-primary/[0.04] transition-colors text-left">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 flex-none">
                    <span className="text-[10px] font-bold text-primary">3</span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary leading-4">Novas vagas para você</p>
                    <p className="text-[10px] text-muted-foreground leading-4">Perfil recalculado</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-primary/50 flex-none" />
                </button>
                <div className="flex items-center gap-2.5 px-3 py-2.5 opacity-60">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-none" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">Sicoob Dom Eliseu</p>
                    <p className="text-[10px] text-muted-foreground/60 leading-4">Em triagem · 21 jun</p>
                  </div>
                </div>
              </>
            ) : postCandidature ? (
              <div className="px-3 py-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <Check className="w-3.5 h-3.5 text-success flex-none" />
                  <p className="text-xs font-semibold leading-4">Gerente Adm. Financeiro</p>
                </div>
                <p className="text-[11px] text-muted-foreground ml-[22px]">Sicoob Dom Eliseu · em triagem</p>
                <p className="text-[10px] text-muted-foreground/50 ml-[22px] mt-0.5">Candidatura enviada · 21 jun</p>
              </div>
            ) : c2done ? (
              <button type="button" className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-primary/[0.03] hover:bg-primary/[0.06] transition-colors text-left">
                <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-primary/12 flex-none">
                  <Briefcase className="w-3 h-3 text-primary" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-primary leading-4">Candidatura disponível</p>
                  <p className="text-[10px] text-muted-foreground leading-4">Gerente Adm. Financeiro</p>
                </div>
                <ArrowRight className="w-3 h-3 text-primary/50 flex-none" />
              </button>
            ) : (
              <div className="flex items-center gap-2.5 px-3 py-2.5 opacity-45">
                <span className="w-6 h-6 flex items-center justify-center rounded-lg border border-border flex-none">
                  <Lock className="w-3 h-3 text-muted-foreground" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-4">Gerente Adm. Financeiro</p>
                  <p className="text-[10px] text-muted-foreground leading-4">Conclua os cursos primeiro</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── NOTIFICAÇÕES — só após candidatura ─────────── */}
        {postCandidature && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground px-1 mb-1.5">Notificações</p>
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border/50">
              {isReactivation ? (
                <>
                  <div className="flex items-start gap-2.5 px-3 py-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-none" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-4">Nova vaga compatível</p>
                      <p className="text-[10px] text-muted-foreground leading-4">UX/UI Designer Pleno · Há 1h</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 px-3 py-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-none" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-4">Curso recomendado</p>
                      <p className="text-[10px] text-muted-foreground leading-4">Design Systems · Há 3h</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-2.5 px-3 py-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 mt-1.5 flex-none" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground leading-4">Candidatura em análise</p>
                    <p className="text-[10px] text-muted-foreground/60 leading-4">Sicoob Dom Eliseu · 21 jun</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}

/* ── Progress Panel (journey drawer, right side) ───────────────────────── */

function progressMotivation(p: number): string {
  if (p < 10)  return "Comece agora — leva menos de 5 minutos para preencher!";
  if (p < 40)  return "Bom começo! Continue a conversa para avançar na jornada.";
  if (p < 70)  return "Você está no caminho certo. Perfil completo = mais vagas!";
  if (p < 90)  return "Quase lá — finalize as etapas restantes para se destacar.";
  if (p < 100) return "Perfil quase completo. Você está prestes a ser encontrado!";
  return "Perfil completo! Você está pronto para as melhores oportunidades.";
}

function ProgressPanel({
  count,
  coursePreset,
  progress,
  onClose,
}: {
  count: number;
  coursePreset: CoursePreset | null;
  progress: number;
  onClose?: () => void;
}) {
  const steps = getJourneySteps(count, coursePreset);

  return (
    <aside className="flex flex-col h-full overflow-hidden bg-card border-l border-border">
      <div className="flex-none px-3 pt-3 pb-2.5 border-b border-border flex items-center gap-2">
        <h2 className="text-sm font-semibold flex-1 px-1">Sua jornada</h2>
        <button
          type="button"
          aria-label="Fechar"
          data-tooltip="Fechar"
          data-tooltip-dir="down-left"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress summary */}
      <div className="flex-none px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold">Perfil completo</p>
          <span className="text-xs font-bold text-success">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-success transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-2.5">
          {progressMotivation(progress)}
        </p>
      </div>

      {/* Steps */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4 pt-2 space-y-0.5">
        {steps.map((step) => {
          if (step.status === "done") {
            return (
              <div key={step.id} className="flex items-center gap-2.5 px-2 py-2 rounded-xl">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-success-soft text-success flex-none">
                  <Check className="w-3 h-3" />
                </span>
                <span className="text-sm text-foreground/60 flex-1">{step.id}. {step.label}</span>
              </div>
            );
          }
          if (step.status === "current") {
            return (
              <div key={step.id} className="rounded-2xl border border-primary/30 bg-gradient-to-b from-brand-soft/50 to-card/80 p-3.5 my-1">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary text-white text-xs font-bold flex-none">
                    {step.id}
                  </span>
                  <span className="text-sm font-semibold flex-1">{step.label}</span>
                  <span className="inline-flex items-center h-5 px-2 rounded-full bg-primary/10 text-primary text-xs font-semibold">Em curso</span>
                </div>
                {"context" in step && step.context && (
                  <p className="text-xs text-primary/65 font-medium ml-[34px]">{step.context}</p>
                )}
              </div>
            );
          }
          return (
            <div key={step.id} className="flex items-start gap-2.5 px-2 py-2 rounded-xl opacity-45">
              <span className="w-6 h-6 flex items-center justify-center rounded-full border border-border flex-none mt-0.5">
                <Lock className="w-3 h-3 text-muted-foreground" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-5">{step.id}. {step.label}</p>
                {"unlocks" in step && step.unlocks && (
                  <p className="text-xs text-muted-foreground leading-4 mt-0.5">{step.unlocks}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

const EMPRECARD_SECTIONS = [
  { id: "identidade", label: "Identidade & Design" },
  { id: "essencia", label: "Essência" },
  { id: "historia", label: "Minha história" },
  { id: "resumo", label: "Resumo profissional" },
  { id: "contato", label: "Contato" },
  { id: "fortalezas", label: "Fortalezas" },
  { id: "skills", label: "Skills" },
  { id: "experiencia", label: "Experiência" },
  { id: "formacao", label: "Formação" },
  { id: "idiomas", label: "Idiomas" },
  { id: "certificacoes", label: "Certificações" },
  { id: "projetos", label: "Projetos" },
  { id: "timeline", label: "Linha do tempo" },
  { id: "agora", label: "Onde estou agora" },
  { id: "curiosidades", label: "Curiosidades" },
  { id: "valores", label: "Valores & Interesses" },
  { id: "disponibilidade", label: "Disponibilidade" },
  { id: "video", label: "Video pitch" },
  { id: "referencias", label: "Referências" },
];

const STATUS_OPTIONS = [
  "Aguardando retorno",
  "Em processo seletivo",
  "Entrevista agendada",
  "Proposta recebida",
  "Encerrado",
] as const;

function VagasPanel({ onClose }: { onClose?: () => void }) {
  const [status, setStatus] = useState<string>("Aguardando retorno");

  return (
    <aside className="flex flex-col h-full overflow-hidden bg-card border-l border-border">
      <div className="flex-none px-3 pt-3 pb-2.5 border-b border-border flex items-center gap-2">
        <h2 className="text-sm font-semibold flex-1 px-1">Candidaturas</h2>
        <button type="button" aria-label="Fechar" onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3">
        {/* Candidatura registrada pelo usuário */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold leading-5">Gerente Administrativo Financeiro</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sicoob Dom Eliseu · Dom Eliseu, PA</p>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Inscrito em <span className="font-medium text-foreground">21 jun. 2026</span>
            </p>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Como está o processo?</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-9 border border-border rounded-lg bg-transparent text-sm px-3 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-4">
                Você controla esse registro — o EmpregaCOOP não tem acesso ao processo da cooperativa.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">Sem outras candidaturas registradas.</p>
      </div>
    </aside>
  );
}

function CursosPanel({ coursePreset, onClose }: { coursePreset: CoursePreset | null; onClose?: () => void }) {
  const c2done = coursePreset === "done";
  const c2progress = coursePreset === "progress";

  const courses = [
    {
      label: "Cooperativismo - Primeiras Lições",
      hours: "4H",
      status: "done" as const,
      desc: "Curso introdutório ao modelo cooperativo — obrigatório para todas as vagas do CapacitaCOOP.",
    },
    {
      label: "Gestão Estratégica de Finanças em Cooperativas",
      hours: "13H",
      status: c2done ? "done" as const : c2progress ? "progress" as const : "idle" as const,
      desc: "Cobre planejamento financeiro, análise de resultados e gestão orçamentária no contexto cooperativo.",
    },
  ];

  const doneCount = courses.filter(c => c.status === "done").length;

  return (
    <aside className="flex flex-col h-full overflow-hidden bg-card border-l border-border">
      <div className="flex-none px-3 pt-3 pb-2.5 border-b border-border flex items-center gap-2">
        <h2 className="text-sm font-semibold flex-1 px-1">Cursos</h2>
        <button type="button" aria-label="Fechar" onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Resumo */}
      <div className="flex-none px-4 py-3 border-b border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">CapacitaCOOP</p>
        <span className="text-xs font-semibold text-success">{doneCount}/{courses.length} concluídos</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2">
        {courses.map((course) => {
          const isDone = course.status === "done";
          const isProgress = course.status === "progress";
          return (
            <div key={course.label}
              className={`rounded-2xl border bg-card overflow-hidden ${
                isDone ? "border-success/35" : isProgress ? "border-primary/30 shadow-sm" : "border-border"
              }`}
            >
              <div className="flex items-start gap-3 px-3 py-3">
                <span className={`w-8 h-8 flex items-center justify-center rounded-lg flex-none mt-0.5 ${
                  isDone ? "bg-success-soft text-success" :
                  isProgress ? "bg-primary/10 text-primary" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {isDone ? <CheckCircle className="w-4 h-4" /> :
                   isProgress ? <RefreshCw className="w-4 h-4" /> :
                   <GraduationCap className="w-4 h-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-5">{course.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />{course.hours}
                    </span>
                    {isDone && (
                      <span className="inline-flex items-center gap-0.5 h-4 px-1.5 rounded-full bg-success-soft text-success text-[10px] font-semibold">
                        <Check className="w-2.5 h-2.5" />Concluído
                      </span>
                    )}
                    {isProgress && (
                      <span className="inline-flex items-center h-4 px-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                        Em andamento
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">{course.desc}</p>
                </div>
              </div>
              {!isDone && (
                <div className="px-3 pb-3 pt-0">
                  <button type="button"
                    className={`inline-flex items-center gap-1 h-7 px-3 rounded-lg text-xs font-semibold transition-colors ${
                      isProgress
                        ? "border border-primary/30 bg-primary/8 text-primary hover:bg-primary/12"
                        : "border border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {isProgress ? "Continuar" : "Começar"} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function ProfilePanel({ onClose, initialView = "curriculo" }: { onClose?: () => void; initialView?: "curriculo" | "emprecard" }) {
  const [view, setView] = useState<"curriculo" | "emprecard" | "emprecard-edit">(initialView);
  const [empreCardTab, setEmpreCardTab] = useState<"base" | "match-cards">("base");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(["identidade", "essencia", "historia"]);

  function toggleSection(id: string) {
    setOpenSections((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  }

  return (
    <aside
      className="flex flex-col h-full overflow-hidden bg-card border-l border-border"
      aria-label="Painel do candidato"
    >
      {view === "curriculo" ? (
        <>
          <div className="flex items-center gap-2 px-3 pt-3 pb-2.5 flex-none border-b border-border">
            <h2 className="text-sm font-semibold flex-1 px-1">Perfil</h2>
            {onClose && (
              <button type="button" aria-label="Fechar painel" data-tooltip="Fechar" data-tooltip-dir="down-left" onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-none">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2">
            {/* Sobre você */}
            {(["sobre", "dados", "localizacao", "formacao", "idiomas"] as const).map((id) => {
              const sections = {
                sobre: { title: "Sobre você", fields: [
                  { label: "", value: "Área principal em tecnologia, produto digital, dados e automação com IA. Busca oportunidades em produto, tecnologia, dados, IA e transformação digital em cooperativas. Prefere oportunidades remotas ou híbridas, com possibilidade de projetos nacionais e viagens pontuais." }
                ]},
                dados: { title: "Dados pessoais", fields: [
                  { label: "Nome completo", value: "Bolivar Alencastro" },
                  { label: "E-mail", value: "bolivar@alencastro.com.br" },
                  { label: "Telefone", value: "+55 48 984138601" },
                ]},
                localizacao: { title: "Localização", fields: [
                  { label: "Cidade", value: "Brasília" },
                  { label: "Estado", value: "Distrito Federal" },
                  { label: "Disponibilidade", value: "Remoto, híbrido em Brasília e projetos nacionais com viagens pontuais." },
                ]},
                formacao: { title: "Formação acadêmica", fields: [
                  { label: "Curso", value: "Bacharel em Design Gráfico" },
                  { label: "Instituição", value: "Faculdades Barddal · Florianópolis, SC" },
                  { label: "Período", value: "2006 — 2010" },
                ]},
                idiomas: { title: "Idiomas", fields: [
                  { label: "Português", value: "Nativo" },
                  { label: "Inglês", value: "Avançado" },
                ]},
              };
              const section = sections[id];
              return (
                <section key={id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <h3 className="text-sm font-semibold">{section.title}</h3>
                    <button type="button"
                      aria-label={editingSection === id ? "Confirmar" : "Editar"}
                      data-tooltip={editingSection === id ? "Confirmar" : "Editar"}
                      onClick={() => setEditingSection(editingSection === id ? null : id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-none">
                      {editingSection === id ? <Check className="w-3.5 h-3.5 text-success" /> : <Pencil className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {section.fields.map((f) => (
                      <div key={f.label} className="flex flex-col gap-1">
                        {f.label && <span className="text-xs text-muted-foreground">{f.label}</span>}
                        {editingSection === id ? (
                          f.value.length > 60 ? (
                            <textarea defaultValue={f.value}
                              className="w-full min-h-[64px] border border-border rounded-lg bg-transparent text-sm px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
                          ) : (
                            <input type="text" defaultValue={f.value}
                              className="h-8 border border-border rounded-lg bg-transparent text-sm px-3 focus:outline-none focus:ring-1 focus:ring-ring" />
                          )
                        ) : (
                          <p className="text-sm font-medium leading-5">{f.value}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Experiência profissional */}
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold">Experiência profissional</h3>
                <button type="button"
                  aria-label={editingSection === "experiencia" ? "Confirmar" : "Editar"}
                  data-tooltip={editingSection === "experiencia" ? "Confirmar" : "Editar"}
                  onClick={() => setEditingSection(editingSection === "experiencia" ? null : "experiencia")}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-none">
                  {editingSection === "experiencia" ? <Check className="w-3.5 h-3.5 text-success" /> : <Pencil className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { cargo: "Product Designer", empresa: "Keeps Learning", periodo: "Ago 2022 — atual" },
                  { cargo: "Diretor de Fotografia e Retoucher", empresa: "Doc.Sync", periodo: "2019 — 2022" },
                  { cargo: "Diretor de Arte e Marketing", empresa: "Kirinus Escola de Dança", periodo: "2014 — 2018" },
                  { cargo: "Diretor de Arte", empresa: "Grupo RBS", periodo: "2009 — 2012" },
                  { cargo: "Diretor de Arte", empresa: "Grupo All", periodo: "2013 — 2014" },
                  { cargo: "Diretor de Arte", empresa: "D/Araújo", periodo: "2013 — 2014" },
                  { cargo: "Designer Gráfico", empresa: "SUCESU-SC", periodo: "2008 — 2009" },
                  { cargo: "WebDesigner", empresa: "Cria Mídia", periodo: "2006 — 2008" },
                ].map((exp, i) => (
                  <div key={i} className={i > 0 ? "border-t border-border pt-3" : ""}>
                    {editingSection === "experiencia" ? (
                      <div className="space-y-1.5">
                        <input type="text" defaultValue={exp.cargo}
                          className="h-7 w-full border border-border rounded-lg bg-transparent text-xs px-2.5 focus:outline-none focus:ring-1 focus:ring-ring" />
                        <input type="text" defaultValue={exp.empresa}
                          className="h-7 w-full border border-border rounded-lg bg-transparent text-xs px-2.5 focus:outline-none focus:ring-1 focus:ring-ring" />
                        <input type="text" defaultValue={exp.periodo}
                          className="h-7 w-full border border-border rounded-lg bg-transparent text-xs px-2.5 focus:outline-none focus:ring-1 focus:ring-ring" />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium leading-5">{exp.cargo}</p>
                        <p className="text-xs text-muted-foreground">{exp.empresa}</p>
                        <p className="text-xs text-muted-foreground">{exp.periodo}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Habilidades */}
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <h3 className="text-sm font-semibold">Habilidades</h3>
                <button type="button"
                  aria-label={editingSection === "habilidades" ? "Confirmar" : "Editar"}
                  data-tooltip={editingSection === "habilidades" ? "Confirmar" : "Editar"}
                  onClick={() => setEditingSection(editingSection === "habilidades" ? null : "habilidades")}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-none">
                  {editingSection === "habilidades" ? <Check className="w-3.5 h-3.5 text-success" /> : <Pencil className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Experiência do Usuário (UX)", "Design Thinking", "Design de Interface (UI)", "Prototipagem", "Mapeamento de Jornada", "Pesquisa de Usuário", "Figma", "Miro", "InVision", "Adobe CC", "Automação com IA", "Produto digital", "Dados", "Estratégia digital", "Integrações", "Fotografia", "Retouching"].map((s) => (
                  <span key={s} className="inline-flex items-center h-5 px-2 rounded-full bg-muted text-muted-foreground text-xs">{s}</span>
                ))}
              </div>
            </section>
          </div>
        </>
      ) : view === "emprecard" ? (
        <>
          <div className="flex items-center gap-2 px-3 pt-3 pb-2.5 flex-none border-b border-border">
            <div className="flex-1 px-1 min-w-0">
              <h2 className="text-sm font-semibold leading-tight">EmpreCard</h2>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Currículo 2.0 — dinâmico e atualizado</p>
            </div>
            {empreCardTab === "base" && (
              <button type="button" aria-label="Editar EmpreCard" data-tooltip="Editar" data-tooltip-dir="down-left" onClick={() => setView("emprecard-edit")}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-none">
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onClose && (
              <button type="button" aria-label="Fechar painel" data-tooltip="Fechar" data-tooltip-dir="down-left" onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-none">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Tab switcher */}
          <div className="flex-none flex gap-1 px-3 pt-2.5 pb-0">
            {(["base", "match-cards"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setEmpreCardTab(tab)}
                className={`h-7 px-3 rounded-full text-xs font-medium transition-all ${empreCardTab === tab ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
              >
                {tab === "base" ? "EmpreCard" : (
                  <span className="flex items-center gap-1.5">Match Cards <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/20 text-[10px] font-bold">1</span></span>
                )}
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {empreCardTab === "base" ? (
              <div className="mx-3 mt-3 rounded-2xl border border-border overflow-hidden">
                <div className="px-4 pt-4 pb-3"
                  style={{ background: "linear-gradient(135deg, #FF904728 0%, #FF904708 60%, transparent 100%)" }}>
                  <p className="text-sm font-semibold leading-5">Profissional de tecnologia, produto e dados</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Designer de Produto com foco em UX, automação e transformação digital</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Brasília, Distrito Federal</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/40 mt-2">Currículo 2.0</p>
                  <p className="text-xs italic leading-4 mt-1" style={{ color: "#ff9047" }}>
                    &ldquo;Tecnologia, produto e dados como eixo principal. Gosta de resolver problemas com automação e IA. Busca oportunidades remotas, híbridas ou em projetos nacionais.&rdquo;
                  </p>
                </div>
                <div className="px-4 py-3 flex flex-col gap-3 border-t border-border">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Essência</p>
                    <p className="text-xs leading-4 italic pl-2 border-l-2" style={{ borderColor: "#ff9047", color: "rgba(36,0,40,.80)" }}>
                      Tecnologia, produto e dados como eixo principal. Gosta de resolver problemas com automação e IA. Busca oportunidades remotas, híbridas ou em projetos nacionais.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Minha história</p>
                    <p className="text-xs leading-4" style={{ color: "rgba(36,0,40,.80)" }}>
                      Bolivar se posiciona na interseção entre tecnologia, produto digital, dados e automação com IA. Ele busca oportunidades em cooperativas e quer atuar em contextos onde estratégia digital, desenvolvimento de produtos e análise de dados tenham papel central. Prefere trabalho remoto ou híbrido em Brasília, com abertura para projetos nacionais.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Resumo profissional</p>
                    <p className="text-xs leading-4" style={{ color: "rgba(36,0,40,.80)" }}>
                      Product Designer com 8 experiências em tecnologia, produto e dados. Atuou como Diretor de Arte, Designer Gráfico e Product Designer. Busca cooperativas e contextos de impacto prático.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Skills · 8 experiências</p>
                    <div className="flex flex-wrap gap-1">
                      {["Experiência do Usuário (UX)", "Design Thinking", "Design de Interface (UI)", "Prototipação de Alta Fidelidade", "Mapeamento de Jornada", "Pesquisa de Usuário"].map((s) => (
                        <span key={s} className="inline-flex items-center h-5 px-2 rounded-full text-xs font-medium"
                          style={{ background: "rgba(255,144,71,.12)", color: "#ff9047" }}>{s}</span>
                      ))}
                      <span className="inline-flex items-center h-5 px-1 text-xs text-muted-foreground">+19</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Disponibilidade</p>
                    <p className="text-xs leading-4" style={{ color: "rgba(36,0,40,.80)" }}>
                      <span className="font-medium">Modelo:</span> Híbrido · <span className="font-medium">Horas:</span> Não informado
                    </p>
                    <p className="text-xs leading-4 mt-0.5" style={{ color: "rgba(36,0,40,.80)" }}>
                      Prefere remoto ou híbrido em Brasília. Avalia projetos nacionais com viagens pontuais.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-3 py-3 space-y-3">
                <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-border flex items-start justify-between gap-2"
                    style={{ background: "linear-gradient(135deg,rgba(109,0,112,.04) 0%,transparent 70%)" }}>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Match Card</p>
                      <p className="text-sm font-semibold leading-5 mt-0.5">Gerente Administrativo Financeiro</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Sicoob Dom Eliseu · Dom Eliseu, PA</p>
                    </div>
                    <span className="text-xs font-bold text-success mt-1 flex-none">87% match</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Adaptações ao EmpreCard base</p>
                    <ul className="text-[11px] text-muted-foreground space-y-0.5 leading-4">
                      <li>· Skills destacadas: Gestão financeira, Análise de dados, Automação</li>
                      <li>· Subtítulo adaptado para cooperativa de crédito</li>
                      <li>· Essência reframeada com foco em gestão estratégica</li>
                      <li>· Experiências ordenadas por relevância financeira</li>
                    </ul>
                  </div>
                  <div className="px-4 py-2.5 border-t border-border flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground">Gerado em 21 jun. 2026</p>
                    <span className="text-[11px] font-medium text-success">Candidatura enviada</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground text-center pt-1">
                  Um Match Card é criado a partir do seu EmpreCard para cada vaga que você se candidata.
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 px-3 pt-3 pb-2.5 flex-none border-b border-border">
            <button type="button" aria-label="Voltar" data-tooltip="Voltar" data-tooltip-dir="down" onClick={() => setView("emprecard")}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-none">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold flex-1">Editar Emprecard</h2>
            <button type="button" aria-label="Recolher painel" data-tooltip="Recolher" data-tooltip-dir="down-left" onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-none">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="mx-3 mt-3 mb-3 rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              {EMPRECARD_SECTIONS.map((sec, i) => {
                const isOpen = openSections.includes(sec.id);
                const isLast = i === EMPRECARD_SECTIONS.length - 1;
                return (
                  <div key={sec.id} className={isLast ? "" : "border-b border-border"}>
                    <button type="button"
                      onClick={() => toggleSection(sec.id)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-left hover:bg-muted/50 transition-colors">
                      {sec.label}
                      <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform flex-none ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3 space-y-2.5">
                        {sec.id === "identidade" && (
                          <>
                            {[
                              { label: "Título principal", value: "Profissional de tecnologia, produto e dados" },
                              { label: "Subtítulo", value: "Foco em automação com IA e transformação digital" },
                              { label: "Cargo (jobTitle)", value: "" },
                              { label: "Empresa-alvo (companyName)", value: "" },
                            ].map((f) => (
                              <div key={f.label} className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">{f.label}</label>
                                <input type="text" defaultValue={f.value} placeholder={f.value ? undefined : "—"}
                                  className="h-7 border border-border rounded-lg bg-transparent text-xs px-2.5 focus:outline-none focus:ring-1 focus:ring-ring" />
                              </div>
                            ))}
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-muted-foreground">Tagline</label>
                              <textarea defaultValue="Atua com estratégia digital, desenvolvimento de produtos, análise de dados e integrações, buscando oportunidades remotas, híbridas em Brasília e projetos nacionais."
                                className="w-full min-h-[56px] border border-border rounded-lg bg-transparent text-xs px-2.5 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
                              <p className="text-xs text-muted-foreground">Frase curta que aparece destacada no cabeçalho.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">Cor primária</label>
                                <div className="flex items-center gap-1.5 h-7 border border-border rounded-lg px-2">
                                  <span className="w-4 h-4 rounded-sm flex-none" style={{ background: "#FF9047" }} />
                                  <span className="text-xs font-mono">#FF9047</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Tom do cartão.</p>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">Cor empresa-alvo</label>
                                <div className="flex items-center gap-1.5 h-7 border border-border rounded-lg px-2">
                                  <span className="w-4 h-4 rounded-sm flex-none" style={{ background: "#000000" }} />
                                  <span className="text-xs font-mono">#000000</span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                        {sec.id === "essencia" && (
                          <div className="flex flex-col gap-1">
                            <textarea defaultValue="Tecnologia, produto digital e dados são o centro do seu trabalho. Automação com IA e integrações entram como parte da forma como você constrói solução. Busca contexto de cooperativas, transformação digital e projetos com impacto prático."
                              className="w-full min-h-[72px] border border-border rounded-lg bg-transparent text-xs px-2.5 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
                            <p className="text-xs text-muted-foreground">Frase curta — sua identidade profissional em uma respiração.</p>
                          </div>
                        )}
                        {sec.id === "historia" && (
                          <div className="flex flex-col gap-1">
                            <textarea defaultValue="Bolivar se posiciona na interseção entre tecnologia, produto digital, dados e automação com IA. Ele busca oportunidades em cooperativas e quer atuar em contextos onde estratégia digital, desenvolvimento de produtos, análise de dados e integrações tenham papel central. Também sinalizou preferência por trabalho remoto ou híbrido em Brasília, com abertura para projetos nacionais e viagens pontuais."
                              className="w-full min-h-[88px] border border-border rounded-lg bg-transparent text-xs px-2.5 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
                            <p className="text-xs text-muted-foreground">Conte sua trajetória — quem você foi, é, e quer ser.</p>
                          </div>
                        )}
                        {!["identidade", "essencia", "historia"].includes(sec.id) && (
                          <p className="text-xs text-muted-foreground italic">Seção vazia — converse com o assistente para preencher.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="px-4 py-3 border-t border-border flex items-center gap-2">
                <button type="button"
                  className="flex-1 h-8 rounded-lg bg-primary text-white text-xs font-medium hover:opacity-90 transition-opacity">
                  Salvar
                </button>
                <button type="button"
                  className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

function ProfileSidebar({ count, progress }: { count: number; progress: number }) {
  const hasPessoal    = count >= 6;
  const hasLocalizacao = count >= 8;
  const hasObjetivo   = count >= 10;
  const hasExperiencia = count >= 14;
  const hasSobreVoce  = count >= 14;
  const hasIdiomas    = count >= 14;
  const hasHabilidades = count >= 14;
  const hasEmpreCard  = count >= 15;

  return (
    <aside className="flex flex-col w-full h-full overflow-hidden bg-card border-l border-border" aria-label="Perfil do candidato">
      {/* Sections */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2.5">
        {!hasPessoal && (
          <p className="text-xs text-muted-foreground text-center pt-10 leading-relaxed">
            Seu perfil será preenchido<br />conforme a conversa avança.
          </p>
        )}
        {hasPessoal && (
          <div className="rounded-xl border border-border overflow-hidden animate-[proto-fade-in_0.5s_ease-out]">
            <div className="px-3 py-2 border-b border-border bg-muted/30">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Dados pessoais</p>
            </div>
            <div className="px-3 py-2.5 space-y-1.5">
              {[
                { label: "Nome", value: "Bolivar Alencastro" },
                { label: "E-mail", value: "bolivar@alencastro.com.br" },
                { label: "LinkedIn", value: "bolivaralencastro" },
              ].map((f) => (
                <div key={f.label} className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground flex-none">{f.label}</span>
                  <span className="text-[11px] font-medium text-right truncate">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {hasLocalizacao && (
          <div className="rounded-xl border border-border overflow-hidden animate-[proto-fade-in_0.5s_ease-out]">
            <div className="px-3 py-2 border-b border-border bg-muted/30">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Localização e pretensão</p>
            </div>
            <div className="px-3 py-2.5 space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] text-muted-foreground flex-none">Cidade</span>
                <span className="text-[11px] font-medium">Brasília, DF</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] text-muted-foreground flex-none">Modelo</span>
                <span className="text-[11px] font-medium">Remoto / Híbrido</span>
              </div>
            </div>
          </div>
        )}
        {hasObjetivo && (
          <div className="rounded-xl border border-border overflow-hidden animate-[proto-fade-in_0.5s_ease-out]">
            <div className="px-3 py-2 border-b border-border bg-muted/30">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Objetivo profissional</p>
            </div>
            <div className="px-3 py-2.5">
              <p className="text-[11px] font-medium">Product Designer</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Tecnologia, produto e dados · cooperativismo</p>
            </div>
          </div>
        )}
        {hasExperiencia && (
          <div className="rounded-xl border border-border overflow-hidden animate-[proto-fade-in_0.5s_ease-out]">
            <div className="px-3 py-2 border-b border-border bg-muted/30">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Experiências profissionais</p>
            </div>
            <div className="divide-y divide-border/60">
              {[
                { role: "Product Designer", company: "Muzt", period: "2023 – atual" },
                { role: "Designer de Produto", company: "Sidecar", period: "2022 – 2023" },
                { role: "Designer Gráfico", company: "ABC Comunicação", period: "2020 – 2022" },
              ].map((exp) => (
                <div key={exp.company} className="px-3 py-2">
                  <p className="text-[11px] font-semibold">{exp.role}</p>
                  <p className="text-[11px] text-muted-foreground">{exp.company} · {exp.period}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {hasSobreVoce && (
          <div className="rounded-xl border border-border overflow-hidden animate-[proto-fade-in_0.5s_ease-out]">
            <div className="px-3 py-2 border-b border-border bg-muted/30">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Sobre você</p>
            </div>
            <div className="px-3 py-2.5 space-y-2">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Product Designer com experiência em implementação de design system do zero, uso de workshops de Design Thinking e foco em trabalho remoto e híbrido.
              </p>
              <div className="space-y-1 pt-0.5">
                {[
                  { icon: "✉", value: "bolivar@alencastro.com.br" },
                  { icon: "📞", value: "+55 48 984138601" },
                  { icon: "📍", value: "Brasília, Distrito Federal" },
                ].map((c) => (
                  <p key={c.value} className="text-[11px] text-muted-foreground">{c.icon} {c.value}</p>
                ))}
              </div>
            </div>
          </div>
        )}
        {hasIdiomas && (
          <div className="rounded-xl border border-border overflow-hidden animate-[proto-fade-in_0.5s_ease-out]">
            <div className="px-3 py-2 border-b border-border bg-muted/30">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Idiomas</p>
            </div>
            <div className="px-3 py-2.5 space-y-1.5">
              {[
                { lang: "Português", level: "Nativo" },
                { lang: "Inglês", level: "Avançado" },
              ].map((l) => (
                <div key={l.lang} className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] font-medium">{l.lang}</span>
                  <span className="text-[11px] text-muted-foreground">{l.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {hasHabilidades && (
          <div className="rounded-xl border border-border overflow-hidden animate-[proto-fade-in_0.5s_ease-out]">
            <div className="px-3 py-2 border-b border-border bg-muted/30">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Habilidades</p>
            </div>
            <div className="px-3 py-2.5 flex flex-wrap gap-1.5">
              {[
                "Experiência do Usuário (UX)", "Design Thinking", "Design de Interface (UI)",
                "Prototipagem de Alta Fidelidade", "Pesquisa de Usuário", "Figma (Avançado)",
                "Automação com IA", "Dados", "Produto digital", "Tecnologia",
                "Análise de dados", "Desenvolvimento de produtos", "Estratégia digital",
              ].map((s) => (
                <span key={s} className="inline-flex items-center h-[22px] px-2 rounded-full text-[10px] font-medium bg-primary/8 text-primary">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {hasEmpreCard && (
          <div className="rounded-xl border border-primary/30 overflow-hidden animate-[proto-fade-in_0.5s_ease-out]"
            style={{ background: "linear-gradient(135deg,#FF904712 0%,transparent 70%)" }}>
            <div className="px-3 py-2 border-b border-primary/20 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary flex-none" />
              <p className="text-[10px] font-bold uppercase tracking-wide text-primary/70">EmpreCard criado</p>
            </div>
            <div className="px-3 py-2.5">
              <p className="text-[11px] font-semibold">Profissional de tecnologia, produto e dados</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Designer de Produto · UX, automação e transformação digital</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

type UploadState = "idle" | "uploading" | "done";

function CvUploadCard() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");

  function handleUpload() {
    setUploadState("uploading");
    setTimeout(() => setUploadState("done"), 1500);
  }

  if (uploadState === "idle") {
    return (
      <div className="mt-3 rounded-2xl border border-border bg-card overflow-hidden shadow-sm max-w-[min(420px,100%)]">
        <div
          onClick={handleUpload}
          className="m-3 rounded-xl border-2 border-dashed border-border hover:border-primary/40 cursor-pointer transition-colors px-6 py-7 flex flex-col items-center gap-2 text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">Arraste seu arquivo aqui</p>
          <p className="text-xs text-primary underline">ou clique para selecionar</p>
          <p className="text-xs text-muted-foreground">PDF ou DOCX · Máx. 10MB</p>
        </div>
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={handleUpload}
            className="w-full h-8 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Continuar sem currículo
          </button>
        </div>
      </div>
    );
  }

  if (uploadState === "uploading") {
    return (
      <div className="mt-3 rounded-2xl border border-border bg-card overflow-hidden shadow-sm max-w-[min(420px,100%)]">
        <div className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary/10 flex-none">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Enviando currículo...</p>
            <p className="text-xs text-muted-foreground mt-0.5">Bolivar_Alencastro_Designer.pdf</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-border bg-card overflow-hidden shadow-sm max-w-[min(420px,100%)]">
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-3 p-3 rounded-xl border border-success-border bg-success-soft">
          <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-success/15 flex-none">
            <FileText className="w-4 h-4 text-success" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-success leading-4">Currículo enviado</p>
            <p className="text-xs text-success/70 mt-0.5">Bolivar_Alencastro_Designer.pdf</p>
          </div>
          <CheckCircle className="w-4 h-4 text-success flex-none" />
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-primary mb-2">Análise da IA concluída ✨</p>
        <div className="space-y-1.5">
          {["Experiências identificadas", "Principais habilidades mapeadas", "Resumo profissional gerado"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="w-3.5 h-3.5 text-success flex-none" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreferencesCard() {
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState({
    local: "Híbrido",
    area: "Tecnologia e Produto",
    nivel: "Sênior",
    tipo: "Qualquer",
  });

  const fields: { key: keyof typeof values; label: string; options: string[] }[] = [
    { key: "local", label: "Onde prefere trabalhar?", options: ["Remoto", "Híbrido", "Presencial", "Flexível"] },
    { key: "area", label: "Qual área você busca?", options: ["Tecnologia e Produto", "Financeiro", "Gestão e Administração", "Saúde", "Educação"] },
    { key: "nivel", label: "Nível de experiência", options: ["Júnior", "Pleno", "Sênior", "Especialista"] },
    { key: "tipo", label: "Tipo de cooperativa", options: ["Qualquer", "Crédito", "Saúde", "Trabalho / TI", "Agronegócio"] },
  ];

  if (!submitted) {
    return (
      <article className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm mt-3 max-w-[min(420px,100%)]">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold">Suas preferências de trabalho</p>
          <p className="text-xs text-muted-foreground mt-0.5">Assim encontramos vagas muito mais alinhadas.</p>
        </div>
        <div className="px-4 py-3 space-y-3">
          {fields.map((f) => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">{f.label}</label>
              <div className="relative">
                <select
                  value={values[f.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className="w-full h-9 border border-border rounded-lg bg-transparent text-sm px-3 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="w-full h-10 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Continuar
          </button>
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Pular por enquanto
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm mt-3 max-w-[min(420px,100%)]">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold">Suas preferências</p>
        <p className="text-xs text-muted-foreground mt-0.5">Usaremos isso para filtrar as vagas mais alinhadas.</p>
      </div>
      <div className="divide-y divide-border">
        {fields.map((f) => (
          <div key={f.key} className="flex items-start justify-between gap-3 px-4 py-2.5">
            <p className="text-xs text-muted-foreground">{f.label}</p>
            <p className="text-xs font-semibold text-foreground text-right max-w-[55%]">{values[f.key]}</p>
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-border bg-success-soft/60 flex items-center gap-2">
        <CheckCircle className="w-3.5 h-3.5 text-success flex-none" />
        <p className="text-xs font-semibold text-success">Preferências registradas</p>
      </div>
    </article>
  );
}

function MatchResultsCard() {
  return (
    <article className="rounded-2xl border border-primary/20 bg-card overflow-hidden shadow-sm mt-3 max-w-[min(420px,100%)]">
      <div className="px-4 py-3 border-b border-primary/15 bg-brand-soft/40">
        <p className="text-xs font-semibold text-primary uppercase tracking-wide">Vagas encontradas para você</p>
      </div>
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div>
            <p className="text-2xl font-bold text-primary">247</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-4">vagas em cooperativas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">92%</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-4">match médio</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">+320</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-4">cooperativas ativas</p>
          </div>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-xl bg-success-soft border border-success-border">
          <CheckCircle className="w-4 h-4 text-success flex-none mt-0.5" />
          <p className="text-xs text-success leading-[18px]">
            <span className="font-semibold">Dica rápida:</span>{" "}
            Você pode refinar tudo isso ao longo da nossa conversa.
          </p>
        </div>
      </div>
    </article>
  );
}

function FileAttachment() {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-sm mt-1">
      <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 flex-none">
        <FileText className="w-4 h-4 text-primary" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-4 truncate">Bolivar Alencastro — Designer de Produto.pdf</p>
        <p className="text-xs text-muted-foreground">PDF · 284 KB</p>
      </div>
    </div>
  );
}

const JOBS = [
  { title: "Gerente Administrativo Financeiro", city: "Dom Eliseu", state: "PA" },
  { title: "Analista de Produtos Digitais",     city: "Brasília",   state: "DF" },
  { title: "Coordenador de Inovação e IA",      city: "São Paulo",  state: "SP" },
] as const;

function OpportunitiesCard() {
  const [applied, setApplied] = useState<string | null>(null);

  function handleApply(jobTitle: string) {
    setApplied(jobTitle);
    localStorage.setItem("proto_stage", "18");
    window.dispatchEvent(new CustomEvent("proto-update", { detail: { stage: 18 } }));
  }

  return (
    <article className="rounded-2xl border border-primary/15 bg-card overflow-hidden shadow-sm mt-4 max-w-[min(420px,100%)]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-primary/10 bg-primary/5">
        <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/12 text-primary flex-none">
          <Zap className="w-3.5 h-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs uppercase font-bold tracking-wide text-muted-foreground">Oportunidades pra você</p>
          <p className="text-sm font-medium">Vagas compatíveis com seu perfil</p>
        </div>
      </div>
      <div className="divide-y divide-border/60">
        {JOBS.map((job) => {
          const isApplied = applied === job.title;
          return (
            <div key={job.title} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground leading-5">{job.title}</p>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 flex-none" />
                  <span>{job.city} / {job.state}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleApply(job.title)}
                disabled={applied !== null}
                className={`flex-none inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isApplied
                    ? "border border-success/40 bg-success-soft text-success"
                    : applied !== null
                    ? "border border-border text-muted-foreground opacity-40 cursor-not-allowed"
                    : "border border-primary/30 text-primary hover:bg-primary/8 cursor-pointer"
                }`}
              >
                {isApplied
                  ? <><Check className="w-3 h-3" /><span>Enviada</span></>
                  : <><span>Candidatar-se</span><ArrowRight className="w-3 h-3" /></>
                }
              </button>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function EmpreCardMessage({ onOpen }: { onOpen: () => void }) {
  return (
    <article className="rounded-[18px] border border-primary/15 bg-card overflow-hidden shadow-sm mt-4">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-primary/10 bg-orange/5">
        <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange/18 text-orange flex-none">
          <Sparkles className="w-3.5 h-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs uppercase font-bold tracking-wide text-muted-foreground">EmpreCard criado</p>
          <p className="text-sm font-medium truncate">Profissional de tecnologia, produto e dados</p>
        </div>
      </div>
      <div className="p-4 bg-white">
        <h3 className="text-base font-medium mb-3">Foco em automação com IA e transformação digital</h3>
        <div className="flex flex-wrap gap-1.5">
          {["Tecnologia", "Produto digital", "Dados", "Automação com IA", "Estratégia digital", "Desenvolvimento de produtos"].map((tag) => (
            <span key={tag} className="inline-flex items-center min-h-[22px] px-2 rounded-full bg-muted text-foreground text-xs whitespace-nowrap">
              {tag}
            </span>
          ))}
          <span className="inline-flex items-center min-h-[22px] px-0 text-muted-foreground text-xs">+3</span>
        </div>
      </div>
      <div className="flex justify-end px-4 py-3 border-t border-primary/10 bg-white">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-2 min-h-8 px-3 rounded-lg border border-primary/16 bg-white text-foreground text-xs font-medium shadow-sm hover:bg-muted transition-colors"
        >
          Ver meu EmpreCard
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
}

function PrereqCard() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [courseStatus, setCourseStatus] = useState<Record<string, CourseStatus>>(
    () => statusFromPreset(null)
  );
  function handleDownload() {
    generateCurriculoPdf();
  }

  useEffect(() => {
    function readPreset() {
      setCourseStatus(statusFromPreset(
        localStorage.getItem("proto_courses") as CoursePreset | null
      ));
    }
    readPreset();
    window.addEventListener("proto-update", readPreset);
    return () => window.removeEventListener("proto-update", readPreset);
  }, []);

  function advanceCourse(label: string) {
    setCourseStatus(prev => {
      const cur = prev[label] ?? "idle";
      const next: CourseStatus = cur === "idle" ? "progress" : "done";
      const newStatus = { ...prev, [label]: next };
      if (label === C2) {
        const preset: CoursePreset = next === "done" ? "done" : "progress";
        localStorage.setItem("proto_courses", preset);
        if (next === "done") {
          const currentStage = parseInt(localStorage.getItem("proto_stage") ?? "0");
          if (currentStage < 19) {
            // Avança o fluxo: continua a animação a partir do estágio seguinte
            localStorage.setItem("proto_stage", "19");
            localStorage.setItem("proto_mode", "animated");
            window.dispatchEvent(new CustomEvent("proto-update", { detail: { stage: 19, mode: "animated" } }));
          } else {
            // Já passou desta etapa — só atualiza o preset sem reiniciar
            window.dispatchEvent(new CustomEvent("proto-courses-update", { detail: {} }));
          }
        } else {
          // Curso em progresso — só atualiza o preset
          window.dispatchEvent(new CustomEvent("proto-courses-update", { detail: {} }));
        }
      }
      return newStatus;
    });
  }

  const coursesData = [
    {
      num: "✓",
      label: C1,
      hours: "4H",
      desc: "Curso introdutório ao modelo cooperativo — obrigatório para todas as vagas do CapacitaCOOP.",
      topics: ["O que é uma cooperativa", "Princípios do cooperativismo", "Cooperativismo no Brasil"],
    },
    {
      num: "1",
      label: C2,
      hours: "13H",
      desc: "Cobre planejamento financeiro, análise de resultados e gestão orçamentária no contexto cooperativo.",
      topics: ["Demonstrações financeiras", "Fluxo de caixa", "Indicadores de desempenho", "Sobras e fundos"],
    },
  ];
  const courses = coursesData.map(c => ({ ...c, status: courseStatus[c.label] ?? "idle" }));
  const allDone = courses.every(c => c.status === "done");
  const pendingCount = courses.filter(c => c.status !== "done").length;

  return (
    <article className="rounded-2xl border border-primary/15 bg-card overflow-hidden shadow-sm mt-4 max-w-[min(420px,100%)]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-primary/10 bg-primary/5">
        <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/12 text-primary flex-none">
          <GraduationCap className="w-3.5 h-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs uppercase font-bold tracking-wide text-muted-foreground">Pré-requisitos</p>
          <p className="text-sm font-medium truncate">Gerente Administrativo Financeiro</p>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {courses.map((c) => {
          const isOpen = expanded === c.label;
          const isDone = c.status === "done";
          const isProgress = c.status === "progress";
          return (
            <div
              key={c.label}
              className={`rounded-xl border bg-card overflow-hidden ${
                isDone ? "border-success/35" : isProgress ? "border-primary/30 shadow-sm" : "border-border"
              }`}
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : c.label)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted/30 transition-colors"
              >
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold flex-none ${
                  isDone ? "bg-success-soft text-success" : isProgress ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {isDone ? <CheckCircle className="w-3 h-3" /> : isProgress ? <RefreshCw className="w-3 h-3" /> : c.num}
                </span>

                <div className="flex-1 min-w-0">
                  <strong className="block text-sm font-semibold leading-5 truncate">{c.label}</strong>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />{c.hours}
                    </span>
                    {isDone && (
                      <span className="inline-flex items-center gap-0.5 h-[14px] px-1 rounded-full bg-success-soft text-success text-[10px] font-semibold">
                        <Check className="w-2 h-2" />Concluído
                      </span>
                    )}
                    {isProgress && (
                      <span className="inline-flex items-center gap-0.5 h-[14px] px-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                        Em progresso
                      </span>
                    )}
                  </div>
                </div>

                {isDone ? (
                  <span
                    role="button"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-none h-7 px-2.5 rounded-lg border border-success/40 bg-success-soft text-success text-xs font-semibold hover:bg-success/10 transition-colors flex items-center gap-1"
                  >
                    Rever <ArrowRight className="w-3 h-3" />
                  </span>
                ) : isProgress ? (
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); advanceCourse(c.label); }}
                    className="flex-none h-7 px-2.5 rounded-lg border border-primary/30 bg-primary/8 text-primary text-xs font-semibold hover:bg-primary/12 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Continuar <ArrowRight className="w-3 h-3" />
                  </span>
                ) : (
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); advanceCourse(c.label); }}
                    className="flex-none h-7 px-2.5 rounded-lg border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/8 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Começar <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </button>

              {isOpen && (
                <div className="px-3 pb-3 border-t border-border/50">
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2.5 mb-2">{c.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {c.topics.map((t) => (
                      <span key={t} className="inline-flex items-center h-5 px-2 rounded-full bg-muted text-xs text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allDone ? (
        <>
          {/* Match Card gerado para a vaga */}
          <div className="border-t border-primary/15 px-4 py-3.5" style={{ background: "linear-gradient(135deg,rgba(109,0,112,.04) 0%,transparent 70%)" }}>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-5 h-5 flex items-center justify-center rounded-md bg-primary/10 flex-none">
                <Sparkles className="w-3 h-3 text-primary" />
              </span>
              <p className="text-[11px] font-bold uppercase tracking-wide text-primary/50 flex-1">Match Card criado</p>
              <span className="text-xs font-bold text-success">87% match</span>
            </div>
            <p className="text-xs font-semibold leading-5">Gerente Administrativo Financeiro</p>
            <p className="text-[11px] text-muted-foreground mb-2">Sicoob Dom Eliseu · Dom Eliseu, PA</p>
            <p className="text-[11px] font-medium text-muted-foreground mb-1">Adaptações ao EmpreCard base:</p>
            <ul className="text-[11px] text-muted-foreground space-y-0.5 leading-4">
              <li>· Skills destacadas: Gestão financeira, Análise de dados, Automação</li>
              <li>· Subtítulo adaptado para cooperativa de crédito</li>
              <li>· Essência reframeada com foco em gestão estratégica</li>
              <li>· Experiências ordenadas por relevância financeira</li>
            </ul>
          </div>
          {/* Ações */}
          <div className="border-t border-success/25 bg-success-soft px-4 py-3.5">
            <div className="flex items-center gap-2 text-success text-sm font-semibold">
              <CheckCircle className="w-4 h-4 flex-none" />
              Pré-requisitos concluídos — vaga liberada!
            </div>
            <p className="mt-1 ml-6 text-xs text-success/70 leading-relaxed">
              Seu Match Card está pronto. Confirme para enviar a candidatura.
            </p>
            <div className="ml-6 mt-3 flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-border bg-card text-muted-foreground text-xs font-medium hover:bg-muted transition-colors"
              >
                <Download className="w-3 h-3" />Baixar MatchCard
              </button>
              <a
                href="/ats-vaga"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  const cur = parseInt(localStorage.getItem("proto_stage") ?? "0");
                  if (cur <= 18) {
                    localStorage.setItem("proto_stage", "19");
                    localStorage.setItem("proto_mode", "animated");
                    window.dispatchEvent(new CustomEvent("proto-update", { detail: { stage: 19, mode: "animated" } }));
                  }
                }}
                className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-success/40 bg-card text-success text-xs font-semibold hover:bg-success/8 transition-colors"
              >
                Confirmar candidatura <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </>
      ) : (
        <div className="border-t border-border px-4 py-3.5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <Lock className="w-3.5 h-3.5 flex-none" />
            {pendingCount} curso{pendingCount !== 1 ? "s" : ""} pendente{pendingCount !== 1 ? "s" : ""} para liberar a candidatura
          </div>
          <p className="mt-1 ml-[22px] text-xs text-muted-foreground/60 leading-relaxed">
            Conclua todos os cursos acima para criar seu Match Card e candidatar-se.
          </p>
          <span className="ml-[22px] mt-3 inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-border text-muted-foreground/40 text-xs font-semibold cursor-not-allowed select-none">
            Confirmar candidatura <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      )}
    </article>
  );
}

function ApplicationStatusCard() {
  return (
    <article className="rounded-2xl border border-success/30 bg-card overflow-hidden shadow-sm mt-4 max-w-[min(420px,100%)]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-success/20 bg-success-soft/60">
        <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-success/15 text-success flex-none">
          <CheckCircle className="w-3.5 h-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs uppercase font-bold tracking-wide text-muted-foreground">Candidatura registrada</p>
          <p className="text-sm font-medium truncate">Gerente Administrativo Financeiro</p>
        </div>
      </div>
      <div className="px-4 py-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground mb-0.5">Cooperativa</p>
            <p className="font-semibold">Sicoob Dom Eliseu</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-0.5">Data</p>
            <p className="font-medium">21 jun. 2026</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-4">
          Acompanhe o processo diretamente com a cooperativa. Você pode atualizar o status desta candidatura no seu histórico.
        </p>
      </div>
    </article>
  );
}

function ProfileReactivationCard() {
  const actions = [
    { Icon: Pencil, label: "Atualizar EmpreCard", sub: "Adicionar novos projetos e habilidades" },
    { Icon: GraduationCap, label: "Explorar novos cursos", sub: "2 cursos novos disponíveis no CapacitaCOOP" },
    { Icon: Briefcase, label: "Ver novas vagas", sub: "3 vagas ainda mais aderentes encontradas" },
  ] as const;

  return (
    <article className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm mt-3 max-w-[min(420px,100%)]">
      <div className="px-4 py-3 border-b border-border bg-brand-soft/30">
        <p className="text-xs uppercase font-bold tracking-wide text-muted-foreground">Enquanto você aguarda</p>
        <p className="text-sm font-medium">Fortaleça seu perfil agora</p>
      </div>
      <div className="p-3 space-y-2">
        {actions.map(({ Icon, label, sub }) => (
          <button
            key={label}
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left"
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary flex-none">
              <Icon className="w-3.5 h-3.5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-5">{label}</p>
              <p className="text-xs text-muted-foreground leading-4">{sub}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-none" />
          </button>
        ))}
      </div>
    </article>
  );
}

const JOBS_REACTIVATION = [
  { title: "Coordenador de Produtos Digitais", city: "Brasília", state: "DF" },
  { title: "Analista de Transformação Digital", city: "Florianópolis", state: "SC" },
  { title: "Gerente de Inovação e Tecnologia", city: "Porto Alegre", state: "RS" },
] as const;

function ReactivationOpportunitiesCard() {
  const [applied, setApplied] = useState<string | null>(null);

  return (
    <article className="rounded-2xl border border-primary/15 bg-card overflow-hidden shadow-sm mt-4 max-w-[min(420px,100%)]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-primary/10 bg-primary/5">
        <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/12 text-primary flex-none">
          <RefreshCw className="w-3.5 h-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs uppercase font-bold tracking-wide text-muted-foreground">Novas vagas para você</p>
          <p className="text-sm font-medium">Perfil recalculado · 3 matches</p>
        </div>
      </div>
      <div className="divide-y divide-border/60">
        {JOBS_REACTIVATION.map((job) => {
          const isApplied = applied === job.title;
          return (
            <div key={job.title} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground leading-5">{job.title}</p>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 flex-none" />
                  <span>{job.city} / {job.state}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApplied(job.title)}
                disabled={applied !== null}
                className={`flex-none inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isApplied
                    ? "border border-success/40 bg-success-soft text-success"
                    : applied !== null
                    ? "border border-border text-muted-foreground opacity-40 cursor-not-allowed"
                    : "border border-primary/30 text-primary hover:bg-primary/8 cursor-pointer"
                }`}
              >
                {isApplied
                  ? <><Check className="w-3 h-3" /><span>Enviada</span></>
                  : <><span>Candidatar-se</span><ArrowRight className="w-3 h-3" /></>
                }
              </button>
            </div>
          );
        })}
      </div>
    </article>
  );
}

/* ── Header — Versão A (produção) ─────────────────────────────────────── */

/* ── Proto constants ───────────────────────────────────────────────────── */

// 'ai' or 'user' for each of the 24 messages
const MSG_TYPES = ["ai","user","ai","ai","ai","ai","user","ai","user","ai","ai","user","ai","user","ai","ai","user","ai","ai","user","ai","ai","user","ai"] as const;
// ms to pause before revealing each message (for AI msgs: this precedes the typing indicator)
const MSG_DELAYS = [0,1200,600,700,800,600,1200,600,1200,600,800,1200,600,1200,1000,1000,1200,700,1400,1000,700,1600,1200,700];
const TYPING_MS = 1100; // how long the typing indicator shows

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-[proto-fade-in_0.2s_ease-out]">
      <AIAvatar />
      <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3.5 mt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:120ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:240ms]" />
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function AssistentePage() {
  const [voiceMode, setVoiceMode] = useState(false);
  const [layoutVariant, setLayoutVariant] = useState<"a" | "b">("a");
  const [forcedPanel, setForcedPanel] = useState<import("@/components/layout/topbar").PanelKey | null>(null);
  const [commandsOpen, setCommandsOpen] = useState(false);
  const commandsRef = useRef<HTMLDivElement>(null);
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [contextText, setContextText] = useState("");
  const [rawInput, setRawInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── Proto playback state ── */
  const [visibleCount, setVisibleCount] = useState(PROTO_TOTAL);
  const [protoMode, setProtoMode] = useState<ProtoMode>("complete");
  const [isTyping, setIsTyping] = useState(false);
  const [coursePreset, setCoursePreset] = useState<CoursePreset | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Inline slash-command detection: fires when rawInput is exactly "/word" (no space yet)
  const inlineSlashMatch = !activeCommand ? rawInput.match(/^\/(\w*)$/) : null;
  const inlineQuery = inlineSlashMatch ? inlineSlashMatch[1].toLowerCase() : null;
  const filteredCmds = inlineQuery !== null
    ? COMMAND_ITEMS.filter(({ cmd }) => cmd.slice(1).startsWith(inlineQuery))
    : COMMAND_ITEMS;
  const showCommandPicker = commandsOpen || (inlineQuery !== null && filteredCmds.length > 0);

  function selectCommand(cmd: string) {
    setActiveCommand(cmd);
    setRawInput("");
    setCommandsOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function clearCommand() {
    setActiveCommand(null);
    setContextText("");
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    if (!activeCommand) {
      // Detect "/validcmd <space>" typed inline → activate command mode
      const cmdSpaceMatch = val.match(/^(\/\w+)\s([\s\S]*)$/);
      if (cmdSpaceMatch) {
        const [, cmd, rest] = cmdSpaceMatch;
        if (COMMAND_ITEMS.some(({ cmd: c }) => c === cmd)) {
          setActiveCommand(cmd);
          setContextText(rest);
          setRawInput("");
          return;
        }
      }
      setRawInput(val);
    } else {
      setContextText(val);
    }
  }

  // Read proto state from localStorage on mount + listen for updates
  useEffect(() => {
    function read() {
      const s = localStorage.getItem("proto_stage");
      const m = localStorage.getItem("proto_mode") as ProtoMode | null;
      const cp = localStorage.getItem("proto_courses") as CoursePreset | null;
      const lv = (localStorage.getItem("proto_layout") as "a" | "b" | null) ?? "a";
      const count = s !== null ? parseInt(s) : PROTO_TOTAL;
      const mode = m ?? "complete";
      setVisibleCount(count);
      setProtoMode(mode);
      setIsTyping(false);
      setCoursePreset(cp);
      setLayoutVariant(lv);
    }
    function readCourses() {
      const cp = localStorage.getItem("proto_courses") as CoursePreset | null;
      setCoursePreset(cp);
    }
    read();
    window.addEventListener("proto-update", read);
    window.addEventListener("proto-courses-update", readCourses);
    return () => {
      window.removeEventListener("proto-update", read);
      window.removeEventListener("proto-courses-update", readCourses);
    };
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (commandsRef.current && !commandsRef.current.contains(e.target as Node)) {
        setCommandsOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Animated playback: reveal one message at a time with delays
  useEffect(() => {
    if (protoMode !== "animated") return;
    if (visibleCount >= PROTO_TOTAL) return;

    const nextIdx = visibleCount;
    const isNextAI = MSG_TYPES[nextIdx] === "ai";
    const pause = MSG_DELAYS[nextIdx];

    const t1: ReturnType<typeof setTimeout> = setTimeout(() => {
      if (isNextAI) {
        setIsTyping(true);
        t2 = setTimeout(() => {
          setIsTyping(false);
          setVisibleCount((c) => c + 1);
        }, TYPING_MS);
      } else {
        setVisibleCount((c) => c + 1);
      }
    }, pause);
    let t2: ReturnType<typeof setTimeout>;

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visibleCount, protoMode]);

  const aiProgress = getProfileProgress(visibleCount);

  // Auto-scroll to bottom when new messages appear or typing indicator shows
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visibleCount, isTyping]);

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      {layoutVariant === "a" ? (
        <TopbarA />
      ) : (
        <Topbar
          profileProgress={aiProgress}
          forcedPanel={forcedPanel}
          onForcedPanelDismiss={() => setForcedPanel(null)}
          renderPanel={(key, onBack) => {
            if (key === "journey") return <ProgressPanel count={visibleCount} coursePreset={coursePreset} progress={aiProgress} onClose={onBack} />;
            if (key === "vagas")   return <VagasPanel onClose={onBack} />;
            if (key === "cursos")  return <CursosPanel coursePreset={coursePreset} onClose={onBack} />;
            return <ProfilePanel key={key} initialView={key as "curriculo" | "emprecard"} onClose={onBack} />;
          }}
        />
      )}

      <main className="flex-1 min-h-0 overflow-hidden flex">
        {/* Left sidebar — Versão A */}
        {layoutVariant === "a" && (
          <div className="hidden lg:flex flex-none w-[240px] overflow-hidden">
            {visibleCount >= 16
              ? <ContextualPanel count={visibleCount} progress={aiProgress} coursePreset={coursePreset} />
              : <JourneyPanel count={visibleCount} coursePreset={coursePreset} progress={aiProgress} />
            }
          </div>
        )}

        {/* Chat */}
        <section className="flex-1 min-w-0 h-full flex flex-col bg-background relative" aria-label="Assistente EmpregaCOOP">
            {/* Voice overlay */}
            {voiceMode && (
              <div className="absolute inset-0 z-20 bg-background flex flex-col">
                {/* Stage */}
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-8 px-6" style={{ marginTop: -48 }}>
                  {/* Live indicator */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-success"
                      style={{ boxShadow: "0 0 0 4px oklch(0.609 0.135 162 / 0.14)" }}
                    />
                    Ao vivo · 9:58
                  </div>

                  {/* Orb */}
                  <div className="relative grid place-items-center" style={{ width: 280, height: 280 }}>
                    <div
                      className="absolute rounded-full"
                      style={{
                        inset: 16,
                        background: "radial-gradient(circle, rgba(151,0,155,.18) 0%, rgba(151,0,155,.06) 52%, transparent 74%)",
                        filter: "blur(20px)",
                      }}
                    />
                    <div
                      className="relative rounded-full"
                      style={{
                        width: 200,
                        height: 200,
                        background: "linear-gradient(155deg, rgba(196,58,199,.92) 0%, rgba(113,0,113,.96) 48%, rgba(84,0,85,.98) 100%)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,.12), 0 0 0 1px rgba(255,255,255,.05), 0 24px 64px rgba(163,24,167,.14)",
                      }}
                    />
                  </div>

                  {/* Transcript */}
                  <p
                    className="max-w-[320px] text-center text-[32px] font-normal leading-tight"
                    style={{ color: "rgba(36,0,40,.88)" }}
                  >
                    Bolivar, a
                  </p>
                </div>

                {/* Controls */}
                <div className="flex-none px-4 pb-8 pt-4 border-t border-border flex items-center justify-center gap-4">
                  <button
                    type="button"
                    aria-label="Silenciar microfone"
                    data-tooltip="Silenciar"
                    className="w-14 h-14 flex items-center justify-center rounded-full border border-border bg-card shadow-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Encerrar conversa por voz"
                    data-tooltip="Encerrar chamada"
                    onClick={() => setVoiceMode(false)}
                    className="w-14 h-14 flex items-center justify-center rounded-full bg-destructive text-white shadow-sm hover:opacity-90 transition-opacity"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Chat scroll */}
            <div className="relative flex-1 min-h-0">
              <div className="h-full overflow-y-auto px-4 pt-4">
              <div className="proto-messages max-w-[820px] mx-auto flex flex-col gap-4 pb-6">

                {/* ── ETAPA 2: ONBOARDING ──────────────────────── */}

                {/* M0 — AI: Boas-vindas */}
                <article className="flex items-start gap-3">
                  <AIAvatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:02</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p className="mb-2">Oi, tudo bem? Sou sua entrevistadora aqui na EmpregaCOOP. Vou conversar com você por uns 20 minutos pra entender seu perfil profissional — isso vai alimentar seu cadastro para vagas em cooperativas e cursos do CapacitaCOOP.</p>
                      <p><strong>Antes de tudo: como posso te chamar?</strong></p>
                    </div>
                  </div>
                </article>

                {/* User: nome + currículo */}
                <article className="flex items-start gap-3 justify-end">
                  <div className="min-w-0 flex-1 flex flex-col items-end">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground justify-end">
                      <span>10:04</span>
                    </div>
                    <div className="inline-block max-w-[min(460px,100%)] rounded-2xl bg-[#efdff2] px-4 py-3 text-base leading-relaxed whitespace-pre-wrap">
                      Pode me chamar de Bolivar.
                    </div>
                  </div>
                  <UserAvatar />
                </article>

                {/* ── INTERAÇÃO: PREFERÊNCIAS E VAGAS INICIAIS ── */}

                {/* NEW M2 — AI: Pedindo currículo */}
                <article className="flex items-start gap-3">
                  <AIAvatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:04</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p>Prazer, Bolivar! Se você tiver um currículo em PDF, pode enviar aqui — isso adianta bastante as próximas perguntas. Mas pode continuar sem ele também.</p>
                    </div>
                    <CvUploadCard />
                  </div>
                </article>

                {/* NEW M4 — AI: Preferências de trabalho */}
                <article className="flex items-start gap-3">
                  <AIAvatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:04</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p>Antes de continuar, me conta suas preferências de trabalho — isso ajuda a encontrar as vagas mais alinhadas com o seu momento.</p>
                    </div>
                    <PreferencesCard />
                  </div>
                </article>

                {/* NEW M5 — AI: Vagas encontradas */}
                <article className="flex items-start gap-3">
                  <AIAvatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:05</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p>Já encontrei vagas compatíveis com você. Vamos continuar construindo seu perfil para aumentar ainda mais esse número.</p>
                    </div>
                    <MatchResultsCard />
                  </div>
                </article>

                {/* ── ETAPA 3 PERFIL: DADOS PESSOAIS → LOCALIZAÇÃO ── */}

                {/* AI: Confirma currículo + pede localização */}
                <article className="flex items-start gap-3">
                  <AIAvatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:05</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p className="mb-2">Ótimo! Já tenho suas informações e preferências — consigo ver uma trajetória de 8 experiências em design, produto e arte, com foco em tecnologia e nível sênior. Vou usar tudo isso para criar seu EmpreCard.</p>
                      <p><strong>Só falta uma coisa: em que cidade e estado você mora hoje?</strong></p>
                    </div>
                  </div>
                </article>

                {/* User: localização */}
                <article className="flex items-start gap-3 justify-end">
                  <div className="min-w-0 flex-1 flex flex-col items-end">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground justify-end">
                      <span>10:07</span>
                    </div>
                    <div className="inline-block max-w-[min(460px,100%)] rounded-2xl bg-[#efdff2] px-4 py-3 text-base leading-relaxed whitespace-pre-wrap">
                      Moro em Brasília, Distrito Federal.
                    </div>
                  </div>
                  <UserAvatar />
                </article>

                {/* ── ETAPA 3 PERFIL: OBJETIVO PROFISSIONAL ──────── */}

                {/* AI: Confirma localização + pede objetivo */}
                <article className="flex items-start gap-3">
                  <AIAvatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:08</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p className="mb-2">Anotado, Brasília DF.</p>
                      <p><strong>Me conta: qual é sua área principal de atuação e o que você busca como próximo passo na carreira?</strong></p>
                    </div>
                  </div>
                </article>

                {/* User: objetivo */}
                <article className="flex items-start gap-3 justify-end">
                  <div className="min-w-0 flex-1 flex flex-col items-end">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground justify-end">
                      <span>10:09</span>
                    </div>
                    <div className="inline-block max-w-[min(460px,100%)] rounded-2xl bg-[#efdff2] px-4 py-3 text-base leading-relaxed whitespace-pre-wrap">
                      Minha área principal é tecnologia, produto digital, dados e automação com IA. Busco oportunidades em cooperativas que estejam passando por transformação digital.
                    </div>
                  </div>
                  <UserAvatar />
                </article>

                {/* AI: Confirma objetivo + transição para experiência */}
                <article className="flex items-start gap-3">
                  <AIAvatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:10</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p className="mb-2">Entendido. Área forte e cada vez mais demandada no cooperativismo em transformação digital. Vou registrar isso como o eixo principal do seu perfil.</p>
                      <p><strong>Agora quero entender melhor sua experiência profissional.</strong></p>
                    </div>
                  </div>
                </article>

                {/* ── ETAPA 3 PERFIL: EXPERIÊNCIA PROFISSIONAL ───── */}

                {/* Assistant message 1 */}
                <article className="flex items-start gap-3">
                  <AIAvatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:30</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p className="mb-2">Oi, Bolivar. Vamos continuar montando seu perfil para conectar você com as melhores oportunidades em cooperativas.</p>
                      <p className="mb-2">Agora quero entender melhor sua experiência profissional.</p>
                      <p><strong>Qual foi seu último trabalho ou atividade profissional?</strong></p>
                    </div>
                  </div>
                </article>

                {/* User message */}
                <article className="flex items-start gap-3 justify-end">
                  <div className="min-w-0 flex-1 flex flex-col items-end">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground justify-end">
                      <span>10:32</span>
                    </div>
                    <div className="inline-block max-w-[min(460px,100%)] rounded-2xl bg-[#efdff2] px-4 py-3 text-base leading-relaxed whitespace-pre-wrap">
                      Trabalhei com estratégia digital, desenvolvimento de produtos, automação, análise de dados e integrações em projetos de transformação digital.
                    </div>
                  </div>
                  <UserAvatar />
                </article>

                {/* Assistant message 2 */}
                <article className="flex items-start gap-3">
                  <AIAvatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:34</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p className="mb-2">Perfeito. Isso me ajuda a entender melhor o tipo de entrega que você faz.</p>
                      <p>Pode me contar em que contexto esse trabalho aconteceu e quais resultados você gerou?</p>
                    </div>
                  </div>
                </article>

                {/* User message 2 */}
                <article className="flex items-start gap-3 justify-end">
                  <div className="min-w-0 flex-1 flex flex-col items-end">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground justify-end">
                      <span>10:35</span>
                    </div>
                    <div className="inline-block max-w-[min(460px,100%)] rounded-2xl bg-[#efdff2] px-4 py-3 text-base leading-relaxed whitespace-pre-wrap">
                      Atuei em projetos de produto e operações, organizando backlog, integrações, automações e análises para tomada de decisão. Meu foco era simplificar processos e aumentar velocidade de entrega.
                    </div>
                  </div>
                  <UserAvatar />
                </article>

                {/* Assistant message 3 — EmpreCard */}
                <article className="flex items-start gap-3">
                  <AIAvatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:37</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p>Pronto! Seu EmpreCard foi criado — seu Currículo 2.0 no cooperativismo.</p>
                    </div>
                    <EmpreCardMessage onOpen={() => setForcedPanel("emprecard")} />
                  </div>
                </article>

                {/* ── ETAPA 4: CAPACITAÇÃO / VAGAS ─────────────── */}

                {/* AI: Oportunidades + vagas */}
                <article className="flex items-start gap-3">
                  <AIAvatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:39</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p>Encontrei vagas compatíveis com seu perfil. Qual te interessa?</p>
                    </div>
                    <OpportunitiesCard />
                  </div>
                </article>

                {/* User: escolhe vaga */}
                <article className="flex items-start gap-3 justify-end">
                  <div className="min-w-0 flex-1 flex flex-col items-end">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground justify-end">
                      <span>10:40</span>
                    </div>
                    <div className="inline-block max-w-[min(460px,100%)] rounded-2xl bg-[#efdff2] px-4 py-3 text-base leading-relaxed whitespace-pre-wrap">
                      Quero saber mais sobre Gerente Administrativo Financeiro.
                    </div>
                  </div>
                  <UserAvatar />
                </article>

                {/* AI: Cursos pré-requisito */}
                <article className="flex items-start gap-3">
                  <AIAvatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:41</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p>Perfeito. Aqui estão os cursos pra você se preparar para essa família de vaga.</p>
                    </div>
                    <PrereqCard />
                  </div>
                </article>

                {/* ── ETAPA 6: PÓS-CANDIDATURA ─────────────── */}

                {/* M18 — AI: Confirma que viu a candidatura */}
                <article className="flex items-start gap-3">
                  <AIAvatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:43</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p>Vi que você selecionou a vaga de Gerente Administrativo Financeiro. Conseguiu concluir a inscrição na plataforma da cooperativa?</p>
                    </div>
                  </div>
                </article>

                {/* M19 — User: Confirmação */}
                <article className="flex items-start gap-3 justify-end">
                  <div className="min-w-0 flex-1 flex flex-col items-end">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground justify-end">
                      <span>10:44</span>
                    </div>
                    <div className="inline-block max-w-[min(460px,100%)] rounded-2xl bg-[#efdff2] px-4 py-3 text-base leading-relaxed whitespace-pre-wrap">
                      Sim, enviei! Foi bem tranquilo.
                    </div>
                  </div>
                  <UserAvatar />
                </article>

                {/* M20 — AI: Candidatura registrada */}
                <article className="flex items-start gap-3">
                  <AIAvatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:44</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p>Ótimo! Registrei sua candidatura no EmpregaCOOP para manter o rastreio e atribuição de origem.</p>
                    </div>
                    <ApplicationStatusCard />
                  </div>
                </article>

                {/* ── ETAPA 7: REATIVAÇÃO ────────────────────── */}

                {/* M22 — AI: Reativação */}
                <article className="flex items-start gap-3">
                  <AIAvatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>Hoje · 09:15</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p className="mb-2">Oi, Bolivar! A cooperativa ainda está em triagem — é normal levar alguns dias.</p>
                      <p>Enquanto isso, que tal usar esse tempo para fortalecer seu perfil e aumentar suas chances em outras vagas também?</p>
                    </div>
                    <ProfileReactivationCard />
                  </div>
                </article>

                {/* M23 — User: Pede novas vagas */}
                <article className="flex items-start gap-3 justify-end">
                  <div className="min-w-0 flex-1 flex flex-col items-end">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground justify-end">
                      <span>09:17</span>
                    </div>
                    <div className="inline-block max-w-[min(460px,100%)] rounded-2xl bg-[#efdff2] px-4 py-3 text-base leading-relaxed whitespace-pre-wrap">
                      Pode mostrar outras vagas compatíveis com meu perfil enquanto aguardo?
                    </div>
                  </div>
                  <UserAvatar />
                </article>

                {/* M24 — AI: Novas vagas */}
                <article className="flex items-start gap-3">
                  <AIAvatar />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>09:17</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p>Claro! Com seu perfil atualizado, encontrei novas vagas que combinam muito com você.</p>
                    </div>
                    <ReactivationOpportunitiesCard />
                  </div>
                </article>

                {/* ── Proto playback UI ── */}
                {isTyping && <TypingIndicator />}
                {protoMode === "manual" && visibleCount < PROTO_TOTAL && (
                  <div className="flex justify-center py-2">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((v) => Math.min(v + 1, PROTO_TOTAL))}
                      className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-primary/30 bg-primary/8 text-primary text-sm font-medium hover:bg-primary/12 transition-colors shadow-sm"
                    >
                      Próxima mensagem <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <div ref={bottomRef} className="h-1 shrink-0" />

                {/* Dynamic CSS: hide articles beyond visibleCount */}
                {visibleCount < PROTO_TOTAL && (
                  <style dangerouslySetInnerHTML={{ __html:
                    `@keyframes proto-fade-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}` +
                    `.proto-messages>article:nth-child(n+${visibleCount+1}){display:none!important}` +
                    (protoMode !== "complete"
                      ? `.proto-messages>article:nth-child(${Math.max(visibleCount,1)}){animation:proto-fade-in .3s ease-out}`
                      : "")
                  }} />
                )}

              </div>
              </div>
              {/* Top fade — messages dissolve in from under the header */}
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent z-10" />
              {/* Bottom fade — messages dissolve into the composer */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
            </div>

            {/* Composer */}
            <form className="flex-none px-4 pt-0 pb-3">
              <div className="max-w-[820px] mx-auto">
                <div className={`flex items-center gap-2 min-h-14 border rounded-[18px] bg-white px-2.5 py-2 shadow-sm transition-colors ${activeCommand ? "border-primary/80 ring-1 ring-primary/20" : "border-primary/50"}`}>
                  {/* Commands / actions button */}
                  <div className="relative flex-none" ref={commandsRef}>
                    <button
                      type="button"
                      aria-label="Ações"
                      aria-expanded={showCommandPicker}
                      onClick={(e) => { e.stopPropagation(); setCommandsOpen((o) => !o); }}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
                        showCommandPicker ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Wand2 className="w-4 h-4" />
                    </button>

                    {showCommandPicker && (
                      <div className="absolute bottom-full left-0 mb-2 w-72 rounded-2xl border border-border bg-card shadow-lg overflow-hidden z-10">
                        <div className="px-3 py-2 border-b border-border">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {inlineQuery !== null ? "Comandos" : "Ações"}
                          </p>
                        </div>
                        <div className="py-1">
                          {filteredCmds.map(({ cmd, Icon, desc, href }) =>
                            href ? (
                              <Link
                                key={cmd}
                                href={href}
                                onClick={() => setCommandsOpen(false)}
                                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted"
                              >
                                <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-muted/80 flex-none">
                                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                </span>
                                <div className="min-w-0">
                                  <p className="text-sm font-mono font-semibold text-primary leading-4">{cmd}</p>
                                  <p className="text-xs text-muted-foreground leading-4 mt-0.5">{desc}</p>
                                </div>
                              </Link>
                            ) : (
                              <button
                                key={cmd}
                                type="button"
                                onClick={() => selectCommand(cmd)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors text-left"
                              >
                                <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-muted/80 flex-none">
                                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                </span>
                                <div className="min-w-0">
                                  <p className="text-sm font-mono font-semibold text-primary leading-4">{cmd}</p>
                                  <p className="text-xs text-muted-foreground leading-4 mt-0.5">{desc}</p>
                                </div>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Active command chip */}
                  {activeCommand && (
                    <span className="inline-flex items-center gap-1 h-7 pl-2 pr-1.5 rounded-lg bg-primary/10 text-primary text-sm font-mono font-semibold flex-none">
                      {activeCommand}
                      <button
                        type="button"
                        aria-label="Cancelar comando"
                        onClick={clearCommand}
                        className="w-4 h-4 flex items-center justify-center rounded text-primary/50 hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <textarea
                    ref={textareaRef}
                    aria-label="Mensagem para o assistente"
                    placeholder={activeCommand ? `Descreva o que deseja...` : "Conte para a EmpregaCOOP sobre você..."}
                    rows={1}
                    value={activeCommand ? contextText : rawInput}
                    onChange={handleInputChange}
                    className="flex-1 min-w-0 min-h-9 max-h-28 border-0 resize-none outline-none bg-transparent text-foreground placeholder:text-muted-foreground/60 placeholder:whitespace-nowrap text-sm leading-5 py-2"
                  />
                  <button
                    type="button"
                    aria-label="Conversar por voz"
                    data-tooltip="Voz"
                    onClick={() => setVoiceMode(true)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-foreground hover:bg-muted transition-colors flex-none"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Enviar mensagem"
                    data-tooltip="Enviar"
                    data-tooltip-dir="left"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white shadow-sm flex-none"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground hidden sm:block">
                  Enter envia · Shift+Enter quebra linha
                </p>
              </div>
            </form>
          </section>

        {/* Right sidebar — Versão A */}
        {layoutVariant === "a" && (
          <div className="hidden lg:flex flex-none w-[280px] overflow-hidden">
            <ProfileSidebar count={visibleCount} progress={aiProgress} />
          </div>
        )}
      </main>
    </div>
  );
}
