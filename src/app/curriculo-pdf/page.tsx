"use client";

import { useEffect } from "react";

export default function CurriculoPdfPage() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
          color: #1a1a1a;
          background: #fff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .page {
          max-width: 760px;
          margin: 0 auto;
          padding: 48px 52px;
        }

        /* Print: full width, standard margins */
        @media print {
          @page { size: A4; margin: 18mm 18mm 18mm 18mm; }
          body { background: white; }
          .page { max-width: 100%; padding: 0; }
          .no-print { display: none !important; }
          .section { page-break-inside: avoid; }
        }

        /* Utility */
        .divider { border: none; border-top: 1.5px solid #e5e5e5; margin: 20px 0; }
        .tag {
          display: inline-flex; align-items: center;
          height: 20px; padding: 0 8px;
          background: #f3f0f5; color: #5c0060;
          border-radius: 100px; font-size: 10px; font-weight: 500;
        }
      `}</style>

      {/* Print button — hidden on print */}
      <div className="no-print" style={{
        position: "fixed", top: 16, right: 16, zIndex: 50,
        display: "flex", gap: 8,
      }}>
        <button
          onClick={() => window.print()}
          style={{
            height: 36, padding: "0 16px",
            background: "#7800a0", color: "#fff",
            border: "none", borderRadius: 10,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Salvar como PDF
        </button>
        <button
          onClick={() => window.close()}
          style={{
            height: 36, padding: "0 12px",
            background: "transparent", color: "#888",
            border: "1px solid #e5e5e5", borderRadius: 10,
            fontSize: 13, cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Fechar
        </button>
      </div>

      <div className="page">

        {/* ── Header ── */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px", color: "#1a1a1a" }}>
              Bolivar Alencastro
            </h1>
            <p style={{ fontSize: 14, color: "#5c0060", fontWeight: 600, marginTop: 4 }}>
              Product Designer · Produto Digital, IA &amp; Dados
            </p>
            <p style={{ fontSize: 12, color: "#666", marginTop: 6, lineHeight: 1.6 }}>
              bolivar@alencastro.com.br &nbsp;·&nbsp; +55 48 98413-8601 &nbsp;·&nbsp; Brasília, DF
            </p>
          </div>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", overflow: "hidden",
            border: "2px solid #e5e5e5", flexShrink: 0,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://i.pravatar.cc/64?img=12" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </header>

        <hr className="divider" />

        {/* ── Sobre ── */}
        <section className="section" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>
            Perfil
          </h2>
          <p style={{ fontSize: 13, color: "#333", lineHeight: 1.65 }}>
            Profissional com 8 experiências em tecnologia, produto digital, dados e automação com IA. Atua na
            interseção entre estratégia digital, desenvolvimento de produtos e análise de dados. Busca
            oportunidades em cooperativas em processo de transformação digital. Prefere trabalho remoto ou
            híbrido em Brasília, com abertura para projetos nacionais.
          </p>
        </section>

        <hr className="divider" />

        {/* ── Experiência ── */}
        <section className="section" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>
            Experiência Profissional
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                cargo: "Product Designer",
                empresa: "Keeps Learning",
                periodo: "Ago 2022 — atual",
                desc: "Design de produto, UX research e prototipagem de alta fidelidade. Automação de fluxos com IA e integração entre sistemas de ensino.",
              },
              {
                cargo: "Diretor de Fotografia e Retoucher",
                empresa: "Doc.Sync",
                periodo: "2019 — 2022",
                desc: "Direção criativa e produção de conteúdo visual para projetos de documentação e produto.",
              },
              {
                cargo: "Diretor de Arte e Marketing",
                empresa: "Kirinus Escola de Dança",
                periodo: "2014 — 2018",
                desc: "Gestão da identidade visual e estratégia de marketing digital.",
              },
              {
                cargo: "Diretor de Arte",
                empresa: "Grupo RBS",
                periodo: "2009 — 2012",
                desc: "Direção de arte para veículos jornalísticos impressos e digitais.",
              },
              {
                cargo: "Diretor de Arte",
                empresa: "Grupo All · D/Araújo",
                periodo: "2013 — 2014",
                desc: "Criação e produção visual para campanhas publicitárias.",
              },
              {
                cargo: "Designer Gráfico",
                empresa: "SUCESU-SC",
                periodo: "2008 — 2009",
                desc: "Design gráfico e identidade visual para entidade do setor de tecnologia.",
              },
              {
                cargo: "WebDesigner",
                empresa: "Cria Mídia",
                periodo: "2006 — 2008",
                desc: "Criação e desenvolvimento de interfaces para projetos web.",
              },
            ].map((exp) => (
              <div key={exp.cargo + exp.empresa} style={{ display: "flex", gap: 16 }}>
                <div style={{ width: 120, flexShrink: 0 }}>
                  <p style={{ fontSize: 11, color: "#999", lineHeight: 1.5 }}>{exp.periodo}</p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.4 }}>{exp.cargo}</p>
                  <p style={{ fontSize: 12, color: "#5c0060", fontWeight: 500, marginTop: 1 }}>{exp.empresa}</p>
                  <p style={{ fontSize: 12, color: "#555", lineHeight: 1.55, marginTop: 4 }}>{exp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" />

        {/* ── Formação ── */}
        <section className="section" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>
            Formação Acadêmica
          </h2>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ width: 120, flexShrink: 0 }}>
              <p style={{ fontSize: 11, color: "#999" }}>2006 — 2010</p>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>Bacharel em Design Gráfico</p>
              <p style={{ fontSize: 12, color: "#5c0060", fontWeight: 500, marginTop: 1 }}>Faculdades Barddal · Florianópolis, SC</p>
            </div>
          </div>
        </section>

        <hr className="divider" />

        {/* ── Habilidades ── */}
        <section className="section" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 10 }}>
            Habilidades
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {[
              "Experiência do Usuário (UX)", "Design Thinking", "Design de Interface (UI)",
              "Prototipagem", "Mapeamento de Jornada", "Pesquisa de Usuário",
              "Figma", "Miro", "InVision", "Adobe CC",
              "Automação com IA", "Produto digital", "Dados",
              "Estratégia digital", "Integrações", "Fotografia", "Retouching",
            ].map((s) => (
              <span key={s} className="tag">{s}</span>
            ))}
          </div>
        </section>

        <hr className="divider" />

        {/* ── Idiomas + Disponibilidade ── */}
        <section className="section" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>
              Idiomas
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#333", fontWeight: 500 }}>Português</span>
                <span style={{ color: "#888" }}>Nativo</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#333", fontWeight: 500 }}>Inglês</span>
                <span style={{ color: "#888" }}>Avançado</span>
              </div>
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>
              Disponibilidade
            </h2>
            <p style={{ fontSize: 12, color: "#333", lineHeight: 1.55 }}>
              Remoto ou híbrido em Brasília, DF. Projetos nacionais com viagens pontuais.
            </p>
          </div>
        </section>

        {/* ── Footer ── */}
        <div className="no-print" style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid #e5e5e5", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#bbb" }}>
            Gerado por EmpregaCOOP · empregacoop.com.br
          </p>
        </div>

      </div>
    </>
  );
}
