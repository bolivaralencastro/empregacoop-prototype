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
  MicOff,
  PhoneOff,
  ArrowRight,
  Sparkles,
  Clock,
  Pencil,
  CheckCircle,
  RefreshCw,
  Zap,
  Star,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";

/* ── Data ─────────────────────────────────────────────────────────────── */

type StepSub = { label: string; done: boolean; current?: boolean };
type JStep =
  | { id: number; label: string; status: "done" }
  | { id: number; label: string; status: "locked"; unlocks?: string }
  | { id: number; label: string; status: "current"; count?: string; context?: string; substeps?: StepSub[] };

function getJourneySteps(n: number): JStep[] {
  const d = (id: number, label: string): JStep => ({ id, label, status: "done" });
  const l = (id: number, label: string, unlocks?: string): JStep => ({ id, label, status: "locked", unlocks });
  const TAIL: JStep[] = [
    l(4, "Capacitação", "Trilhas e cursos indicados"),
    l(5, "Vagas", "Oportunidades compatíveis"),
    l(6, "Candidaturas", "Candidatura com um clique"),
    l(7, "Reativação", "Perfil sempre atualizado"),
  ];
  const subLabels = ["Dados pessoais", "Localização", "Objetivo profissional", "Experiência profissional", "Formação acadêmica", "Habilidades e idiomas", "Currículo", "Referências"];
  const subs = (nDone: number, cur: number): StepSub[] =>
    subLabels.map((label, i) => ({ label, done: i < nDone, current: i === cur }));

  if (n < 3) {
    const ctx = n === 0 ? "Iniciando conversa" : "Apresentando o EmpregaCOOP";
    return [d(1, "Acesso"), { id: 2, label: "Onboarding", status: "current", context: ctx }, l(3, "Perfil", "Construção do seu perfil"), ...TAIL];
  }
  if (n < 5)  return [d(1, "Acesso"), d(2, "Onboarding"), { id: 3, label: "Perfil", status: "current", count: "1/8", context: "Coletando dados pessoais",        substeps: subs(0, 0) }, ...TAIL];
  if (n < 7)  return [d(1, "Acesso"), d(2, "Onboarding"), { id: 3, label: "Perfil", status: "current", count: "2/8", context: "Coletando localização",             substeps: subs(1, 1) }, ...TAIL];
  if (n < 11) return [d(1, "Acesso"), d(2, "Onboarding"), { id: 3, label: "Perfil", status: "current", count: "4/8", context: "Coletando objetivo profissional",   substeps: subs(2, 2) }, ...TAIL];
  if (n < 12) return [d(1, "Acesso"), d(2, "Onboarding"), { id: 3, label: "Perfil", status: "current", count: "5/8", context: "Coletando experiência profissional", substeps: subs(3, 3) }, ...TAIL];
  if (n < 13) return [d(1, "Acesso"), d(2, "Onboarding"), { id: 3, label: "Perfil", status: "current", count: "7/10", context: "Emprecard gerado",                 substeps: subs(4, -1) }, ...TAIL];
  const capSubs: StepSub[] = [
    { label: "Cooperativismo - Primeiras Licoes", done: true },
    { label: "Gestao Estrategica de Financas", done: n >= 15 },
  ];
  return [
    d(1, "Acesso"), d(2, "Onboarding"), d(3, "Perfil"),
    { id: 4, label: "Capacitação", status: "current",
      context: n >= 15 ? "Pré-requisito concluído" : "Analisando pré-requisitos",
      substeps: capSubs },
    n >= 15 ? d(5, "Vagas") : l(5, "Vagas", "1 vaga compatível identificada"),
    l(6, "Candidaturas", n >= 15 ? "Candidatura disponível →" : "Candidatura com um clique"),
    l(7, "Reativação", "Perfil sempre atualizado"),
  ];
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

/* ── Sub-components ────────────────────────────────────────────────────── */

function JourneyPanel({ count, onClose }: { count: number; onClose?: () => void }) {
  return (
    <aside
      className="flex flex-col overflow-hidden bg-card border-r border-border"
      aria-label="Sua jornada"
    >
      {/* Header */}
      <div className="flex-none px-3 pt-3 pb-2.5 border-b border-border flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold px-1">Sua jornada</h2>
        <button
          type="button"
          aria-label="Recolher jornada"
          data-tooltip="Recolher"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Steps */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4 space-y-0.5">
        {getJourneySteps(count).map((step) => {
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
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary text-white text-xs font-bold flex-none">
                    {step.id}
                  </span>
                  <span className="text-sm font-semibold flex-1">{step.label}</span>
                  {step.count && (
                    <span className="inline-flex items-center h-5 px-2 rounded-full bg-brand-soft text-primary text-xs font-semibold">
                      {step.count}
                    </span>
                  )}
                </div>
                {"context" in step && step.context && (
                  <p className="text-xs text-primary/65 font-medium mb-3 ml-[34px]">
                    {step.context}
                  </p>
                )}
                {"substeps" in step && step.substeps && (
                  <div className="ml-[34px] space-y-2">
                    {step.substeps.map((sub) => (
                      <div key={sub.label} className="flex items-center gap-2">
                        <span className={`w-4 h-4 flex items-center justify-center rounded-full border flex-none ${
                          sub.done && !sub.current
                            ? "border-success bg-success text-white"
                            : sub.current
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-transparent"
                        }`}>
                          {(sub.done || sub.current) && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <span className={`text-xs leading-4 ${
                          sub.current ? "font-semibold text-foreground" :
                          sub.done ? "text-muted-foreground" :
                          "text-muted-foreground/50"
                        }`}>
                          {sub.label}
                        </span>
                      </div>
                    ))}
                  </div>
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

function ProfilePanel({ onClose }: { onClose?: () => void }) {
  const [view, setView] = useState<"summary" | "curriculo" | "emprecard" | "emprecard-edit">("summary");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(["identidade", "essencia", "historia"]);

  function toggleSection(id: string) {
    setOpenSections((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  }

  return (
    <aside
      className="flex flex-col overflow-hidden bg-card border-l border-border"
      aria-label="Painel do candidato"
    >
      {view === "summary" ? (
        <>
          {/* Panel header */}
          <div className="flex-none px-3 pt-3 pb-2.5 border-b border-border flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold px-1">Meu perfil</h2>
            <button type="button" aria-label="Recolher painel" data-tooltip="Recolher" data-tooltip-dir="left" onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Summary cards */}
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3">
            {/* Currículo card */}
            <button type="button" onClick={() => setView("curriculo")}
              className="w-full rounded-2xl border border-border bg-card p-4 shadow-sm text-left hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-semibold">Currículo</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-base font-medium">Bolivar Alencastro</p>
              <p className="text-xs text-muted-foreground mt-0.5">Brasília, DF · +55 48 984138601</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-4">Product Designer · 8 experiências · Bacharel em Design Gráfico</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 h-5 px-2 rounded-full bg-success-soft text-success text-xs font-medium">
                  <Check className="w-3 h-3" /> 7 completas
                </span>
                <span className="inline-flex items-center h-5 px-2 rounded-full bg-muted text-muted-foreground text-xs">2 pendentes</span>
              </div>
            </button>

            {/* Emprecard card */}
            <button type="button" onClick={() => setView("emprecard")}
              className="w-full rounded-2xl border border-border overflow-hidden text-left hover:shadow-md transition-shadow group">
              <div className="w-full h-1 bg-orange" />
              <div className="p-4 bg-card">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-sm font-semibold">Emprecard</h3>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-sm font-medium leading-5 line-clamp-1">Profissional de tecnologia, produto e dados</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">Designer de Produto com foco em UX, automação e transformação digital</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {["UX", "Design Thinking", "UI", "Figma"].map((s) => (
                    <span key={s} className="inline-flex items-center h-5 px-2 rounded-full text-xs font-medium"
                      style={{ background: "rgba(255,144,71,.12)", color: "#ff9047" }}>{s}</span>
                  ))}
                  <span className="inline-flex items-center h-5 px-1 text-xs text-muted-foreground">+19</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-1 h-5 px-2 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <Star className="w-3 h-3 fill-current" /> Padrão
                  </span>
                </div>
              </div>
            </button>
          </div>
        </>
      ) : view === "curriculo" ? (
        <>
          <div className="flex items-center gap-2 px-3 pt-3 pb-2.5 flex-none border-b border-border">
            <button type="button" aria-label="Voltar" data-tooltip="Voltar" onClick={() => { setView("summary"); setEditingSection(null); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-none">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold flex-1">Currículo</h2>
            <button type="button" aria-label="Recolher painel" data-tooltip="Recolher" data-tooltip-dir="left" onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-none">
              <ChevronRight className="w-4 h-4" />
            </button>
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
            <button type="button" aria-label="Voltar" data-tooltip="Voltar" onClick={() => setView("summary")}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-none">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold flex-1">Emprecard</h2>
            <button type="button" aria-label="Editar Emprecard" data-tooltip="Editar" data-tooltip-dir="left" onClick={() => setView("emprecard-edit")}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-none">
              <Pencil className="w-4 h-4" />
            </button>
            <button type="button" aria-label="Recolher painel" data-tooltip="Recolher" data-tooltip-dir="left" onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-none">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="mx-3 mt-3 rounded-2xl border border-border overflow-hidden">
              <div className="w-full h-1.5 bg-orange" />
              <div className="px-4 pt-4 pb-3"
                style={{ background: "linear-gradient(135deg, #FF904728 0%, #FF904708 60%, transparent 100%)" }}>
                <p className="text-sm font-semibold leading-5">Profissional de tecnologia, produto e dados</p>
                <p className="text-xs text-muted-foreground mt-0.5">Designer de Produto com foco em UX, automação e transformação digital</p>
                <p className="text-xs text-muted-foreground mt-0.5">Brasília, Distrito Federal</p>
                <p className="text-xs italic leading-4 mt-2" style={{ color: "#ff9047" }}>
                  "Tecnologia, produto e dados como eixo principal. Gosta de resolver problemas com automação e IA. Busca oportunidades remotas, híbridas ou em projetos nacionais."
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
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 px-3 pt-3 pb-2.5 flex-none border-b border-border">
            <button type="button" aria-label="Voltar" data-tooltip="Voltar" onClick={() => setView("emprecard")}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-none">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold flex-1">Editar Emprecard</h2>
            <button type="button" aria-label="Recolher painel" data-tooltip="Recolher" data-tooltip-dir="left" onClick={onClose}
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

function OpportunitiesCard() {
  return (
    <article className="rounded-2xl border border-primary/15 bg-card overflow-hidden shadow-sm mt-4">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-primary/10 bg-primary/5">
        <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/12 text-primary flex-none">
          <Zap className="w-3.5 h-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs uppercase font-bold tracking-wide text-muted-foreground">Oportunidades pra você</p>
          <p className="text-base font-medium truncate">Vagas compatíveis com seu perfil</p>
        </div>
      </div>
      <div className="p-3">
        <button
          type="button"
          className="w-full text-left rounded-xl border border-primary/20 bg-primary/4 px-4 py-3 hover:bg-primary/8 transition-colors group"
        >
          <p className="text-base font-semibold text-foreground">Gerente Administrativo Financeiro</p>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
            <span>📍 Dom Eliseu / PA</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span>1 vaga disponível</span>
          </div>
          <p className="text-xs text-primary mt-1.5 font-medium group-hover:underline">Ver cursos pré-requisito →</p>
        </button>
      </div>
    </article>
  );
}

function EmpreCardMessage() {
  return (
    <article className="rounded-[18px] border border-primary/15 bg-card overflow-hidden shadow-sm mt-4">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-primary/10 bg-orange/5">
        <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange/18 text-orange flex-none">
          <Sparkles className="w-3.5 h-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs uppercase font-bold tracking-wide text-muted-foreground">Emprecard gerado</p>
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
        <Link
          href="/emprecards/1"
          className="inline-flex items-center gap-2 min-h-8 px-3 rounded-lg border border-primary/16 bg-white text-foreground text-xs font-medium shadow-sm hover:bg-muted transition-colors"
        >
          Ver Emprecard salvo
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}

function PrereqCard() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [courseStatus, setCourseStatus] = useState<Record<string, CourseStatus>>(
    () => statusFromPreset(null)
  );

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
      return { ...prev, [label]: cur === "idle" ? "progress" : "done" };
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
    <article className="rounded-2xl border border-primary/20 bg-brand-soft/40 overflow-hidden mt-4">
      <div className="px-4 py-3 border-b border-primary/12 bg-brand-soft/30">
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wide">
          <GraduationCap className="w-3.5 h-3.5" />
          Pré-requisitos · Gerente Administrativo Financeiro
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
              className={`rounded-xl border bg-white overflow-hidden transition-shadow ${
                isDone ? "border-success/45" : isProgress ? "border-primary/40 shadow-sm" : isOpen ? "border-primary/30 shadow-sm" : "border-primary/8"
              }`}
            >
              {/* Row — always visible */}
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : c.label)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted/30 transition-colors"
              >
                {/* Status icon */}
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold flex-none ${
                  isDone ? "bg-success-soft text-success" : isProgress ? "bg-primary text-white" : "bg-brand-soft text-primary"
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

                {/* CTA — 3 states */}
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
                    className="flex-none h-7 px-2.5 rounded-lg bg-primary/90 text-white text-xs font-semibold hover:bg-primary transition-colors flex items-center gap-1"
                  >
                    Continuar <ArrowRight className="w-3 h-3" />
                  </span>
                ) : (
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); advanceCourse(c.label); }}
                    className="flex-none h-7 px-2.5 rounded-lg bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1"
                  >
                    Começar <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </button>

              {/* Expanded details */}
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
        <div className="mx-3 mb-3 p-3.5 rounded-2xl border border-success-border bg-success-soft">
          <div className="flex items-center gap-2.5 text-[#106f4a] text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            Todos os pré-requisitos concluídos — vaga liberada!
          </div>
          <p className="mt-1.5 ml-[26px] text-xs text-[#106f4a]/84 leading-[18px]">
            Parabéns! Você completou todos os cursos obrigatórios e pode se candidatar.
          </p>
          <a
            href="#"
            className="ml-[26px] mt-3 inline-flex items-center gap-2 min-h-[38px] px-3.5 rounded-xl bg-[#0d9b6c] text-white border-2 border-primary/50 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Candidatar-se à vaga
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div className="mx-3 mb-3 p-3.5 rounded-2xl border border-border bg-muted/20">
          <div className="flex items-center gap-2.5 text-muted-foreground text-sm font-semibold">
            <Lock className="w-4 h-4" />
            {pendingCount} curso{pendingCount !== 1 ? "s" : ""} pendente{pendingCount !== 1 ? "s" : ""} para liberar a candidatura
          </div>
          <p className="mt-1.5 ml-[26px] text-xs text-muted-foreground leading-[18px]">
            Conclua todos os cursos acima para se candidatar a esta vaga.
          </p>
          <span className="ml-[26px] mt-3 inline-flex items-center gap-2 min-h-[38px] px-3.5 rounded-xl bg-muted border border-border text-muted-foreground/40 text-xs font-semibold cursor-not-allowed select-none">
            <Briefcase className="w-3.5 h-3.5" />
            Candidatar-se à vaga
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      )}
    </article>
  );
}

/* ── Proto constants ───────────────────────────────────────────────────── */

// 'ai' or 'user' for each of the 15 messages
const MSG_TYPES = ["ai","user","ai","user","ai","user","ai","ai","user","ai","user","ai","ai","user","ai"] as const;
// ms to pause before revealing each message (for AI msgs: this precedes the typing indicator)
const MSG_DELAYS = [0,1200,600,1200,600,1200,600,800,1200,600,1200,1000,1000,1200,700];
const TYPING_MS = 1100; // how long the typing indicator shows

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-[proto-fade-in_0.2s_ease-out]">
      <span className="w-8 h-8 flex-none rounded-full bg-primary overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://b2c.empregacoop.xyz/brand/empregacoop-mark.png" alt="" className="w-full h-full object-cover" />
      </span>
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
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [voiceMode, setVoiceMode] = useState(false);

  /* ── Proto playback state ── */
  const [visibleCount, setVisibleCount] = useState(PROTO_TOTAL);
  const [protoMode, setProtoMode] = useState<ProtoMode>("complete");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Read proto state from localStorage on mount + listen for updates
  useEffect(() => {
    function read() {
      const s = localStorage.getItem("proto_stage");
      const m = localStorage.getItem("proto_mode") as ProtoMode | null;
      const count = s !== null ? parseInt(s) : PROTO_TOTAL;
      const mode = m ?? "complete";
      setVisibleCount(count);
      setProtoMode(mode);
      setIsTyping(false);
    }
    read();
    window.addEventListener("proto-update", read);
    return () => window.removeEventListener("proto-update", read);
  }, []);

  // Animated playback: reveal one message at a time with delays
  useEffect(() => {
    if (protoMode !== "animated") return;
    if (visibleCount >= PROTO_TOTAL) return;

    const nextIdx = visibleCount;
    const isNextAI = MSG_TYPES[nextIdx] === "ai";
    const pause = MSG_DELAYS[nextIdx];

    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;

    t1 = setTimeout(() => {
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

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visibleCount, protoMode]);

  // Auto-scroll to bottom when new messages appear or typing indicator shows
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visibleCount, isTyping]);

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <Topbar />

      <main className="flex-1 min-h-0 overflow-hidden">
        <div
          className="h-full grid overflow-hidden transition-all"
          style={{
            gridTemplateColumns: leftOpen
              ? rightOpen ? "348px minmax(0,1fr) 336px" : "348px minmax(0,1fr)"
              : rightOpen ? "minmax(0,1fr) 336px" : "minmax(0,1fr)",
          }}
        >
          {/* Left — Journey */}
          {leftOpen ? (
            <JourneyPanel count={visibleCount} onClose={() => setLeftOpen(false)} />
          ) : null}

          {/* Center — Chat */}
          <section className="relative flex flex-col min-w-0 min-h-0 bg-background" aria-label="Assistente EmpregaCOOP">
            {/* Edge buttons to reopen collapsed panels */}
            {!leftOpen && (
              <button
                type="button"
                onClick={() => setLeftOpen(true)}
                aria-label="Abrir jornada"
                data-tooltip="Abrir jornada"
                data-tooltip-dir="right"
                className="absolute left-3 top-3 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {!rightOpen && (
              <button
                type="button"
                onClick={() => setRightOpen(true)}
                aria-label="Abrir painel do perfil"
                data-tooltip="Abrir perfil"
                data-tooltip-dir="left"
                className="absolute right-3 top-3 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
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
                  <span className="w-8 h-8 flex-none rounded-full bg-primary overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://b2c.empregacoop.xyz/brand/empregacoop-mark.png" alt="EmpregaCOOP" className="w-full h-full object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:02</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p className="mb-2">Oi, tudo bem? Sou sua entrevistadora aqui na EmpregaCOOP. Vou conversar com você por uns 20 minutos pra entender seu perfil profissional — isso vai alimentar seu cadastro para vagas em cooperativas e cursos do CapacitaCOOP.</p>
                      <p className="mb-2">Se você tiver um currículo em PDF aí à mão, pode anexar pelo clipe aqui embaixo — é opcional, mas adianta bastante o que eu ia te perguntar.</p>
                      <p><strong>Antes da gente começar: como posso te chamar?</strong></p>
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
                    <FileAttachment />
                  </div>
                  <span className="w-8 h-8 flex-none rounded-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://i.pravatar.cc/64?img=12" alt="Bolivar" className="w-full h-full object-cover" />
                  </span>
                </article>

                {/* ── ETAPA 3 PERFIL: DADOS PESSOAIS → LOCALIZAÇÃO ── */}

                {/* AI: Confirma currículo + pede localização */}
                <article className="flex items-start gap-3">
                  <span className="w-8 h-8 flex-none rounded-full bg-primary overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://b2c.empregacoop.xyz/brand/empregacoop-mark.png" alt="EmpregaCOOP" className="w-full h-full object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:05</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p className="mb-2">Perfeito, Bolivar! Recebi seu currículo — já consigo ver uma trajetória de 8 experiências em design, produto e arte. Vou usar isso como referência enquanto a gente conversa.</p>
                      <p><strong>Pra começar: em que cidade e estado você mora hoje?</strong></p>
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
                      Moro em Brasília, Distrito Federal. Prefiro trabalho remoto ou híbrido, mas tenho disponibilidade pra projetos nacionais com viagens pontuais.
                    </div>
                  </div>
                  <span className="w-8 h-8 flex-none rounded-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://i.pravatar.cc/64?img=12" alt="Bolivar" className="w-full h-full object-cover" />
                  </span>
                </article>

                {/* ── ETAPA 3 PERFIL: OBJETIVO PROFISSIONAL ──────── */}

                {/* AI: Confirma localização + pede objetivo */}
                <article className="flex items-start gap-3">
                  <span className="w-8 h-8 flex-none rounded-full bg-primary overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://b2c.empregacoop.xyz/brand/empregacoop-mark.png" alt="EmpregaCOOP" className="w-full h-full object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:08</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p className="mb-2">Anotado. Brasília, DF — remoto ou híbrido, com mobilidade nacional.</p>
                      <p><strong>Agora me conta: qual é sua área principal de atuação e o que você busca como próximo passo na carreira?</strong></p>
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
                      Minha área principal é tecnologia, produto digital, dados e automação com IA. Busco oportunidades em cooperativas que estejam passando por transformação digital — remoto ou híbrido.
                    </div>
                  </div>
                  <span className="w-8 h-8 flex-none rounded-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://i.pravatar.cc/64?img=12" alt="Bolivar" className="w-full h-full object-cover" />
                  </span>
                </article>

                {/* AI: Confirma objetivo + transição para experiência */}
                <article className="flex items-start gap-3">
                  <span className="w-8 h-8 flex-none rounded-full bg-primary overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://b2c.empregacoop.xyz/brand/empregacoop-mark.png" alt="EmpregaCOOP" className="w-full h-full object-cover" />
                  </span>
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
                  <span className="w-8 h-8 flex-none rounded-full bg-primary overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://b2c.empregacoop.xyz/brand/empregacoop-mark.png" alt="EmpregaCOOP" className="w-full h-full object-cover" />
                  </span>
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
                  <span className="w-8 h-8 flex-none rounded-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://i.pravatar.cc/64?img=12" alt="Bolivar" className="w-full h-full object-cover" />
                  </span>
                </article>

                {/* Assistant message 2 */}
                <article className="flex items-start gap-3">
                  <span className="w-8 h-8 flex-none rounded-full bg-primary overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://b2c.empregacoop.xyz/brand/empregacoop-mark.png" alt="EmpregaCOOP" className="w-full h-full object-cover" />
                  </span>
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
                  <span className="w-8 h-8 flex-none rounded-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://i.pravatar.cc/64?img=12" alt="Bolivar" className="w-full h-full object-cover" />
                  </span>
                </article>

                {/* Assistant message 3 — EmpreCard */}
                <article className="flex items-start gap-3">
                  <span className="w-8 h-8 flex-none rounded-full bg-primary overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://b2c.empregacoop.xyz/brand/empregacoop-mark.png" alt="EmpregaCOOP" className="w-full h-full object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 text-xs text-muted-foreground">
                      <strong className="text-sm font-semibold text-foreground">EmpregaCOOP IA</strong>
                      <span>10:37</span>
                    </div>
                    <div className="inline-block max-w-[min(560px,100%)] rounded-2xl bg-muted px-4 py-3 text-base leading-relaxed">
                      <p>Pronto! Seu Emprecard foi gerado.</p>
                    </div>
                    <EmpreCardMessage />
                  </div>
                </article>

                {/* ── ETAPA 4: CAPACITAÇÃO / VAGAS ─────────────── */}

                {/* AI: Oportunidades + vagas */}
                <article className="flex items-start gap-3">
                  <span className="w-8 h-8 flex-none rounded-full bg-primary overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://b2c.empregacoop.xyz/brand/empregacoop-mark.png" alt="EmpregaCOOP" className="w-full h-full object-cover" />
                  </span>
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
                  <span className="w-8 h-8 flex-none rounded-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://i.pravatar.cc/64?img=12" alt="Bolivar" className="w-full h-full object-cover" />
                  </span>
                </article>

                {/* AI: Cursos pré-requisito */}
                <article className="flex items-start gap-3">
                  <span className="w-8 h-8 flex-none rounded-full bg-primary overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://b2c.empregacoop.xyz/brand/empregacoop-mark.png" alt="EmpregaCOOP" className="w-full h-full object-cover" />
                  </span>
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
                  // eslint-disable-next-line react/no-danger
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
              {/* Fade gradient so messages dissolve into the composer */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
            </div>

            {/* Composer */}
            <form className="flex-none px-4 pt-0 pb-3">
              <div className="max-w-[820px] mx-auto">
                <div className="flex items-center gap-2 min-h-14 border border-primary/50 rounded-[18px] bg-white px-2.5 py-2 shadow-sm">
                  <button type="button" aria-label="Anexar currículo (PDF)" data-tooltip="Anexar currículo" className="w-9 h-9 flex items-center justify-center rounded-xl text-foreground hover:bg-muted transition-colors flex-none">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <textarea
                    aria-label="Mensagem para o assistente"
                    placeholder="Conte para a EmpregaCOOP sobre você..."
                    rows={1}
                    className="flex-1 min-w-0 min-h-9 max-h-28 border-0 resize-none outline-none bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm leading-5 py-2"
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

          {/* Right — Profile */}
          {rightOpen ? (
            <ProfilePanel onClose={() => setRightOpen(false)} />
          ) : null}
        </div>

        {/* Backdrop for mobile drawers */}
        {(leftOpen || rightOpen) && (
          <div
            className="fixed inset-0 bg-foreground/25 z-30 md:hidden"
            onClick={() => { setLeftOpen(false); setRightOpen(false); }}
          />
        )}
      </main>
    </div>
  );
}
