async function loadImageAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export type MatchCardVaga = {
  titulo: string;
  cooperativa: string;
  subtitulo: string;
  skillsDestaque: string[];
  filename: string;
  resumo: string;
};

const VAGA_DEFAULT: MatchCardVaga = {
  titulo: "Gerente Administrativo Financeiro",
  cooperativa: "Sicoob Dom Eliseu",
  subtitulo: "Gestão Administrativo-Financeira · Tecnologia e Dados",
  skillsDestaque: ["Gestão Financeira", "Análise de Dados", "Automação com IA"],
  filename: "MatchCard_Bolivar_Alencastro_Gerente_Adm_Financeiro.pdf",
  resumo:
    "Profissional com 8 experiências em produto digital, dados e automação com IA, unindo visão " +
    "estratégica e rigor analítico. Histórico de liderança em iniciativas multidisciplinares, " +
    "otimização de processos e uso de indicadores para tomada de decisão — competências diretamente " +
    "aplicáveis à gestão administrativo-financeira em ambiente cooperativista.",
};

export async function generateEmpreMatchPdf(vagaOverride?: MatchCardVaga) {
  const { jsPDF } = await import("jspdf");

  const [logoDataUrl, markDataUrl] = await Promise.all([
    loadImageAsDataUrl("/brand/empregacoop-logo-cor.png"),
    loadImageAsDataUrl("/brand/empregacoop-mark.png"),
  ]);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const PAGE_H = 297;
  const L = 18; // left margin
  const R = W - 18; // right margin
  const CONTENT_W = R - L;
  const BOTTOM_LIMIT = 270; // reserve space so content never collides with the per-page footer

  // Real aspect ratios of the source PNGs — keeps the logo from looking stretched.
  const LOGO_W = 32;
  const LOGO_H = LOGO_W * (63 / 564);
  const MARK_SIZE = 4;

  // ── Dados da vaga (Match Card) ──────────────────────────────────────
  const vaga = vagaOverride ?? VAGA_DEFAULT;

  let y = 0;

  const C = {
    dark:  [26, 26, 26]    as [number, number, number],
    brand: [92, 0, 96]     as [number, number, number],
    gray:  [120, 120, 120] as [number, number, number],
    muted: [160, 160, 160] as [number, number, number],
    line:  [220, 220, 220] as [number, number, number],
    text:  [68, 68, 68]    as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
  };

  function color(c: [number, number, number]) {
    doc.setTextColor(c[0], c[1], c[2]);
  }

  function checkPage(needed: number) {
    if (y + needed > BOTTOM_LIMIT) {
      doc.addPage();
      y = 22;
    }
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

  // Coluna única: título (bold, escuro) → período (muted) → descrição opcional.
  // Ordem de desenho = ordem de leitura, sem posicionamento lado a lado que
  // parsers de ATS possam embaralhar.
  function entry(titleLine: string, period: string, desc?: string) {
    const titleLines = doc.splitTextToSize(titleLine, CONTENT_W) as string[];
    const descLines = desc ? (doc.splitTextToSize(desc, CONTENT_W) as string[]) : [];
    checkPage(titleLines.length * 4.3 + 4.5 + descLines.length * 4 + 5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    color(C.dark);
    doc.text(titleLines, L, y);
    y += titleLines.length * 4.3;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    color(C.muted);
    doc.text(period, L, y);
    y += 4.5;

    if (desc) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      color(C.text);
      doc.text(descLines, L, y);
      y += descLines.length * 4;
    }

    y += 5;
  }

  // ── Chrome de página (filete + logo + rodapé) — aplicado a todas as páginas no final ──
  function drawPageChrome() {
    doc.setFillColor(C.brand[0], C.brand[1], C.brand[2]);
    doc.rect(0, 0, W, 2, "F");

    const footerY = PAGE_H - 14;
    doc.addImage(markDataUrl, "PNG", L, footerY - 3.2, MARK_SIZE, MARK_SIZE);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    color(C.brand);
    doc.text("Gerado por EmpregaCOOP  ·  empregacoop.com.br", L + MARK_SIZE + 2, footerY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    color(C.muted);
    doc.text("Uma solução Empregol", L + MARK_SIZE + 2, footerY + 4);
  }

  // ── Metadados do documento (lidos por diversos ATS) ─────────────────
  const todasSkills = [...new Set([
    ...vaga.skillsDestaque,
    "Experiência do Usuário (UX)", "Design Thinking", "Design de Interface (UI)",
    "Prototipagem", "Mapeamento de Jornada", "Pesquisa de Usuário",
    "Figma", "Miro", "InVision", "Adobe CC",
    "Produto digital", "Estratégia digital", "Integrações", "Fotografia", "Retouching",
  ])];
  doc.setProperties({
    title: `Match Card — Bolivar Alencastro — ${vaga.titulo}`,
    subject: `Match Card — ${vaga.titulo} · ${vaga.cooperativa}`,
    author: "Bolivar Alencastro",
    keywords: todasSkills.join(", "),
    creator: "EmpregaCOOP · Empregol",
  });

  // ── Header ──────────────────────────────────────────────────────────
  y = 26;

  doc.addImage(logoDataUrl, "PNG", R - LOGO_W, 14, LOGO_W, LOGO_H);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  color(C.dark);
  doc.text("Bolivar Alencastro", L, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  color(C.brand);
  doc.text(vaga.subtitulo, L, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  color(C.gray);
  doc.text("bolivar@alencastro.com.br   ·   +55 48 98413-8601   ·   Brasília, DF", L, y);
  y += 7;

  // Selo de contexto — Match Card para a vaga
  {
    const badgeText = `Match Card  ·  ${vaga.titulo}  ·  ${vaga.cooperativa}`;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const textW = doc.getTextWidth(badgeText);
    const padX = 3.2;
    const boxW = textW + padX * 2;
    const boxH = 6.4;
    doc.setFillColor(C.brand[0], C.brand[1], C.brand[2]);
    doc.roundedRect(L, y, boxW, boxH, 2, 2, "F");
    color(C.white);
    doc.text(badgeText, L + padX, y + 4.4);
    y += boxH + 6;
  }

  divider();

  // ── Resumo Profissional ─────────────────────────────────────────────
  label("Resumo Profissional");
  para(vaga.resumo);
  y += 5;

  divider();

  // ── Experiência (reordenada por relevância para a vaga) ────────────
  label("Experiência Profissional");

  const exps = [
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

  for (const exp of exps) {
    entry(`${exp.cargo} — ${exp.empresa}`, exp.periodo, exp.desc);
  }

  checkPage(10);
  divider();

  // ── Formação ────────────────────────────────────────────────────────
  checkPage(30); // heading + primeira entrada juntos — evita título órfão no fim da página
  label("Formação Acadêmica");
  entry("Bacharel em Design Gráfico — Faculdades Barddal, Florianópolis, SC", "Jan 2006 — Dez 2010");

  checkPage(10);
  divider();

  // ── Certificações e Cursos ──────────────────────────────────────────
  checkPage(32); // heading + primeiro curso juntos — evita título órfão no fim da página
  label("Certificações e Cursos");

  const cursos = [
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

  for (const curso of cursos) {
    entry(curso.nome, curso.horas, curso.desc);
  }

  checkPage(10);
  divider();

  // ── Habilidades — texto corrido, sem pills gráficas ─────────────────
  // (evita concatenação sem espaço na extração de texto por ATS)
  checkPage(20);
  label("Habilidades");

  const skillsResto = [
    "Experiência do Usuário (UX)", "Design Thinking", "Design de Interface (UI)",
    "Prototipagem", "Mapeamento de Jornada", "Pesquisa de Usuário",
    "Figma", "Miro", "InVision", "Adobe CC",
    "Produto digital", "Estratégia digital", "Integrações", "Fotografia", "Retouching",
  ].filter((s) => !vaga.skillsDestaque.includes(s));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  color(C.brand);
  const destaqueLines = doc.splitTextToSize(vaga.skillsDestaque.join(", ") + ",", CONTENT_W) as string[];
  doc.text(destaqueLines, L, y);
  y += destaqueLines.length * 4.4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  color(C.text);
  const restoLines = doc.splitTextToSize(skillsResto.join(", "), CONTENT_W) as string[];
  doc.text(restoLines, L, y);
  y += restoLines.length * 4.4 + 5;

  checkPage(10);
  divider();

  // ── Idiomas ─────────────────────────────────────────────────────────
  checkPage(16);
  label("Idiomas");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  color(C.text);
  doc.text("Português — Nativo", L, y);
  y += 4.5;
  doc.text("Inglês — Avançado", L, y);
  y += 9;

  divider();

  // ── Disponibilidade ─────────────────────────────────────────────────
  checkPage(16);
  label("Disponibilidade");
  para("Remoto ou híbrido em Brasília, DF. Projetos nacionais com viagens pontuais.");

  // ── Chrome final: filete + logo + rodapé em todas as páginas ────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageChrome();
  }

  doc.save(vaga.filename);
}
