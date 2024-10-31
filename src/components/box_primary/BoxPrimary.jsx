import React from 'react';

const BoxPrimary = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-white border-t-[10px] border-solid border-[#00783F] rounded-[5px] p-4 ${className} max-w-full flex flex-col`}
      style={{
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Optional for a subtle shadow
      }}
    >
      {children}
    </div>
  );
};

export default BoxPrimary;
