import React, { useState } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import QrScanner from "react-qr-scanner";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
import BackTopLeftButton from "../../../components/mobile/button/BackTopLeftButton";
import "./ScanCollectPointCSS.css"; // ✅ Import CSS

export default function ScanCollectPoint() {
  const [scanResult, setScanResult] = useState("");
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);

  const handleScan = (data) => {
    if (data) {
      setScanResult(data.text);
      setIsPopUpVisible(true);
    }
  };

  const handleError = (error) => {
    console.error("QR Scan Error:", error);
  };

  const handleClosePopUp = () => {
    setIsPopUpVisible(false);
    setScanResult("");
  };

  return (
    <div className="flex flex-col items-center w-full h-screen bg-[#D9D9D9]">
      {/* Header Section */}
      <div className="w-full bg-green-600 text-white flex items-center p-4">
        <BackTopLeftButton to="/mobile/main" className="text-white filter invert brightness-0" />
        <span className="flex-grow text-center text-lg font-semibold sarabun-font">
          สแกนเพื่อสะสม
        </span>
      </div>

      {/* Scan Section */}
      <div className="flex flex-col items-center justify-center flex-grow w-full relative">
        {/* ✅ กรอบ QR Code */}
        <div className="scanner-frame">
          <QrScanner
            delay={300}
            style={{ width: "100%", height: "100%" }}
            onError={handleError}
            onScan={handleScan}
          />
          {/* ✅ เส้นโค้งทั้ง 4 มุม */}
          <div className="corner top-left"></div>
          <div className="corner top-right"></div>
          <div className="corner bottom-left"></div>
          <div className="corner bottom-right"></div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="w-full bg-white p-4 text-center text-gray-500 text-sm sarabun-font">
        วาง Qr Code หรือ บาร์โค้ดให้อยู่ที่กลางหน้าจอ
      </div>

      {/* ✅ PopUp แสดงผลลัพธ์ที่สแกนได้ */}
      <DynamicPopUp
        visible={isPopUpVisible}
        onConfirm={handleClosePopUp}
        text={`<strong>QR Code:</strong> ${scanResult}`}
        confirmText="ตกลง"
      />
    </div>
  );
}
