import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { io } from "socket.io-client";
import api from "../services/api";
import PresenceSidebar from "../components/PresenceSidebar";
import VersionHistory from "../components/VersionHistory";
import CommentsSidebar from "../components/CommentsSidebar";
import ShareModal from "../components/ShareModal";
import ShortcutsModal from "../components/ShortcutsModal";
import { notify } from "../components/Toast";
import { exportAsMarkdown, exportAsHtml, markdownToHtml } from "../utils/exportImport";
import "./Editor.css";

// ─── Toolbar ──────────────────────────────────────────────────────────────────
function ToolbarButton({ onClick, active, disabled, title, children }) {
  return (
    <button
      className={`toolbar-btn ${active ? "active" : ""} ${disabled ? "disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, readOnly, onToggleSearch, onOpenImport, onExport, onOpenShortcuts }) {
  if (!editor || readOnly) return null;

  const addLink = () => {
    const url = prompt("Enter URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">H1</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">H3</ToolbarButton>
      </div>

      <div className="toolbar-sep" />

      <div className="toolbar-group">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)"><b>B</b></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)"><i>I</i></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)"><u>U</u></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><s>S</s></ToolbarButton>
      </div>

      <div className="toolbar-sep" />

      <div className="toolbar-group">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">• List</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">1. List</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">" "</ToolbarButton>
      </div>

      <div className="toolbar-sep" />

      <div className="toolbar-group">
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">≡L</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">≡C</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">≡R</ToolbarButton>
      </div>

      <div className="toolbar-sep" />

      <div className="toolbar-group">
        <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Insert Link">🔗</ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
          title="Remove Link"
        >🔗✕</ToolbarButton>
      </div>

      <div className="toolbar-sep" />

      <div className="toolbar-group">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">↩</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">↪</ToolbarButton>
      </div>

      <div className="toolbar-sep" />

      {/* Extra Utilities */}
      <div className="toolbar-group">
        <ToolbarButton onClick={onToggleSearch} title="Find in Document (Ctrl+F)">🔍</ToolbarButton>
        <ToolbarButton onClick={onOpenImport} title="Import Markdown File">📥 Import</ToolbarButton>
        <ToolbarButton onClick={onExport} title="Export Document">📤 Export</ToolbarButton>
        <ToolbarButton onClick={onOpenShortcuts} title="Keyboard Shortcuts (Ctrl+/)">⌨️</ToolbarButton>
      </div>
    </div>
  );
}

// ─── Main Editor Component ────────────────────────────────────────────────────
function Editor() {
  const { id: docId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const socketRef = useRef(null);

  const [docTitle, setDocTitle] = useState("Loading...");
  const [permission, setPermission] = useState("editor");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [presenceUsers, setPresenceUsers] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [typingUsers, setTypingUsers] = useState([]);
  const [contentReady, setContentReady] = useState(false);

  const saveTimer = useRef(null);
  const typingTimer = useRef(null);
  const isRemoteChange = useRef(false);
  const fileInputRef = useRef(null);

  const readOnly = permission === "viewer" || permission === "commenter";

  // ── TipTap editor ─────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Start writing your document here..." }),
    ],
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (isRemoteChange.current) return;
      const html = editor.getHTML();

      if (socketRef.current) {
        socketRef.current.emit("document-change", { docId, content: html });
      }

      setSaveStatus("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        setSaveStatus("saved");
      }, 2500);

      if (socketRef.current) {
        socketRef.current.emit("typing", { docId, isTyping: true });
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => {
          socketRef.current?.emit("typing", { docId, isTyping: false });
        }, 1500);
      }
    },
    onSelectionUpdate: ({ editor }) => {
      if (socketRef.current) {
        const { from, to } = editor.state.selection;
        const currentNode = editor.state.selection.$head.parent;
        const nodeType = currentNode.type.name;
        const textSnippet = currentNode.textContent.trim().slice(0, 25);
        const editingLocation = nodeType === "heading"
          ? `Heading: ${textSnippet || "Untitled"}`
          : textSnippet ? `Editing: "${textSnippet}..."` : "Editing";

        socketRef.current.emit("cursor-move", {
          docId,
          cursor: { from, to },
          editingLocation,
        });
      }
    },
  });

  // ── Theme toggle ─────────────────────────────────────────────────────────
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    notify(`Switched to ${nextTheme} mode`, "info");
  };

  // ── Keyboard shortcuts listener ──────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setShowShortcuts(v => !v);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowSearchBar(v => !v);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Load doc from API ────────────────────────────────────────────────────
  useEffect(() => {
    api.get(`/documents/${docId}`)
      .then(res => {
        setDocTitle(res.data.title);
        setPermission(res.data.permission);
        if (editor && res.data.content) {
          editor.commands.setContent(res.data.content, false);
        }
        setContentReady(true);
      })
      .catch(err => {
        if (err.response?.status === 403) {
          notify("You don't have access to this document.", "error");
          navigate("/dashboard");
        }
      });
  }, [docId, editor]);

  // ── Socket.io connection ───────────────────────────────────────────────────
  useEffect(() => {
    const socket = io("http://localhost:5000", { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("join-document", {
      docId,
      user: {
        userId: user.id,
        name: user.name,
        color: user.avatar_color || "#6366f1",
      },
    });

    socket.on("load-document", ({ content, title }) => {
      if (editor && content) {
        isRemoteChange.current = true;
        editor.commands.setContent(content, false);
        isRemoteChange.current = false;
      }
      if (title) setDocTitle(title);
    });

    socket.on("document-change", (content) => {
      if (!editor) return;
      isRemoteChange.current = true;
      const { from, to } = editor.state.selection;
      editor.commands.setContent(content, false);
      try { editor.commands.setTextSelection({ from, to }); } catch {}
      isRemoteChange.current = false;
    });

    socket.on("version-restored", ({ content }) => {
      if (!editor) return;
      isRemoteChange.current = true;
      editor.commands.setContent(content, false);
      isRemoteChange.current = false;
      notify("Document restored to previous version!", "success");
    });

    socket.on("title-change", (title) => {
      setDocTitle(title);
    });

    socket.on("presence-update", (users) => {
      const others = users.filter(u => u.userId !== user.id);
      setPresenceUsers(others);
    });

    socket.on("cursor-move", ({ socketId, name, color, cursor, editingLocation }) => {
      setPresenceUsers(prev => prev.map(u => {
        if (u.socketId === socketId || u.userId === user.id) {
          return { ...u, cursor, editingLocation };
        }
        return u;
      }));
    });

    socket.on("typing", ({ userId, name, isTyping }) => {
      if (userId === user.id) return;
      setTypingUsers(prev =>
        isTyping
          ? prev.includes(name) ? prev : [...prev, name]
          : prev.filter(n => n !== name)
      );
    });

    return () => {
      socket.emit("leave-document", { docId });
      socket.disconnect();
    };
  }, [docId, editor]);

  useEffect(() => {
    if (editor) editor.setEditable(!readOnly);
  }, [readOnly, editor]);

  const handleTitleChange = (e) => {
    setDocTitle(e.target.value);
    socketRef.current?.emit("title-change", { docId, title: e.target.value });
  };

  const handleTitleBlur = async () => {
    try {
      await api.put(`/documents/${docId}/rename`, { title: docTitle });
    } catch {}
  };

  const handleVersionRestore = (content) => {
    if (editor) {
      isRemoteChange.current = true;
      editor.commands.setContent(content, false);
      isRemoteChange.current = false;
      socketRef.current?.emit("document-change", { docId, content });
      notify("Restored document version", "success");
    }
  };

  // ── Import Markdown File ─────────────────────────────────────────────────
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string" && editor) {
        const html = markdownToHtml(text);
        editor.commands.setContent(html, true);
        socketRef.current?.emit("document-change", { docId, content: editor.getHTML() });
        notify(`Imported ${file.name} successfully`, "success");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const initials = (name) => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const meAndOthers = [{ socketId: "me", userId: user.id, name: user.name, color: user.avatar_color }, ...presenceUsers];

  return (
    <div className="editor-page">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".md,.txt"
        style={{ display: "none" }}
      />

      {/* ── Header ── */}
      <header className="editor-header">
        <div className="editor-header-left">
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate("/dashboard")} title="Back to Dashboard">
            ← 
          </button>
          <div className="editor-logo">✦</div>
          <input
            id="doc-title-input"
            className="editor-title-input"
            value={docTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            readOnly={readOnly}
            spellCheck={false}
          />
        </div>

        <div className="editor-header-center">
          <div className={`save-indicator ${saveStatus}`}>
            {saveStatus === "saving" && <><span className="spinner" style={{ width: 12, height: 12 }} /> Saving...</>}
            {saveStatus === "saved" && <><span style={{ color: "var(--success)" }}>●</span> Saved</>}
          </div>
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              <span className="typing-dots"><span/><span/><span/></span>
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing
            </div>
          )}
        </div>

        <div className="editor-header-right">
          {/* Theme toggle */}
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Presence avatars */}
          <div className="presence-avatars">
            {meAndOthers.slice(0, 4).map((u, i) => (
              <div
                key={u.socketId}
                className="avatar avatar-sm"
                style={{
                  background: u.color || "#6366f1",
                  marginLeft: i > 0 ? -8 : 0,
                  zIndex: 10 - i,
                  border: "2px solid var(--bg-secondary)",
                  position: "relative",
                }}
                title={`${u.name} (${u.editingLocation || "Online"})`}
              >
                {initials(u.name)}
              </div>
            ))}
            {meAndOthers.length > 4 && (
              <div className="avatar avatar-sm" style={{
                background: "var(--bg-card)", marginLeft: -8,
                border: "2px solid var(--bg-secondary)", fontSize: 10
              }}>
                +{meAndOthers.length - 4}
              </div>
            )}
          </div>

          <button id="comments-btn" className={`btn btn-ghost btn-sm ${showComments ? "active-btn" : ""}`} onClick={() => { setShowComments(v => !v); setShowVersions(false); }}>
            💬 Comments
          </button>
          <button id="history-btn" className={`btn btn-ghost btn-sm ${showVersions ? "active-btn" : ""}`} onClick={() => { setShowVersions(v => !v); setShowComments(false); }}>
            🕒 History
          </button>
          {(permission === "owner") && (
            <button id="share-btn" className="btn btn-primary btn-sm" onClick={() => setShowShare(true)}>
              🔗 Share
            </button>
          )}
        </div>
      </header>

      {/* ── Toolbar ── */}
      <Toolbar
        editor={editor}
        readOnly={readOnly}
        onToggleSearch={() => setShowSearchBar(v => !v)}
        onOpenImport={() => fileInputRef.current?.click()}
        onExport={() => setShowExportMenu(v => !v)}
        onOpenShortcuts={() => setShowShortcuts(true)}
      />

      {/* Export Popover Menu */}
      {showExportMenu && (
        <div style={{
          position: "absolute",
          top: 105,
          right: 120,
          zIndex: 300,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          boxShadow: "var(--shadow-md)",
          padding: 8,
          display: "flex",
          flexDirection: "column",
          gap: 4
        }}>
          <button
            className="btn btn-ghost btn-sm"
            style={{ justifyContent: "flex-start" }}
            onClick={() => {
              exportAsMarkdown(docTitle, editor?.getHTML() || "");
              setShowExportMenu(false);
              notify("Exported as Markdown", "success");
            }}
          >
            📝 Export as Markdown (.md)
          </button>
          <button
            className="btn btn-ghost btn-sm"
            style={{ justifyContent: "flex-start" }}
            onClick={() => {
              exportAsHtml(docTitle, editor?.getHTML() || "");
              setShowExportMenu(false);
              notify("Exported as HTML", "success");
            }}
          >
            🌐 Export as HTML (.html)
          </button>
          <button
            className="btn btn-ghost btn-sm"
            style={{ justifyContent: "flex-start" }}
            onClick={() => {
              setShowExportMenu(false);
              window.print();
            }}
          >
            🖨️ Save as PDF / Print
          </button>
        </div>
      )}

      {/* Search Bar Overlay */}
      {showSearchBar && (
        <div style={{
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border)",
          padding: "8px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 13
        }}>
          <span>🔍 Find:</span>
          <input
            className="form-input"
            style={{ maxWidth: 300, padding: "4px 10px", fontSize: 13 }}
            placeholder="Type text to search in document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
              Matches highlighted in text
            </span>
          )}
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setShowSearchBar(false); setSearchQuery(""); }}>
            ✕
          </button>
        </div>
      )}

      {readOnly && (
        <div className="read-only-banner">
          {permission === "commenter"
            ? "💬 You have commenter access (you can view & post comments, but cannot edit text)"
            : "👁 You have view-only access to this document"}
        </div>
      )}

      {/* ── Editor body ── */}
      <div className="editor-body">
        <div className="editor-container">
          <EditorContent editor={editor} className="editor-content" />
        </div>

        {/* ── Right panel: presence ── */}
        {presenceUsers.length > 0 && !showVersions && !showComments && (
          <div className="editor-presence-panel">
            <PresenceSidebar users={presenceUsers} />
          </div>
        )}
      </div>

      {/* ── Side panels & Modals ── */}
      {showVersions && (
        <VersionHistory
          docId={docId}
          socket={socketRef.current}
          onRestore={handleVersionRestore}
          onClose={() => setShowVersions(false)}
        />
      )}
      {showComments && (
        <CommentsSidebar
          docId={docId}
          socket={socketRef.current}
          currentUser={user}
          permission={permission}
          onClose={() => setShowComments(false)}
        />
      )}
      {showShare && (
        <ShareModal docId={docId} onClose={() => setShowShare(false)} />
      )}
      {showShortcuts && (
        <ShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
}

export default Editor;