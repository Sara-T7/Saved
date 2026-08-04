const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Assign a random avatar color from a preset palette
const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#06b6d4",
  "#10b981", "#f59e0b", "#ef4444", "#3b82f6",
];
function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// Register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  if (password.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const color = randomColor();

    db.query(
      "INSERT INTO users(name, email, password, avatar_color) VALUES(?,?,?,?)",
      [name, email, hashedPassword, color],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY")
            return res.status(400).json({ message: "Email already registered" });
          return res.status(500).json({ message: "Registration failed", error: err.message });
        }
        res.json({ message: "User registered successfully" });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Login
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  db.query("SELECT * FROM users WHERE email=?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0)
      return res.status(400).json({ message: "No account found with that email" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, color: user.avatar_color },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_color: user.avatar_color,
      },
    });
  });
};

// Get current user
exports.getMe = (req, res) => {
  db.query(
    "SELECT id, name, email, avatar_color, created_at FROM users WHERE id=?",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (!results.length) return res.status(404).json({ message: "User not found" });
      res.json(results[0]);
    }
  );
};