import React from "react";

export default function Button({ className, text, onClick }) {
  return (
    <div>
      <button className={`border-2 p-2 m-2 rounded-lg ${className}`}>{text}</button>
    </div>
  );
}
