import React, { useState, useEffect } from "react";
import { Button, Input } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import QrScanner from "react-qr-barcode-scanner";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
import BackTopLeftButton from "../../../components/mobile/button/BackTopLeftButton";
import "./ScanCollectPointCSS.css";
import ActionButton from "../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";

export default function ScanCollectPoint() {
  const [scanResult, setScanResult] = useState("");
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const navigate = useNavigate();

  // ขอสิทธิ์กล้อง
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        setCameraPermission(true);
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch((error) => {
        console.error("Permission denied or error:", error);
        setCameraPermission(false);
      });
  }, []);

  const handleScan = (err, result) => {
    if (result) {
      setScanResult(result.text);
      setIsPopUpVisible(true);
    }
    if (err) {
      console.error("Scan Error:", err);
    }
  };

  const handleClosePopUp = () => {
    setIsPopUpVisible(false);
    setScanResult("");
  };

  return (
    <div className="flex flex-col items-center w-full h-screen bg-[#D9D9D9]">
      {/* Header Section */}
      <div className="w-full bg-green-600 text-white flex items-center p-4">
        <BackTopLeftButton
          to="/mobile/main"
          className="text-white filter invert brightness-0"
        />
        <span className="flex-grow text-center text-lg font-semibold sarabun-font">
          สแกนเพื่อสะสม
        </span>
      </div>

      {/* Scan Section */}
      <div className="flex flex-col items-center justify-center flex-grow w-full relative">
        <div className="scanner-frame">
          {cameraPermission === null && <p>กำลังขอสิทธิ์กล้อง...</p>}
          {cameraPermission === false && (
            <p className="text-red-600">
              ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตจากเบราว์เซอร์
            </p>
          )}
          {cameraPermission && (
            <>
              <QrScanner
                onUpdate={handleScan}
                constraints={{ facingMode: "environment" }}
                style={{ width: "100%", height: "100%" }}
              />
              {/* เส้นโค้ง 4 มุม */}
              <div className="corner top-left"></div>
              <div className="corner top-right"></div>
              <div className="corner bottom-left"></div>
              <div className="corner bottom-right"></div>
            </>
          )}
        </div>
        <div className="mt-5 flex flex-col gap-5">
          <Input
            value={scanResult}
            placeholder="code"
            className=""
            onChange={(value) => setScanResult(value)}
          />
          <ActionButton
            mode="save"
            text="เปิดกล้อง"
            onClick={() => navigate("/mobile/take-photo")}
          />
        </div>
      </div>

      {/* Footer Section */}
      <div className="w-full bg-white p-4 text-center text-gray-500 text-sm sarabun-font">
        วาง QR Code หรือ บาร์โค้ดให้อยู่ที่กลางหน้าจอ
      </div>

      {/* PopUp แสดงผล */}
      <DynamicPopUp
        visible={isPopUpVisible}
        onConfirm={handleClosePopUp}
        text={`<strong>ผลลัพธ์:</strong> ${scanResult}`}
        confirmText="ตกลง"
      />
    </div>
  );
}
