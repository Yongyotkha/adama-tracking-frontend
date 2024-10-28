import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";
import "antd/dist/reset.css";
import Error403 from "./pages/error/Error403";
import Error404 from "./pages/error/Error404";
import Error500 from "./pages/error/Error500";
import Error503 from "./pages/error/Error503";
import Login from "./pages/auth/Login";
import Users from "./pages/users/Users";
import Verify from "./pages/auth/Verify";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ChangePassword from "./pages/auth/ChangePassword";
import Wiki from "./pages/wiki/Wiki";
import Dashboard from "./pages/dashboard/Dashboard";
import WorkPlan from "./pages/workplan/WorkPlan";
import WorkPlanCreate from "./pages/workplan/WorkPlanCreate";
import WorkPlanCreateStepTwo from "./pages/workplan/WorkPlanCreateStepTwo";
import { ConfigProvider } from "antd";

const App = () => {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* <Route path="/" element={<Welcome />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/sale-plan/work-plan" element={<WorkPlan />} />
          <Route
            path="/sale-plan/work-plan/create"
            element={<WorkPlanCreate />}
          />
          <Route
            path="/sale-plan/work-plan/create-2"
            element={<WorkPlanCreateStepTwo />}
          />
          <Route path="/error/403" element={<Error403 />} />
          <Route path="/error/404" element={<Error404 />} />
          <Route path="/error/500" element={<Error500 />} />
          <Route path="/error/503" element={<Error503 />} />
          <Route path="/wiki" element={<Wiki />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
