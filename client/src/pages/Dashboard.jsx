import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import DocumentCard from "../components/DocumentCard";
import ShareModal from "../components/ShareModal";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [activeTab, setActiveTab] = useState("mine");
  const [documents, setDocuments] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [shareDocId, setShareDocId] = useState(null);
  const [renameState, setRenameState] = useState({ docId: null, title: "" });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [mine, shared, recent] = await Promise.all([
        api.get("/documents"),
        api.get("/documents/shared"),
        api.get("/documents/recent"),
      ]);
      setDocuments(mine.data);
      setSharedDocs(shared.data);
      setRecentDocs(recent.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createDocument = async () => {
    const title = newTitle.trim() || "Untitled Document";
    setCreating(true);
    try {
      const res = await api.post("/documents", { title });
      setShowNewModal(false);
      setNewTitle("");
      navigate(`/editor/${res.data.documentId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const deleteDocument = async (id) => {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const duplicateDocument = async (id) => {
    try {
      const res = await api.post(`/documents/${id}/duplicate`);
      navigate(`/editor/${res.data.documentId}`);
    } catch (err) { console.error(err); }
  };

  const renameDocument = async () => {
    if (!renameState.title.trim()) return;
    try {
      await api.put(`/documents/${renameState.docId}/rename`, { title: renameState.title });
      setRenameState({ docId: null, title: "" });
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const logout = () => { localStorage.clear(); navigate("/"); };

  const currentDocs = activeTab === "mine" ? documents : activeTab === "shared" ? sharedDocs : recentDocs;
  const filtered = currentDocs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  const initials = (name) => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="dash-nav">
        <div className="dash-nav-left">
          <div className="dash-logo">
            <span className="dash-logo-icon">✦</span>
            <span className="dash-logo-text">RTCDE</span>
          </div>
        </div>

        <div className="dash-search-wrap">
          <span className="dash-search-icon">⌕</span>
          <input
            id="search-input"
            className="dash-search"
            placeholder="Search documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="dash-nav-right">
          <button id="new-doc-btn" className="btn btn-primary" onClick={() => setShowNewModal(true)}>
            + New Document
          </button>
          <div className="avatar" style={{ background: user.avatar_color || "#02609b" }} title={user.name}>
            {initials(user.name)}
          </div>
          <button id="logout-btn" className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="dash-body">
        {/* Sidebar */}
        <aside className="dash-sidebar">
          <div className="dash-user-info">
            <div className="avatar avatar-lg" style={{ background: user.avatar_color || "#6366f1" }}>
              {initials(user.name)}
            </div>
            <div>
              <div className="dash-user-name">{user.name}</div>
              <div className="dash-user-email">{user.email}</div>
            </div>
          </div>

          <div className="divider" />

          <nav className="dash-tabs">
            {[
              { key: "mine", icon: "📄", label: "My Documents", count: documents.length },
              { key: "shared", icon: "🤝", label: "Shared With Me", count: sharedDocs.length },
              { key: "recent", icon: "🕒", label: "Recent", count: recentDocs.length },
            ].map(tab => (
              <button
                key={tab.key}
                id={`tab-${tab.key}`}
                className={`dash-tab ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.icon}</span>
                <span className="dash-tab-label">{tab.label}</span>
                <span className="dash-tab-count">{tab.count}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="dash-main">
          <div className="dash-main-header">
            <h2 className="dash-heading">
              {activeTab === "mine" ? "My Documents" : activeTab === "shared" ? "Shared With Me" : "Recent"}
            </h2>
            <span className="dash-count">{filtered.length} document{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {loading ? (
            <div className="dash-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="skeleton" style={{ height: 180, borderRadius: "var(--radius-lg)" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">{search ? "🔍" : "📝"}</div>
              <h3>{search ? "No results found" : "No documents yet"}</h3>
              <p>{search ? "Try a different search term" : "Create your first document to get started"}</p>
              {!search && (
                <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                  + Create Document
                </button>
              )}
            </div>
          ) : (
            <div className="dash-grid">
              {filtered.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  currentUserId={user.id}
                  onOpen={() => navigate(`/editor/${doc.id}`)}
                  onDelete={deleteDocument}
                  onDuplicate={duplicateDocument}
                  onRename={(id, title) => setRenameState({ docId: id, title })}
                  onShare={(id) => setShareDocId(id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* New Document Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Document</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowNewModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Document Title</label>
                <input
                  id="new-doc-title"
                  autoFocus
                  className="form-input"
                  placeholder="Untitled Document"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && createDocument()}
                />
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button id="create-confirm-btn" className="btn btn-primary" onClick={createDocument} disabled={creating}>
                  {creating ? <span className="spinner" /> : null}
                  {creating ? "Creating..." : "Create Document"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameState.docId && (
        <div className="modal-overlay" onClick={() => setRenameState({ docId: null, title: "" })}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Rename Document</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setRenameState({ docId: null, title: "" })}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">New Title</label>
                <input
                  autoFocus
                  className="form-input"
                  value={renameState.title}
                  onChange={e => setRenameState({ ...renameState, title: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && renameDocument()}
                />
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" onClick={() => setRenameState({ docId: null, title: "" })}>Cancel</button>
                <button className="btn btn-primary" onClick={renameDocument}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareDocId && (
        <ShareModal docId={shareDocId} onClose={() => setShareDocId(null)} />
      )}
    </div>
  );
}

export default Dashboard;