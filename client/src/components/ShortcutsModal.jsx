function ShortcutsModal({ onClose }) {
  const shortcuts = [
    { key: "Ctrl + B", description: "Toggle Bold" },
    { key: "Ctrl + I", description: "Toggle Italic" },
    { key: "Ctrl + U", description: "Toggle Underline" },
    { key: "Ctrl + Shift + S", description: "Toggle Strikethrough" },
    { key: "Ctrl + Alt + 1", description: "Heading 1" },
    { key: "Ctrl + Alt + 2", description: "Heading 2" },
    { key: "Ctrl + Alt + 3", description: "Heading 3" },
    { key: "Ctrl + Shift + 8", description: "Bullet List" },
    { key: "Ctrl + Shift + 7", description: "Numbered List" },
    { key: "Ctrl + Z", description: "Undo" },
    { key: "Ctrl + Y", description: "Redo" },
    { key: "Ctrl + F", description: "Find in Document" },
    { key: "Ctrl + /", description: "Toggle Shortcuts Helper" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h3 className="modal-title">⌨️ Keyboard Shortcuts</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                <th style={{ padding: "8px 12px", color: "var(--text-muted)" }}>Shortcut</th>
                <th style={{ padding: "8px 12px", color: "var(--text-muted)" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {shortcuts.map((s, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px 12px", fontFamily: "monospace", fontWeight: 600, color: "var(--accent)" }}>
                    <kbd style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      padding: "2px 6px",
                      fontSize: 12
                    }}>
                      {s.key}
                    </kbd>
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-primary)" }}>{s.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ShortcutsModal;
