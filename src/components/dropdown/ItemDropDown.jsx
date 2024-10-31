import React from "react";

export default function ItemDropDown({ text, link, onClick, mode }) {
  return (
    <>
      {mode == "edit" && (
        <a rel="noopener noreferrer" onClick={onClick} className="flex gap-1">
          <img
            src="/img/icons/edit.png"
            alt="Edit icon"
            className="inline-block h-4"
          />
          <span className="text-[#978B87]">{text || "Edit"}</span>
        </a>
      )}

      {mode == "delete" && (
        <a rel="noopener noreferrer" className="flex gap-1">
          <img
            src="/img/icons/delete.png"
            alt="Delete icon"
            className="inline-block h-4"
          />
          <span className="text-[#978B87]">{text || "Delete"}</span>
        </a>
      )}
    </>
  );
}
