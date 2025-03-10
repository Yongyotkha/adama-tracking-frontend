import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../../../../components/navbar/NavbarMobile";
import BackButton from "../../../../../components/mobile/button/BackButton";
import { Collapse } from "antd";
import "./Faq.css"; // ✅ Import CSS

export default function Faq() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const text = `
  “ผู้ซื้อมีสิทธิยกเลิกคำสั่งซื้อโดยการส่งหนังสือแสดงเจตนาได้ภายใน 7 วัน นับแต่วันที่ได้รับสินค้า และทางบริษัทฯ จะคืนเงินที่ผู้ซื้อได้จ่ายไปเพื่อซื้อสินค้า ภายใน 15 วัน นับแต่วันที่ผู้ซื้อใช้สิทธิในการคืนสินค้า ทั้งนี้ เป็นไปตามเงื่อนไขที่บริษัทกำหนด ตามนโยบายการคืนสินค้าและคืนเงิน”

     ทางร้านจะรับเงื่อนไขการขอยกเลิกคำสั่งซื้อ ในกรณีที่พบปัญหาจากการขนส่งหรือสืบเนื่องจากการผลิต รวมถึงสินค้าที่ได้รับไม่ตรงตามที่สั่งซื้อเท่านั้น โดยลูกค้าสามารถแจ้งเรื่องร้องเรียนได้ภายใน 7 วัน หลังจากที่ได้รับสินค้า อ้างอิงจากวันที่ในระบบที่แสดงสถานะว่าสินค้าได้ถูกจัดส่งถึงที่อยู่ลูกค้าเรียบร้อยแล้ว พร้อมหลักฐานรูปถ่ายสินค้าที่ชำรุด/เสียหาย/สูญหาย โดยทางร้านจะพิจารณาให้ เปลี่ยนสินค้าใหม่ทดแทนสินค้าที่ชำรุด/เสียหาย/สูญหาย ก่อนเป็นลำดับแรก หากทางร้านค้าไม่สามารถเปลี่ยนสินค้าใหม่ได้ ทางร้านจะดำเนินการคืนเงินตามมูลค่าสินค้าที่ชำรุด/เสียหาย/สูญหาย เป็นลำดับถัดมา

     ซึ่งหากสินค้าที่ลูกค้าได้รับ ตรงตามเงื่อนไขสินค้าที่สามารถเปลี่ยนได้ ทางร้านยินดีที่จะเปลี่ยนสินค้าให้กับท่าน โดยรายละเอียดเงื่อนไข มีดังนี้

1.ลักษณะสินค้าที่สามารถเปลี่ยนได้

สินค้าชำรุดหรือได้รับความเสียหายจากการขนส่ง
สินค้าที่มีปัญหาและตรวจสอบได้ว่าได้รับความเสียหายสืบเนื่องจากการผลิต
สินค้าที่ได้รับไม่ตรงตามที่สั่งซื้อ

  `
  const items = [
    {
      key: '1',
      label: 'วิธีการแลกรางวัล',
      children: <p>{text}</p>,
    },
    {
      key: '2',
      label: 'วิธีการลุ้นรางวัล',
      children: <p>{text}</p>,
    },
    {
      key: '3',
      label: 'นโยบายการจัดส่งสินค้า',
      children: <p>{text}</p>,
    },
    {
      key: '4',
      label: 'นโยบาย การยกเลิกการสั่งซื้อ / การเปลี่ยน-คืนสินค้า / การคืนเงิน',
      children: <p>{text}</p>,
    },
  ];
  const onChange = (key) => {
    console.log(key);
  };
  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Head Title */}
        <div className="w-full max-w-md py-4 flex justify-between items-center">
          <h2 className="text-[#009845] text-lg font-semibold sarabun-font">คำถามที่พบบ่อย</h2>
        </div>
          <Collapse className="w-full max-w-md bg-white rounded-lg sarabun-font" items={items} defaultActiveKey={['1']} onChange={onChange} expandIconPosition="end" />
        <BackButton />

      </div>
    </MobileLayout>
  );
}
