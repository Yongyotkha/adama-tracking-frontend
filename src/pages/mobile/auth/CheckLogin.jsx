import React, { useContext, useEffect, useState } from "react";
import MessageLayout from "../../../layouts/MessageLayout";
import { useNavigate, useOutletContext } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";

export default function CheckLogin() {
  const navigate = useNavigate();
  const { loginLineUid, userInfo } = useContext(AuthContext);
  const [redirectPath, setRedirectPath] = useState(null);
  const [loading, setLoading] = useState(false); // ✅ loading state
  const { lineProfile } = useOutletContext() || {};

  useEffect(() => {
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
          sessionStorage.removeItem("redirectPath");
          // setRedirectPath("/mobile/verify");
          navigate("/mobile/main");
        }
      } finally {
        setLoading(false); // ✅ done loading, whether success or error
      }
    };

    if (lineProfile && !userInfo) {
      fetchUserProfile();
    } else {
      setLoading(false); // no profile = skip loading
    }
  }, [lineProfile]);

  useEffect(() => {
    if (!loading && redirectPath) {
      sessionStorage.removeItem("redirectPath");
      navigate(redirectPath, { replace: true });
    } else if (!loading && !redirectPath) {
      navigate("/mobile/main");
    }
  }, [loading, redirectPath]);

  return <MessageLayout loading={loading} />;
}
