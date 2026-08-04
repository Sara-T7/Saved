import { useState, useEffect } from "react";
import api from "../services/api";

function VersionHistory({ docId, socket, onRestore, onClose }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [previewContent, setPreviewContent] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  const fetchVersions = () => {
    api.get(`/versions/${docId}`)
      .then(res => setVersions(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVersions();

    if (socket) {
      const handleVersionCreated = (ver) => {
        if (ver.document_id === Number(docId) || !ver.document_id) {
          setVersions(prev => [ver, ...prev]);
        }
      };
      socket.on("version-created", handleVersionCreated);
      return () => socket.off("version-created", handleVersionCreated);
    }
  }, [docId, socket]);

  const togglePreview = async (versionId) => {
    if (previewId === versionId) {
      setPreviewId(null);
      setPreviewContent("");
      return;
    }
    setPreviewId(versionId);
    setLoadingPreview(true);
    try {
      const res = await api.get(`/versions/detail/${versionId}`);
      setPreviewContent(res.data.content);
    } catch {
      setPreviewContent("Failed to load preview.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleRestore = async (versionId) => {
    if (!confirm("Restore this version? The current content will be replaced.")) return;
    setRestoring(versionId);
    try {
      const res = await api.post(`/versions/restore/${versionId}`);
      onRestore(res.data.content);
      fetchVersions();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to restore");
    } finally { setRestoring(null); }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
  };

  const initials = (name) => name?.[0]?.toUpperCase() || "?";

  return (
    <div className="side-panel">
      <div className="side-panel-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🕒</span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Version History</span>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
      </div>

      <div className="side-panel-body">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map(i => (
              <div key={i} className="skeleton" style={{ height: 72, borderRadius: "var(--radius-sm)" }} />
            ))}
          </div>
        ) : versions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: 14 }}>
            No versions saved yet.<br/>Versions are saved automatically as you edit.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {versions.map((v, idx) => (
              <div
                key={v.id}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>
                      v{v.version_number}
                    </span>
                    {idx === 0 && (
                      <span className="badge badge-editor" style={{ fontSize: 10 }}>Current</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => togglePreview(v.id)}
                      style={{ fontSize: 11 }}
                    >
                      {previewId === v.id ? "Hide" : "Preview"}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRestore(v.id)}
                      disabled={restoring === v.id || idx === 0}
                      style={{ opacity: idx === 0 ? 0.4 : 1, fontSize: 11 }}
                    >
                      {restoring === v.id ? "..." : "Restore"}
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="avatar avatar-sm" style={{ background: v.avatar_color || "#6366f1" }}>
                    {initials(v.created_by_name)}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{v.created_by_name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatDate(v.created_at)}</div>
                  </div>
                </div>

                {previewId === v.id && (
                  <div style={{
                    marginTop: 8,
                    padding: 10,
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12,
                    maxHeight: 150,
                    overflowY: "auto",
                    border: "1px solid var(--border)"
                  }}>
                    {loadingPreview ? (
                      <span style={{ color: "var(--text-muted)" }}>Loading preview...</span>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: previewContent || "<i>(Empty version)</i>" }} />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VersionHistory;

