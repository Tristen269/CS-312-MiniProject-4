import { Link, NavLink, useNavigate } from "react-router-dom";

export default function NavBar({ user, onSignOut }) {
  const navigate = useNavigate();

  const signOut = async () => {
    await onSignOut();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          ✍️ BlogApp
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Home
              </NavLink>
            </li>
            {user && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/profile">
                  My Profile
                </NavLink>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center gap-2 text-white">
            {user ? (
              <>
                <span className="me-2">Hi, {user.name}</span>
                <button className="btn btn-outline-light btn-sm" onClick={signOut}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm" to="/signin">
                  Sign In
                </Link>
                <Link className="btn btn-primary btn-sm" to="/signup">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}