"use client";

const VAGA = {
  titulo: "Gerente Administrativo Financeiro",
  cooperativa: "Sicoob Dom Eliseu",
  subtitulo: "Gestão Administrativo-Financeira · Tecnologia e Dados",
};

const EXPERIENCIAS = [
  {
    cargo: "Product Designer",
    empresa: "Keeps Learning",
    periodo: "Ago 2022 — Atual",
    desc: "Liderança de produto com foco em automação de fluxos com IA, integração entre sistemas e leitura de indicadores de uso. Atuação próxima a áreas de dados e operações, traduzindo métricas em decisões.",
  },
  {
    cargo: "Diretor de Arte e Marketing",
    empresa: "Kirinus Escola de Dança",
    periodo: "Jan 2014 — Dez 2018",
    desc: "Gestão da identidade visual e estratégia de marketing digital, incluindo planejamento orçamentário de campanhas e acompanhamento de indicadores de performance.",
  },
  {
    cargo: "Diretor de Fotografia e Retoucher",
    empresa: "Doc.Sync",
    periodo: "Jan 2019 — Dez 2022",
    desc: "Direção criativa e produção de conteúdo visual para projetos de documentação e produto.",
  },
  {
    cargo: "Diretor de Arte",
    empresa: "Grupo RBS",
    periodo: "Jan 2009 — Dez 2012",
    desc: "Direção de arte para veículos jornalísticos impressos e digitais.",
  },
  {
    cargo: "Diretor de Arte",
    empresa: "Grupo All · D/Araújo",
    periodo: "Jan 2013 — Dez 2014",
    desc: "Criação e produção visual para campanhas publicitárias.",
  },
  {
    cargo: "Designer Gráfico",
    empresa: "SUCESU-SC",
    periodo: "Jan 2008 — Dez 2009",
    desc: "Design gráfico e identidade visual para entidade do setor de tecnologia.",
  },
  {
    cargo: "WebDesigner",
    empresa: "Cria Mídia",
    periodo: "Jan 2006 — Dez 2008",
    desc: "Criação e desenvolvimento de interfaces para projetos web.",
  },
];

const CURSOS = [
  {
    nome: "Cooperativismo - Primeiras Lições",
    horas: "CapacitaCOOP · 4H",
    desc: "Curso introdutório ao modelo cooperativo — obrigatório para todas as vagas do CapacitaCOOP. Tópicos: o que é uma cooperativa, princípios do cooperativismo, cooperativismo no Brasil.",
  },
  {
    nome: "Gestão Estratégica de Finanças em Cooperativas",
    horas: "CapacitaCOOP · 13H",
    desc: "Planejamento financeiro, análise de resultados e gestão orçamentária no contexto cooperativo. Tópicos: demonstrações financeiras, fluxo de caixa, indicadores de desempenho, sobras e fundos.",
  },
];

const SKILLS_DESTAQUE = ["Gestão Financeira", "Análise de Dados", "Automação com IA"];
const SKILLS_RESTO = [
  "Experiência do Usuário (UX)", "Design Thinking", "Design de Interface (UI)",
  "Prototipagem", "Mapeamento de Jornada", "Pesquisa de Usuário",
  "Figma", "Miro", "InVision", "Adobe CC",
  "Produto digital", "Estratégia digital", "Integrações", "Fotografia", "Retouching",
];

