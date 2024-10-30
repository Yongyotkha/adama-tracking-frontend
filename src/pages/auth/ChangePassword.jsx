import React, { useState } from "react";
import MessageLayout from "../../layouts/MessageLayout";
import { useNavigate } from "react-router-dom";

import { Input } from "antd";
import DynamicButton from "../../components/button/DynamicButton";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const checkPasswordStrength = (password) => {
    const conditions = [
      { text: "At least 8 characters", regex: /.{8,}/ },
      { text: "Contains a digit", regex: /\d/ },
      { text: "Contains a lowercase letter", regex: /[a-z]/ },
      { text: "Contains an uppercase letter", regex: /[A-Z]/ },
      { text: "Contains a symbol", regex: /[!@#$%^&*(),.?":{}|<>]/ },
    ];

    const results = conditions.map((condition) => ({
      ...condition,
      isMet: condition.regex.test(password),
    }));

    const isStrong = results.every((condition) => condition.isMet);
    return { results, isStrong };
  };

  const passwordStrength = checkPasswordStrength(password);
  const isPasswordMatch = password && confirmPassword && password === confirmPassword;
  const allGreen = passwordStrength.isStrong && isPasswordMatch;

  return (
    <MessageLayout
      loading={loading}
      childrenStyle="flex justify-center items-center flex-col gap-3 h-full max-w-xs p-4 m-auto"
    >
      <img
        src="/img/icons/change-password.png"
        alt="Change-Password"
        className="w-[200px]"
      />
      <p className="text-[#00783F] text-xl font-bold">Change Password</p>

      <div>
        <p className="text-center mb-3 text-[#978B87]">
          Your New Password Must Be Different <br />
          From Previously Used Password
        </p>

        <Input.Password
          placeholder="New Password"
          className={`p-2 rounded-md border mb-4 mt-4 ${password.length > 0 && !passwordStrength.isStrong ? "border-red-500" : passwordStrength.isStrong ? "border-green-500" : "border-gray-300"
            }`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Input.Password
          placeholder="Confirm Password"
          className={`p-2 rounded-md border mb-4 ${allGreen ? "border-green-500" : isPasswordMatch || !confirmPassword ? "border-gray-300" : "border-red-500"
            }`}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <ul className="list-disc pl-5 mb-4">
          {!isPasswordMatch && confirmPassword && (
            <li className="text-red-500">Passwords do not match</li>
          )}
          {passwordStrength.results.map((condition, index) => (
            <li
              key={index}
              className={`${condition.isMet ? "text-green-500" : "text-red-500"}`}
            >
              {condition.text}
            </li>
          ))}
          {password.length > 0 && (
            <li
              className={`${passwordStrength.isStrong ? "text-green-500" : "text-red-500"}`}
            >
              Password Strength: {passwordStrength.isStrong ? "Strong" : "Weak"}
            </li>
          )}
        </ul>

        <div className="mb-40">
          <DynamicButton
            type="primary"
            className="flex w-full justify-center rounded-sm bg-[#00783F] text-white hover:bg-[#00783F] hover:text-green-600 px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full max-w-full mb-3"
            htmlType="submit"
            text="Save"
            disabled={loading}
          />

          <DynamicButton
            type="primary"
            className="flex w-full justify-center rounded-sm bg-white text-[#00783F] hover:bg-white hover:text-gray-600 px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full max-w-full mb-3"
            htmlType="button"
            text="Cancel"
            disabled={loading}
            onClick={() => navigate("/login")}
          />
        </div>
      </div>
    </MessageLayout>
  );
}
