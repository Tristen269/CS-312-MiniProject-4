import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function SignIn({ onAuth }) {
  const [form, setForm] = useState({ user_id: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { user } = await api.signIn(form);
      onAuth(user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card card shadow-sm mx-auto">
      <div className="card-body p-4">
        <h2 className="h4 mb-3">Sign In</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="user_id">User ID</label>
            <input
              id="user_id"
              name="user_id"
              className="form-control"
              value={form.user_id}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button className="btn btn-primary w-100" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="mt-3 mb-0 text-center">
          No account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}