export default function CurriculoPdfPage() {
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

        .top-stripe {
          height: 6px;
          background: #5c0060;
        }

        @media print {
          @page { size: A4; margin: 18mm 18mm 18mm 18mm; }
          body { background: white; }
          .page { max-width: 100%; padding: 0; }
          .no-print { display: none !important; }
          .section { page-break-inside: avoid; }
          .top-stripe { position: fixed; top: 0; left: 0; right: 0; }
        }

        .divider { border: none; border-top: 1.5px solid #e5e5e5; margin: 20px 0; }
      `}</style>

      <div className="top-stripe" />

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
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, paddingTop: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px", color: "#1a1a1a" }}>
              Bolivar Alencastro
            </h1>
            <p style={{ fontSize: 14, color: "#5c0060", fontWeight: 600, marginTop: 4 }}>
              {VAGA.subtitulo}
            </p>
            <p style={{ fontSize: 12, color: "#666", marginTop: 6, lineHeight: 1.6 }}>
              bolivar@alencastro.com.br &nbsp;·&nbsp; +55 48 98413-8601 &nbsp;·&nbsp; Brasília, DF
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/empregacoop-logo-cor.png" alt="EmpregaCOOP" style={{ height: 22, width: "auto", flexShrink: 0, marginTop: 4 }} />
        </header>

        {/* ── Selo Match Card ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
          <span style={{
            display: "inline-flex", alignItems: "center",
            height: 22, padding: "0 10px",
            background: "#5c0060", color: "#fff",
            borderRadius: 100, fontSize: 11, fontWeight: 600,
          }}>
            EmpreCard · {VAGA.titulo} · {VAGA.cooperativa}
          </span>
        </div>

        <hr className="divider" />

        {/* ── Resumo Profissional ── */}
        <section className="section" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>
            Resumo Profissional
          </h2>
          <p style={{ fontSize: 13, color: "#333", lineHeight: 1.65 }}>
            Profissional com 8 experiências em produto digital, dados e automação com IA, unindo visão
            estratégica e rigor analítico. Histórico de liderança em iniciativas multidisciplinares,
            otimização de processos e uso de indicadores para tomada de decisão — competências diretamente
            aplicáveis à gestão administrativo-financeira em ambiente cooperativista.
          </p>
        </section>

        <hr className="divider" />

        {/* ── Experiência (coluna única) ── */}
        <section className="section" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>
            Experiência Profissional
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {EXPERIENCIAS.map((exp) => (
              <div key={exp.cargo + exp.empresa}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.4 }}>
                  {exp.cargo} — <span style={{ color: "#5c0060" }}>{exp.empresa}</span>
                </p>
                <p style={{ fontSize: 11, color: "#999", marginTop: 1 }}>{exp.periodo}</p>
                <p style={{ fontSize: 12, color: "#555", lineHeight: 1.55, marginTop: 4 }}>{exp.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" />

        {/* ── Formação (coluna única) ── */}
        <section className="section" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>
            Formação Acadêmica
          </h2>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>
            Bacharel em Design Gráfico — <span style={{ color: "#5c0060" }}>Faculdades Barddal, Florianópolis, SC</span>
          </p>
          <p style={{ fontSize: 11, color: "#999", marginTop: 1 }}>Jan 2006 — Dez 2010</p>
        </section>

        <hr className="divider" />

        {/* ── Certificações e Cursos (coluna única) ── */}
        <section className="section" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>
            Certificações e Cursos
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {CURSOS.map((curso) => (
              <div key={curso.nome}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.4 }}>{curso.nome}</p>
                <p style={{ fontSize: 11, color: "#999", marginTop: 1 }}>{curso.horas}</p>
                <p style={{ fontSize: 12, color: "#555", lineHeight: 1.55, marginTop: 4 }}>{curso.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" />

        {/* ── Habilidades — texto corrido, sem pills ── */}
        <section className="section" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 10 }}>
            Habilidades
          </h2>
          <p style={{ fontSize: 12.5, lineHeight: 1.7 }}>
            <span style={{ color: "#5c0060", fontWeight: 700 }}>{SKILLS_DESTAQUE.join(", ")}, </span>
            <span style={{ color: "#444" }}>{SKILLS_RESTO.join(", ")}</span>
          </p>
        </section>

        <hr className="divider" />

        {/* ── Idiomas ── */}
        <section className="section" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>
            Idiomas
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <p style={{ fontSize: 12, color: "#333" }}><strong>Português</strong> — Nativo</p>
            <p style={{ fontSize: 12, color: "#333" }}><strong>Inglês</strong> — Avançado</p>
          </div>
        </section>

        <hr className="divider" />

        {/* ── Disponibilidade ── */}
        <section className="section">
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>
            Disponibilidade
          </h2>
          <p style={{ fontSize: 12, color: "#333", lineHeight: 1.55 }}>
            Remoto ou híbrido em Brasília, DF. Projetos nacionais com viagens pontuais.
          </p>
        </section>

        {/* ── Assinatura ── */}
        <div style={{ marginTop: 28, paddingTop: 16, borderTop: "1px solid #e5e5e5", display: "flex", alignItems: "center", gap: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/empregacoop-mark.png" alt="" style={{ width: 16, height: 16, borderRadius: 4 }} />
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#5c0060" }}>
              Gerado por EmpregaCOOP · empregacoop.com.br
            </p>
            <p style={{ fontSize: 9, color: "#bbb", marginTop: 1 }}>
              Uma solução Empregol
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
