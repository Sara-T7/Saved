import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./auth.css";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getStrength = (pw) => {
    if (pw.length === 0) return 0;
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#eab308", "#10b981", "#6366f1"];
  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-blob blob-1" />
        <div className="auth-blob blob-2" />
      </div>

      <div className="auth-container">
        <div className="auth-logo">
          <div className="auth-logo-icon">✦</div>
          <span className="auth-logo-text">RTCDE</span>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Start collaborating in seconds</p>
          </div>

          {error && <div className="auth-error"><span>⚠</span>{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                placeholder="Jane Smith"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                id="reg-password"
                name="password"
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
              {form.password.length > 0 && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1,2,3,4,5].map(i => (
                      <div
                        key={i}
                        className="strength-bar"
                        style={{
                          background: i <= strength ? strengthColor[strength] : "var(--border)",
                          transition: "background 0.3s"
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ color: strengthColor[strength], fontSize: "12px", fontWeight: 500 }}>
                    {strengthLabel[strength]}
                  </span>
                </div>
              )}
            </div>

            <button
              id="register-btn"
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : null}
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;