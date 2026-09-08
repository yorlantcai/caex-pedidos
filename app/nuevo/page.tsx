"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { TipoEntrega } from "@/lib/database.types";
import { ArrowLeft, Save } from "lucide-react";

const PERFUMES_SUGERIDOS = [
  "212 VIP Black", "Acqua di Giò", "Bleu de Chanel", "Sauvage",
  "La Vie Est Belle", "Idôle", "Good Girl", "Black Orchid",
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--dim)" }}>{label}</label>
      {children}
    </div>
  );
}

const INPUT = "w-full px-3 py-2.5 rounded-lg text-sm outline-none";
const INPUT_STYLE = { background: "var(--surface)", border: "1px solid var(--border2)", color: "var(--text)" };

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const [form, setForm] = useState({
    cliente:       "",
    telefono:      "",
    marca:         "CAEX Parfum",
    referencia:    "",
    tipo_entrega:  "presencial" as TipoEntrega,
    direccion:     "",
    precio_venta:  "",
    vendedor:      "",
    notas:         "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace("/login"); return; }

    if (!form.cliente.trim() || !form.referencia.trim() || !form.precio_venta) {
      setError("Cliente, referencia y precio son obligatorios."); return;
    }

    setSaving(true);
    const { error } = await supabase.from("pedidos").insert({
      cliente:      form.cliente.trim(),
      telefono:     form.telefono.trim() || null,
      marca:        form.marca.trim(),
      referencia:   form.referencia.trim(),
      tipo_entrega: form.tipo_entrega,
      direccion:    form.tipo_entrega === "domicilio" ? (form.direccion.trim() || null) : null,
      precio_venta: Number(form.precio_venta),
      vendedor:     form.vendedor.trim() || null,
      notas:        form.notas.trim() || null,
      estado:       "pendiente",
    });

    setSaving(false);
    if (error) { setError("Error al guardar. Intenta de nuevo."); return; }
    router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <header className="sticky top-0 z-10 border-b px-6 py-4 flex items-center gap-4"
        style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
        <Link href="/dashboard" style={{ color: "var(--dim)" }} className="hover:opacity-70 transition-opacity">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-lg font-light tracking-widest" style={{ color: "var(--text)" }}>
          Nuevo pedido
        </h1>
      </header>

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Datos del cliente */}
          <div className="rounded-xl p-5 space-y-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-xs tracking-wider uppercase font-medium" style={{ color: "var(--gold)" }}>
              Cliente
            </p>
            <Field label="Nombre *">
              <input className={INPUT} style={INPUT_STYLE} required placeholder="Ej: María García"
                value={form.cliente} onChange={set("cliente")} />
            </Field>
            <Field label="Teléfono / WhatsApp">
              <input className={INPUT} style={INPUT_STYLE} placeholder="3001234567" type="tel"
                value={form.telefono} onChange={set("telefono")} />
            </Field>
          </div>

          {/* Producto */}
          <div className="rounded-xl p-5 space-y-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-xs tracking-wider uppercase font-medium" style={{ color: "var(--gold)" }}>
              Producto
            </p>
            <Field label="Marca">
              <input className={INPUT} style={INPUT_STYLE} placeholder="CAEX Parfum"
                value={form.marca} onChange={set("marca")} />
            </Field>
            <Field label="Referencia / Nombre *">
              <input className={INPUT} style={INPUT_STYLE} required placeholder="Ej: Noir Absolu"
                list="sugerencias" value={form.referencia} onChange={set("referencia")} />
              <datalist id="sugerencias">
                {PERFUMES_SUGERIDOS.map(s => <option key={s} value={s} />)}
              </datalist>
            </Field>
            <Field label="Precio de venta (COP) *">
              <input className={INPUT} style={INPUT_STYLE} required type="number" min="0" step="1000"
                placeholder="140000" value={form.precio_venta} onChange={set("precio_venta")} />
            </Field>
          </div>

          {/* Entrega */}
          <div className="rounded-xl p-5 space-y-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-xs tracking-wider uppercase font-medium" style={{ color: "var(--gold)" }}>
              Entrega
            </p>
            <Field label="Tipo de entrega">
              <div className="flex gap-3">
                {(["presencial", "domicilio"] as TipoEntrega[]).map(t => (
                  <button key={t} type="button"
                    onClick={() => setForm(p => ({ ...p, tipo_entrega: t }))}
                    className="flex-1 py-2.5 rounded-lg text-xs font-medium capitalize transition-all"
                    style={{
                      background:  form.tipo_entrega === t ? "var(--accent2)" : "var(--bg2)",
                      color:       form.tipo_entrega === t ? "var(--text)" : "var(--muted)",
                      border:      `1px solid ${form.tipo_entrega === t ? "var(--accent2)" : "var(--border)"}`,
                    }}>
                    {t === "presencial" ? "🤝 Presencial" : "🚗 A domicilio"}
                  </button>
                ))}
              </div>
            </Field>

            {form.tipo_entrega === "domicilio" && (
              <Field label="Dirección">
                <input className={INPUT} style={INPUT_STYLE} placeholder="Calle 45 #23-10, Barranquilla"
                  value={form.direccion} onChange={set("direccion")} />
              </Field>
            )}
          </div>

          {/* Extra */}
          <div className="rounded-xl p-5 space-y-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-xs tracking-wider uppercase font-medium" style={{ color: "var(--gold)" }}>
              Extras
            </p>
            <Field label="Vendedor (socio)">
              <input className={INPUT} style={INPUT_STYLE} placeholder="Tu nombre"
                value={form.vendedor} onChange={set("vendedor")} />
            </Field>
            <Field label="Notas adicionales">
              <textarea className={INPUT} style={INPUT_STYLE} rows={3}
                placeholder="Cualquier detalle extra del pedido…"
                value={form.notas} onChange={set("notas")} />
            </Field>
          </div>

          {error && <p className="text-xs text-center" style={{ color: "#C8A49F" }}>{error}</p>}

          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
            style={{ background: "var(--accent2)", color: "var(--text)" }}>
            <Save size={15} />
            {saving ? "Guardando…" : "Guardar pedido"}
          </button>
        </form>
      </main>
    </div>
  );
}
