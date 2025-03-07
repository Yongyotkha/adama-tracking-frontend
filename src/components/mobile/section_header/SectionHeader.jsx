import React from "react";

const SectionHeader = ({ title, icon }) => {
  return (
    <div className="w-full max-w-md mt-6">
      <div className="flex items-center w-full">
        <div
          className="flex items-center px-6 py-2 rounded-l-full w-full"
          style={{
            background: "linear-gradient(to right, #00783F 0%, #FFFFFF 93%, #FFFFFF 98%)",
          }}
        >
          {icon && <img src={icon} className="object-cover w-6 h-6 mr-3" alt="icon" />}
          <h3 className="text-white text-lg font-semibold sarabun-font">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;
