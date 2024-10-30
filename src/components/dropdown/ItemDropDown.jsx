import React from "react";
import { useNavigate } from "react-router-dom";

export default function ItemDropDown({ text, link }) {
  const navigate = useNavigate();

  return (
    <>
      <a
        // target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => navigate(link)}
      >
        {text}
      </a>
    </>
  );
}
