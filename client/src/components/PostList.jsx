import { Link } from "react-router-dom";

const fmt = (date) =>
  new Date(date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function PostList({ posts, onDelete }) {
  if (posts.length === 0) {
    return <p className="text-muted">No posts yet. Be the first to write one!</p>;
  }

  return (
    <div className="d-flex flex-column gap-3">
      {posts.map((post) => (
        <article key={post.blog_id} className="card shadow-sm post-card">
          <div className="card-body">
            <h3 className="h5 mb-1">{post.title}</h3>
            <p className="text-muted small mb-2">
              By <strong>{post.creator_name}</strong> · {fmt(post.date_created)}
            </p>
            <p className="post-content mb-3">{post.body}</p>
            {/* canEdit comes from the backend ownership check */}
            {post.canEdit && (
              <div className="d-flex gap-2">
                <Link to={`/edit/${post.blog_id}`} className="btn btn-outline-primary btn-sm">
                  Edit
                </Link>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => onDelete(post.blog_id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}