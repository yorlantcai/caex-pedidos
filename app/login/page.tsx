"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

const GLASS: React.CSSProperties = {
  background: "var(--surface2)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid var(--border2)",
};

const GRAD_GOLD: React.CSSProperties = {
  display: "inline-block",
  background: "linear-gradient(135deg, var(--gg1) 0%, var(--gg2) 50%, var(--gg3) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export default function LoginPage() {
  const router  = useRouter();
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", position: "relative", overflow: "hidden", background: "var(--bg)" }}>

      {/* Orbes */}
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", top: "-10%", left: "-10%", background: "radial-gradient(circle, var(--orb1) 0%, transparent 70%)", animation: "orb1 18s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", bottom: "-5%", right: "-5%", background: "radial-gradient(circle, var(--orb2) 0%, transparent 70%)", animation: "orb2 22s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", top: "50%", left: "60%", background: "radial-gradient(circle, var(--orb3) 0%, transparent 70%)", animation: "orb1 28s ease-in-out infinite reverse", pointerEvents: "none" }} />

      {/* Card */}
      <div style={{ ...GLASS, position: "relative", zIndex: 10, width: "100%", maxWidth: 380, borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)", animation: "fadein 0.7s cubic-bezier(0.23,1,0.32,1) both" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p style={{ fontSize: "0.625rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "var(--dim)", marginBottom: "0.5rem" }}>
            uso interno
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.875rem", fontWeight: 500, lineHeight: 1.2 }}>
            <span style={{ color: "var(--text)" }}>CAEX </span>
            <span style={GRAD_GOLD}>Pedidos</span>
          </h1>
          <p style={{ fontSize: "0.75rem", color: "var(--dim)", marginTop: "0.375rem" }}>
            Solo para socios CAEX Parfum
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={{ fontSize: "0.625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--dim)" }}>Correo</label>
            <input type="email" required placeholder="tu@correo.com" value={email}
              onChange={e => setEmail(e.target.value)} className="inp" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={{ fontSize: "0.625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--dim)" }}>Contraseña</label>
            <div style={{ position: "relative" }}>
              <input type={show ? "text" : "password"} required placeholder="••••••••"
                value={pass} onChange={e => setPass(e.target.value)}
                className="inp" style={{ paddingRight: "2.5rem" }} />
              <button type="button" onClick={() => setShow(!show)}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--dim)", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <p style={{ fontSize: "0.75rem", textAlign: "center", padding: "0.5rem", borderRadius: "0.5rem", color: "var(--gold)", background: "rgba(200,164,159,0.08)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "0.875rem", borderRadius: "0.75rem",
            fontSize: "0.875rem", fontWeight: 500, letterSpacing: "0.1em",
            background: "linear-gradient(135deg, #7A1820 0%, #A02030 100%)",
            color: "#FFFFFF", border: "none", cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1, marginTop: "0.5rem",
            boxShadow: "0 0 30px rgba(122,24,32,0.35), 0 0 60px rgba(122,24,32,0.15)",
            transition: "opacity 0.2s",
          }}>
            {loading ? "Entrando…" : "Entrar →"}
          </button>
        </form>
      </div>
    </div>
  );
}
