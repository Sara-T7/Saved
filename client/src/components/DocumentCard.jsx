import { useState, useRef, useEffect } from "react";
import "./DocumentCard.css";

function DocumentCard({ document, currentUserId, onOpen, onDelete, onDuplicate, onRename, onShare }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  const isOwner = document.owner_id === currentUserId;
  const permission = isOwner ? "owner" : (document.permission || document.access);

  const permissionBadge = permission === "owner" ? { label: "Owner", cls: "badge-owner" }
    : permission === "editor" ? { label: "Editor", cls: "badge-editor" }
    : permission === "commenter" ? { label: "Commenter", cls: "badge-commenter" }
    : { label: "Viewer", cls: "badge-viewer" };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
  };

  const preview = document.content
    ? document.content.replace(/<[^>]+>/g, "").slice(0, 80) || "No content"
    : "Empty document";

  const docColor = `hsl(${(document.id * 47) % 360}, 60%, 50%)`;

  return (
    <div className="doc-card" onClick={() => onOpen(document.id)}>
      <div className="doc-card-thumb" style={{ background: `linear-gradient(135deg, ${docColor}25, ${docColor}10)` }}>
        <div className="doc-card-icon" style={{ color: docColor }}>📄</div>
      </div>

      <div className="doc-card-body">
        <div className="doc-card-top">
          <h3 className="doc-card-title">{document.title || "Untitled"}</h3>
          <div className="doc-card-menu-wrap" ref={menuRef}>
            <button
              className="doc-card-menu-btn"
              onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
              id={`menu-${document.id}`}
            >
              ⋮
            </button>
            {menuOpen && (
              <div className="doc-card-menu" onClick={e => e.stopPropagation()}>
                <button onClick={() => { onOpen(document.id); setMenuOpen(false); }}>
                  <span>📂</span> Open
                </button>
                {isOwner && (
                  <>
                    <button onClick={() => { onRename(document.id, document.title); setMenuOpen(false); }}>
                      <span>✏️</span> Rename
                    </button>
                    <button onClick={() => { onShare(document.id); setMenuOpen(false); }}>
                      <span>🔗</span> Share
                    </button>
                  </>
                )}
                <button onClick={() => { onDuplicate(document.id); setMenuOpen(false); }}>
                  <span>📋</span> Duplicate
                </button>
                {isOwner && (
                  <button className="danger" onClick={() => { onDelete(document.id); setMenuOpen(false); }}>
                    <span>🗑️</span> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="doc-card-preview">{preview}</p>

        <div className="doc-card-footer">
          <span className={`badge ${permissionBadge.cls}`}>{permissionBadge.label}</span>
          <div className="doc-card-meta">
            <div className="avatar avatar-sm" style={{ background: document.owner_color || "#6366f1" }}>
              {document.owner_name?.[0]?.toUpperCase() || "?"}
            </div>
            <span className="doc-card-date">{formatDate(document.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentCard;