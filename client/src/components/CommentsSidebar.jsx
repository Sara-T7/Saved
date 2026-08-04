import { useState, useEffect, useRef } from "react";
import api from "../services/api";

function CommentsSidebar({ docId, socket, currentUser, permission, onClose }) {
  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all' | 'active' | 'resolved'
  const [newComment, setNewComment] = useState("");
  const [replyStates, setReplyStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const endRef = useRef(null);

  const canComment = permission !== "viewer";

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${docId}`);
      setComments(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();

    if (socket) {
      const handleCommentAdded = (newComment) => {
        setComments(prev => [...prev.filter(c => c.id !== newComment.id), newComment]);
      };
      const handleCommentResolved = ({ commentId, resolved }) => {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, resolved } : c));
      };
      const handleCommentDeleted = ({ commentId }) => {
        setComments(prev => prev.filter(c => c.id !== commentId));
      };
      const handleReplyAdded = ({ commentId, reply }) => {
        setComments(prev => prev.map(c => {
          if (c.id === commentId) {
            const replies = [...(c.replies || []).filter(r => r.id !== reply.id), reply];
            return { ...c, replies };
          }
          return c;
        }));
      };
      const handleReplyDeleted = ({ commentId, replyId }) => {
        setComments(prev => prev.map(c => {
          if (c.id === commentId) {
            return { ...c, replies: (c.replies || []).filter(r => r.id !== replyId) };
          }
          return c;
        }));
      };

      socket.on("comment-added", handleCommentAdded);
      socket.on("comment-resolved", handleCommentResolved);
      socket.on("comment-deleted", handleCommentDeleted);
      socket.on("reply-added", handleReplyAdded);
      socket.on("reply-deleted", handleReplyDeleted);

      return () => {
        socket.off("comment-added", handleCommentAdded);
        socket.off("comment-resolved", handleCommentResolved);
        socket.off("comment-deleted", handleCommentDeleted);
        socket.off("reply-added", handleReplyAdded);
        socket.off("reply-deleted", handleReplyDeleted);
      };
    }
  }, [docId, socket]);

  const addComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      await api.post(`/comments/${docId}`, { content: newComment });
      setNewComment("");
      // Re-fetch to ensure the poster sees their own comment immediately
      // (socket event may arrive but this guarantees consistency)
      await fetchComments();
    } catch (err) {
      alert("Failed to post comment. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const resolveComment = async (commentId, resolved) => {
    try {
      await api.put(`/comments/${commentId}/resolve`, { resolved: !resolved });
    } catch {
      alert("Failed to update comment.");
    }
  };

  const deleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.delete(`/comments/${commentId}`);
    } catch {
      alert("Failed to delete comment.");
    }
  };

  const addReply = async (commentId) => {
    const content = replyStates[commentId];
    if (!content?.trim()) return;
    try {
      await api.post(`/comments/${commentId}/replies`, { content });
      setReplyStates(s => ({ ...s, [commentId]: "" }));
      // Re-fetch so the poster sees their reply immediately
      await fetchComments();
    } catch {
      alert("Failed to post reply.");
    }
  };

  const deleteReply = async (replyId) => {
    try {
      await api.delete(`/comments/replies/${replyId}`);
    } catch {
      alert("Failed to delete reply.");
    }
  };

  const initials = (name) => name?.[0]?.toUpperCase() || "?";
  const formatDate = (d) => new Date(d).toLocaleString();

  const filteredComments = comments.filter(c => {
    if (filter === "active") return !c.resolved;
    if (filter === "resolved") return c.resolved;
    return true;
  });

  return (
    <div className="side-panel">
      <div className="side-panel-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>💬</span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Comments</span>
          <span className="badge badge-viewer">{comments.length}</span>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: "flex",
        gap: 6,
        padding: "8px 16px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-secondary)"
      }}>
        {["all", "active", "resolved"].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter(f)}
            style={{ fontSize: 11, textTransform: "capitalize", padding: "3px 10px" }}
          >
            {f} ({comments.filter(c => f === "all" ? true : f === "active" ? !c.resolved : c.resolved).length})
          </button>
        ))}
      </div>

      <div className="side-panel-body" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Add comment */}
        {canComment ? (
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)", padding: 12,
            display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, flexShrink: 0
          }}>
            <textarea
              id="new-comment-input"
              className="form-input"
              placeholder="Add a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              rows={2}
              style={{ resize: "none" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                id="post-comment-btn"
                className="btn btn-primary btn-sm"
                onClick={addComment}
                disabled={posting || !newComment.trim()}
              >
                {posting ? "..." : "Post Comment"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "10px 0", fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
            👁 You have view-only access.
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>Loading...</div>
        ) : filteredComments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 14 }}>
            {filter === "all" ? "No comments yet." : `No ${filter} comments.`}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filteredComments.map(c => (
              <div
                key={c.id}
                style={{
                  background: c.resolved ? "var(--bg-secondary)" : "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: 14,
                  opacity: c.resolved ? 0.75 : 1,
                  transition: "var(--transition)",
                }}
              >
                {/* Comment header */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div className="avatar avatar-sm" style={{ background: c.avatar_color || "#6366f1" }}>
                    {initials(c.user_name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{c.user_name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatDate(c.created_at)}</div>
                  </div>
                  {c.resolved && <span className="badge badge-editor" style={{ fontSize: 10 }}>Resolved</span>}
                  {canComment && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => resolveComment(c.id, c.resolved)}
                        title={c.resolved ? "Reopen comment" : "Resolve comment"}
                        style={{ fontSize: 14 }}
                      >
                        {c.resolved ? "↩" : "✓"}
                      </button>
                      {(c.user_id === currentUser?.id || permission === "owner") && (
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => deleteComment(c.id)}
                          style={{ fontSize: 14, color: "var(--danger)" }}
                          title="Delete"
                        >🗑</button>
                      )}
                    </div>
                  )}
                </div>

                <p style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 10, color: "var(--text-primary)" }}>
                  {c.content}
                </p>

                {/* Replies */}
                {c.replies?.length > 0 && (
                  <div style={{
                    borderLeft: "2px solid var(--border)", paddingLeft: 12,
                    marginBottom: 10, display: "flex", flexDirection: "column", gap: 8
                  }}>
                    {c.replies.map(r => (
                      <div key={r.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <div className="avatar avatar-sm" style={{ background: r.avatar_color || "#6366f1" }}>
                          {initials(r.user_name)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 600 }}>{r.user_name}
                            <span style={{ fontWeight: 400, color: "var(--text-muted)", marginLeft: 6 }}>
                              {formatDate(r.created_at)}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, lineHeight: 1.5, marginTop: 2 }}>{r.content}</p>
                        </div>
                        {canComment && (r.user_id === currentUser?.id || permission === "owner") && (
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => deleteReply(r.id)}
                            style={{ fontSize: 12, color: "var(--danger)" }}
                          >✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                {canComment && !c.resolved && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      className="form-input"
                      placeholder="Reply..."
                      value={replyStates[c.id] || ""}
                      onChange={e => setReplyStates(s => ({ ...s, [c.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && addReply(c.id)}
                      style={{ flex: 1, padding: "6px 10px", fontSize: 12 }}
                    />
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => addReply(c.id)}
                      disabled={!replyStates[c.id]?.trim()}
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

export default CommentsSidebar;

