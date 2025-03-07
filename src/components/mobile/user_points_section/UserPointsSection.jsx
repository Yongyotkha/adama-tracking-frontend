import React from "react";

const UserPointsSection = ({ pointsData }) => {
  return (
    <div className="w-full max-w-xs flex flex-col items-center mt-4">
      <div
        className="bg-[url('/img/bg-point.png')] bg-[length:100%_100%] bg-center bg-no-repeat text-white rounded-full flex items-center justify-center aspect-[1573/256] w-full"
      >
        <span className="sarabun-font text-md">
          คุณมี {pointsData.currentPoints} คะแนน
        </span>
      </div>
      <p className="text-[#A19793] sarabun-font text-xs mt-1">
        คะแนนหมดอายุ : {pointsData.expiringPoints} คะแนน | {pointsData.expiryDate}
      </p>
    </div>
  );
};

export default UserPointsSection;
