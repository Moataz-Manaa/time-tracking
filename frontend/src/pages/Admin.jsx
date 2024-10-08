import { useState, useEffect } from "react";
import axios from "axios";
import { formatDuration } from "../utils"; // Adjust the path as necessary

function Admin() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3000/api/v1/projects/all-details",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProjects(response.data.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const getUserDuration = (userId, userDurations) => {
    const userDuration = userDurations.find((ud) => ud.user === userId);
    return userDuration ? userDuration.duration : 0;
  };

  return (
    <div className="container mx-auto max-w-7xl p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-6">Admin Page</h2>
      </div>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border-collapse block md:table mx-auto text-center text-lg">
            <thead className="block md:table-header-group">
              <tr className="border border-grey-500 md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto md:relative">
                <th className="bg-gray-600 pl-5 pt-2 pb-2 text-white font-bold md:border md:border-grey-500 text-left block md:table-cell">
                  Project Name
                </th>
                <th className="bg-gray-600 pl-5 pt-2 pb-2 text-white font-bold md:border md:border-grey-500 text-left block md:table-cell">
                  Total Duration
                </th>
                <th className="bg-gray-600 pl-5 pt-2 pb-2 text-white font-bold md:border md:border-grey-500 text-left block md:table-cell">
                  Team
                </th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {projects.map((project) => (
                <tr
                  key={project._id}
                  className="bg-gray-100 border border-grey-500 md:border-none block md:table-row"
                >
                  <td className="pl-5 pb-2 pt-2 md:border md:border-grey-500 md:table-cell text-left">
                    {project.projectName}
                  </td>
                  <td className="pl-5 pb-2 pt-2 md:border md:border-grey-500 md:table-cell text-left">
                    {formatDuration(project.totalDuration)}
                  </td>
                  <td className="pl-5 pb-2 pt-2 md:border md:border-grey-500 md:table-cell text-left">
                    <ul className="list-disc pl-5">
                      <li className="mb-2">
                        <span className="font-semibold">
                          {project.user.firstName} {project.user.lastName}{" "}
                          (project creator)
                        </span>{" "}
                        Work For :{" "}
                        <span className="text-red-600">
                          {formatDuration(
                            getUserDuration(
                              project.user._id,
                              project.userDurations
                            )
                          )}
                        </span>
                        <ul className="list-none pl-4">
                          {project.tasks
                            .filter((task) => task.user === project.user._id)
                            .map((task) => (
                              <li key={task._id} className="text-blue-700">
                                {task.title}
                              </li>
                            ))}
                        </ul>
                      </li>
                      {project.sharedWith.map((user) => (
                        <li key={user._id} className="mb-2">
                          <span className="font-semibold">
                            {user.firstName} {user.lastName}
                          </span>{" "}
                          Work For :{" "}
                          <span className="text-red-600">
                            {formatDuration(
                              getUserDuration(user._id, project.userDurations)
                            )}
                          </span>
                          <ul className="list-none pl-4">
                            {project.tasks
                              .filter((task) => task.user === user._id)
                              .map((task) => (
                                <li key={task._id} className="text-blue-700">
                                  {task.title}
                                </li>
                              ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Admin;
