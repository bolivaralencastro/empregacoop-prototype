"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Star, Pencil, Trash2, MapPin, Clock, Wrench, Lightbulb, Briefcase } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";

export default function EmpreCardDetail() {
  const [menuOpen, setMenuOpen] = useState(false);
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
            {/* Page header */}
            <header className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Link
                  href="/emprecards"
                  aria-label="Voltar para a lista"
                  data-tooltip="Voltar"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors flex-none"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <input
                  defaultValue="Profissional de tecnologia, produto e dados"
                  maxLength={120}
                  className="flex-1 min-w-0 max-w-[448px] h-9 border border-transparent rounded-lg bg-transparent text-foreground text-lg font-medium px-2 truncate focus:outline-none focus:border-border"
                />
              </div>
              <div className="flex items-center gap-2 flex-none" ref={menuRef}>
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
                      <Link href="/emprecards/1/editar" role="menuitem" className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm hover:bg-muted">
                        <Pencil className="w-4 h-4" /> Editar dados
                      </Link>
                      <div className="h-px mx-1 my-1 bg-border" />
                      <button type="button" role="menuitem" className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm hover:bg-muted text-left text-destructive">
                        <Trash2 className="w-4 h-4" /> Excluir Emprecard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Card preview */}
            <div className="flex justify-center">
              <article className="w-full max-w-[768px] min-h-[1020px] overflow-hidden border border-border rounded-2xl bg-card shadow-sm">
                {/* Hero */}
                <header
                  className="relative overflow-hidden px-8 py-10"
                  style={{ background: "linear-gradient(135deg, #FF904740 0%, #FF904715 60%, transparent 100%)" }}
                >
                  <div className="flex items-center gap-4 max-sm:flex-col max-sm:items-start">
                    <div
                      className="w-20 h-20 flex-none rounded-full flex items-center justify-center text-2xl font-semibold"
                      style={{ background: "#FF904730", color: "#ff9047", boxShadow: "0 0 0 4px white" }}
                    >
                      PD
                    </div>
                    <div>
                      <h1
                        className="text-[32px] font-semibold leading-9 max-sm:text-2xl"
                        style={{ fontFamily: "Lora, Georgia, serif" }}
                      >
                        Profissional de tecnologia, produto e dados
                      </h1>
                      <p className="mt-1 text-base" style={{ color: "rgba(36,0,40,.80)" }}>
                        Foco em automação com IA e transformação digital
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> Brasília, Distrito Federal
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-5 text-base font-medium italic" style={{ color: "#ff9047" }}>
                    "Atua com estratégia digital, desenvolvimento de produtos, análise de dados e integrações, buscando oportunidades remotas, híbridas em Brasília e projetos nacionais."
                  </p>
                </header>

                {/* Body */}
                <div className="flex flex-col gap-7 px-8 py-8 max-sm:px-6">
                  {[
                    {
                      icon: <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/></svg>,
                      title: "Essência",
                      content: (
                        <blockquote className="pl-4 border-l-4 text-base leading-7 italic" style={{ borderColor: "#ff9047", color: "rgba(36,0,40,.90)" }}>
                          Tecnologia, produto digital e dados são o centro do seu trabalho. Automação com IA e integrações entram como parte da forma como você constrói solução. Busca contexto de cooperativas, transformação digital e projetos com impacto prático.
                        </blockquote>
                      ),
                    },
                    {
                      icon: <Lightbulb className="w-4 h-4" />,
                      title: "Minha história",
                      content: (
                        <p className="text-base leading-7 whitespace-pre-wrap" style={{ color: "rgba(36,0,40,.90)" }}>
                          Bolivar se posiciona na interseção entre tecnologia, produto digital, dados e automação com IA. Ele busca oportunidades em cooperativas e quer atuar em contextos onde estratégia digital, desenvolvimento de produtos, análise de dados e integrações tenham papel central. Também sinalizou preferência por trabalho remoto ou híbrido em Brasília, com abertura para projetos nacionais e viagens pontuais.
                        </p>
                      ),
                    },
                    {
                      icon: <Briefcase className="w-4 h-4" />,
                      title: "Resumo profissional",
                      content: (
                        <p className="text-base leading-7" style={{ color: "rgba(36,0,40,.90)" }}>
                          Profissional com foco em tecnologia, produto digital, dados e automação com IA. Tem interesse em transformação digital em cooperativas e busca oportunidades remotas, híbridas em Brasília ou em projetos nacionais.
                        </p>
                      ),
                    },
                    {
                      icon: <Wrench className="w-4 h-4" />,
                      title: "Skills",
                      content: (
                        <div className="flex flex-wrap gap-2">
                          {["Tecnologia", "Produto digital", "Dados", "Automação com IA", "Estratégia digital", "Desenvolvimento de produtos", "Automação", "Análise de dados", "Integrações"].map((s) => (
                            <span key={s} className="inline-flex items-center min-h-6 px-2.5 rounded-full text-sm font-medium" style={{ background: "rgba(255,144,71,.12)", color: "#ff9047" }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      ),
                    },
                    {
                      icon: <Clock className="w-4 h-4" />,
                      title: "Disponibilidade",
                      content: (
                        <div>
                          <div className="grid grid-cols-2 gap-4 mb-3 max-sm:grid-cols-1">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Modelo:</p>
                              <p className="text-base font-medium">Híbrido</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Horas:</p>
                              <p className="text-base font-medium">Não informado</p>
                            </div>
                          </div>
                          <p className="text-base leading-7" style={{ color: "rgba(36,0,40,.90)" }}>
                            Prefere remoto ou híbrido em Brasília. Avalia projetos nacionais com viagens pontuais.
                          </p>
                        </div>
                      ),
                    },
                  ].map((section) => (
                    <section key={section.title}>
                      <h2 className="inline-flex items-center gap-1.5 mb-2 text-base font-medium text-muted-foreground">
                        {section.icon}
                        {section.title}
                      </h2>
                      {section.content}
                    </section>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
