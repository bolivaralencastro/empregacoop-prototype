"use client";

import Link from "next/link";
import { Mic, MicOff } from "lucide-react";

export default function VozPage() {
  return (
    <main
      className="min-h-dvh flex flex-col"
      style={{
        background:
          "radial-gradient(circle at 50% 36%, rgba(163,24,167,.32), transparent 18%), linear-gradient(180deg, #230028 0%, #160019 58%, #070008 100%)",
        color: "#f7ecf8",
        fontFamily: "inherit",
      }}
    >
      {/* Topbar */}
      <header
        className="flex-none grid items-center gap-4 px-5 border-b"
        style={{
          height: 56,
          gridTemplateColumns: "1fr auto auto",
          borderColor: "rgba(255,255,255,.12)",
        }}
      >
        <div className="flex items-center gap-3 text-sm font-medium">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "#0ad37f", boxShadow: "0 0 0 4px rgba(10,211,127,.10)" }}
          />
          Ao vivo
        </div>
        <div className="text-xl font-normal" style={{ color: "rgba(255,255,255,.76)" }}>
          9:58
        </div>
        <Link
          href="/assistente"
          aria-label="Fechar conversa por voz"
          className="relative w-6 h-6 flex items-center justify-center"
          style={{ color: "rgba(255,255,255,.84)" }}
        >
          <span
            className="absolute w-3.5 h-[1.5px] rounded-full bg-current"
            style={{ transform: "rotate(45deg)" }}
          />
          <span
            className="absolute w-3.5 h-[1.5px] rounded-full bg-current"
            style={{ transform: "rotate(-45deg)" }}
          />
        </Link>
      </header>

      {/* Stage */}
      <section
        className="flex-1 min-h-0 flex items-center justify-center px-6 py-12"
        aria-label="Conversa por voz"
      >
        <div className="w-full max-w-[680px] flex flex-col items-center gap-9" style={{ marginTop: -72 }}>
          {/* Orb */}
          <div
            aria-hidden="true"
            className="relative grid place-items-center"
            style={{ width: 460, height: 460 }}
          >
            <div
              className="absolute rounded-full"
              style={{
                inset: 28,
                background:
                  "radial-gradient(circle, rgba(151,0,155,.38) 0%, rgba(151,0,155,.12) 52%, transparent 74%)",
                filter: "blur(12px)",
              }}
            />
            <div
              className="relative rounded-full"
              style={{
                width: 304,
                height: 304,
                background:
                  "linear-gradient(155deg, rgba(196,58,199,.92) 0%, rgba(113,0,113,.96) 48%, rgba(84,0,85,.98) 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,.12), 0 0 0 1px rgba(255,255,255,.05), 0 24px 80px rgba(163,24,167,.22)",
              }}
            />
          </div>

          {/* Transcript */}
          <p
            className="max-w-[360px] text-center font-normal"
            style={{ fontSize: 40, lineHeight: "48px", color: "rgba(255,255,255,.92)" }}
          >
            Bolivar, a
          </p>
        </div>
      </section>

      {/* Footer controls */}
      <footer
        className="flex-none flex items-center justify-center px-6 pb-6 border-t"
        style={{
          height: 136,
          borderColor: "rgba(255,255,255,.12)",
          background: "rgba(0,0,0,.62)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Microfone"
            className="w-14 h-14 flex items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
            style={{ background: "rgba(255,255,255,.06)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.18)" }}
          >
            <Mic className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Encerrar conversa por voz"
            className="w-14 h-14 flex items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
            style={{ background: "#ff0a0a" }}
          >
            <MicOff className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </main>
  );
}
