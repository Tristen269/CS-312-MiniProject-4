import { useEffect, useState } from "react";
import { api } from "../api";
import PostList from "./PostList";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getProfile().then(setProfile).catch((err) => setError(err.message));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.deletePost(id);
      setProfile((p) => ({ ...p, posts: p.posts.filter((post) => post.blog_id !== id) }));
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!profile) return <p>Loading…</p>;

  const { user, posts } = profile;
  return (
    <>
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h4">{user.name}</h2>
          <dl className="row mb-0">
            <dt className="col-sm-3">Username</dt>
            <dd className="col-sm-9">{user.user_id}</dd>
            <dt className="col-sm-3">Name</dt>
            <dd className="col-sm-9">{user.name}</dd>
            <dt className="col-sm-3">Total posts</dt>
            <dd className="col-sm-9">{posts.length}</dd>
          </dl>
        </div>
      </div>
      <h3 className="h5 mb-3">My Posts</h3>
      <PostList posts={posts} onDelete={handleDelete} />
    </>
  );
}