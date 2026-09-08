"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router  = useRouter();
  const [email, setEmail]   = useState("");
  const [pass,  setPass]    = useState("");
  const [show,  setShow]    = useState(false);
  const [error, setError]   = useState<string | null>(null);
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
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo / marca */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.35em] uppercase mb-2" style={{ color: "var(--muted)" }}>
            uso interno
          </p>
          <h1 className="text-3xl font-light tracking-widest" style={{ color: "var(--text)" }}>
            CAEX <span style={{ color: "var(--gold)" }}>Pedidos</span>
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--dim)" }} />
            <input
              type="email"
              placeholder="Correo"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background:   "var(--surface)",
                border:       "1px solid var(--border2)",
                color:        "var(--text)",
              }}
            />
          </div>

          {/* Contraseña */}
          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--dim)" }} />
            <input
              type={show ? "text" : "password"}
              placeholder="Contraseña"
              required
              value={pass}
              onChange={e => setPass(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "var(--surface)",
                border:     "1px solid var(--border2)",
                color:      "var(--text)",
              }}
            />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
              style={{ color: "var(--dim)" }}
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-center" style={{ color: "#C8A49F" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium tracking-wider transition-opacity disabled:opacity-50"
            style={{ background: "var(--accent2)", color: "var(--text)" }}
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="text-center text-xs mt-8" style={{ color: "var(--dim)" }}>
          Solo para socios CAEX Parfum
        </p>
      </div>
    </div>
  );
}
