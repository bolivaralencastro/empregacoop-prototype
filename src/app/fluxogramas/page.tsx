"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import mermaid from "mermaid";
import { ZoomIn, ZoomOut, Maximize2, ArrowLeft } from "lucide-react";

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  securityLevel: "loose",
  themeVariables: {
    primaryColor: "#f3e7f5",
    primaryTextColor: "#240028",
    primaryBorderColor: "#6d0070",
    lineColor: "#6f5573",
    secondaryColor: "#ffffff",
    tertiaryColor: "#fff4eb",
    fontFamily: "var(--font-geist-sans)",
  },
  flowchart: { curve: "basis" },
});

/* ── Diagrams ──────────────────────────────────────────────────────────── */

const DIAGRAMS = [
  {
    id: "acesso",
    label: "Acesso",
    description: "Fluxo completo do usuário pela plataforma — das 6 etapas principais (acesso, onboarding, perfil, capacitação, vagas e reativação) à candidatura e reentrada no ciclo.",
    chart: `
flowchart TD
    subgraph sg1["① Acesso"]
        A([Login no app]) --> B[OTP — Código de acesso]
        B --> C[Boas-vindas pós-cadastro]
    end

    subgraph sg2["② Onboarding"]
        D([Onboarding iniciado]) --> E([Onboarding concluído])
    end

    subgraph sg3["③ Assistente e Perfil"]
        F([Chat com assistente IA]) --> G{Perfil completo?}
        G -->|Não — continua coleta| F
        G -->|Sim| H([EmpreCard gerado])
    end

    subgraph sg4["④ Capacitação"]
        I{Pré-requisitos pendentes?}
        J[CapacitaCOOP — Cursos e trilhas]
        K([Capacitação concluída])
        I -->|Sim| J
        J --> K
        I -->|Não| K
    end

    subgraph sg5["⑤ Vagas e Candidatura"]
        L([Vagas compatíveis disponibilizadas])
        M[Candidatura enviada — Currículo ATS]
        N[Acompanhamento do processo]
        O{Resultado}
        P([Contratado])
        Q([Atualizar perfil e tentar novamente])
        L --> M --> N --> O
        O -->|Aprovado| P
        O -->|Reprovado| Q
        O -->|Em processo| N
    end

    subgraph sg6["⑥ Reativação e Segmentação"]
        R([Reativação periódica por IA])
        S[Segmentação regional — Oportunidades locais]
        T([Novo ciclo de candidatura])
        R --> S --> T
    end

    C --> D
    E --> F
    H --> I
    K --> L
    Q --> R
    T --> F
`,
  },
  {
    id: "engajamento",
    label: "Engajamento",
    description: "Encadeamento de e-mails (E-x) e WhatsApps (F-x) ao longo da jornada — fluxos principais e mensagens de recuperação por abandono ou inatividade.",
    chart: `
flowchart TD
    subgraph sg1["① Acesso"]
        A([Início — Login no app])
        E1["E-1 · OTP / Código de acesso\nEnviar código para acesso"]
        E2["E-2 · Boas-vindas pós-cadastro\nOrientar próximos passos"]
        A --> E1 --> E2
    end

    subgraph sg2["② Onboarding"]
        OB1(["Onboarding iniciado"])
        OB2(["Onboarding concluído"])
        OB1 --> OB2
    end

    subgraph sg3["③ Assistente e Perfil"]
        CH(["Chat / Assistente iniciado"])
        E3["E-3 · Perfil incompleto\nLembrete para completar o perfil"]
        E4["E-4 · Perfil concluído\nConfirmação de perfil"]
        CH --> E3 --> E4
    end

    subgraph sg4["④ Capacitação"]
        E5["E-5 · Trilha disponível\nInformar trilhas compatíveis"]
        E6["E-6 · Lembrete de trilha\nReforçar para iniciar a trilha"]
        E7["E-7 · Trilha concluída\nParabéns pela conclusão"]
        E5 --> E6 --> E7
    end

    subgraph sg5["⑤ Vagas e Candidatura"]
        E8["E-8 · Vagas disponíveis\nVagas compatíveis com seu perfil"]
        E9["E-9 · Candidatura enviada\nConfirmação de recebimento"]
        E10["E-10 · Atualização de status\nInformar andamento do processo"]
        E8 --> E9 --> E10
    end

    subgraph sg6["⑥ Reativação e Segmentação"]
        F12["F-12 · Inatividade após recomendação\n14 e 30 dias"]
        F13["F-13 · Segmentação regional\nOportunidades locais"]
    end

    E2 --> OB1
    OB2 --> CH
    E4 --> E5
    E7 --> E8
    E10 --> F12
    E10 --> F13

    A -.-> F1["F-1 · Não iniciou cadastro/onboarding\nE-mail: 2h · WA: 24h"]
    E2 -.-> F2["F-2 · CPF/termos não concluído\nE-mail: 4h · WA: 48h"]
    OB1 -.-> EF3["E-11/F-3 · Abandono de onboarding\n24h · 72h · 7 dias"]
    OB2 -.-> F4["F-4 · Chat não iniciado após onboarding\nE-mail: 2h · WA: 24h"]
    CH -.-> F5["F-5 · Perfil não completado\nWA: 3h · E-mail: 24h e 72h"]
    E4 -.-> F6["F-6 · Emprecard gerado\nImediato"]
    E5 -.-> F7["F-7 · Curso indicado como pré-requisito\nImediato · 24h · 5 dias"]
    E6 -.-> F8["F-8 · Curso iniciado, mas abandonado\n48h · 5 dias · 10 dias"]
    E7 -.-> F9["F-9 · Vaga liberada após conclusão\nImediato"]
    E8 -.-> E12["E-12 · Sem seleção de vagas\n48h · 5 dias · 10 dias"]
    E8 -.-> F10["F-10 · Candidatura não iniciada\nWA: 24h · E-mail: 72h e 7 dias"]
    E9 -.-> F11["F-11 · Candidatura não enviada\nWA: 2h · E-mail: 24h"]

    classDef emailTrigger fill:#fff7ed,stroke:#ea580c,color:#9a3412
    classDef followup fill:#f0fdf4,stroke:#16a34a,color:#14532d
    classDef milestone fill:#fffbeb,stroke:#d97706,color:#78350f

    class E1,E2,E3,E4,E5,E6,E7,E8,E9,E10 emailTrigger
    class F1,F2,EF3,F4,F5,F6,F7,F8,F9,E12,F10,F11,F12,F13 followup
    class A,OB1,OB2,CH milestone
`,
  },
  {
    id: "jornada",
    label: "Jornada B2C",
    description: "Fluxo completo do usuário: entrada, qualificação, candidatura, retorno ao app e reativação contínua.",
    chart: `
flowchart TD
    A([Login]) --> B[Onboarding\n3 slides]
    B --> C[Assistente IA]
    C --> D{Perfil\ncompleto?}
    D -->|Não| C
    D -->|Sim| E[EmpreCard\ngerado]
    E --> F[Vagas\ncompatíveis]
    F --> G{Pré-requisitos\npendentes?}
    G -->|Sim| H[CapacitaCOOP\nCursos]
    H --> I{Todos\nconcluídos?}
    I -->|Não| H
    I -->|Sim| J([Candidatura\nliberada])
    G -->|Não| J
    J --> MC[Match Card gerado\nEmpreCard personalizado para a vaga]
    MC --> K[Saída para ATS\nou inscrição externa]
    K --> L[Confirmação manual\nou por RH]
    L --> M[Retorno ao app]
    M --> N{Precisa fortalecer\nperfil?}
    N -->|Sim| O[Atualizar dados,\nexperiências e preferências]
    O --> P[Receber novas vagas\ne novos cursos]
    P --> F
    N -->|Não| Q[Seguir acompanhando\nprocessos ativos]
    Q --> R{Nova vaga aderente?}
    R -->|Sim| J
    R -->|Não| S[Reativação periódica\npor IA]
    S --> C
`,
  },
  {
    id: "candidatura",
    label: "Candidatura",
    description: "Da descoberta da vaga até a inscrição externa, confirmação, acompanhamento do processo e retorno ao produto.",
    chart: `
flowchart TD
    A[EmpregaCOOP encontra vaga compatível] --> B[Usuário abre a vaga]
    B --> C[Registrar event job_viewed]
    C --> D{Clicou em Candidatar-se?}
    D -->|Não| E[Vaga segue em acompanhamento]
    D -->|Sim| F[Registrar event apply_clicked]
    F --> G[Criar application_intent]
    G --> MC1[Gerar Match Card\nEmpreCard adaptado à vaga]
    MC1 --> MC2{Candidato revisa\npacote de aplicação?}
    MC2 -->|Confirma| H[Exportar currículo ATS\na partir do Match Card]
    MC2 -->|Ajusta destaques| MC1
    H --> I[Anexar match_card_id · resume_id · candidate_id · job_id · cooperative_id]
    I --> J[Redirecionar para ATS externo]
    J --> K{Apoio do RH\nou link rastreável?}
    K -->|Sim| L[RH ou cooperativa confirma origem]
    K -->|Não| M[EmpregaCOOP pergunta ao usuário se concluiu]
    M --> N{Usuário confirmou?}
    N -->|Sim| O[Status user_confirmed_apply]
    N -->|Não| P[Status started_external_apply]
    L --> Q[Status recruiter_confirmed_apply]
    O --> R[Auditoria consolidada]
    P --> R
    Q --> R
    R --> S[Acompanhar etapa do processo]
    S --> T{Cooperativa retornou?}
    T -->|Entrevista| U[Registrar avanço\nscreening ou entrevista]
    T -->|Reprovado| V[Encerrar aplicação e\nrecomendar ajustes]
    T -->|Sem retorno| W[Disparar lembrete\ne pedido de atualização]
    T -->|Aprovado| X[Registrar contratação\nou etapa final]
    U --> Y[Voltar ao app para\npreparo e cursos]
    V --> Y
    W --> Y
    X --> Z[Entrar em trilha de\npós-colocação ou reativação futura]
    Y --> AA[Atualizar perfil,\nnovas skills e preferências]
    AA --> AB[Buscar novas vagas\nou capacitações]
`,
  },
  {
    id: "pos-candidatura",
    label: "Pós-candidatura",
    description: "Etapas posteriores à inscrição: acompanhamento, aprendizagem, nova candidatura e reentrada no ciclo.",
    chart: `
flowchart TD
    A[Aplicação confirmada] --> B[EmpregaCOOP abre acompanhamento]
    B --> C{Status atual do processo}
    C -->|Em triagem| D[Mostrar timeline\ne próximos passos]
    C -->|Entrevista| E[Sugerir preparo,\nroteiros e conteúdos]
    C -->|Teste ou case| F[Indicar cursos,\ntrilhas e materiais]
    C -->|Reprovado| G[Capturar feedback\nquando existir]
    C -->|Aprovado| H[Registrar sucesso\ne fechamento]
    D --> I[Usuário retorna ao app]
    E --> I
    F --> I
    G --> I
    H --> J{Deseja manter perfil\nativo?}
    I --> K[Atualizar currículo,\nEmpreCard e dados]
    K --> L[Recalcular match]
    L --> M{Há gaps de aderência?}
    M -->|Sim| N[Oferecer novos cursos]
    M -->|Não| O[Oferecer novas vagas]
    N --> P[Concluir capacitação]
    P --> O
    O --> Q[Nova candidatura]
    Q --> R[Reiniciar fluxo externo]
    R --> B
    J -->|Sim| K
    J -->|Não| S[Entrar em pool passivo\ncom reativação periódica]
`,
  },
  {
    id: "auditoria",
    label: "Auditoria",
    description: "Como origem, qualificação, retorno ao app e novas candidaturas continuam atribuídos ao EmpregaCOOP.",
    chart: `
flowchart LR
    A[Perfil e histórico do candidato] --> B[Motor de match]
    B --> C[Vaga da cooperativa]
    B --> D[Score de aderência]
    C --> E[Tracking link único]
    A --> F[Currículo exportado]
    F --> G[resume_id e profile_version]
    E --> H[apply_clicked]
    G --> I[Origem EmpregaCOOP]
    D --> J[qualified_by_empregacoop]
    H --> K[Funil por vaga]
    I --> K
    J --> K
    K --> L[Dashboard da cooperativa]
    L --> M[Retorno do candidato ao app]
    M --> N[Atualização de perfil]
    N --> O[Requalificação e novo match]
    O --> P[Segunda ou terceira candidatura]
    P --> L
`,
  },
  {
    id: "estados",
    label: "Estados",
    description: "Máquina de estados da candidatura incluindo desdobramentos pós-inscrição e reativação.",
    chart: `
stateDiagram-v2
    [*] --> discovered
    discovered --> interested : abriu / salvou
    interested --> started_external_apply : saiu para ATS
    started_external_apply --> user_confirmed_apply : usuário confirmou
    started_external_apply --> recruiter_confirmed_apply : RH confirmou
    user_confirmed_apply --> audited
    recruiter_confirmed_apply --> audited
    audited --> in_review : cooperativa analisa
    in_review --> interviewing : entrevista ou contato
    in_review --> rejected : reprovado
    interviewing --> upskilling : precisa reforçar gaps
    interviewing --> hired
    interviewing --> rejected
    upskilling --> reactivated : perfil atualizado
    rejected --> reactivated : retorno ao app
    reactivated --> discovered : novas vagas aderentes
    hired --> alumni_pool : reativação futura
    alumni_pool --> discovered
    audited --> closed : vaga encerrada
`,
  },
  {
    id: "objetos",
    label: "Objetos",
    description: "Modelo mínimo de dados para suportar candidatura, acompanhamento, capacitação e reativação.",
    chart: `
flowchart TB
    cand[candidates]
    jobs[jobs]
    emprecard[emprecard\nperfil profissional padrão]
    match_cards[match_cards\nEmpreCard personalizado por vaga]
    resumes[resume_exports]
    apps[job_applications]
    events[application_events]
    courses[course_enrollments]
    profile[profile_versions]
    reactivation[reactivation_cycles]

    cand --> emprecard
    cand --> courses
    cand --> profile
    emprecard --> match_cards
    jobs --> match_cards
    profile --> match_cards
    match_cards --> resumes
    match_cards --> apps
    jobs --> apps
    resumes --> apps
    apps --> events
    jobs --> events
    courses --> profile
    apps --> reactivation
    reactivation --> events
`,
  },
] as const;

