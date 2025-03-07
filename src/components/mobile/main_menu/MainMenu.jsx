import React from "react";
import MenuButton from "../button/MenuButton";

const MainMenu = () => {
  const menuItems = [
    {
      icon: "/img/icons/scan-collect-oa.png",
      text: "สแกนเพื่อสะสมคะแนน",
      url: "/mobile/scan-collect",
    },
    {
      icon: "/img/icons/redeem-oa.png",
      text: "แลกคะแนนสะสม",
      url: "/mobile/redeem-point",
    },
    {
      icon: "/img/icons/history-oa.png",
      text: "ประวัติการซื้อสินค้า",
      url: "/mobile/history-purchase",
    },
    {
      icon: "/img/icons/history-redeem-oa.png",
      text: "ประวัติการแลกคะแนน",
      url: "/mobile/redeem-history",
    },
  ];

  return (
    <div className="w-full max-w-md mt-6 flex flex-col space-y-3">
      {menuItems.map((item, index) => (
        <MenuButton key={index} icon={item.icon} text={item.text} url={item.url} />
      ))}
    </div>
  );
};

export default MainMenu;
