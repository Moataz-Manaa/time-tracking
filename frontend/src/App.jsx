import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import CreateProject from "./pages/CreateProject";
import CreateTask from "./pages/CreateTask";
import RootPage from "./pages/RootPage";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ActivationPage from "./pages/ActivationPage";
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
          path="/team"
          element={
            <PrivateRoute>
              <Team />
            </PrivateRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <Projects />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
export default App;
