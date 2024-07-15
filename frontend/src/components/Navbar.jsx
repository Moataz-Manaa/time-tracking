import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-blue-500 text-white">
      <div>
        <Link to="/" className="text-xl font-bold">
          Time Tracking
        </Link>
      </div>
      <div>
        {token ? (
          <>
            <Link to="/projects" className="px-4">
              Projects
            </Link>
            <Link to="/projects/new" className="px-4">
              Create Project
            </Link>
            <Link to="/create-task" className="px-4">
              Create Task
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            {
              <Link to="/login" className="px-4">
                Login
              </Link>
            }
            {
              <Link to="/signup" className="px-4">
                Signup
              </Link>
            }
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
