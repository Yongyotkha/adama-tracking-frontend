import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import Button from "../../components/button/Button";

export default function WorkPlan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <>
      <MainLayout
        loading={loading}
        childrenStyle="flex flex-col justify-center items-center h-screen"
      >
        <img src="/img/403-Page-Forbidden.png" alt="403 Page Forbidden" className="w-[50%] mb-6" />

        <div className="text-[39px] text-[#00783F] font-bold text-center mb-6">
          Page Not Found
        </div>

        <Button
          type="primary"
          className="w-full flex justify-center rounded-sm bg-[#00783F] text-white hover:bg-[#00783F] hover:text-green-600 px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          htmlType="button"
          text="Back"
          disabled={loading}
          onClick={() => navigate("/login")}
          style={{ 'max-width': "260px" }}

          />
      </MainLayout>
    </>
  );
}
