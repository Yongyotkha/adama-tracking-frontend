import React, { useEffect, useState } from "react";
import {
  Page, Image, Text, View, Document, StyleSheet, PDFViewer, Font,
} from "@react-pdf/renderer";
import { useSearchParams } from "react-router-dom";
import useServiceAPI from "../../services/corsService";
import { paths } from "../../services/CorsPath";

// ฟอนต์ + ปิดการตัดคำภาษาไทย
Font.register({
  family: "Sarabun",
  fonts: [
    { src: "/font/Sarabun/Sarabun-Regular.ttf" },
    { src: "/font/Sarabun/Sarabun-Bold.ttf", fontWeight: "bold" },
    { src: "/font/Anuphan/Anuphan-Light.ttf", fontWeight: "300" },
    { src: "/font/Anuphan/Anuphan-Medium.ttf", fontWeight: "500" },
    { src: "/font/Anuphan/Anuphan-SemiBold.ttf", fontWeight: "600" },
    { src: "/font/Anuphan/Anuphan-Thin.ttf", fontWeight: "100" },
  ],
});
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: { padding: 28, fontFamily: "Sarabun", fontSize: 10 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 6 },
  logo: { width: 60, height: 60 },
  company: { flex: 1, fontSize: 9, lineHeight: 1.5 },
  title: { textAlign: "center", fontSize: 16, fontWeight: "bold", marginVertical: 10 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  bold: { fontWeight: "bold" },
  // recipient box
  box: { borderWidth: 1, borderColor: "#000", padding: 8, marginBottom: 8 },
  red: { color: "black", fontWeight: "bold" },
  // table
  table: { borderWidth: 1, borderColor: "#000" },
  tr: { flexDirection: "row" },
  trHead: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000" },
  th: { flex: 1, padding: 6, borderRightWidth: 1, borderColor: "#000", textAlign: "center", fontWeight: "bold" },
  td: { flex: 1, padding: 6, borderRightWidth: 1, borderColor: "#000" },
  tdCenter: { textAlign: "center" },
  cellLast: { borderRightWidth: 0 },
  // signature area
  signRow: { flexDirection: "row", marginTop: 10, gap: 8 },
  signCol: { flex: 1, borderWidth: 1, borderColor: "#000", minHeight: 90, padding: 8, gap: 6 },
  line: { marginVertical: 2 },
  imgBox: { width: 70, height: 50, objectFit: "cover" },
  boldTextRight: { textAlign: "right", fontWeight: "bold" },
});

