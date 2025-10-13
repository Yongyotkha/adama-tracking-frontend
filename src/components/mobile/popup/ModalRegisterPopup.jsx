import React, { useState, useRef, useEffect } from "react";
import { Modal, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const ModalRegisterPopup = ({ visible, onConfirm, onCancel }) => {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const contentRef = useRef(null);



  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight * 0.7;
        setIsScrolledToBottom(isNearBottom);
      }
    };

    const contentDiv = contentRef.current;
    if (contentDiv) {
      contentDiv.addEventListener("scroll", handleScroll);
      handleScroll(); // เช็คครั้งแรกเผื่อกรณีเปิด modal มาแล้วอ่านไปถึงล่างสุด
    }

    return () => {
      if (contentDiv) {
        contentDiv.removeEventListener("scroll", handleScroll);
      }
    };
  }, [visible]); // ให้ useEffect รันใหม่เมื่อ modal ถูกเปิด/ปิด

  // console.log(isScrolledToBottom);
  
  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null} // Removing default footer to create a custom one
      centered
    >

      <div className="sarabun-font text-gray-900 text-sm max-h-screen overflow-y-auto p-2" ref={contentRef}>
        
        <h2 className="sarabun-font text-lg font-semibold text-[#009845] text-start">
          รายละเอียดข้อกำหนดและเงื่อนไข
        </h2>

        <h3 className="sarabun-font font-semibold mt-3 text-[#978B87]">
          นโยบายความเป็นส่วนตัว
        </h3>
        <p className="sarabun-font text-[#978B87]">
        ความยินยอมในการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล
        สมาชิกอดามา สไมล์ พลัสตกลงยินยอมให้ บริษัท อดามา (ประเทศไทย) จำกัด เข้าถึง เก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคลซึ่งได้บันทึกและจัดเก็บอยู่ในบัตรประจำตัวประชาชนแบบอเนกประสงค์ (Smart Card) หรือพาสปอร์ต (Passport) หรือเอกสารอื่นใดที่ออกโดยหน่วยงานราชการ และ/หรือที่บริษัทเก็บรวบรวมจากแหล่งอื่นหรือบุคคลอื่นใดโดยถูกต้องตามกฎหมายที่ใช้บังคับอยู่ในขณะนั้น รวมถึงข้อมูลส่วนบุคคลอื่นใดของสมาชิก เช่น:

        ชื่อ-นามสกุล
        หมายเลขบัตรประชาชน / หมายเลขพาสปอร์ต
        วันเดือนปีเกิด
        ที่อยู่
        หมายเลขโทรศัพท์
        รายการซื้อสินค้าหรือบริการ
        ข้อมูลจากการสอบถามหรือมีปฏิสัมพันธ์กับบริษัท เช่น ข้อคิดเห็น คำติชม คำถาม

        ข้อมูลดังกล่าวสามารถนำไปใช้ตามวัตถุประสงค์ในการ:

        พัฒนาประสิทธิภาพของสินค้าและบริการ
        จัดหรือทำการตลาดเกี่ยวกับสินค้า บริการ และสิทธิประโยชน์
        จัดกิจกรรมส่งเสริมการขาย
        ทำวิจัย วิเคราะห์ และสำรวจทางการตลาด
        จัดทำข้อมูลสถิติ
        นำเสนอสิทธิประโยชน์ใหม่ ๆ ให้แก่สมาชิก

        บริษัทจะประมวลผลข้อมูลดังกล่าวให้สอดคล้องกับวัตถุประสงค์และให้เกิดประโยชน์สูงสุดแก่สมาชิก โดยดำเนินการตามกฎหมายที่เกี่ยวข้อง

        การเปิดเผยข้อมูลต่อบุคคลภายนอก
        บริษัทอาจเปิดเผยข้อมูลส่วนบุคคลต่อบริษัทในเครือของ บริษัท อดามา (ประเทศไทย) จำกัด หรือพันธมิตรทางธุรกิจที่เกี่ยวข้องกับการให้บริการสมาชิกอดามา สไมล์ พลัส โดยจะดำเนินการตามวัตถุประสงค์ที่ระบุไว้ข้างต้น และจะขอความยินยอมจากสมาชิกก่อนเปิดเผยข้อมูลในกรณีที่กฎหมายกำหนด

        การถอนความยินยอม
        หากสมาชิกไม่ประสงค์ให้เปิดเผยข้อมูลส่วนบุคคล สามารถแจ้งมายังบริษัทเพื่อขอถอนความยินยอมเมื่อใดก็ได้ โดยติดต่อผ่านช่องทางดังนี้:
        เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล
        บริษัท อดามา (ประเทศไทย) จำกัด
        127/33 อาคารปัญจธานี ทาวเวอร์ ชั้น 28 ถนนนนทรี แขวงช่องนนทรี เขตยานนาวา กรุงเทพฯ 10120
        อีเมล: privacy@adama.co.th (กรุณายืนยันอีเมลจริงของบริษัท)
        โทรศัพท์: 02-xxx-xxxx (กรุณาระบุเบอร์จริง)

        ข้อสงวนสิทธิ์
        บริษัทไม่มีเจตนาในการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคลเพื่อเสนอขายสินค้าหรือบริการ หรือเสนอสิทธิประโยชน์ใด ๆ แก่สมาชิก หรือการติดตามพฤติกรรมของสมาชิกเมื่ออยู่ในประเทศอื่น
        หากมีกรณีพิพาท ให้ตีความตามหนังสือฉบับภาษาไทย โดยใช้กฎหมายไทยในการตีความ และให้ศาลไทยเป็นผู้มีอำนาจในการพิจารณาคดี
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

        {isScrolledToBottom  && (
          <Button
            type="button"
            onClick={onConfirm}
            className="w-1/2 bg-[#009845] flex items-center justify-center py-5 rounded-md"
          >
            <span className="sarabun-font text-white">ตกลง</span>
          </Button>
        )}
        
      </div>
    </Modal>
  );
};

export default ModalRegisterPopup;
