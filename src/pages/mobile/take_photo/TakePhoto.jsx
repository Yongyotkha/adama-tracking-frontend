import React, { useRef, useState, useEffect } from "react";
import { Input } from "antd";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
import BackTopLeftButton from "../../../components/mobile/button/BackTopLeftButton";
import ActionButton from "../../../components/button/ActionButton";
import "./TakePhotoCSS.css";

export default function TakePhoto() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState("");

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        setCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Camera access denied:", error);
        setCameraPermission(false);
      });

    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream && stream.getTracks) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/png");
      setPhotoDataUrl(imageDataUrl);
      setIsPopUpVisible(true);
    }
  };

  const handleClosePopUp = () => {
    setIsPopUpVisible(false);
    setPhotoDataUrl("");
  };

  return (
    <div className="flex flex-col items-center w-full h-screen bg-[#D9D9D9]">
      {/* Header */}
      <div className="w-full bg-green-600 text-white flex items-center p-4">
        <BackTopLeftButton
          to="/mobile/main"
          className="text-white filter invert brightness-0"
        />
        <span className="flex-grow text-center text-lg font-semibold sarabun-font">
          ถ่ายภาพเพื่อสะสม
        </span>
      </div>

      {/* Camera Section */}
      <div className="flex flex-col items-center justify-center flex-grow w-full relative">
        <div className="scanner-frame">
          {cameraPermission === null && <p>กำลังขอสิทธิ์กล้อง...</p>}
          {cameraPermission === false && (
            <p className="text-red-600">
              ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตจากเบราว์เซอร์
            </p>
          )}
          {cameraPermission && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="mt-5 flex flex-col gap-5">
          <ActionButton mode="save" text="ถ่ายภาพ" onClick={takePhoto} />
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-white p-4 text-center text-gray-500 text-sm sarabun-font">
        วางวัตถุให้อยู่กลางกล้องก่อนกดถ่าย
      </div>

      {/* PopUp พรีวิวรูป */}
      <DynamicPopUp
        visible={isPopUpVisible}
        onConfirm={handleClosePopUp}
        confirmText="ตกลง"
        text={
          photoDataUrl
            ? `<img src="${photoDataUrl}" alt="Captured" style="width: 300px; height: 400px; object-fit: cover;" />`
            : ""
        }

      />
    </div>
  );
}
