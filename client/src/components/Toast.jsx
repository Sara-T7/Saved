import { useState, useEffect } from "react";

let toastListener = null;

export const notify = (message, type = "info") => {
  if (toastListener) toastListener({ id: Date.now(), message, type });
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastListener = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3500);
    };
    return () => { toastListener = null; };
  }, []);

  if (!toasts.length) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      pointerEvents: "none"
    }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            pointerEvents: "auto",
            padding: "10px 16px",
            borderRadius: "var(--radius-sm, 6px)",
            background: t.type === "error" ? "#ef4444" : t.type === "success" ? "#10b981" : "#6366f1",
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 500,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <span>{t.type === "error" ? "❌" : t.type === "success" ? "✓" : "ℹ"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
