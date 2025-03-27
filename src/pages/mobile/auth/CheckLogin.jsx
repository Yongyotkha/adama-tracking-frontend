import React, { useContext, useEffect, useState } from "react";
import MessageLayout from "../../../layouts/MessageLayout";
import { useNavigate, useOutletContext } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";

export default function CheckLogin() {
  const navigate = useNavigate();
  const { loginLineUid, userInfo } = useContext(AuthContext);
  const [redirectPath, setRedirectPath] = useState(null);
  const { lineProfile } = useOutletContext() || {};

  useEffect(() => {
    console.log(lineProfile, "lineProfile");
    const fetchUserProfile = async () => {
      try {
        const results = await loginLineUid(lineProfile.userId);
        if (results.status === 200) {
          console.log(results);
          const storedRedirectPath =
            localStorage.getItem("redirectPath") || "/mobile/main";
          setRedirectPath(storedRedirectPath);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (error?.response?.status === 401) {
          setRedirectPath("/mobile/verify");
        }
      }
    };

    if (lineProfile && !userInfo) {
      fetchUserProfile();
    }
  }, [lineProfile]);

  useEffect(() => {
    if (redirectPath) {
      sessionStorage.removeItem("redirectPath");
      navigate(redirectPath, { replace: true });
    } else {
      navigate("/mobile/main");
    }
  }, []);

  return <MessageLayout loading={true} />;
}
