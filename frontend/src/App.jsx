import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import CreateProject from "./pages/CreateProject";
import CreateTask from "./pages/CreateTask";
import RootPage from "./pages/RootPage";
import Admin from "./pages/Admin";
import Own_Projects from "./pages/Own_Projects";
import ActivationPage from "./pages/ActivationPage";
import Profile from "./pages/Profile";
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<RootPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/activate/:activationCode" element={<ActivationPage />} />
        <Route
          path="/projects/new"
          element={
            <PrivateRoute>
              <CreateProject />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-task"
          element={
            <PrivateRoute>
              <CreateTask />
            </PrivateRoute>
          }
        />
        <Route
          path="/own-projects"
          element={
            <PrivateRoute>
              <Own_Projects />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
export default App;
