import React from "react";

export default function ItemDropDown({ text, link, onClick, mode }) {
  return (
    <>
      {(mode === "edit" || mode === "rolling forecast (summary)" || mode === "sub dealer by dealer") && (
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

      {mode === "delete" && (
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

      {(mode === "view" || mode === "approved_area" || mode === "approved_head" || mode === "approved_accounting") && (
        <a
          rel="noopener noreferrer"
          href={link}
          onClick={onClick}
          className="block gap-1"
        >
          <img
            src="/img/icons/view.png"
            alt="View icon"
            className="inline-block h-4 m-auto"
          />
          <span className="text-[#978B87] ms-3">{text || "View"}</span>
        </a>
      )}

      {mode === "history" && (
        <a
          rel="noopener noreferrer"
          href={link}
          onClick={onClick}
          className="block gap-1"
        >
          <img
            src="/img/icons/view.png"
            alt="History icon"
            className="inline-block h-4 m-auto"
          />
          <span className="text-[#978B87] ms-3">{text || "History"}</span>
        </a>
      )}

      {(mode === "create" || mode === "rolling forecast (dealer)") && (
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
          <span className="text-[#978B87] ms-3">{text || "Create"}</span>
        </a>
      )}

      {mode === "approve" && (
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

      {/* For any mode that doesn't match the above, display as View */}
      {/* {!["edit", "delete", "view", "history", "create", "approve"].includes(mode) && (
        <a
          rel="noopener noreferrer"
          href={link}
          onClick={onClick}
          className="block gap-1"
        >
          <img
            src="/img/icons/view.png"
            alt="Generic icon"
            className="inline-block h-4 m-auto"
          />
          <span className="text-[#978B87] ms-3">{text || "View"}</span>
        </a>
      )} */}
    </>
  );
}
