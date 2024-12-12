import React from "react";

export default function ItemDropDown({ text, link, onClick, mode }) {
  return (
    <>
      {mode == "edit" && (
        <a
          rel="noopener noreferrer"
          href={link}
          onClick={onClick}
          className="block gap-1"
        >
          <img
            src="/img/icons/edit.png"
            alt="Edit icon"
            className="inline-block h-4 m-auto"
          />
          <span className="text-[#978B87] ms-3">{text || "Edit"}</span>
        </a>
      )}

      {mode == "delete" && (
        <a
          rel="noopener noreferrer"
          href={link}
          onClick={onClick}
          className="block gap-1"
        >
          <img
            src="/img/icons/delete.png"
            alt="Delete icon"
            className="inline-block h-4 m-auto"
          />
          <span className="text-[#978B87] ms-3">{text || "Delete"}</span>
        </a>
      )}

      {mode == "view" && (
        <a
          rel="noopener noreferrer"
          href={link}
          onClick={onClick}
          className="block gap-1"
        >
          <img
            src="/img/icons/view.png"
            alt="Delete icon"
            className="inline-block h-4 m-auto"
          />
          <span className="text-[#978B87] ms-3">{text || "View"}</span>
        </a>
      )}
      {mode == "history" && (
        <a
          rel="noopener noreferrer"
          href={link}
          onClick={onClick}
          className="block gap-1"
        >
          <img
            src="/img/icons/view.png"
            alt="Delete icon"
            className="inline-block h-4 m-auto"
          />
          <span className="text-[#978B87] ms-3">{text || "History"}</span>
        </a>
      )}
      {mode == "create" && (
        <a
          rel="noopener noreferrer"
          href={link}
          onClick={onClick}
          className="block gap-1"
        >
          <img
            src="/img/icons/create.png"
            alt="Create icon"
            className="inline-block h-4 m-auto"
          />
          <span className="text-[#978B87] ms-3">{text || "create"}</span>
        </a>
      )}

      {mode == "approve" && (
        <a
          rel="noopener noreferrer"
          href={link}
          onClick={onClick}
          className="block gap-1"
        >
          <img
            src="/img/icons/approve.png"
            alt="Approve icon"
            className="inline-block h-4 m-auto"
          />
          <span className="text-[#978B87] ms-3">{text || "Approve"}</span>
        </a>
      )}
    </>
  );
}
