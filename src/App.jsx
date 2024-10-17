import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";
import "antd/dist/reset.css";
import Welcome from "./pages/welcome/Welcome";

import Error from "./pages/error/Error";
import Login from "./pages/auth/Login";
import Users from "./pages/users/Users";
import Verify from "./pages/auth/Verify";
import Wiki from "./pages/wiki/Wiki";
import Dashboard from "./pages/dashboard/Dashboard";
import WorkPlan from "./pages/workplan/WorkPlan";
import WorkPlanCreate from "./pages/workplan/Create";
import { ConfigProvider } from "antd";

const App = () => {
 
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<WorkPlan />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<Verify />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sale-plan/work-plan" element={<WorkPlan />} />
          <Route
            path="/sale-plan/work-plan/create"
            element={<WorkPlanCreate />}
          />
          <Route path="*" element={<Error />} />
          <Route path="/wiki" element={<Wiki />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
