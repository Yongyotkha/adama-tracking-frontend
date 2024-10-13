import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { endPoint, paths } from "../../services/CorsPath";
import { Button, Flex } from "antd";

export default function Welcome() {
  const userInfo = JSON.parse(localStorage.getItem("users"));
  const { isLoggedIn, user, logout } = useContext(AuthContext);

  if (!isLoggedIn)
    return (
      <>
        <p>กรุณาเข้าสู่ระบบก่อนใช้งาน</p>
        <Button type="primary">
          <Link to="/login"> เข้าสู่ระบบ </Link>
        </Button>
      </>
    );

  return (
    <div>
      <h1>Welcome, {userInfo.user.username}</h1>
      <ul>
        <li className="text-blue-500">
          <Link to="/users"> รายชื่อผู้ใช้งาน </Link>
        </li>
      </ul>
      <Button type="primary" onClick={logout}>
        ออกจากระบบ
      </Button>
    </div>
  );
}
