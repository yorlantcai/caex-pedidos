"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Pedido, EstadoPedido } from "@/lib/database.types";
import Dropdown from "@/components/ui/Dropdown";
import {
  Plus, LogOut, Package, Truck, User,
  CheckCircle2, Clock, XCircle, Search,
} from "lucide-react";

type FiltroEstado = EstadoPedido | "todos";

const ESTADO_OPTIONS: { value: FiltroEstado; label: string }[] = [
  { value: "todos",     label: "Todos los pedidos" },
  { value: "pendiente", label: "Pendientes"         },
  { value: "entregado", label: "Entregados"         },
  { value: "cancelado", label: "Cancelados"         },
];

const ESTADO_CHANGE_OPTIONS: { value: EstadoPedido; label: string }[] = [
  { value: "pendiente", label: "Pendiente"  },
  { value: "entregado", label: "Entregado"  },
  { value: "cancelado", label: "Cancelado"  },
];

const BADGE: Record<EstadoPedido, { label: string; color: string; bg: string; glow: string }> = {
  pendiente: { label: "Pendiente", color: "var(--yellow3)", bg: "rgba(139,112,48,0.15)",  glow: "rgba(212,168,64,0.15)"  },
  entregado: { label: "Entregado", color: "var(--green2)",  bg: "rgba(45,90,61,0.20)",    glow: "rgba(74,155,106,0.15)"  },
  cancelado: { label: "Cancelado", color: "var(--red3)",    bg: "rgba(122,32,32,0.20)",   glow: "rgba(192,80,80,0.15)"   },
};

function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function StatCard({ icon, label, value, color, delay = 0 }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; delay?: number;
}) {
  return (
    <div className="card-3d glass rounded-2xl p-5 space-y-3 animate-fade-in"
      style={{ animationDelay: `${delay}ms`, boxShadow: `0 8px 32px rgba(0,0,0,0.3)` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${color}22`, color }}>
        {icon}
      </div>
      <p className="text-2xl font-display font-medium" style={{ color: "var(--text)" }}>{value}</p>
      <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: "var(--dim)" }}>{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
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

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const cambiarEstado = async (id: string, estado: EstadoPedido) => {
    await supabase.from("pedidos").update({ estado }).eq("id", id);
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado } : p));
  };

  const filtrados = pedidos.filter(p => {
    const matchEstado = filtroEstado === "todos" || p.estado === filtroEstado;
    const q = busqueda.toLowerCase();
    const matchBusq = !q || p.cliente.toLowerCase().includes(q)
      || p.referencia.toLowerCase().includes(q)
      || p.marca.toLowerCase().includes(q);
    return matchEstado && matchBusq;
  });

  const totales = {
    pendientes: pedidos.filter(p => p.estado === "pendiente").length,
    entregados: pedidos.filter(p => p.estado === "entregado").length,
    ingresos:   pedidos.filter(p => p.estado === "entregado").reduce((s, p) => s + p.precio_venta, 0),
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Orbe de fondo sutil */}
      <div style={{
        position: "fixed", top: "-20%", right: "-10%", width: 600, height: 600,
        borderRadius: "50%", pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(circle, rgba(77,14,19,0.08) 0%, transparent 70%)",
      }} />

      {/* Header */}
      <header className="glass sticky top-0 z-20 px-6 lg:px-10 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)", borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <h1 className="font-display text-xl font-medium">
          <span style={{ color: "var(--text)" }}>CAEX </span>
          <span className="gradient-gold">Pedidos</span>
        </h1>
        <div className="flex items-center gap-5">
          <span className="hidden sm:block text-xs" style={{ color: "var(--dim)" }}>{userEmail}</span>
          <button onClick={logout}
            className="flex items-center gap-1.5 text-xs transition-all hover:opacity-60"
            style={{ color: "var(--muted)" }}>
            <LogOut size={13} /> Salir
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Tarjetas */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={<Clock size={16} />}        label="Pendientes" value={totales.pendientes} color="var(--yellow3)" delay={0}   />
          <StatCard icon={<CheckCircle2 size={16} />} label="Entregados" value={totales.entregados} color="var(--green2)"  delay={80}  />
          <StatCard icon={<Package size={16} />}      label="Ingresos"   value={fmt(totales.ingresos)} color="var(--gold)" delay={160} />
        </div>

        {/* Filtros + nuevo */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--dim)" }} />
            <input
              type="text"
              placeholder="Buscar cliente, marca o referencia…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="input-base pl-9"
            />
          </div>

          <Dropdown
            value={filtroEstado}
            options={ESTADO_OPTIONS}
            onChange={v => setFiltroEstado(v)}
            width="200px"
          />

          <Link href="/nuevo"
            className="glow-red flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium tracking-wide transition-all hover:opacity-85 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, var(--accent2) 0%, var(--accent3) 100%)", color: "var(--text)" }}>
            <Plus size={15} /> Nuevo pedido
          </Link>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-8 h-8 rounded-full border-2 mx-auto animate-spin"
              style={{ borderColor: "var(--border2)", borderTopColor: "var(--gold)" }} />
            <p className="text-sm" style={{ color: "var(--dim)" }}>Cargando pedidos…</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-20 space-y-2">
            <p className="text-2xl opacity-20">📦</p>
            <p className="text-sm" style={{ color: "var(--dim)" }}>
              {busqueda || filtroEstado !== "todos" ? "Sin resultados para esa búsqueda." : "Aún no hay pedidos. ¡Registra el primero!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map((p, i) => {
              const badge = BADGE[p.estado];
              return (
                <div key={p.id}
                  className="card-3d glass rounded-2xl p-5 animate-fade-in"
                  style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    {/* Info principal */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm" style={{ color: "var(--text)" }}>{p.cliente}</span>
                        {p.telefono && (
                          <a href={`https://wa.me/57${p.telefono.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium transition-opacity hover:opacity-70"
                            style={{ background: "rgba(74,155,106,0.18)", color: "var(--green2)", border: "1px solid rgba(74,155,106,0.25)" }}>
                            WA
                          </a>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {p.marca} · <span style={{ color: "var(--gold)" }}>{p.referencia}</span>
                      </p>
                    </div>

                    {/* Precio + estado */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-display text-base font-medium gradient-gold">{fmt(p.precio_venta)}</span>

                      <div style={{ position: "relative" }}>
                        <Dropdown
                          value={p.estado}
                          options={ESTADO_CHANGE_OPTIONS}
                          onChange={v => cambiarEstado(p.id, v)}
                          width="130px"
                        />
                        {/* glow del estado */}
                        <div style={{
                          position: "absolute", inset: 0, borderRadius: "0.75rem",
                          boxShadow: `0 0 12px ${badge.glow}`,
                          pointerEvents: "none",
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs" style={{ color: "var(--dim)" }}>
                    <span className="flex items-center gap-1.5">
                      {p.tipo_entrega === "domicilio" ? <Truck size={11} /> : <User size={11} />}
                      {p.tipo_entrega === "domicilio" ? (p.direccion ?? "Sin dirección") : "Presencial"}
                    </span>
                    {p.vendedor && <span>Vendedor: <span style={{ color: "var(--muted)" }}>{p.vendedor}</span></span>}
                    <span>{fmtDate(p.created_at)}</span>
                  </div>

                  {p.notas && (
                    <p className="mt-2 text-xs italic" style={{ color: "rgba(232,224,208,0.35)" }}>
                      "{p.notas}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
