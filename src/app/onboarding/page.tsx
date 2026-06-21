"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

const TOTAL = 3;

const chatLines = [
  { from: "ai", text: "Olá! Sou o EmpregaCOOP. Que bom que você está aqui!" },
  { from: "user", text: "Oi! Trabalho com tecnologia, sou desenvolvedor." },
  { from: "ai", text: "Ótimo! Qual tipo de trabalho você mais almeja?" },
  { from: "user", text: "JavaScript e TypeScript, trabalho com React." },
  { from: "ai", text: "Perfeito! Quanto tempo de experiência você tem?" },
];


export default function Onboarding() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  function advance() {
    if (step < TOTAL - 1) {
      setStep((s) => s + 1);
    } else {
      router.push("/assistente");
    }
  }

  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-[480px] flex flex-col items-center text-center gap-8">
        {step === 0 && <SlideWelcome />}
        {step === 1 && <SlideChatPreview />}
        {step === 2 && <SlideReady />}

        <button
          onClick={advance}
          className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-primary text-white text-base font-medium shadow-sm hover:opacity-90 transition-opacity"
        >
          {step < TOTAL - 1 ? "Continuar" : "Começar agora"}
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? "w-5 h-1.5 bg-primary"
                  : "w-1.5 h-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideWelcome() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://b2c.empregacoop.xyz/brand/empregacoop-logo-cor.png"
        alt="EmpregaCOOP"
        className="h-8 object-contain"
      />
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Seja bem vindo ao EmpregaCOOP!
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Conheça o seu assistente de carreira com IA. O EmpregaCOOP te
          entende, prepara e encontra vagas reais que combinam com o seu
          momento.
        </p>
      </div>
    </>
  );
}

function SlideChatPreview() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Seu assistente de carreira com IA
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          O EmpregaCOOP funciona na base da conversa!{" "}
          <span className="text-foreground font-medium">
            Ele vai te perguntar várias coisas...
          </span>
        </p>
      </div>

      <div className="w-full rounded-2xl border border-border bg-card shadow-sm p-4 flex flex-col gap-3 text-left">
        {chatLines.map((line, i) => (
          <div
            key={i}
            className={`flex ${line.from === "user" ? "justify-end" : "justify-start"}`}
          >
            {line.from === "ai" && (
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-none mr-2 mt-0.5">
                <span className="text-[9px] font-bold text-primary">EC</span>
              </div>
            )}
            <div
              className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-5 ${
                line.from === "ai"
                  ? "bg-muted text-foreground rounded-tl-sm"
                  : "bg-primary text-white rounded-tr-sm"
              }`}
            >
              {line.text}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SlideReady() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Tudo pronto para você decolar
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A IA monta seu perfil, treina você e indica as vagas certas.
        </p>
      </div>

      <div className="w-full grid grid-cols-3 gap-3 text-left">
        <SkeletonCard accent="bg-[#6d0070]" label="Emprecard" tagline="Perfil único para cada vaga">
          <ChatSkeletonPreview />
        </SkeletonCard>
        <SkeletonCard accent="bg-[#7c3aed]" label="Evolução" tagline="Treino para cada entrevista">
          <ProfileSkeletonPreview />
        </SkeletonCard>
        <SkeletonCard accent="bg-[#059669]" label="Vagas certas" tagline="Indicadas para você">
          <JobsSkeletonPreview />
        </SkeletonCard>
      </div>
    </>
  );
}

function SkeletonCard({ accent, label, tagline, children }: {
  accent: string;
  label: string;
  tagline: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <div className={`h-1.5 ${accent}`} />
      <div className="flex-1 bg-muted/20 px-2 pt-2 pb-1">
        {children}
      </div>
      <div className="px-2.5 py-2 border-t border-border/60 flex flex-col gap-0.5">
        <p className="text-[11px] font-bold text-foreground leading-tight">{label}</p>
        <p className="text-[10px] text-muted-foreground leading-snug">{tagline}</p>
      </div>
    </div>
  );
}

function ChatSkeletonPreview() {
  return (
    <div className="flex flex-col gap-2 h-full">
      {/* AI message */}
      <div className="flex gap-1.5 items-end">
        <div className="w-5 h-5 rounded-full bg-[#6d0070]/30 flex-none flex items-center justify-center">
          <div className="w-2 h-1 rounded-full bg-[#6d0070]/50" />
        </div>
        <div className="bg-foreground/8 rounded-2xl rounded-bl-sm px-2 py-1.5 flex flex-col gap-1 max-w-[75%]">
          <div className="h-1.5 w-16 rounded-full bg-foreground/15" />
          <div className="h-1.5 w-10 rounded-full bg-foreground/10" />
        </div>
      </div>
      {/* User message */}
      <div className="flex justify-end">
        <div className="bg-[#6d0070]/25 rounded-2xl rounded-br-sm px-2 py-1.5 max-w-[65%]">
          <div className="h-1.5 w-14 rounded-full bg-[#6d0070]/40" />
        </div>
      </div>
      {/* AI message */}
      <div className="flex gap-1.5 items-end">
        <div className="w-5 h-5 rounded-full bg-[#6d0070]/30 flex-none" />
        <div className="bg-foreground/8 rounded-2xl rounded-bl-sm px-2 py-1.5 flex flex-col gap-1 max-w-[75%]">
          <div className="h-1.5 w-12 rounded-full bg-foreground/15" />
        </div>
      </div>
      {/* User message */}
      <div className="flex justify-end">
        <div className="bg-[#6d0070]/25 rounded-2xl rounded-br-sm px-2 py-1.5">
          <div className="h-1.5 w-10 rounded-full bg-[#6d0070]/40" />
        </div>
      </div>
    </div>
  );
}

function ProfileSkeletonPreview() {
  return (
    <div className="flex flex-col items-center gap-2 pt-1">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-[#7c3aed]/30 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-[#7c3aed]/40" />
      </div>
      {/* Name lines */}
      <div className="flex flex-col items-center gap-1">
        <div className="h-2 w-16 rounded-full bg-foreground/15" />
        <div className="h-1.5 w-10 rounded-full bg-foreground/10" />
      </div>
      {/* Skill tags */}
      <div className="flex gap-1 flex-wrap justify-center">
        <div className="h-3.5 w-10 rounded-full bg-[#7c3aed]/30" />
        <div className="h-3.5 w-8 rounded-full bg-[#7c3aed]/20" />
        <div className="h-3.5 w-12 rounded-full bg-[#7c3aed]/25" />
      </div>
      {/* Bio line */}
      <div className="w-full flex flex-col gap-0.5 pt-1 border-t border-border/30">
        <div className="h-1 w-full rounded-full bg-foreground/10" />
        <div className="h-1 w-4/5 rounded-full bg-foreground/10" />
      </div>
    </div>
  );
}

function JobsSkeletonPreview() {
  return (
    <div className="flex flex-col gap-1.5">
      {[
        { title: 20, sub: 14 },
        { title: 16, sub: 12 },
        { title: 18, sub: 10 },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-1.5 rounded-lg bg-card border border-border/50 p-1.5">
          <div className="w-5 h-5 rounded-md bg-[#059669]/20 flex-none" />
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="h-1.5 rounded-full bg-foreground/15" style={{ width: `${item.title * 2}px` }} />
            <div className="h-1 rounded-full bg-foreground/10" style={{ width: `${item.sub * 2}px` }} />
          </div>
          <div className="h-3 w-5 rounded-full bg-[#059669]/30 flex-none" />
        </div>
      ))}
    </div>
  );
}
