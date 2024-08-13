import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaLock } from "react-icons/fa";

const Profile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3000/api/v1/users/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFirstName(response.data.data.firstName);
        setLastName(response.data.data.lastName);
      } catch (error) {
        console.error("Error fetching user info", error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        "http://localhost:3000/api/v1/users/me",
        { firstName, lastName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Error updating profile");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        "http://localhost:3000/api/v1/users/updateMyPassword",
        {
          passwordCurrent: currentPassword,
          password: newPassword,
          passwordConfirm: confirmNewPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Password updated successfully!");
      setShowModal(false);
    } catch (error) {
      toast.error("Error updating password");
    }
  };

  return (
    <div className="container mx-auto max-w-7xl p-4">
      <h2 className="text-2xl font-bold mb-6">Profile</h2>
      <form onSubmit={handleUpdate} className="ml-6">
        <div className="mb-4 flex items-center">
          <label htmlFor="firstName" className="block text-gray-700 mr-4">
            First Name:
          </label>
          <input
            type="text"
            id="firstName"
            className="p-2 border border-gray-300 rounded"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4 flex items-center">
          <label htmlFor="lastName" className="block text-gray-700 mr-4">
            Last Name:
          </label>
          <input
            type="text"
            id="lastName"
            className="p-2 border border-gray-300 rounded"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="py-2 px-4 mb-4 bg-green-600 text-white rounded"
        >
          Update
        </button>
        <button
          type="button"
          className=" py-2 px-4 flex items-center  bg-zinc-100 text-black rounded outline outline-2  "
          onClick={() => setShowModal(true)}
        >
          <FaLock className="mr-2" />
          Change Password
        </button>
      </form>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Update Password</h3>
            <form onSubmit={handlePasswordUpdate}>
              <div className="mb-4">
                <label
                  htmlFor="currentPassword"
                  className="block text-gray-700"
                >
                  Current Password:
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  className="p-2 border border-gray-300 rounded w-full"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-gray-700">
                  New Password:
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="p-2 border border-gray-300 rounded w-full"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="confirmNewPassword"
                  className="block text-gray-700"
                >
                  Confirm New Password:
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  className="p-2 border border-gray-300 rounded w-full"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="py-2 px-4 bg-gray-500 text-white rounded mr-4"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-600 text-white rounded"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Profile;
