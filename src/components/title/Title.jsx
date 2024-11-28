import React from "react";

export default function Title({ prefix, suffix, showYear }) {
  return (
    <div className="flex justify-between items-center">
      <div className="title-page">{prefix}</div>
      {suffix && <div className="title-page">{suffix}</div>}
      {showYear && (
        <div
          className={
            "pointer-events-none  border-[1px] text-[#00783F] border-[#00783F] py-[6px] px-[24px] rounded-md font-bold"
          }
        >
          {showYear}
        </div>
      )}
    </div>
  );
}
