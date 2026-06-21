"use client";

import { useState } from "react";
import { generateCurriculoPdf } from "@/lib/generateCurriculoPdf";

const SICOOB_BLUE = "#004B8D";
const SICOOB_DARK = "#003570";

type Step = "form" | "success";

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#22c55e" fillOpacity=".15" />
      <path d="M6 10l3 3 5-5" stroke="#16a34a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ATSVagaPage() {
  const [step, setStep] = useState<Step>("form");
  const [cvAttached, setCvAttached] = useState(false);
  const [form, setForm] = useState({
    nome: "Bolivar Alencastro",
    email: "bolivar@alencastro.com.br",
    telefone: "+55 48 98413-8601",
    mensagem: "",
  });

  if (step === "success") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#F4F7FB" }}>
        <header style={{ background: SICOOB_BLUE }}>
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-base">Sicoob Dom Eliseu</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,.55)" }}>
                Cooperativa de Crédito · Dom Eliseu, PA
              </p>
            </div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,.55)" }}>
              Trabalhe Conosco
            </p>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "#dcfce7" }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M8 16l5.5 5.5L24 11" stroke="#16a34a" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Candidatura enviada!</h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Recebemos sua candidatura para a vaga de{" "}
              <strong className="text-gray-700">Gerente Administrativo Financeiro</strong>.
              Você receberá um e-mail de confirmação em breve.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Acompanhe o processo diretamente com o departamento de Recursos Humanos da cooperativa.
            </p>
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-[11px] text-gray-400">
                Candidatura originada via{" "}
                <span className="font-semibold" style={{ color: SICOOB_BLUE }}>EmpregaCOOP</span>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F4F7FB" }}>
      {/* Header */}
      <header style={{ background: SICOOB_BLUE }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-white text-base">Sicoob Dom Eliseu</p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,.55)" }}>
              Cooperativa de Crédito · Dom Eliseu, PA
            </p>
          </div>
          <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,.7)" }}>
            Trabalhe Conosco
          </p>
        </div>
      </header>

      {/* Job hero */}
      <div style={{ background: SICOOB_DARK }}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,.5)" }}>
            Vagas abertas › Gerente Administrativo Financeiro
          </p>
          <h1 className="text-2xl font-bold text-white leading-tight">
            Gerente Administrativo Financeiro
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3">
            {[
              { icon: "📍", text: "Dom Eliseu, PA" },
              { icon: "🕐", text: "Tempo integral" },
              { icon: "🏢", text: "Presencial" },
              { icon: "🤝", text: "Cooperativa de Crédito" },
            ].map(({ icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 text-sm"
                style={{ color: "rgba(255,255,255,.7)" }}>
                <span>{icon}</span>{text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

        {/* Left: job description */}
        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">Sobre a vaga</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              O Sicoob Dom Eliseu busca um profissional para liderar a área administrativo-financeira da cooperativa,
              garantindo a saúde financeira, o cumprimento das obrigações regulatórias e a eficiência dos processos internos.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mt-3">
              O cargo tem papel estratégico na tomada de decisão da diretoria e requer experiência sólida em
              gestão de pessoas, análise financeira e conhecimento do ambiente cooperativista.
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">Responsabilidades</h2>
            <ul className="space-y-2">
              {[
                "Gerenciar as rotinas financeiras e contábeis da cooperativa",
                "Elaborar e monitorar o orçamento anual e relatórios de desempenho",
                "Assegurar o cumprimento das normas do Banco Central e do Sistema Sicoob",
                "Liderar equipe administrativa e financeira (5–8 pessoas)",
                "Apoiar a diretoria na tomada de decisões estratégicas",
                "Coordenar auditorias internas e externas",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="flex-none mt-0.5"><CheckIcon /></span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">Requisitos</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Obrigatórios</p>
                <ul className="space-y-2">
                  {[
                    "Graduação em Ciências Contábeis, Administração ou Economia",
                    "Mínimo 5 anos de experiência em gestão financeira",
                    "Conhecimento em DRE, balanço patrimonial e fluxo de caixa",
                    "Conclusão dos cursos do CapacitaCOOP (pré-requisito obrigatório)",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="flex-none mt-0.5"><CheckIcon /></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Diferenciais</p>
                <ul className="space-y-2">
                  {[
                    "Experiência anterior em cooperativas de crédito",
                    "Pós-graduação em Finanças ou Gestão Cooperativista",
                    "Conhecimento em sistemas CORE Banking do Sicoob",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-500">
                      <span className="flex-none mt-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "#eff6ff" }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <circle cx="5" cy="5" r="3" fill={SICOOB_BLUE} fillOpacity=".6" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">O que oferecemos</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Remuneração", value: "A combinar" },
                { label: "Benefícios", value: "VR, VT, Plano de saúde" },
                { label: "Regime", value: "CLT" },
                { label: "Local", value: "Dom Eliseu, PA" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-gray-50 px-3 py-2.5">
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: application form */}
        <div className="lg:sticky lg:top-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100" style={{ background: SICOOB_BLUE }}>
              <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,.65)" }}>
                Candidatura online
              </p>
              <p className="text-sm font-bold text-white mt-0.5">
                Gerente Administrativo Financeiro
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Nome completo</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  className="h-9 border border-gray-200 rounded-lg text-sm px-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ "--tw-ring-color": SICOOB_BLUE } as React.CSSProperties}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="h-9 border border-gray-200 rounded-lg text-sm px-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ "--tw-ring-color": SICOOB_BLUE } as React.CSSProperties}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Telefone</label>
                <input
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                  className="h-9 border border-gray-200 rounded-lg text-sm px-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ "--tw-ring-color": SICOOB_BLUE } as React.CSSProperties}
                />
              </div>

              {/* CV upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">
                  Currículo <span className="text-red-500">*</span>
                </label>
                {cvAttached ? (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl border border-green-200 bg-green-50">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-none">
                      <rect width="16" height="16" rx="4" fill="#16a34a" fillOpacity=".12" />
                      <path d="M4 8l3 3 5-5" stroke="#16a34a" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-xs font-medium text-green-700 flex-1 truncate">
                      Bolivar_Alencastro_Designer.pdf
                    </p>
                    <button type="button" onClick={() => setCvAttached(false)}
                      className="text-green-400 hover:text-green-600 text-xs">
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCvAttached(true)}
                    className="flex flex-col items-center gap-1.5 py-5 px-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 text-gray-400 hover:text-gray-600 transition-colors text-xs font-medium"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 16V8M12 8l-3 3M12 8l3 3" stroke="currentColor" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor"
                        strokeWidth="1.5" strokeDasharray="3 2" />
                    </svg>
                    Clique para anexar ou arraste o arquivo
                    <span className="font-normal text-gray-400">PDF ou DOCX · máx. 10 MB</span>
                  </button>
                )}
                <p className="text-[11px] text-gray-400 leading-4">
                  <button type="button" onClick={() => generateCurriculoPdf()}
                    className="underline hover:text-gray-600 transition-colors">
                    Baixe seu currículo do EmpregaCOOP
                  </button>{" "}e anexe aqui.
                </p>
              </div>

              {/* Optional message */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">
                  Carta de apresentação <span className="text-gray-300">(opcional)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.mensagem}
                  onChange={(e) => setForm((f) => ({ ...f, mensagem: e.target.value }))}
                  placeholder="Conte brevemente por que você é o candidato ideal..."
                  className="border border-gray-200 rounded-lg text-sm px-3 py-2 text-gray-900 resize-none focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-gray-300"
                  style={{ "--tw-ring-color": SICOOB_BLUE } as React.CSSProperties}
                />
              </div>

              <button
                type="button"
                disabled={!cvAttached}
                onClick={() => setStep("success")}
                className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: SICOOB_BLUE }}
              >
                Enviar candidatura
              </button>

              <p className="text-[11px] text-gray-400 text-center leading-4">
                Ao enviar, você concorda com o uso dos seus dados para este processo seletivo.
              </p>
            </div>
          </div>

          {/* EmpregaCOOP attribution */}
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <p className="text-[11px] text-gray-400">Candidatura via</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://b2c.empregacoop.xyz/brand/empregacoop-logo-cor.png"
              alt="EmpregaCOOP"
              className="h-3.5 w-auto opacity-60"
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-5">
        <p className="text-center text-xs text-gray-400">
          © 2026 Sicoob Dom Eliseu · Cooperativa de Crédito · CNPJ 00.000.000/0001-00
        </p>
      </footer>
    </div>
  );
}
