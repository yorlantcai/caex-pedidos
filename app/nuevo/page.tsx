"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { TipoEntrega } from "@/lib/database.types";
import { ArrowLeft, Save } from "lucide-react";

const PERFUMES: string[] = [
  "212 VIP Black", "Acqua di Giò", "Bleu de Chanel", "Sauvage",
  "La Vie Est Belle", "Idôle", "Good Girl", "Black Orchid",
  "Noir Absolu", "Rose Éternelle",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in">
      <p className="text-[10px] tracking-[0.3em] uppercase font-medium gradient-gold inline-block">
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--dim)" }}>{label}</label>
      {children}
    </div>
  );
}

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const [form, setForm] = useState({
    cliente:      "",
    telefono:     "",
    marca:        "CAEX Parfum",
    referencia:   "",
    tipo_entrega: "presencial" as TipoEntrega,
    direccion:    "",
    precio_venta: "",
    vendedor:     "",
    notas:        "",
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
      {/* Orbe fondo */}
      <div style={{
        position: "fixed", bottom: "-15%", left: "-10%", width: 500, height: 500,
        borderRadius: "50%", pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(circle, rgba(122,24,32,0.08) 0%, transparent 70%)",
        animation: "float-orb2 20s ease-in-out infinite",
      }} />

      <header className="glass sticky top-0 z-20 px-6 py-4 flex items-center gap-4"
        style={{ borderBottom: "1px solid var(--border)", borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <Link href="/dashboard"
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-60"
          style={{ background: "var(--surface2)", color: "var(--muted)" }}>
          <ArrowLeft size={15} />
        </Link>
        <h1 className="font-display text-lg">
          <span style={{ color: "var(--text)" }}>Nuevo </span>
          <span className="gradient-gold">pedido</span>
        </h1>
      </header>

      <main className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-4">

          <Section title="Cliente">
            <Field label="Nombre *">
              <input className="input-base" required placeholder="Ej: María García"
                value={form.cliente} onChange={set("cliente")} />
            </Field>
            <Field label="Teléfono / WhatsApp">
              <input className="input-base" type="tel" placeholder="3001234567"
                value={form.telefono} onChange={set("telefono")} />
            </Field>
          </Section>

          <Section title="Producto">
            <Field label="Marca">
              <input className="input-base" placeholder="CAEX Parfum"
                value={form.marca} onChange={set("marca")} />
            </Field>
            <Field label="Referencia / Nombre *">
              <input className="input-base" required placeholder="Ej: Noir Absolu"
                list="perfumes-list" value={form.referencia} onChange={set("referencia")} />
              <datalist id="perfumes-list">
                {PERFUMES.map(s => <option key={s} value={s} />)}
              </datalist>
            </Field>
            <Field label="Precio de venta (COP) *">
              <input className="input-base" required type="number" min="0" step="1000"
                placeholder="140000" value={form.precio_venta} onChange={set("precio_venta")} />
            </Field>
          </Section>

          <Section title="Entrega">
            <Field label="Tipo de entrega">
              <div className="grid grid-cols-2 gap-3">
                {(["presencial", "domicilio"] as TipoEntrega[]).map(t => (
                  <button key={t} type="button"
                    onClick={() => setForm(p => ({ ...p, tipo_entrega: t }))}
                    className="py-3 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: form.tipo_entrega === t
                        ? "linear-gradient(135deg, var(--accent2) 0%, var(--accent3) 100%)"
                        : "var(--surface2)",
                      color:      form.tipo_entrega === t ? "var(--text)" : "var(--muted)",
                      border:     `1px solid ${form.tipo_entrega === t ? "var(--accent3)" : "var(--border)"}`,
                      boxShadow:  form.tipo_entrega === t ? "0 4px 20px rgba(122,24,32,0.3)" : "none",
                    }}>
                    {t === "presencial" ? "🤝 Presencial" : "🚗 A domicilio"}
                  </button>
                ))}
              </div>
            </Field>
            {form.tipo_entrega === "domicilio" && (
              <Field label="Dirección">
                <input className="input-base" placeholder="Calle 45 #23-10, Barranquilla"
                  value={form.direccion} onChange={set("direccion")} />
              </Field>
            )}
          </Section>

          <Section title="Extras">
            <Field label="Vendedor (socio)">
              <input className="input-base" placeholder="Tu nombre"
                value={form.vendedor} onChange={set("vendedor")} />
            </Field>
            <Field label="Notas adicionales">
              <textarea className="input-base resize-none" rows={3}
                placeholder="Detalles extra del pedido…"
                value={form.notas} onChange={set("notas")} />
            </Field>
          </Section>

          {error && (
            <p className="text-xs text-center py-2.5 rounded-xl"
              style={{ color: "var(--gold)", background: "rgba(200,164,159,0.08)", border: "1px solid rgba(200,164,159,0.15)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={saving}
            className="glow-red w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium tracking-wider transition-all hover:opacity-85 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, var(--accent2) 0%, var(--accent3) 100%)", color: "var(--text)" }}>
            <Save size={15} />
            {saving ? "Guardando…" : "Guardar pedido"}
          </button>
        </form>
      </main>
    </div>
  );
}
