"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [show,    setShow]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) { setError("Correo o contraseña incorrectos."); return; }
    router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "var(--bg)" }}>

      {/* Orbes de fondo animados */}
      <div style={{
        position: "absolute", width: 500, height: 500,
        borderRadius: "50%", top: "-10%", left: "-10%",
        background: "radial-gradient(circle, rgba(122,24,32,0.18) 0%, transparent 70%)",
        animation: "float-orb 18s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 400, height: 400,
        borderRadius: "50%", bottom: "-5%", right: "-5%",
        background: "radial-gradient(circle, rgba(200,164,159,0.10) 0%, transparent 70%)",
        animation: "float-orb2 22s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 300, height: 300,
        borderRadius: "50%", top: "50%", left: "60%",
        background: "radial-gradient(circle, rgba(77,14,19,0.12) 0%, transparent 70%)",
        animation: "float-orb 28s ease-in-out infinite reverse",
        pointerEvents: "none",
      }} />

      {/* Card */}
      <div className="glass-heavy animate-fade-in relative z-10 w-full max-w-sm rounded-3xl p-8 sm:p-10"
        style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)" }}>

        {/* Logo */}
        <div className="text-center mb-10 space-y-1">
          <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: "var(--dim)" }}>
            uso interno
          </p>
          <h1 className="font-display text-3xl font-medium">
            <span style={{ color: "var(--text)" }}>CAEX </span>
            <span className="gradient-gold">Pedidos</span>
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--dim)" }}>
            Solo para socios CAEX Parfum
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--dim)" }}>
              Correo
            </label>
            <input
              type="email" required placeholder="tu@correo.com"
              value={email} onChange={e => setEmail(e.target.value)}
              className="input-base"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <label className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--dim)" }}>
              Contraseña
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"} required placeholder="••••••••"
                value={pass} onChange={e => setPass(e.target.value)}
                className="input-base pr-10"
              />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                style={{ color: "var(--dim)" }}>
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-center py-2 rounded-lg"
              style={{ color: "var(--gold)", background: "rgba(200,164,159,0.08)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="glow-red w-full py-3 rounded-xl text-sm font-medium tracking-wider transition-all duration-300 disabled:opacity-40 mt-2"
            style={{
              background: "linear-gradient(135deg, var(--accent2) 0%, var(--accent3) 100%)",
              color: "var(--text)",
            }}>
            {loading ? "Entrando…" : "Entrar →"}
          </button>
        </form>
      </div>
    </div>
  );
}
