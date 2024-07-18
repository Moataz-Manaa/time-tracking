import React from "react";
import { useNavigate, Link } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-orange-600	 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col md:flex-row justify-between items-center py-4">
        <div className="mb-2 md:mb-0">
          <Link to="/" className="text-3xl font-bold">
            Time Tracking
          </Link>
        </div>
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
          {token ? (
            <>
              <Link to="/projects/new" className="px-4 py-2 text-md">
                Create Project
              </Link>
              <Link to="/create-task" className="px-4 py-2 text-md">
                Create Task
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 mt-2 md:mt-0 bg-stone-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-md">
                Login
              </Link>
              <Link to="/signup" className="px-4 py-2 text-md">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
