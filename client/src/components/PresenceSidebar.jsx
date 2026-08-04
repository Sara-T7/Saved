import "./PresenceSidebar.css";

function PresenceSidebar({ users }) {
  if (!users || users.length === 0) return null;

  const initials = (name) => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="presence-sidebar">
      <div className="presence-header">
        <span className="presence-dot-live" />
        <span className="presence-title">{users.length} online</span>
      </div>
      <div className="presence-list">
        {users.map((u) => (
          <div key={u.socketId} className="presence-user" title={`${u.name} - ${u.editingLocation || "Online"}`}>
            <div className="avatar avatar-sm" style={{ background: u.color || "#6366f1" }}>
              {initials(u.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="presence-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.name}
                </span>
                <span className="presence-dot" />
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {u.editingLocation || "Viewing"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PresenceSidebar;

