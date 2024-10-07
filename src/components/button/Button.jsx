import React from "react";

export default function Button({ className, onClick }) {
  return (
    <div>
      <button className={`btn ${className}`} onClick={onClick}>
        Button
      </button>
    </div>
  );
}
