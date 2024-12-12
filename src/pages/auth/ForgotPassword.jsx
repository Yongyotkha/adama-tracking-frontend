import React, { useContext, useState } from "react";
import MessageLayout from "../../layouts/MessageLayout";
import { useNavigate } from "react-router-dom";
import { Input } from "antd";
import DynamicButton from "../../components/button/DynamicButton";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const { showNotification } = useContext(AuthContext);

  const handleSubmit = async () => {
    await useServiceAPI
      .post(paths.pathVerifyPhone, {
        phone_number: phone,
      })
      .then((response) => {
        if (response.status === 200) {
          console.log(response);
          response.data.mode = "forgot";
          showNotification("success", response.message).then(() => {
            navigate("/verify-otp", {
              state: response.data,
            });
          });
        }
      })
      .catch((error) => {
        console.log(error);
        let message = error.response.data.data.Message;
        showNotification("error", message.Message_Header, message.Message_Line);
      });

    console.log(123);
  };

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
            value={phone}
            placeholder="Enter numbers only"
            className="p-2 my-4 rounded-md border border-gray-300 w-full"
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, ""));
            }}
          />
          <div className="mb-40 mt-4">
            <DynamicButton
              type="button"
              className="flex w-full justify-center rounded-sm bg-[#00783F] text-white hover:bg-[#00783F] hover:text-green-600 px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full max-w-full mb-3"
              htmlType="button"
              text="Send"
              disabled={loading}
              onClick={handleSubmit}
            />

            <DynamicButton
              type="button"
              className="flex w-full justify-center rounded-sm bg-white text-[#00783F] hover:bg-white hover:text-gray-600 px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full max-w-full mb-3"
              // htmlType="button"
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
