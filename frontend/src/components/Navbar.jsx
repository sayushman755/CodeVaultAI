import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("codevault_user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("codevault_token");
    localStorage.removeItem("codevault_user");
    navigate("/login");
  };

  return (
    <nav className="bg-slate-950 text-white px-8 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          CodeVault AI
        </Link>

        <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-cyan-300">
            Dashboard
          </Link>

          <Link to="/add-problem" className="hover:text-cyan-300">
            Add Problem
          </Link>

          <Link to="/problems" className="hover:text-cyan-300">
            Problems
          </Link>

          <Link to="/statements" className="hover:text-cyan-300">
            Statements
          </Link>

          <Link to="/knowledge" className="hover:text-cyan-300">
            Knowledge Vault
          </Link>

          <Link to="/revision" className="hover:text-cyan-300">
            Revision Mode
          </Link>

          {user && (
            <span className="text-slate-300">
              Hi, {user.name?.split(" ")[0]}
            </span>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;