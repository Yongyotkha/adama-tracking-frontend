import React from "react";

export default function Title({ prefix, suffix, showYear, showMonth }) {
  return (
    <div className="flex justify-between items-center">
      <div className="title-page">{prefix}</div>
      {suffix && <div className="title-page">{suffix}</div>}
      {showYear && !showMonth && (
        <div
          className={
            "pointer-events-none  border-[1px] text-[#00783F] border-[#00783F] py-[6px] px-[24px] rounded-md font-bold"
          }
        >
          {showYear}
        </div>
      )}

      {showYear && showMonth && (
        <div className="flex gap-2">
          <div
            className={
              "pointer-events-none  border-[1px] text-[#00783F] border-[#00783F] py-[6px] px-[24px] rounded-md font-bold"
            }
          >
            {showMonth}
          </div>
          <div
            className={
              "pointer-events-none  border-[1px] text-[#00783F] border-[#00783F] py-[6px] px-[24px] rounded-md font-bold"
            }
          >
            {showYear}
          </div>
        </div>
      )}
    </div>
  );
}
