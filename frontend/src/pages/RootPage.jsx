import React from "react";
import { Link } from "react-router-dom";

const RootPage = () => {
  const token = localStorage.getItem("token");

  return (
    <div className="bg-orange-100 min-h-screen flex flex-col items-center py-10">
      <div className="max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold text-orange-800 mb-6">
          Welcome to Time Tracking
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Effortlessly manage your projects and tasks with our intuitive time
          tracking. Collaborate with your team, monitor progress, and stay
          productive with powerful reporting and integrations.
        </p>
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <h2 className="text-2xl font-semibold text-orange-600 mb-4">
              Create Projects
            </h2>
            <p className="text-gray-600">
              Easily create and manage your projects, ensuring all your tasks
              are organized and tracked efficiently.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <h2 className="text-2xl font-semibold text-orange-600 mb-4">
              Share with Team
            </h2>
            <p className="text-gray-600">
              Share your projects with your team members and collaborate
              seamlessly. Assign tasks and track progress together.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <h2 className="text-2xl font-semibold text-orange-600 mb-4">
              Track Time
            </h2>
            <p className="text-gray-600">
              Create tasks, track time for each task, and monitor the total
              duration of your projects to improve productivity.
            </p>
          </div>
        </div>
        <div className="mt-10">
          {token ? (
            <Link
              to="/projects/new"
              className="bg-orange-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-orange-700"
            >
              Create Project
            </Link>
          ) : (
            <Link
              to="/signup"
              className="bg-orange-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-orange-700"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default RootPage;
