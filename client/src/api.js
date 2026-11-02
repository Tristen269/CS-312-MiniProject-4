// Where your Express server runs. credentials: "include" sends the session cookie.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Something went wrong.");
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  me: () => request("/me"),
  signUp: (body) => request("/signup", { method: "POST", body }),
  signIn: (body) => request("/signin", { method: "POST", body }),
  signOut: () => request("/signout", { method: "POST" }),
  getPosts: () => request("/blogs"),
  getPost: (id) => request(`/blogs/${id}`),
  createPost: (body) => request("/blogs", { method: "POST", body }),
  updatePost: (id, body) => request(`/blogs/${id}`, { method: "PUT", body }),
  deletePost: (id) => request(`/blogs/${id}`, { method: "DELETE" }),
  getProfile: () => request("/profile"),
};