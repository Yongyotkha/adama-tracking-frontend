import React, { useState } from "react";
import MessageLayout from "../../layouts/MessageLayout";
import { useNavigate } from "react-router-dom";
import Button from "../../components/button/Button";
import { Input } from "antd";


export default function Verify() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return (
    <>
      <MessageLayout
        loading={loading}
        childrenStyle="flex justify-center items-center flex-col gap-3 h-full max-w-xs p-4 m-auto"
      >

        <img
          src="\img\icons\forgot-password.png"
          alt="Forgot-Password"
          className="w-[200px]"
        />
        <p className="text-[#00783F] text-xl font-bold">Forgot Password</p>

        <div>
          <p className="text-center my-4 text-[#978B87]">
            Please Enter Your Phone Or Username <br />
            To Recieve a Verification
          </p>

          <Input
            value=''
            placeholder="Phone Number"
            className="p-2 my-4 rounded-md border border-gray-300"
          />
          <div className="mb-40 mt-4">
            <Button
              type="primary"
              className="flex w-full justify-center rounded-sm bg-[#00783F] text-white hover:bg-[#00783F] hover:text-green-600 px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full max-w-full mb-3"
              htmlType="submit"
              text="Send"
              disabled={loading}
            />

            <Button
              type="primary"
              className="flex w-full justify-center rounded-sm bg-white text-[#00783F] hover:bg-white hover:text-gray-600 px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full max-w-full mb-3"
              htmlType="button"
              text="Cancel"
              disabled={loading}
              onClick={() => navigate("/login")} // Navigate back on cancel
            />
          </div>
        </div>

      </MessageLayout>
    </>
  );
}