type DiagramId = (typeof DIAGRAMS)[number]["id"];

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function FluxogramasPage() {
  const router = useRouter();
  const [activeId, setActiveId] = useState<DiagramId>("acesso");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const diagramSizeRef = useRef({ w: 800, h: 500 });
  const renderKeyRef = useRef(0);
  const dragRef = useRef({ sx: 0, sy: 0, px: 0, py: 0 });
  // Ref always in sync with current view so wheel / drag handlers avoid stale closures
  const viewRef = useRef({ zoom: 1, pan: { x: 0, y: 0 } });

  const active = DIAGRAMS.find(d => d.id === activeId)!;

  function applyView(z: number, p: { x: number; y: number }) {
    viewRef.current = { zoom: z, pan: p };
    setZoom(z);
    setPan(p);
  }

  function fitToScreen() {
    const vp = viewportRef.current;
    const { w, h } = diagramSizeRef.current;
    if (!vp || !w || !h) return;
    const padH = 120; // leave room for top description and bottom nav
    const padV = 140;
    const scale = Math.min(
      (vp.clientWidth - padH * 2) / w,
      (vp.clientHeight - padV * 2) / h,
    );
    applyView(scale, {
      x: (vp.clientWidth - w * scale) / 2,
      y: (vp.clientHeight - h * scale) / 2,
    });
  }

  function zoomBy(factor: number) {
    const vp = viewportRef.current;
    if (!vp) return;
    const cx = vp.clientWidth / 2;
    const cy = vp.clientHeight / 2;
    const { zoom: curZ, pan: curP } = viewRef.current;
    const newZ = Math.max(0.1, Math.min(8, curZ * factor));
    applyView(newZ, {
      x: cx - (cx - curP.x) * (newZ / curZ),
      y: cy - (cy - curP.y) * (newZ / curZ),
    });
  }

  // Render diagram whenever active diagram changes
  useEffect(() => {
    const key = ++renderKeyRef.current;
    const container = diagramRef.current;
    if (!container) return;
    container.innerHTML = "";
    setRenderError(null);

    mermaid.render(`mc-${key}`, active.chart).then(({ svg, bindFunctions }) => {
      if (renderKeyRef.current !== key || !container) return;
      container.innerHTML = svg;
      bindFunctions?.(container);

      const svgEl = container.querySelector("svg");
      if (!svgEl) return;

      const vb = svgEl.viewBox.baseVal;
      let w = vb.width;
      let h = vb.height;
      if (!w || !h) {
        const rect = svgEl.getBoundingClientRect();
        w = rect.width || 800;
        h = rect.height || 500;
      }
      // Remove mermaid's max-width constraint and fix explicit size
      svgEl.removeAttribute("style");
      svgEl.setAttribute("width", String(w));
      svgEl.setAttribute("height", String(h));
      diagramSizeRef.current = { w, h };

      requestAnimationFrame(fitToScreen);
    }).catch((err) => {
      if (renderKeyRef.current === key) {
        setRenderError("Não foi possível renderizar este fluxograma.");
        console.error(err);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Wheel zoom — must be non-passive to prevent page scroll
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = vp!.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const { zoom: curZ, pan: curP } = viewRef.current;
      const newZ = Math.max(0.1, Math.min(8, curZ * factor));
      const newP = {
        x: mx - (mx - curP.x) * (newZ / curZ),
        y: my - (my - curP.y) * (newZ / curZ),
      };
      viewRef.current = { zoom: newZ, pan: newP };
      setZoom(newZ);
      setPan(newP);
    }

    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, []);

  function onMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    const { sx, sy, px, py } = dragRef.current;
    const newP = { x: px + e.clientX - sx, y: py + e.clientY - sy };
    viewRef.current = { ...viewRef.current, pan: newP };
    setPan(newP);
  }

  function onMouseUp() { setIsDragging(false); }

  return (
    <div
      className="h-dvh overflow-hidden relative select-none"
      style={{ background: "oklch(0.975 0 0)" }}
    >
      {/* Dotted background */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, oklch(0 0 0 / 0.09) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Back */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 h-8 px-3 rounded-full border border-border bg-card/90 backdrop-blur text-xs font-medium text-muted-foreground hover:text-foreground shadow-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar
        </button>
      </div>

      {/* Description — top center */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center pt-4 px-36 pointer-events-none">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/50 mb-0.5">
            {active.label}
          </p>
          <p className="text-xs text-muted-foreground leading-5 max-w-xs">
            {active.description}
          </p>
        </div>
      </div>

      {/* Zoom controls — top right */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-0.5 bg-card/90 backdrop-blur border border-border rounded-full p-1 shadow-sm">
        <button
          onClick={() => zoomBy(1.3)}
          aria-label="Aproximar"
          className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={fitToScreen}
          aria-label="Ajustar à tela"
          className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
        <button
          onClick={() => zoomBy(1 / 1.3)}
          aria-label="Afastar"
          className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={viewportRef}
        className="absolute inset-0"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          {renderError ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {renderError}
            </div>
          ) : (
            <div ref={diagramRef} />
          )}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="absolute bottom-7 left-0 right-0 z-20 flex justify-center">
        <nav className="flex items-center gap-1 bg-card/95 backdrop-blur-sm border border-border rounded-full p-1.5 shadow-lg">
          {DIAGRAMS.map(d => (
            <button
              key={d.id}
              onClick={() => setActiveId(d.id)}
              className={`h-8 px-4 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                activeId === d.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {d.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
