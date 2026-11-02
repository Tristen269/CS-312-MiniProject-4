import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import BlogPostForm from "./BlogPostForm";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getPost(id)
      .then((data) => {
        // The backend tells us whether the signed-in user wrote this post
        if (!data.canEdit) {
          setError("You can only edit posts that you created.");
        } else {
          setPost(data);
        }
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const handleUpdate = async (values) => {
    await api.updatePost(id, values);
    navigate("/"); // Home refetches, so the updated post shows up
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 640 }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="h5 mb-3">Edit Post</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {post && (
            <BlogPostForm
              initial={post}
              onSubmit={handleUpdate}
              submitLabel="Save Changes"
              onCancel={() => navigate(-1)}
            />
          )}
        </div>
      </div>
    </div>
  );
}