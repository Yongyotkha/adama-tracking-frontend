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

      <div className="sarabun-font text-gray-900 text-sm max-h-screen overflow-y-auto p-4 space-y-6" ref={contentRef}>
  <h2 className="text-lg font-semibold text-[#009845]">รายละเอียดข้อกำหนดและเงื่อนไข</h2>

  <section>
    <h3 className="font-semibold text-[#978B87]">นโยบายความเป็นส่วนตัว</h3>
    <p className="text-[#978B87] leading-relaxed">
      ความยินยอมในการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล<br />
      สมาชิกอดามา สไมล์ พลัสตกลงยินยอมให้ บริษัท อดามา (ประเทศไทย) จำกัด เข้าถึง เก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคลซึ่งได้บันทึกและจัดเก็บรวบรวมจากแหล่งอื่นหรือบุคคลอื่นใดโดยถูกต้องตามกฎหมายที่ใช้บังคับอยู่ในขณะนั้น รวมถึงข้อมูลส่วนบุคคลอื่นใดของสมาชิก เช่น:
    </p>
    <ul className="list-disc list-inside text-[#978B87] mt-2">
      <li>ชื่อ-นามสกุล</li>
      <li>วันเดือนปีเกิด</li>
      <li>ที่อยู่</li>
      <li>เบอร์โทรศัพท์</li>
      <li>ไลน์ไอดี</li>
    </ul>
    <p className="text-[#978B87] mt-2">
      ข้อมูลดังกล่าวสามารถนำไปใช้ตามวัตถุประสงค์ในการ:
    </p>
    <ul className="list-disc list-inside text-[#978B87] mt-2">
      <li>พัฒนาประสิทธิภาพของสินค้าและบริการ</li>
      <li>จัดหรือทำการตลาดเกี่ยวกับสินค้า บริการ และสิทธิประโยชน์</li>
      <li>จัดกิจกรรมส่งเสริมการขาย</li>
      <li>ทำวิจัย วิเคราะห์ และสำรวจทางการตลาด</li>
      <li>จัดทำข้อมูลสถิติ</li>
      <li>นำเสนอสิทธิประโยชน์ใหม่ ๆ ให้แก่สมาชิก</li>
    </ul>
    <p className="text-[#978B87] mt-2">
      บริษัทจะประมวลผลข้อมูลดังกล่าวให้สอดคล้องกับวัตถุประสงค์และให้เกิดประโยชน์สูงสุดแก่สมาชิก โดยดำเนินการตามกฎหมายที่เกี่ยวข้อง
    </p>
    <p className="text-[#978B87] mt-2 font-semibold">การเปิดเผยข้อมูลต่อบุคคลภายนอก</p>
    <p className="text-[#978B87]">
      บริษัทอาจเปิดเผยข้อมูลส่วนบุคคลต่อบริษัทในเครือของ บริษัท อดามา (ประเทศไทย) จำกัด หรือพันธมิตรทางธุรกิจที่เกี่ยวข้องกับการให้บริการสมาชิกอดามา สไมล์ พลัส โดยจะดำเนินการตามวัตถุประสงค์ที่ระบุไว้ข้างต้น และจะขอความยินยอมจากสมาชิกก่อนเปิดเผยข้อมูลในกรณีที่กฎหมายกำหนด
    </p>
  </section>

  <section>
    <h3 className="font-semibold text-[#978B87]">การถอนความยินยอม</h3>
    <p className="text-[#978B87] leading-relaxed">
      หากสมาชิกไม่ประสงค์ให้เปิดเผยข้อมูลส่วนบุคคล สามารถแจ้งมายังบริษัทเพื่อขอถอนความยินยอมเมื่อใดก็ได้ โดยติดต่อผ่านช่องทางดังนี้:
    </p>
    <ul className="list-inside text-[#978B87] mt-2 space-y-1">
      <li>เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล</li>
      <li>บริษัท อดามา (ประเทศไทย) จำกัด</li>
      <li>127/33 อาคารปัญจธานี ทาวเวอร์ ชั้น 28 ถนนนนทรี แขวงช่องนนทรี เขตยานนาวา กรุงเทพฯ 10120</li>
      <li>อีเมล: <span className="font-medium">privacy@adama.co.th</span> (กรุณายืนยันอีเมลจริงของบริษัท)</li>
      <li>โทรศัพท์: <span className="font-medium">02-xxx-xxxx</span> (กรุณาระบุเบอร์จริง)</li>
    </ul>
  </section>

  <section>
    <h3 className="font-semibold text-[#978B87]">ข้อสงวนสิทธิ์</h3>
    <p className="text-[#978B87] leading-relaxed">
      บริษัทไม่มีเจตนาในการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคลเพื่อเสนอขายสินค้าหรือบริการ หรือเสนอสิทธิประโยชน์ใด ๆ แก่สมาชิก หรือการติดตามพฤติกรรมของสมาชิกเมื่ออยู่ในประเทศอื่น<br />
      หากมีกรณีพิพาท ให้ตีความตามหนังสือฉบับภาษาไทย โดยใช้กฎหมายไทยในการตีความ และให้ศาลไทยเป็นผู้มีอำนาจในการพิจารณาคดี
    </p>
  </section>
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
