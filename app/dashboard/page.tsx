"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Pedido, EstadoPedido } from "@/lib/database.types";
import Dropdown from "@/components/ui/Dropdown";
import { Plus, LogOut, Package, Truck, User, CheckCircle2, Clock, Search, Pencil, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/useTheme";

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

type FiltroEstado = EstadoPedido | "todos";

const ESTADO_OPTIONS: { value: FiltroEstado; label: string }[] = [
  { value: "todos",     label: "Todos los pedidos" },
  { value: "pendiente", label: "Pendientes"         },
  { value: "entregado", label: "Entregados"         },
  { value: "cancelado", label: "Cancelados"         },
];

const BADGE: Record<EstadoPedido, { color: string; glow: string }> = {
  pendiente: { color: "var(--yellow3)", glow: "rgba(212,168,64,0.20)" },
  entregado: { color: "var(--green2)",  glow: "rgba(74,155,106,0.20)" },
  cancelado: { color: "var(--red3)",    glow: "rgba(192,80,80,0.20)"  },
};

const GLASS: React.CSSProperties = {
  background: "var(--surface)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid var(--border2)",
};

const GRAD_GOLD: React.CSSProperties = {
  display: "inline-block",
  background: "linear-gradient(135deg, var(--gg1) 0%, var(--gg2) 50%, var(--gg3) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

function StatCard({ icon, label, value, color, delay = 0 }: { icon: React.ReactNode; label: string; value: string | number; color: string; delay?: number }) {
  const [hov, setHov] = useState(false);
  const mobile = useIsMobile();
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      ...GLASS,
      borderRadius: mobile ? "0.875rem" : "1rem",
      padding: mobile ? "0.75rem" : "1.25rem 1.5rem",
      flex: "1 1 0", minWidth: 0,
      display: "flex", flexDirection: "column",
      gap: mobile ? "0.375rem" : "0.75rem",
      animation: `fadein 0.6s cubic-bezier(0.23,1,0.32,1) ${delay}ms both`,
      transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s",
      transform: hov ? "translateY(-4px) scale(1.02)" : "none",
      boxShadow: hov ? "0 12px 40px rgba(0,0,0,0.35)" : "none",
    }}>
      <div style={{ width: mobile ? 26 : 36, height: mobile ? 26 : 36, borderRadius: mobile ? "0.5rem" : "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", background: `${color}22`, color }}>
        {icon}
      </div>
      <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: mobile ? "1.125rem" : "1.75rem", fontWeight: 500, color: "var(--text)" }}>{value}</p>
      <p style={{ fontSize: mobile ? "0.5rem" : "0.625rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--dim)" }}>{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { theme, toggle: toggleTheme } = useTheme();
  const [pedidos,      setPedidos]      = useState<Pedido[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [busqueda,     setBusqueda]     = useState("");
  const [userEmail,    setUserEmail]    = useState("");

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace("/login"); return; }
    setUserEmail(session.user.email ?? "");
    const { data } = await supabase.from("pedidos").select("*").order("created_at", { ascending: false });
    setPedidos(data ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const logout = async () => { await supabase.auth.signOut(); router.replace("/login"); };

  const cambiarEstado = async (id: string, estado: EstadoPedido) => {
    await supabase.from("pedidos").update({ estado }).eq("id", id);
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado } : p));
  };

  const filtrados = pedidos.filter(p => {
    const matchEstado = filtroEstado === "todos" || p.estado === filtroEstado;
    const q = busqueda.toLowerCase();
    return matchEstado && (!q || p.cliente.toLowerCase().includes(q) || p.referencia.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q));
  });

  const totales = {
    pendientes: pedidos.filter(p => p.estado === "pendiente").length,
    entregados: pedidos.filter(p => p.estado === "entregado").length,
    ingresos:   pedidos.filter(p => p.estado === "entregado").reduce((s, p) => s + p.precio_venta, 0),
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ position: "fixed", top: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", pointerEvents: "none", zIndex: 0, background: "radial-gradient(circle, rgba(77,14,19,0.10) 0%, transparent 70%)" }} />

      {/* Header */}
      <header style={{ ...GLASS, position: "sticky", top: 0, zIndex: 20, padding: "clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 2.5rem)", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "none", borderLeft: "none", borderRight: "none", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(1.125rem, 3vw, 1.5rem)", fontWeight: 500, lineHeight: 1.1 }}>
          <span style={{ color: "var(--text)" }}>CAEX</span><br />
          <span style={GRAD_GOLD}>Pedidos</span>
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.6875rem", color: "var(--dim)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</span>
          <button onClick={toggleTheme} title={theme === "dark" ? "Modo claro" : "Modo oscuro"} style={{ width: 32, height: 32, borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface2)", border: "1px solid var(--border2)", color: "var(--muted)", cursor: "pointer" }}>
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={logout} style={{ width: 32, height: 32, borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 10, maxWidth: 900, margin: "0 auto", padding: "clamp(1rem, 3vw, 2rem)", display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* Stats — scroll horizontal en móvil */}
        <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "4px", WebkitOverflowScrolling: "touch" as "touch" }}>
          <StatCard icon={<Clock size={15} />}        label="Pendientes" value={totales.pendientes} color="#D4A840" delay={0}   />
          <StatCard icon={<CheckCircle2 size={15} />} label="Entregados" value={totales.entregados} color="#4A9B6A" delay={60}  />
          <StatCard icon={<Package size={15} />}      label="Ingresos"   value={fmt(totales.ingresos)} color="#C8A49F" delay={120} />
        </div>

        {/* Búsqueda */}
        <div style={{ position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--dim)", pointerEvents: "none" }} />
          <input type="text" placeholder="Buscar cliente, marca o referencia…" value={busqueda}
            onChange={e => setBusqueda(e.target.value)} className="inp" style={{ paddingLeft: "2.25rem" }} />
        </div>

        {/* Filtro + nuevo */}
        <div style={{ display: "flex", gap: "0.625rem" }}>
          <div style={{ flex: 1 }}>
            <Dropdown value={filtroEstado} options={ESTADO_OPTIONS} onChange={v => setFiltroEstado(v)} width="100%" />
          </div>
          <Link href="/nuevo" style={{
            display: "flex", alignItems: "center", gap: "0.375rem", padding: "0 1rem",
            borderRadius: "0.75rem", fontSize: "0.875rem", fontWeight: 500,
            background: "linear-gradient(135deg, #7A1820 0%, #A02030 100%)", color: "#FFFFFF",
            textDecoration: "none", whiteSpace: "nowrap", height: "42px",
            boxShadow: "0 0 20px rgba(122,24,32,0.30)",
          }}>
            <Plus size={15} /> Nuevo
          </Link>
        </div>

        {/* Lista */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--spin-bd)", borderTopColor: "var(--gold)", margin: "0 auto", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p style={{ fontSize: "2rem", opacity: 0.15, marginBottom: "0.5rem" }}>📦</p>
            <p style={{ fontSize: "0.875rem", color: "var(--dim)" }}>
              {busqueda || filtroEstado !== "todos" ? "Sin resultados." : "Aún no hay pedidos. ¡Registra el primero!"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {filtrados.map((p, i) => <PedidoCard key={p.id} p={p} i={i} onEstado={cambiarEstado} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function PedidoCard({ p, i, onEstado }: { p: Pedido; i: number; onEstado: (id: string, e: EstadoPedido) => void }) {
  const [hov, setHov] = useState(false);
  const badge = BADGE[p.estado];

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      ...GLASS, borderRadius: "1rem", padding: "1rem",
      animation: `fadein 0.45s cubic-bezier(0.23,1,0.32,1) ${i * 35}ms both`,
      transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)",
      transform: hov ? "translateY(-2px)" : "none",
    }}>
      {/* Fila 1: nombre + editar + precio */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.375rem" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 500, fontSize: "0.9375rem", color: "var(--text)" }}>{p.cliente}</span>
            {p.telefono && (
              <a href={`https://wa.me/57${p.telefono.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: "0.5625rem", padding: "0.125rem 0.4rem", borderRadius: 999, background: "var(--wa-bg)", color: "var(--wa-col)", border: "1px solid var(--wa-bd)", textDecoration: "none", fontWeight: 600 }}>
                WA
              </a>
            )}
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: "0.125rem" }}>
            {p.marca} · <span style={{ color: "var(--gold)" }}>{p.referencia}</span>
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1rem", fontWeight: 500, ...GRAD_GOLD }}>
            {fmt(p.precio_venta)}
          </span>
          <Link href={`/editar?id=${p.id}`} style={{ width: 28, height: 28, borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface2)", color: "var(--dim)", textDecoration: "none", flexShrink: 0 }}>
            <Pencil size={11} />
          </Link>
        </div>
      </div>

      {/* Fila 2: meta + estado */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.6875rem", color: "var(--dim)", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            {p.tipo_entrega === "domicilio" ? <Truck size={10} /> : <User size={10} />}
            {p.tipo_entrega === "domicilio" ? (p.direccion ?? "Sin dirección") : "Presencial"}
          </span>
          {p.vendedor && <span>{p.vendedor}</span>}
          <span>{fmtDate(p.created_at)}</span>
        </div>

        <div style={{ position: "relative", flexShrink: 0 }}>
          <Dropdown value={p.estado} options={[
            { value: "pendiente", label: "Pendiente" },
            { value: "entregado", label: "Entregado" },
            { value: "cancelado", label: "Cancelado" },
          ]} onChange={v => onEstado(p.id, v)} width="120px" />
          <div style={{ position: "absolute", inset: 0, borderRadius: "0.75rem", boxShadow: `0 0 12px ${badge.glow}`, pointerEvents: "none" }} />
        </div>
      </div>

      {p.notas && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", fontStyle: "italic", color: "rgba(232,224,208,0.30)", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.5rem" }}>
          "{p.notas}"
        </p>
      )}
    </div>
  );
}
