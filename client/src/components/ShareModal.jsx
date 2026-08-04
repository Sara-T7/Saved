import { useState, useEffect } from "react";
import api from "../services/api";

function ShareModal({ docId, onClose }) {
  const [shares, setShares] = useState([]);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("editor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchShares();
  }, [docId]);

  const fetchShares = async () => {
    try {
      const res = await api.get(`/sharing/${docId}`);
      setShares(res.data);
    } catch {}
  };

  const handleShare = async () => {
    setError(""); setSuccess("");
    if (!email.trim()) return setError("Please enter an email");
    setLoading(true);
    try {
      await api.post(`/sharing/${docId}`, { email: email.trim(), permission });
      setSuccess(`Shared with ${email}`);
      setEmail("");
      fetchShares();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to share");
    } finally { setLoading(false); }
  };

  const updatePermission = async (shareId, newPerm) => {
    try {
      await api.put(`/sharing/share/${shareId}`, { permission: newPerm });
      fetchShares();
    } catch {}
  };

  const removeShare = async (shareId) => {
    try {
      await api.delete(`/sharing/share/${shareId}`);
      fetchShares();
    } catch {}
  };

  const initials = (name) => name?.[0]?.toUpperCase() || "?";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3 className="modal-title">🔗 Share Document</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {/* Invite section */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              id="share-email"
              className="form-input"
              placeholder="Invite by email..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleShare()}
              style={{ flex: 1 }}
            />
            <select
              className="form-input"
              value={permission}
              onChange={e => setPermission(e.target.value)}
              style={{ width: 130 }}
            >
              <option value="editor">Editor</option>
              <option value="commenter">Commenter</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              id="share-invite-btn"
              className="btn btn-primary"
              onClick={handleShare}
              disabled={loading}
            >
              {loading ? "..." : "Invite"}
            </button>
          </div>

          {error && <div style={{ fontSize: 13, color: "var(--danger)", padding: "4px 0" }}>⚠ {error}</div>}
          {success && <div style={{ fontSize: 13, color: "var(--success)", padding: "4px 0" }}>✓ {success}</div>}

          <div className="divider" />

          {/* Current shares */}
          {shares.length > 0 && (
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12 }}>
                People with access
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {shares.map(share => (
                  <div key={share.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="avatar" style={{ background: share.avatar_color || "#6366f1" }}>
                      {initials(share.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{share.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{share.email}</div>
                    </div>
                    <select
                      className="form-input"
                      value={share.permission}
                      onChange={e => updatePermission(share.id, e.target.value)}
                      style={{ width: 130, padding: "6px 10px" }}
                    >
                      <option value="editor">Editor</option>
                      <option value="commenter">Commenter</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => removeShare(share.id)}
                      title="Remove access"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {shares.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "8px 0" }}>
              Not shared with anyone yet. Invite collaborators above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
