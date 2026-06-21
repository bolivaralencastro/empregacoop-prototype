"use client";

import { useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  chart: string;
  title: string;
  description: string;
}

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
  flowchart: {
    curve: "basis",
    useMaxWidth: true,
  },
});

export function MermaidDiagram({ chart, title, description }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const diagramId = useId().replace(/:/g, "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;

    async function renderDiagram() {
      try {
        const { svg, bindFunctions } = await mermaid.render(`mermaid-${diagramId}`, chart);
        if (cancelled || !container) return;
        container.innerHTML = svg;
        bindFunctions?.(container);
        setError(null);
      } catch {
        if (!cancelled) {
          setError("Não foi possível renderizar este fluxograma.");
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [chart, diagramId]);

  return (
    <article className="rounded-[28px] border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-brand-soft via-white to-[#fff4eb]">
        <h2
          className="text-[24px] font-semibold leading-7"
          style={{ fontFamily: "Lora, Georgia, serif" }}
        >
          {title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      <div className="px-4 py-4 md:px-6">
        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="mermaid-shell">
            <div ref={containerRef} className="mermaid-stage" aria-label={title} />
          </div>
        )}

        <details className="mt-4 rounded-2xl border border-border bg-muted/45">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium">
            Ver definição Mermaid
          </summary>
          <pre className="overflow-x-auto border-t border-border px-4 py-4 text-xs leading-6 text-muted-foreground">
            <code>{chart}</code>
          </pre>
        </details>
      </div>
    </article>
  );
}
