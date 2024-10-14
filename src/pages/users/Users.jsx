import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { paths } from "../../services/CorsPath";
import useServiceAPI from "../../services/corsService";
import { Button } from "antd";

export default function Users() {
  const [userInfo, setUserInfo] = useState([]);
  const [loading, setLoading] = useState(false); // จัดการ loading state
  const [error, setError] = useState(null);

  useEffect(() => {
    const body = {};
    useServiceAPI
      .get(paths.pathMasterUsers, body, setLoading)
      .then((response) => {
        setUserInfo(response.data);
      })
      .catch((error) => {
        console.log(error.message);
        
        setError(error.message);
      });
  }, []);

  return (
    <div>
      <h1>รายชื่อผู้ใช้งานทั้งหมด: </h1>
      <ul>
        {userInfo?.map((data) => (
          <li key={data.id}>{data.username}</li>
        ))}
      </ul>
    </div>
  );
}
