"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  width?: string;
}

export default function Dropdown<T extends string>({ value, options, onChange, width = "160px" }: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative", width }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          padding: "0.625rem 0.875rem",
          borderRadius: "0.75rem",
          fontSize: "0.8125rem",
          background: "var(--surface)",
          border: "1px solid var(--border2)",
          color: "var(--text)",
          cursor: "pointer",
          transition: "border-color 0.2s, background 0.2s",
          backdropFilter: "blur(8px)",
        }}
      >
        <span>{selected?.label ?? ""}</span>
        <ChevronDown
          size={13}
          style={{
            color: "var(--dim)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          width: "100%",
          borderRadius: "0.75rem",
          overflow: "hidden",
          background: "var(--bg)",
          backdropFilter: "blur(24px)",
          border: "1px solid var(--border2)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          zIndex: 50,
          animation: "fade-in 0.15s ease both",
        }}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.625rem 0.875rem",
                fontSize: "0.8125rem",
                color: opt.value === value ? "var(--gg2)" : "var(--muted)",
                background: opt.value === value ? "var(--surface2)" : "transparent",
                border: "none",
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={e => { if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = "var(--surface)"; }}
              onMouseLeave={e => { if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {opt.label}
              {opt.value === value && <Check size={11} style={{ color: "var(--gg2)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
