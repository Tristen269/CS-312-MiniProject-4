import { useEffect, useState } from "react";
import { api } from "../api";
import BlogPostForm from "./BlogPostForm";
import PostList from "./PostList";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPosts()
      .then((data) => {
        console.log("Blogs from backend:", data); // check the connection in the console
        setPosts(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (values) => {
    const created = await api.createPost(values);
    setPosts((prev) => [created, ...prev]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.blog_id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="row g-4">
      <div className="col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="h5 mb-3">Create a New Post</h2>
            <BlogPostForm onSubmit={handleCreate} />
          </div>
        </div>
      </div>
      <div className="col-lg-7">
        <h2 className="h5 mb-3">All Posts</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? <p>Loading posts…</p> : <PostList posts={posts} onDelete={handleDelete} />}
      </div>
    </div>
  );
}
