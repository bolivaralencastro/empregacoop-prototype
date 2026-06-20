"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Star, Trash2, ChevronDown } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";

const accordionSections = [
  {
    id: "identity",
    label: "Identidade & Design",
    open: true,
    fields: [
      { id: "title", label: "Título principal", type: "text" as const, value: "Profissional de tecnologia, produto e dados" },
      { id: "subtitle", label: "Subtítulo", type: "text" as const, value: "Foco em automação com IA e transformação digital" },
      { id: "job", label: "Cargo (jobTitle)", type: "text" as const, value: "" },
      { id: "company", label: "Empresa-alvo (companyName)", type: "text" as const, value: "" },
      { id: "tagline", label: "Tagline", type: "text" as const, hint: "Frase curta que aparece destacada no cabeçalho.", value: "Atua com estratégia digital, desenvolvimento de produtos, análise de dados e integrações, buscando oportunidades remotas, híbridas em Brasília e projetos nacionais." },
    ],
  },
  {
    id: "essence",
    label: "Essência",
    open: true,
    fields: [
      { id: "essence", label: "Essência", type: "textarea" as const, hint: "Frase curta — sua identidade profissional em uma respiração.", value: "Tecnologia, produto digital e dados são o centro do seu trabalho. Automação com IA e integrações entram como parte da forma como você constrói solução. Busca contexto de cooperativas, transformação digital e projetos com impacto prático." },
    ],
  },
  {
    id: "story",
    label: "Minha história",
    open: true,
    fields: [
      { id: "story", label: "Minha história", type: "textarea" as const, hint: "Conte sua trajetória — quem você foi, é, e quer ser.", value: "Bolivar se posiciona na interseção entre tecnologia, produto digital, dados e automação com IA. Ele busca oportunidades em cooperativas e quer atuar em contextos onde estratégia digital, desenvolvimento de produtos, análise de dados e integrações tenham papel central. Também sinalizou preferência por trabalho remoto ou híbrido em Brasília, com abertura para projetos nacionais e viagens pontuais." },
    ],
  },
];

const closedSections = [
  "Resumo profissional", "Contato", "Fortalezas", "Skills", "Experiência",
  "Formação", "Idiomas", "Certificações", "Projetos", "Linha do tempo",
  "Onde estou agora", "Curiosidades", "Valores & Interesses", "Disponibilidade",
  "Video pitch", "Referências",
];

function Accordion({ label, open, children }: { label: string; open?: boolean; children?: React.ReactNode }) {
  const [expanded, setExpanded] = useState(open ?? false);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        className="w-full flex items-center justify-between min-h-11 px-1 py-3 text-sm font-medium text-left"
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
      >
        {label}
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && children && (
        <div className="px-1 pb-4">{children}</div>
      )}
    </div>
  );
}

export default function EmpreCardEdit() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <Topbar />
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="w-full max-w-[800px] mx-auto px-4 py-8">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <header className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Link
                  href="/emprecards/1"
                  aria-label="Voltar para visualização"
                  data-tooltip="Voltar"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors flex-none"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <input
                  defaultValue="Profissional de tecnologia, produto e dados"
                  maxLength={120}
                  onChange={() => setHasChanges(true)}
                  className="flex-1 min-w-0 max-w-[448px] h-9 border border-transparent rounded-lg bg-transparent text-foreground text-lg font-medium px-2 truncate focus:outline-none focus:border-border"
                />
              </div>
              <div className="flex items-center gap-2 flex-none" ref={menuRef}>
                <button
                  type="button"
                  disabled={!hasChanges}
                  className="inline-flex items-center gap-2 h-8 px-3 rounded-lg bg-primary text-white text-xs font-medium shadow-sm transition-opacity disabled:opacity-45 disabled:pointer-events-none"
                >
                  <Save className="w-4 h-4" />
                  <span className="save-label text-sm">Salvar</span>
                </button>
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Mais ações"
                    data-tooltip="Mais ações"
                    data-tooltip-dir="left"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[204px] p-1 border border-border rounded-xl bg-card shadow-md">
                      <button type="button" role="menuitem" className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm hover:bg-muted text-left">
                        <Star className="w-4 h-4 fill-primary text-primary" /> Padrão atual
                      </button>
                      <div className="h-px mx-1 my-1 bg-border" />
                      <button type="button" role="menuitem" className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm hover:bg-muted text-left text-destructive">
                        <Trash2 className="w-4 h-4" /> Excluir Emprecard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Editor panel */}
            <div className="bg-card border border-border rounded-2xl shadow-sm p-8 max-sm:p-6">
              {accordionSections.map((section) => (
                <Accordion key={section.id} label={section.label} open={section.open}>
                  <div className="grid grid-cols-2 gap-5 gap-x-4 max-sm:grid-cols-1">
                    {section.fields.map((field) => (
                      <div
                        key={field.id}
                        className={`flex flex-col gap-1.5 min-w-0 ${
                          field.type === "textarea" ? "col-span-2 max-sm:col-span-1" : ""
                        }`}
                      >
                        <label className="text-sm font-medium">{field.label}</label>
                        {field.hint && (
                          <p className="text-sm text-muted-foreground -mt-0.5">{field.hint}</p>
                        )}
                        {field.type === "textarea" ? (
                          <textarea
                            defaultValue={field.value}
                            onChange={() => setHasChanges(true)}
                            className="w-full min-h-[78px] border border-border rounded-lg bg-transparent text-foreground text-base px-3 py-2 resize-y shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                        ) : (
                          <input
                            type="text"
                            defaultValue={field.value}
                            onChange={() => setHasChanges(true)}
                            className="h-9 border border-border rounded-lg bg-transparent text-foreground text-base px-3 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </Accordion>
              ))}

              {closedSections.map((label) => (
                <Accordion key={label} label={label} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
