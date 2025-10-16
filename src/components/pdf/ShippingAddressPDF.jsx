import React, { useEffect, useState } from "react";
import {
  Page, Image, Text, View, Document, StyleSheet, PDFViewer, Font,
} from "@react-pdf/renderer";
import { useSearchParams } from "react-router-dom";
import useServiceAPI from "../../services/corsService";
import { paths } from "../../services/CorsPath";

// ฟอนต์ไทย
Font.register({
  family: "Sarabun",
  fonts: [
    { src: "/font/Sarabun/Sarabun-Regular.ttf" },
    { src: "/font/Sarabun/Sarabun-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 28, fontFamily: "Sarabun", fontSize: 11 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 24 },
  logo: { width: 60, height: 60 },
  company: { flex: 1, fontSize: 9, lineHeight: 1.5 },
  recipientWrap: { marginTop: 140, alignItems: "center" },
  recipientBox: { width: "65%", padding: 12 },
  label: { fontSize: 12, marginBottom: 6, fontWeight: "bold", textAlign: "start" },
  line: { marginTop: 2, marginBottom: 6 },
  red: { color: "black", fontWeight: "bold" },
});

const fmt = (v) => (v ? String(v).trim() : "-");

export default function ShippingAddressPDF() {
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

  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
          {/* Header company */}
          <View style={styles.header}>
            <Image style={styles.logo} src="/favicon.png" />
            <View style={styles.company}>
              <Text style={{ fontSize: 11, fontWeight: "bold" }}>บริษัท อดามา (ประเทศไทย) จำกัด </Text>
              <Text style={{ fontSize: 10, fontWeight: "bold" }}>ADAMA (Thailand) Limited </Text>
              <Text>127/33 อาคารปัญจธานี ทาวเวอร์ ชั้น 28 ถนนนนทรี แขวงช่องนนทรี เขตยานนาวา กรุงเทพฯ 10120 </Text>
              <Text>127/33 Panjathani Tower Building 28 floor , Nonsi Rd, Chong nonsi , Yannawa Bangkok 10120</Text>
              <Text>Tel. +66 2 681 1979   Fax. +66 2 681 1977</Text>
            </View>
          </View>

          {/* Recipient box (กลางหน้า) */}
          <View style={styles.recipientWrap}>
            <View style={styles.recipientBox}>
              <Text style={[styles.label, { fontSize: 15 }, { marginBottom: 20 }]}>ที่อยู่ผู้รับของ </Text>
              <Text style={styles.line}>
                <Text>ร้าน : </Text>
                <Text style={styles.red}>{fmt(data?.shop_name)} </Text>
              </Text>
              <Text style={styles.line}>
                <Text>ผู้ติดต่อ : </Text>
                <Text style={styles.red}>{fmt(data?.name_en)} </Text>
              </Text>
              <Text style={styles.line}>
                <Text>ที่อยู่ : </Text>
                <Text style={styles.red}>
                  {fmt(data?.user_address || data?.address || data?.shop_address)}
                </Text>
              </Text>
              <Text style={styles.line}>
                <Text>โทร : </Text>
                <Text style={styles.red}>{fmt(data?.user_number)} </Text>
              </Text>
            </View>
          </View>
          
        </Page>
      </Document>
    </PDFViewer>
  );
}
