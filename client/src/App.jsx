import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { api } from "./api";
import NavBar from "./components/NavBar";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import EditPost from "./components/EditPost";
import Profile from "./components/Profile";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on page load
  useEffect(() => {
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    await api.signOut();
    setUser(null);
  };

  if (loading) return <div className="container py-5 text-center">Loading…</div>;

  return (
    <>
      <NavBar user={user} onSignOut={handleSignOut} />
      <main className="container py-4">
        <Routes>
          {/* Same as Mini-Project 3: the feed needs you to be signed in */}
          <Route path="/" element={user ? <Home /> : <Navigate to="/signin" />} />
          <Route
            path="/signin"
            element={user ? <Navigate to="/" /> : <SignIn onAuth={setUser} />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/" /> : <SignUp />}
          />
          <Route
            path="/edit/:id"
            element={user ? <EditPost /> : <Navigate to="/signin" />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/signin" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}