const fmt = (v) => (v ? String(v).trim() : "-");
const dmy = (s) => {
  if (!s) return "-";
  const d = new Date(String(s).replace(" ", "T"));
  if (isNaN(d)) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}-${mm}-${yy}`;
};

export default function DeliverySlipPDF() {
  const [sp] = useSearchParams();
  const id = sp.get("id");
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await useServiceAPI.get(`${paths.pathTransportDetail}/${id}`);
        if (mounted && res?.status === 200) setData(res.data || {});
      } catch (err) {
        console.error("load transport detail failed:", err);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  // เตรียมข้อมูลสินค้า (1 แถว ตามตัวอย่าง)
  const itemImage =
    data?.pictures?.[0]?.part || "/img/placeholder.png"; // เปลี่ยนเป็นรูปจริงถ้ามี
  const itemName = fmt(data?.reward_name);
  const itemDetail = fmt(data?.reward_cost); // ในตัวอย่าง reward_cost เป็น "TV"

  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <Document>
        <Page size="A4" style={styles.page}>
          {/* header */}
          <View style={styles.header}>
            <Image style={styles.logo} src="/favicon.png" />
            <View style={styles.company}>
              <Text style={{ fontSize: 11, fontWeight: "bold" }}>บริษัท อดามา (ประเทศไทย) จำกัด </Text>
              <Text style={{ fontSize: 10, fontWeight: "bold" }}>ADAMA (Thailand) Limited</Text>
              <Text>127/33 อาคารปัญจธานี ทาวเวอร์ ชั้น 28 ถนนนนทรี แขวงช่องนนทรี เขตยานนาวา กรุงเทพฯ 10120</Text>
              <Text>127/33 Panjathani Tower Building 28 floor , Nonsi Rd, Chong nonsi , Yannawa Bangkok 10120</Text>
              <Text>Tel. +66 2 681 1979   Fax. +66 2 681 1977</Text>
            </View>
          </View>

          <Text style={styles.title}>ใบส่งสินค้า</Text>

          <View style={styles.metaRow}>
            {/* <Text><Text style={styles.bold}>เลขที่เอกสาร :</Text> {fmt(data?.status_tran_namsse)}</Text> */}
            <Text><Text style={styles.boldTextRight}>Date :</Text> {dmy(data?.send_at) || dmy(data?.created_at)}</Text>
          </View>

          {/* ผู้รับของ */}
          <View style={styles.box}>
            <Text style={{ marginBottom: 4 }}>
              <Text style={[styles.bold ,{fontSize: 11}]}>ผู้รับของ</Text>
            </Text>
            <Text style={styles.line}>
              <Text style={{ fontSize: 10, fontWeight: "bold" }}>ร้าน : </Text>
              <Text>{fmt(data?.shop_name)} </Text>
            </Text>
            <Text style={styles.line}>
              <Text style={{ fontSize: 10, fontWeight: "bold" }}>ที่อยู่ : </Text>
              <Text> {fmt(data?.user_address)} </Text>
            </Text>
            <Text style={styles.line}>
              <Text style={{ fontSize: 10, fontWeight: "bold" }}>โทร : </Text>
              <Text>{fmt(data?.user_number)} </Text>
            </Text>
          </View>

          {/* ตารางสินค้า */}
          <View style={styles.table}>
            {/* header */}
            <View style={styles.trHead}>
              {/* <Text style={[styles.th, { flex: 1.2 }]}>รูปสินค้า </Text> */}
              {/* <Text style={[styles.th, { flex: 1.2 }]}>Reward Code </Text> */}
              <Text style={[styles.th, { flex: 4 }]}>รายละเอียด </Text>
              <Text style={[styles.th, { flex: 1 }, styles.cellLast]}>จำนวน/ชิ้น </Text>
            </View>
            {/* row */}
            <View style={styles.tr}>
              {/* <View style={[styles.td, { flex: 1.2, alignItems: "center", justifyContent: "center" }]}> */}
              {/* อันนี้แสดงผล */}
              {/* <Image src='/img/Image-not-found.png' style={styles.imgBox} />  */}
              {/* อันนี้ไม่แสดงผล แก้ไขให้แสดงผลภาพเว็บอื่นได้ */}
              {/* <Image src='https://adama-api.mtsc.co.th/storage/adama-smile/uploads/files/activity/20251001/4CFD8582-80A7-4AD1-9D2F-263210CF5DC9.png' style={styles.imgBox} /> */}
              {/* <Text>{data?.reward_code}</Text> */}
              {/* </View> */}
              <View style={[styles.td, { flex: 4 }]}>
                <Text>{itemName} </Text>
                {/* <Text>{itemDetail}</Text> */}
                {/* ใส่รายละเอียดรุ่น/สเป็กเพิ่มได้ตามจริง */}
              </View>
              <Text style={[styles.td, { flex: 1 }, styles.tdCenter, styles.cellLast]}>{1}</Text>
            </View>
          </View>

          {/* พื้นที่เซ็นชื่อ */}
          <View style={styles.signRow}>
            <View style={styles.signCol}>
              <Text style={styles.bold}>พนักงานขนส่ง</Text>
              <Text className="line">สายส่งที่ : ...............................................................</Text>
              <Text>ชื่อพนักงาน : .......................................................................</Text>
              <Text>วันที่รับ : ...........................................................................</Text>
            </View>
            <View style={styles.signCol}>
              <Text style={styles.bold}>ผู้รับของ</Text>
              <Text>สายส่งที่ : ...........................................................................</Text>
              <Text>ชื่อผู้รับของ : ......................................................................</Text>
              <Text>วันที่รับ : ...........................................................................</Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
}
