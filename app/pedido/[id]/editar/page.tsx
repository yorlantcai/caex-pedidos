"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { TipoEntrega } from "@/lib/database.types";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.10)",
};

const GRAD_GOLD: React.CSSProperties = {
  display: "inline-block",
  background: "linear-gradient(135deg, #D8C4AC 0%, #C8A49F 50%, #A07868 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const PERFUMES = [
  "212 VIP Black", "Acqua di Giò", "Bleu de Chanel", "Sauvage",
  "La Vie Est Belle", "Idôle", "Good Girl", "Black Orchid",
  "Noir Absolu", "Rose Éternelle",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...GLASS, borderRadius: "1rem", padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <p style={{ fontSize: "0.625rem", letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 500, ...GRAD_GOLD }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <label style={{ fontSize: "0.625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--dim)" }}>{label}</label>
      {children}
    </div>
  );
}

export default function EditarPedidoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [saving,   setSaving]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState<string | null>(null);
  const [form, setForm] = useState({
    cliente:      "",
    telefono:     "",
    marca:        "",
    referencia:   "",
    tipo_entrega: "presencial" as TipoEntrega,
    direccion:    "",
    precio_venta: "",
    vendedor:     "",
    notas:        "",
  });

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }
      const { data } = await supabase.from("pedidos").select("*").eq("id", id).single();
      if (!data) { router.replace("/dashboard"); return; }
      setForm({
        cliente:      data.cliente,
        telefono:     data.telefono ?? "",
        marca:        data.marca,
        referencia:   data.referencia,
        tipo_entrega: data.tipo_entrega as TipoEntrega,
        direccion:    data.direccion ?? "",
        precio_venta: String(data.precio_venta),
        vendedor:     data.vendedor ?? "",
        notas:        data.notas ?? "",
      });
      setLoading(false);
    })();
  }, [id, router]);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.cliente.trim() || !form.referencia.trim() || !form.precio_venta) {
      setError("Cliente, referencia y precio son obligatorios."); return;
    }
    setSaving(true);
    const { error } = await supabase.from("pedidos").update({
      cliente:      form.cliente.trim(),
      telefono:     form.telefono.trim() || null,
      marca:        form.marca.trim(),
      referencia:   form.referencia.trim(),
      tipo_entrega: form.tipo_entrega,
      direccion:    form.tipo_entrega === "domicilio" ? (form.direccion.trim() || null) : null,
      precio_venta: Number(form.precio_venta),
      vendedor:     form.vendedor.trim() || null,
      notas:        form.notas.trim() || null,
    }).eq("id", id);
    setSaving(false);
    if (error) { setError("Error al guardar. Intenta de nuevo."); return; }
    router.replace("/dashboard");
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este pedido? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    await supabase.from("pedidos").delete().eq("id", id);
    router.replace("/dashboard");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.10)", borderTopColor: "#C8A49F", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ position: "fixed", top: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", pointerEvents: "none", zIndex: 0, background: "radial-gradient(circle, rgba(77,14,19,0.09) 0%, transparent 70%)" }} />

      <header style={{ ...GLASS, position: "sticky", top: 0, zIndex: 20, padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "none", borderLeft: "none", borderRight: "none", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/dashboard" style={{ width: 32, height: 32, borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.07)", color: "var(--muted)", textDecoration: "none" }}>
            <ArrowLeft size={15} />
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.125rem", fontWeight: 500 }}>
            <span style={{ color: "var(--text)" }}>Editar </span>
            <span style={GRAD_GOLD}>pedido</span>
          </h1>
        </div>

        <button onClick={handleDelete} disabled={deleting} style={{
          display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem",
          color: "#C05050", background: "rgba(192,80,80,0.08)", border: "1px solid rgba(192,80,80,0.20)",
          padding: "0.375rem 0.75rem", borderRadius: "0.625rem", cursor: "pointer", opacity: deleting ? 0.5 : 1,
        }}>
          <Trash2 size={13} /> Eliminar
        </button>
      </header>

      <main style={{ position: "relative", zIndex: 10, maxWidth: 560, margin: "0 auto", padding: "2rem 1rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          <Section title="Cliente">
            <Field label="Nombre *">
              <input className="inp" required placeholder="Ej: María García" value={form.cliente} onChange={set("cliente")} />
            </Field>
            <Field label="Teléfono / WhatsApp">
              <input className="inp" type="tel" placeholder="3001234567" value={form.telefono} onChange={set("telefono")} />
            </Field>
          </Section>

          <Section title="Producto">
            <Field label="Marca">
              <input className="inp" placeholder="CAEX Parfum" value={form.marca} onChange={set("marca")} />
            </Field>
            <Field label="Referencia / Nombre *">
              <input className="inp" required placeholder="Ej: Noir Absolu" list="perfumes-list" value={form.referencia} onChange={set("referencia")} />
              <datalist id="perfumes-list">{PERFUMES.map(s => <option key={s} value={s} />)}</datalist>
            </Field>
            <Field label="Precio de venta (COP) *">
              <input className="inp" required type="number" min="0" step="1000" placeholder="140000" value={form.precio_venta} onChange={set("precio_venta")} />
            </Field>
          </Section>

          <Section title="Entrega">
            <Field label="Tipo de entrega">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {(["presencial", "domicilio"] as TipoEntrega[]).map(t => {
                  const active = form.tipo_entrega === t;
                  return (
                    <button key={t} type="button" onClick={() => setForm(p => ({ ...p, tipo_entrega: t }))} style={{
                      padding: "0.75rem", borderRadius: "0.75rem", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer",
                      background: active ? "linear-gradient(135deg, #7A1820 0%, #A02030 100%)" : "rgba(255,255,255,0.05)",
                      color: active ? "#E8E0D0" : "var(--muted)",
                      border: `1px solid ${active ? "#A02030" : "rgba(255,255,255,0.10)"}`,
                      boxShadow: active ? "0 4px 20px rgba(122,24,32,0.35)" : "none",
                      transition: "all 0.2s",
                    }}>
                      {t === "presencial" ? "🤝 Presencial" : "🚗 A domicilio"}
                    </button>
                  );
                })}
              </div>
            </Field>
            {form.tipo_entrega === "domicilio" && (
              <Field label="Dirección">
                <input className="inp" placeholder="Calle 45 #23-10, Barranquilla" value={form.direccion} onChange={set("direccion")} />
              </Field>
            )}
          </Section>

          <Section title="Extras">
            <Field label="Vendedor (socio)">
              <input className="inp" placeholder="Tu nombre" value={form.vendedor} onChange={set("vendedor")} />
            </Field>
            <Field label="Notas adicionales">
              <textarea className="inp" rows={3} placeholder="Detalles extra…" value={form.notas} onChange={set("notas")} style={{ resize: "none" }} />
            </Field>
          </Section>

          {error && (
            <p style={{ fontSize: "0.75rem", textAlign: "center", padding: "0.625rem", borderRadius: "0.75rem", color: "#C8A49F", background: "rgba(200,164,159,0.08)", border: "1px solid rgba(200,164,159,0.15)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={saving} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            padding: "0.875rem", borderRadius: "0.75rem", fontSize: "0.875rem", fontWeight: 500, letterSpacing: "0.08em",
            background: "linear-gradient(135deg, #7A1820 0%, #A02030 100%)", color: "#E8E0D0",
            border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.5 : 1,
            boxShadow: "0 0 30px rgba(122,24,32,0.35)",
          }}>
            <Save size={15} />
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      </main>
    </div>
  );
}
