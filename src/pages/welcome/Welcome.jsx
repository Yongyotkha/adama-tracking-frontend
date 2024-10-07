import React from "react";
import Button from "../../components/button/Button";

export default function Welcome() {
  const testFunction = () => {
    alert(1);
  };

  return <Button class={"btn-primary"} onClick={testFunction} />;
}
