import React from "react";

export default function Button({ className, text, onClick }) {
  return (
    <div>
      <button className={className}>{text}</button>
    </div>
  );
}
