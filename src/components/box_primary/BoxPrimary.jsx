import React from 'react';

const BoxPrimary = ({ title, children, className = '' }) => {
  return (
    <div
      className={`bg-white border-t-[10px] border-solid border-[#00783F] rounded-[5px] p-4 ${className}`}
      style={{
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Optional for a subtle shadow
      }}
    >
      {title && <div className="text-[#00783F] text-lg mb-3">{title}</div>}
      {children}
    </div>
  );
};

export default BoxPrimary;
