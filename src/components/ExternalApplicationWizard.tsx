"use client";

import { useState } from "react";
import {
  X,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  UploadCloud,
  Send,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type Step = {
  Icon: LucideIcon;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    Icon: ExternalLink,
    title: "Você vai continuar em outra plataforma",
    body: "A candidatura acontece no site da cooperativa — pode ser Gupy, Empregare ou uma página de carreiras própria. Você vai precisar de um cadastro rápido por lá; use o mesmo e-mail do EmpregaCOOP para facilitar seu controle.",
  },
  {
    Icon: UploadCloud,
    title: "Use seu Match Card",
    body: "No campo de upload de currículo da plataforma, anexe o PDF do seu Match Card. A maioria das plataformas lê o arquivo e pré-preenche seu perfil automaticamente — é a forma mais rápida de concluir a candidatura.",
  },
  {
    Icon: Send,
    title: "Envie e volte para me contar",
    body: "Te preparamos para essa candidatura — use o Match Card, envie pela plataforma e volte aqui para avisar que finalizou. Assim a gente segue junto para outras vagas e cursos.",
  },
];

function WizardAvatar() {
  return (
    <span className="w-8 h-8 flex-none rounded-full bg-primary overflow-hidden flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="https://b2c.empregacoop.xyz/brand/empregacoop-mark.png" alt="EmpregaCOOP" className="w-full h-full object-cover" />
    </span>
  );
}

export function ExternalApplicationWizard({
  open,
  vagaTitulo,
  cooperativa,
  variant = "full",
  onClose,
  onComplete,
  onDownload,
}: {
  open: boolean;
  vagaTitulo: string;
  cooperativa: string;
  variant?: "full" | "short";
  onClose: () => void;
  onComplete: () => void;
  onDownload?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [showFull, setShowFull] = useState(false);

  if (!open) return null;

  const isShort = variant === "short" && !showFull;
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  function handleClose() {
    setStep(0);
    setShowFull(false);
    onClose();
  }

  function handleComplete() {
    setStep(0);
    setShowFull(false);
    localStorage.setItem("proto_wizard_seen", "true");
    onComplete();
  }

  if (isShort) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        role="dialog"
        aria-modal="true"
        aria-label="Confirmar candidatura na plataforma externa"
        onClick={handleClose}
      >
        <div
          className="w-full max-w-[420px] rounded-2xl border border-primary/15 bg-card shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-primary/10 bg-primary/5">
            <WizardAvatar />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase font-bold tracking-wide text-muted-foreground">EmpregaCOOP IA</p>
              <p className="text-sm font-medium truncate">{vagaTitulo} · {cooperativa}</p>
            </div>
            <button
              type="button"
              aria-label="Fechar"
              onClick={handleClose}
              className="w-7 h-7 flex-none flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5">
            <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
              <Send className="w-5 h-5" />
            </span>
            <h3 className="text-base font-semibold leading-5 mb-2">Você já conhece o caminho</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Baixe o Match Card desta vaga e anexe no upload de currículo da plataforma da cooperativa. Depois volte aqui para me avisar que finalizou.
            </p>
            <button
              type="button"
              onClick={() => setShowFull(true)}
              className="mt-3 text-xs text-muted-foreground underline hover:text-foreground transition-colors"
            >
              Rever o passo a passo completo
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-t border-border">
            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-primary/30 bg-primary/8 text-primary text-sm font-semibold hover:bg-primary/12 transition-colors"
              >
                Baixar Match Card
              </button>
            )}
            <button
              type="button"
              onClick={handleComplete}
              className="ml-auto inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Ir para a página da vaga
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Como candidatar-se na plataforma externa"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[420px] rounded-2xl border border-primary/15 bg-card shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-primary/10 bg-primary/5">
          <WizardAvatar />
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase font-bold tracking-wide text-muted-foreground">EmpregaCOOP IA</p>
            <p className="text-sm font-medium truncate">{vagaTitulo} · {cooperativa}</p>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={handleClose}
            className="w-7 h-7 flex-none flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 px-4 pt-3.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-primary/12"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="p-5">
          <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
            <current.Icon className="w-5 h-5" />
          </span>
          <h3 className="text-base font-semibold leading-5 mb-2">{current.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{current.body}</p>

          {isLast && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-success-soft border border-success/25 px-3 py-2.5">
              <Sparkles className="w-3.5 h-3.5 text-success flex-none mt-0.5" />
              <p className="text-xs text-success/80 leading-relaxed">
                Tudo pronto! Ao continuar, você sai do EmpregaCOOP e vai para a página da vaga na plataforma da cooperativa.
              </p>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={isFirst}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-muted-foreground text-xs font-medium hover:bg-muted transition-colors disabled:opacity-0 disabled:pointer-events-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={handleComplete}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Ir para a página da vaga
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Avançar
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
