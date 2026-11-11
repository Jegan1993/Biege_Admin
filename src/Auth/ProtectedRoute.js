
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { makeApiRequest } from "../AxiosServices/apiCall";

const ProtectedRoute = (props) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adminToken = localStorage.getItem("token");

        if (!adminToken || adminToken === "undefined") {
          localStorage.clear();
          navigate("/", { replace: true });
          return;
        }

        const params = {
          url: "admin-auth",
          method: "POST",
        };

        const response = await makeApiRequest(params);

        if (response?.status) {
          setIsLoggedIn(true);
        } else {
          localStorage.clear();
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.log("An error occurred:", error.message);
        localStorage.clear();
        navigate("/", { replace: true });
      } finally {
        setIsChecking(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (isChecking) {
    return null;
  }

  return isLoggedIn ? props.children : null;
};

export default ProtectedRoute;
