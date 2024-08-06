import React, { useEffect, useState } from "react";
import axios from "axios";

function Team() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3000/api/v1/projects/my-projects-and-shared-users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProjects(response.data.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto max-w-7xl p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-6">Team</h2>
        <table className="min-w-full border-collapse block md:table mx-auto text-lg">
          <thead className="block md:table-header-group">
            <tr className="border border-grey-500 md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto md:relative">
              <th className="bg-gray-600 pl-5 pt-2 pb-2  text-white font-bold md:border md:border-grey-500 text-left block md:table-cell">
                Project Name
              </th>
              <th className="bg-gray-600 pl-5 pt-2 pb-2  text-white font-bold md:border md:border-grey-500 text-left block md:table-cell">
                Total Duration
              </th>
              <th className="bg-gray-600 pl-5 pt-2 pb-2  text-white font-bold md:border md:border-grey-500 text-left block md:table-cell">
                Team
              </th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr
                  key={project._id}
                  className="bg-gray-300 border border-grey-500 md:border-none block md:table-row"
                >
                  <td className="pl-5 pb-2 pt-2 md:border md:border-grey-500 block md:table-cell">
                    {project.projectName}
                  </td>
                  <td className="pl-5 pb-2 pt-2 md:border md:border-grey-500 block md:table-cell">
                    {formatTime(project.totalDuration)}
                  </td>
                  <td className="pl-5 pb-2 pt-2 md:border md:border-grey-500 block md:table-cell">
                    <div>
                      <span className="text-transform: capitalize font-semibold">
                        {project.creator.user.firstName}{" "}
                        {project.creator.user.lastName} (Project Creator)
                      </span>{" "}
                      Work for :{" "}
                      <span className="text-red-600 ml-4">
                        {formatTime(project.creator.duration)}
                      </span>{" "}
                    </div>
                    {project.sharedUsersWithDurations.map((sharedUser) => (
                      <div key={sharedUser.user._id}>
                        <span className="text-transform: capitalize font-semibold">
                          {sharedUser.user.firstName} {sharedUser.user.lastName}
                        </span>{" "}
                        Work for :{" "}
                        <span className="text-red-600 ml-4">
                          {formatTime(sharedUser.duration)}
                        </span>
                      </div>
                    ))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="p-2 text-center text-gray-500 font-bold"
                >
                  No Projects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Team;
