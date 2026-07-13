"use client";

import Link from "next/link";
import { Star, Sparkles, Eye, MoreVertical, Clock } from "lucide-react";
import { TopbarA } from "@/components/layout/topbar-a";

const cards = [
  {
    id: "1",
    title: "Profissional de tecnologia, produto e dados",
    subtitle: "Foco em automação com IA e transformação digital",
    updatedAt: "Atualizado há 1 semana",
    isDefault: true,
  },
];

export default function EmprecardsList() {
  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <TopbarA activeSection="emprecards" />
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="w-full max-w-[800px] mx-auto px-4 py-8">
          <section className="bg-card border border-border rounded-2xl shadow-sm p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
              <div>
                <h1 className="text-[28px] sm:text-[32px] font-semibold leading-9">
                  Meus Emprecards
                </h1>
                <p className="mt-1 text-base text-muted-foreground">
                  Cartões de apresentação profissional gerados a partir das suas conversas.
                </p>
              </div>
              <Link
                href="/assistente"
                className="self-start inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium shadow-sm hover:bg-brand-strong transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                Novo Emprecard
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <article
                  key={card.id}
                  className="flex flex-col overflow-hidden border border-border rounded-xl bg-card transition-shadow hover:shadow-md min-h-[151px]"
                >
                  <div className="w-full h-1.5 bg-orange flex-none" />
                  <div className="flex-1 flex flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium leading-6 truncate">{card.title}</h3>
                        <p className="mt-0.5 text-sm text-muted-foreground truncate">{card.subtitle}</p>
                      </div>
                      {card.isDefault && (
                        <span className="inline-flex items-center gap-1 h-[19px] px-2 rounded-full bg-primary/10 text-primary text-xs font-medium whitespace-nowrap flex-none">
                          <Star className="w-3 h-3 fill-current" />
                          Padrão
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Clock className="w-3 h-3" />
                      {card.updatedAt}
                    </div>
                    <div className="flex items-center gap-2 mt-auto pt-3">
                      <Link
                        href={`/emprecards/${card.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 h-8 border border-border rounded-lg bg-background text-foreground text-sm font-medium shadow-sm hover:bg-muted transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver
                      </Link>
                      <button
                        type="button"
                        aria-label="Mais ações"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
