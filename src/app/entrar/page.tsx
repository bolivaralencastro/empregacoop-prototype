"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, X, ChevronDown } from "lucide-react";

type Screen = "home" | "email-input" | "otp-email" | "otp-phone";

const LOGO_URL = "https://b2c.empregacoop.xyz/_next/image?url=%2Fbrand%2Fempregacoop-logo-cor.png&w=1200&q=75";

function Logo() {
  return (
    <div className="flex justify-center mb-8">
      <img src={LOGO_URL} alt="EmpregaCOOP" className="h-8 w-auto" />
    </div>
  );
}

function Footer() {
  return (
    <p className="mt-6 text-center text-xs text-muted-foreground leading-5">
      Ao criar sua conta, você concorda com nossos{" "}
      <Link href="#" className="text-primary hover:underline">Termos de Uso</Link>
      {" "}e{" "}
      <Link href="#" className="text-primary hover:underline">Política de Privacidade</Link>.
    </p>
  );
}

function ErrorBanner({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/8 text-destructive text-sm mb-6">
      <span className="mt-0.5 flex-none">
        <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{message}</p>
        <button type="button" onClick={onClose} className="text-xs underline mt-0.5 opacity-70 hover:opacity-100">Fechar</button>
      </div>
      <button type="button" onClick={onClose} className="flex-none opacity-50 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function OTPInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  function inputs() {
    return Array.from(containerRef.current?.querySelectorAll("input") ?? []) as HTMLInputElement[];
  }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      inputs()[i - 1]?.focus();
    }
  }

  function handleChange(i: number, raw: string) {
    const char = raw.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[i] = char;
    onChange(next);
    if (char && i < 5) inputs()[i + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const next = Array(6).fill("");
    digits.forEach((d, i) => { next[i] = d; });
    onChange(next);
    inputs()[Math.min(digits.length, 5)]?.focus();
    e.preventDefault();
  }

  return (
    <div ref={containerRef} className="flex gap-2 justify-center my-6" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          className="w-11 h-12 text-center text-lg font-semibold border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}

function CountdownButton({ onResend }: { onResend: () => void }) {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  if (seconds > 0) {
    return <p className="text-center text-sm text-primary/50">Reenviar código em {seconds}s</p>;
  }

  return (
    <button
      type="button"
      onClick={() => { setSeconds(60); onResend(); }}
      className="w-full text-center text-sm text-primary hover:underline"
    >
      Reenviar código
    </button>
  );
}

export default function EntrarPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("home");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");

  const otpComplete = otp.every(Boolean);

  function goBack() {
    setError("");
    setOtp(Array(6).fill(""));
    if (screen === "email-input") setScreen("home");
    else if (screen === "otp-email") setScreen("email-input");
    else if (screen === "otp-phone") setScreen("home");
  }

  function handleVerify() {
    const code = otp.join("");
    if (code === "000000") {
      router.push("/assistente");
    } else {
      setError("Código inválido ou expirado");
    }
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[384px]">
        <Logo />

        {/* ── TELA 1: HOME ── */}
        {screen === "home" && (
          <>
            <h1 className="text-[22px] font-semibold text-center text-foreground mb-6">
              Entrar no EmpregaCOOP
            </h1>

            <div className="flex flex-col gap-4">
              {/* Telefone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Código do país</label>
                <button
                  type="button"
                  className="w-full flex items-center justify-between h-11 px-3.5 border border-border rounded-xl bg-background text-sm shadow-sm hover:bg-muted/30 transition-colors"
                >
                  <span className="flex items-center gap-2">🇧🇷 +55 Brasil</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Número de telefone</label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 px-3.5 border border-border rounded-xl bg-background text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">Enviaremos um código para confirmar seu número.</p>
              </div>

              <button
                type="button"
                disabled={!phone}
                onClick={() => { setError(""); setOtp(Array(6).fill("")); setScreen("otp-phone"); }}
                className="w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:pointer-events-none"
              >
                Continuar
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">Ou</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                type="button"
                onClick={() => { setError(""); setScreen("email-input"); }}
                className="w-full h-11 flex items-center justify-center gap-2 border border-border rounded-xl bg-background text-sm font-medium shadow-sm hover:bg-muted/30 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Continuar com e-mail
              </button>

              <button
                type="button"
                className="w-full h-11 flex items-center justify-center gap-2 border border-border rounded-xl bg-background text-sm font-medium shadow-sm hover:bg-muted/30 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuar com Google
              </button>
            </div>

            <Footer />
          </>
        )}

        {/* ── TELA 2: E-MAIL INPUT ── */}
        {screen === "email-input" && (
          <>
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>

            <h2 className="text-xl font-semibold text-center text-foreground mb-6">
              Entrar com e-mail
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">E-mail</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  className="h-11 px-3.5 border border-border rounded-xl bg-background text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <button
                type="button"
                disabled={!email.includes("@")}
                onClick={() => { setError(""); setOtp(Array(6).fill("")); setScreen("otp-email"); }}
                className="w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:pointer-events-none"
              >
                Continuar
              </button>

              <button
                type="button"
                onClick={() => setScreen("home")}
                className="w-full text-center text-sm text-primary hover:underline"
              >
                Cancelar
              </button>
            </div>

            <Footer />
          </>
        )}

        {/* ── TELA 3: OTP E-MAIL ── */}
        {screen === "otp-email" && (
          <>
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>

            {error && <ErrorBanner message={error} onClose={() => setError("")} />}

            <div className="flex justify-center mb-4">
              <span className="w-14 h-14 flex items-center justify-center rounded-2xl border-2 border-primary/25 bg-primary/8 text-primary">
                <Mail className="w-7 h-7" />
              </span>
            </div>

            <h2 className="text-xl font-semibold text-center text-foreground mb-1">
              Verifique seu e-mail
            </h2>
            <p className="text-sm text-center text-muted-foreground">
              Enviamos um código de 6 dígitos para
              <br /><strong className="text-foreground">{email || "seu e-mail"}</strong>
            </p>

            <OTPInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} />

            <button
              type="button"
              disabled={!otpComplete}
              onClick={handleVerify}
              className="w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:pointer-events-none mb-4"
            >
              Verificar
            </button>

            <CountdownButton onResend={() => setOtp(Array(6).fill(""))} />

            <Footer />
          </>
        )}

        {/* ── TELA 4: OTP TELEFONE ── */}
        {screen === "otp-phone" && (
          <>
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>

            {error && <ErrorBanner message={error} onClose={() => setError("")} />}

            <div className="flex justify-center mb-4">
              <span className="w-14 h-14 flex items-center justify-center rounded-2xl border-2 border-primary/25 bg-primary/8 text-primary">
                <Phone className="w-7 h-7" />
              </span>
            </div>

            <h2 className="text-xl font-semibold text-center text-foreground mb-1">
              Digite o código
            </h2>
            <p className="text-sm text-center text-muted-foreground">
              Enviamos um código de 6 dígitos para
              <br /><strong className="text-foreground">+55 {phone || "seu número"}</strong>
            </p>

            <OTPInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} />

            <button
              type="button"
              disabled={!otpComplete}
              onClick={handleVerify}
              className="w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:pointer-events-none mb-4"
            >
              Verificar
            </button>

            <CountdownButton onResend={() => setOtp(Array(6).fill(""))} />

            <Footer />
          </>
        )}
      </div>
    </div>
  );
}
