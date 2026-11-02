import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function SignUp() {
  const [form, setForm] = useState({ user_id: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.signUp(form);
      // Same flow as Mini-Project 3: after signing up, go to the sign in page
      navigate("/signin");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card card shadow-sm mx-auto">
      <div className="card-body p-4">
        <h2 className="h4 mb-3">Create Account</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="user_id">User ID</label>
            <input id="user_id" name="user_id" className="form-control"
              value={form.user_id} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="form-control"
              value={form.password} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="name">Name</label>
            <input id="name" name="name" className="form-control"
              value={form.name} onChange={handleChange} required />
          </div>
          <button className="btn btn-primary w-100" disabled={submitting}>
            {submitting ? "Creating…" : "Sign Up"}
          </button>
        </form>
        <p className="mt-3 mb-0 text-center">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  );
}