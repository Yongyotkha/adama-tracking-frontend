import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";
import "antd/dist/reset.css";
import Welcome from "./pages/welcome/Welcome";
import Example from "./pages/example/Example";
import Error from "./pages/error/Error";
import Login from "./pages/auth/Login";
import Users from "./pages/users/Users";
import Verify from "./pages/auth/Verify";
import Wiki from "./pages/wiki/Wiki";

const App = () => {
    
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<Verify />} />
          <Route path="/users" element={<Users />} />
          <Route path="/example" element={<Example />} />
          <Route path="*" element={<Error />} />
          <Route path="/wiki" element={<Wiki />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
