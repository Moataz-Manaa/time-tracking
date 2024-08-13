import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ActivationPage = () => {
  const { activationCode } = useParams();
  const [status, setStatus] = useState("");

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/v1/users/activate/${activationCode}`
        );
        setStatus(response.data.message);
      } catch (err) {
        setStatus("Activation failed. Invalid activation code.");
      }
    };

    activateAccount();
  }, [activationCode]);

  return (
    <div className="container">
      <h1>Account Activation</h1>
      <p>{status}</p>
    </div>
  );
};

export default ActivationPage;
