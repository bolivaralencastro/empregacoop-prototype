export async function generateCurriculoPdf() {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const L = 18; // left margin
  const R = W - 18; // right margin
  const COL = L + 44; // content column start (after period)
  const CONTENT_W = R - L;
  const CONTENT_W_RIGHT = R - COL;

  let y = 0;

  // Color helpers
  const C = {
    dark:  [26, 26, 26]   as [number, number, number],
    brand: [92, 0, 96]    as [number, number, number],
    gray:  [120, 120, 120] as [number, number, number],
    muted: [160, 160, 160] as [number, number, number],
    line:  [220, 220, 220] as [number, number, number],
    text:  [68, 68, 68]   as [number, number, number],
  };

  function color(c: [number, number, number]) {
    doc.setTextColor(c[0], c[1], c[2]);
  }

  function divider() {
    doc.setDrawColor(C.line[0], C.line[1], C.line[2]);
    doc.setLineWidth(0.3);
    doc.line(L, y, R, y);
    y += 6;
  }

  function label(text: string) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    color(C.muted);
    doc.text(text.toUpperCase(), L, y);
    y += 5;
  }

  function para(text: string, maxW = CONTENT_W, indent = L) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    color(C.text);
    const lines = doc.splitTextToSize(text, maxW) as string[];
    doc.text(lines, indent, y);
    y += lines.length * 4.2;
    return lines.length;
  }

  // ── Header ──────────────────────────────────────────────────────────
  y = 26;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  color(C.dark);
  doc.text("Bolivar Alencastro", L, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  color(C.brand);
  doc.text("Product Designer  ·  Produto Digital, IA & Dados", L, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  color(C.gray);
  doc.text("bolivar@alencastro.com.br   ·   +55 48 98413-8601   ·   Brasília, DF", L, y);
  y += 9;

  divider();

  // ── Perfil ──────────────────────────────────────────────────────────
  label("Perfil");
  para(
    "Profissional com 8 experiências em tecnologia, produto digital, dados e automação com IA. " +
    "Atua na interseção entre estratégia digital, desenvolvimento de produtos e análise de dados. " +
    "Busca oportunidades em cooperativas em processo de transformação digital. Prefere trabalho " +
    "remoto ou híbrido em Brasília, com abertura para projetos nacionais."
  );
  y += 5;

  divider();

  // ── Experiência ─────────────────────────────────────────────────────
  label("Experiência Profissional");

  const exps = [
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
  ];

  for (const exp of exps) {
    const startY = y;

    // Period (left column)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    color(C.muted);
    doc.text(exp.periodo, L, startY);

    // Cargo (right column)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    color(C.dark);
    doc.text(exp.cargo, COL, startY);

    // Empresa
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    color(C.brand);
    doc.text(exp.empresa, COL, startY + 4.5);

    // Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    color(C.text);
    const descLines = doc.splitTextToSize(exp.desc, CONTENT_W_RIGHT) as string[];
    doc.text(descLines, COL, startY + 9);

    y = startY + 9 + descLines.length * 4 + 4;
  }

  y += 2;
  divider();

  // ── Formação ────────────────────────────────────────────────────────
  label("Formação Acadêmica");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  color(C.muted);
  doc.text("2006 — 2010", L, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  color(C.dark);
  doc.text("Bacharel em Design Gráfico", COL, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  color(C.brand);
  doc.text("Faculdades Barddal  ·  Florianópolis, SC", COL, y + 4.5);

  y += 12;
  divider();

  // ── Habilidades ─────────────────────────────────────────────────────
  label("Habilidades");

  const skills = [
    "Experiência do Usuário (UX)", "Design Thinking", "Design de Interface (UI)",
    "Prototipagem", "Mapeamento de Jornada", "Pesquisa de Usuário",
    "Figma", "Miro", "InVision", "Adobe CC",
    "Automação com IA", "Produto digital", "Dados",
    "Estratégia digital", "Integrações", "Fotografia", "Retouching",
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  color(C.text);
  const skillLines = doc.splitTextToSize(skills.join("  ·  "), CONTENT_W) as string[];
  doc.text(skillLines, L, y);
  y += skillLines.length * 4.2 + 5;

  divider();

  // ── Idiomas + Disponibilidade ────────────────────────────────────────
  const halfW = (R - L - 10) / 2;

  label("Idiomas");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  color(C.text);
  doc.text("Português — Nativo", L, y);
  y += 4.5;
  doc.text("Inglês — Avançado", L, y);

  // Disponibilidade (next to idiomas)
  const dispY = y - 4.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  color(C.muted);
  doc.text("DISPONIBILIDADE", L + halfW + 10, dispY - 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  color(C.text);
  const dispLines = doc.splitTextToSize(
    "Remoto ou híbrido em Brasília, DF. Projetos nacionais com viagens pontuais.",
    halfW
  ) as string[];
  doc.text(dispLines, L + halfW + 10, dispY);

  y += 12;

  // ── Footer ──────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  color(C.muted);
  doc.text("Gerado por EmpregaCOOP  ·  empregacoop.com.br", L, 287);

  doc.save("Bolivar_Alencastro_Designer.pdf");
}
