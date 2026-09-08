"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Pedido, EstadoPedido } from "@/lib/database.types";
import {
  Plus, LogOut, Package, Truck, User,
  CheckCircle2, Clock, XCircle, Search, ChevronDown
} from "lucide-react";

const ESTADOS: { value: EstadoPedido | "todos"; label: string }[] = [
  { value: "todos",      label: "Todos"       },
  { value: "pendiente",  label: "Pendientes"  },
  { value: "entregado",  label: "Entregados"  },
  { value: "cancelado",  label: "Cancelados"  },
];

const BADGE: Record<EstadoPedido, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "var(--yellow)" },
  entregado: { label: "Entregado", color: "var(--green)"  },
  cancelado: { label: "Cancelado", color: "var(--red)"    },
};

function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DashboardPage() {
  const router  = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | "todos">("todos");
  const [busqueda, setBusqueda] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace("/login"); return; }
    setUserEmail(session.user.email ?? "");

    const { data } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });
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
      {/* Header */}
      <header className="sticky top-0 z-10 border-b px-6 py-4 flex items-center justify-between"
        style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
        <h1 className="text-lg font-light tracking-widest" style={{ color: "var(--text)" }}>
          CAEX <span style={{ color: "var(--gold)" }}>Pedidos</span>
        </h1>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-xs" style={{ color: "var(--dim)" }}>{userEmail}</span>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
            style={{ color: "var(--muted)" }}>
            <LogOut size={13} /> Salir
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { icon: <Clock size={16} />, label: "Pendientes", value: totales.pendientes, color: "var(--yellow)" },
            { icon: <CheckCircle2 size={16} />, label: "Entregados", value: totales.entregados, color: "var(--green)" },
            { icon: <Package size={16} />, label: "Ingresos", value: fmt(totales.ingresos), color: "var(--gold)" },
          ].map(card => (
            <div key={card.label} className="rounded-xl p-4 space-y-2"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div style={{ color: card.color }}>{card.icon}</div>
              <p className="text-xl font-light" style={{ color: "var(--text)" }}>{card.value}</p>
              <p className="text-[10px] tracking-wider uppercase" style={{ color: "var(--dim)" }}>{card.label}</p>
            </div>
          ))}
        </div>

        {/* Filtros + botón nuevo */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--dim)" }} />
            <input
              type="text"
              placeholder="Buscar cliente, marca o referencia…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface)", border: "1px solid var(--border2)", color: "var(--text)" }}
            />
          </div>

          {/* Filtro estado */}
          <div className="relative">
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value as EstadoPedido | "todos")}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface)", border: "1px solid var(--border2)", color: "var(--text)" }}
            >
              {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--dim)" }} />
          </div>

          {/* Nuevo pedido */}
          <Link href="/nuevo"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: "var(--accent2)", color: "var(--text)" }}>
            <Plus size={15} /> Nuevo pedido
          </Link>
        </div>

        {/* Lista de pedidos */}
        {loading ? (
          <p className="text-center text-sm py-16" style={{ color: "var(--dim)" }}>Cargando…</p>
        ) : filtrados.length === 0 ? (
          <p className="text-center text-sm py-16" style={{ color: "var(--dim)" }}>
            {busqueda || filtroEstado !== "todos" ? "Sin resultados." : "Aún no hay pedidos. ¡Registra el primero!"}
          </p>
        ) : (
          <div className="space-y-3">
            {filtrados.map(p => (
              <div key={p.id} className="rounded-xl p-4 sm:p-5 space-y-3"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm" style={{ color: "var(--text)" }}>{p.cliente}</span>
                      {p.telefono && (
                        <a href={`https://wa.me/57${p.telefono.replace(/\D/g,"")}`} target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] px-2 py-0.5 rounded-full transition-opacity hover:opacity-70"
                          style={{ background: "rgba(61,107,79,0.25)", color: "#6DBF8A" }}>
                          WhatsApp
                        </a>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      {p.marca} · {p.referencia}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium" style={{ color: "var(--gold)" }}>
                      {fmt(p.precio_venta)}
                    </span>
                    {/* Badge estado */}
                    <select
                      value={p.estado}
                      onChange={e => cambiarEstado(p.id, e.target.value as EstadoPedido)}
                      className="text-[10px] px-2 py-1 rounded-full appearance-none outline-none font-medium cursor-pointer"
                      style={{
                        background: `${BADGE[p.estado].color}22`,
                        color:       BADGE[p.estado].color,
                        border:     `1px solid ${BADGE[p.estado].color}44`,
                      }}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs" style={{ color: "var(--dim)" }}>
                  <span className="flex items-center gap-1.5">
                    {p.tipo_entrega === "domicilio" ? <Truck size={11} /> : <User size={11} />}
                    {p.tipo_entrega === "domicilio" ? (p.direccion ?? "Sin dirección") : "Presencial"}
                  </span>
                  {p.vendedor && <span>Vendedor: {p.vendedor}</span>}
                  <span>{fmtDate(p.created_at)}</span>
                </div>

                {p.notas && (
                  <p className="text-xs italic" style={{ color: "var(--muted)" }}>"{p.notas}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
