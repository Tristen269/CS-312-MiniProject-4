import { useState } from "react";

/**
 * Controlled form used for both creating and editing a post.
 * Pass `initial` (the existing post) to pre-fill the fields when editing.
 */
export default function BlogPostForm({
  initial = { title: "", body: "" },
  onSubmit,
  submitLabel = "Publish Post",
  onCancel,
}) {
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({ title, body });
      // Clear the form only when creating (no initial values)
      if (!initial.title) {
        setTitle("");
        setBody("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-3">
        <label className="form-label" htmlFor="title">Title</label>
        <input
          id="title"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor="body">Body</label>
        <textarea
          id="body"
          rows={5}
          className="form-control"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
      </div>
      <div className="d-flex gap-2">
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}