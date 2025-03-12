import React from "react";
import { Modal, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const ModalRegisterPopup = ({ visible, onConfirm, onCancel }) => {
  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null} // Removing default footer to create a custom one
      centered
    >
      <div className="sarabun-font text-gray-900 text-sm max-h-screen overflow-y-auto p-2">
        <h2 className="sarabun-font text-lg font-semibold text-[#009845] text-start">
          รายละเอียดข้อกำหนดและเงื่อนไข
        </h2>

        <h3 className="sarabun-font font-semibold mt-3 text-[#978B87]">
          นโยบายความเป็นส่วนตัว
        </h3>
        <p className="sarabun-font text-[#978B87]">
          กรุณาอ่านและทำความเข้าใจนโยบายความเป็นส่วนตัว ก่อนลงทะเบียน
          สมัครเป็นสมาชิกเพื่อเข้าใช้บริการเว็บไซต์<br />
          เพื่อผลประโยชน์สูงสุดของท่าน ทางบริษัท ------------------ จำกัด (บริษัทฯ")
          ตระหนักถึงความสำคัญของข้อมูลส่วนตัวของท่าน<br /> บริษัทฯขอสัญญาว่าจะเก็บข้อมูล
          ของท่านเป็นความลับอย่างดีที่สุด
        </p>

        <h3 className="sarabun-font font-semibold mt-3 text-[#978B87]">
          การใช้ข้อมูล
        </h3>
        <p className="sarabun-font text-[#978B87]">
          ข้อมูลที่ท่านเปิดเผยกับ ---------- ไม่ว่าจะเป็น ชื่อ ที่อยู่ E-mail
          Address ข้อมูลเกี่ยวกับการซื้อสินค้า หรือ การชำระเงิน อาจถูกนำไป
          ใช้ในการปรับปรุง และส่งเสริมการให้บริการ การตลาดการพัฒนา
          บริการของเว็บไซต์นี้ เพื่อ ความพึงพอใจและประโยชน์สูงสุดของท่าน
          นอกจากนี้แล้ว --------- ขอสงวนสิทธิ์ที่จะนำข้อมูลของท่าน มาใช้
          ในการวิเคราะห์ข้อมูลได้ตลอดเวลา
        </p>

        <h3 className="sarabun-font font-semibold mt-3 text-[#978B87]">
          ความปลอดภัยของข้อมูล
        </h3>
        <p className="sarabun-font text-[#978B87]">
          ข้อมูลส่วนบุคคลที่ท่านให้หรือใช้ผ่านการประมวลผลของเครื่อง
          คอมพิวเตอร์ที่ควบคุมการทำงานของ เว็บไซต์ -------- ทั้งหมดนั้น
          ท่านได้ยอมรับและตกลงว่าเป็นสิทธิและกรรมสิทธิ์ของ ------.co.th
          อย่างไรก็ตาม -----------  รับประกันว่า ข้อมูลส่วนตัวของท่านจะได้รับ
          การรักษาอย่างเป็นความลับและใช้มาตรฐานความปลอดภัยสูงสุด
          และเพื่อความปลอดภัยของข้อมูล ท่านควรปฏิบัติตามข้อกำหนดและ
          เงื่อนไขการให้บริการของเว็บไซต์นี้โดยเคร่งครัด สำหรับผู้ใช้ทั่วไปการ
          เข้าสู่ข้อมูลของตนเองจำเป็นต้องใช้ชื่อผู้ใช้ที่เป็นสมาชิก และรหัสผ่าน
        </p>
        
      </div>

      {/* Custom Footer Buttons */}
      <div className="flex gap-2 mt-4">
        <Button
          type="button"
          onClick={onCancel}
          className="w-1/2 bg-[#E0DCDB] flex items-center justify-center py-5 rounded-md"
        >
          <ArrowLeftOutlined className="text-[#A19793] mr-2" />
          <span className="sarabun-font text-[#A19793]">ปิดหน้าต่าง</span>
        </Button>

        <Button
          type="button"
          onClick={onConfirm}
          className="w-1/2 bg-[#009845] flex items-center justify-center py-5 rounded-md"
        >
          <span className="sarabun-font text-white">ตกลง</span>
        </Button>
      </div>
    </Modal>
  );
};

export default ModalRegisterPopup;
