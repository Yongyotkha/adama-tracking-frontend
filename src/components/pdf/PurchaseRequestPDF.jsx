import React, { useEffect, useState } from "react";
import { Page, Text, View, Document, StyleSheet, PDFViewer, Font } from "@react-pdf/renderer";
import { useSearchParams } from "react-router-dom";
import useServiceAPI from "../../services/corsService";
import { paths } from "../../services/CorsPath";

Font.register({
  family: "Sarabun",
  fonts: [
    { src: "/font/Sarabun/Sarabun-Regular.ttf" },
    { src: "/font/Sarabun/Sarabun-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 28, fontFamily: "Sarabun", fontSize: 10 },
  title: { textAlign: "center", fontSize: 16, fontWeight: "bold", marginBottom: 14 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 150, fontWeight: "bold" },
  value: { flex: 1 },
  split: { flexDirection: "row", gap: 16, marginBottom: 4 },
  col: { flex: 1, flexDirection: "row" },
  table: { borderWidth: 1, borderColor: "#000", marginTop: 12 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000" },
  th: { padding: 4, fontWeight: "bold", borderRightWidth: 1, borderColor: "#000", textAlign: "center" },
  td: { padding: 4, borderRightWidth: 1, borderColor: "#000" },
  last: { borderRightWidth: 0 },
  cNo: { width: 50 },
  cDesc: { flex: 1 },
  cQty: { width: 60, textAlign: "right" },
  cPrice: { width: 80, textAlign: "right" },
  cTotal: { width: 90, textAlign: "right" },
  totals: { marginTop: 6, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", width: 220, justifyContent: "space-between", marginBottom: 2 },
  signRow: { flexDirection: "row", marginTop: 36, justifyContent: "space-between" },
  signCol: { width: "30%" },
  line: { borderBottomWidth: 1, borderColor: "#000", marginBottom: 4, height: 18 },
});

const money = (n) =>
  Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const dmy = (s) => {
  if (!s) return "-";
  const d = new Date(String(s).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return String(s).split(" ")[0];
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const FormDoc = ({ data }) => {
  const reward = data?.reward || {};
  const qty = Number(data?.qty || 1);
  const price = Number(reward.cost || 0);
  const lineTotal = qty * price;
  const vat = lineTotal * 0.07;
  const grand = lineTotal + vat;
  const user = data?.user || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>PURCHASE REQUEST FORM</Text>

        <View style={styles.split}>
          <View style={styles.col}>
            <Text style={styles.label}>DATE OF REQUESTED :</Text>
            <Text>{dmy(data?.created_at)}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>SUGGESTION VENDER :</Text>
            <Text>{data?.vendor_name || "-"}</Text>
          </View>
        </View>
        <View style={styles.split}>
          <View style={styles.col}>
            <Text style={styles.label}>EXPECT DELIVERY DATE :</Text>
            <Text>{dmy(data?.expect_delivery_date) === "-" ? "-" : dmy(data?.expect_delivery_date)}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>ATTN :</Text>
            <Text>{data?.attn || "-"}</Text>
          </View>
        </View>
        <View style={styles.split}>
          <View style={styles.col}>
            <Text style={styles.label}>REQUESTED BY :</Text>
            <Text>{user.name_en || user.name_th || data?.approve_by || "-"}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>PHONE NO. :</Text>
            <Text>{data?.vendor_phone || user.phone_number || "-"}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>DEPARTMENT :</Text>
          <Text style={styles.value}>{data?.department || "Marketing"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>PURCHASE FOR :</Text>
          <Text style={styles.value}>{reward.name || data?.reward_name || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>SHIP TO ADDRESS :</Text>
          <Text style={styles.value}>{data?.tranUserAddress?.address || data?.address || "-"}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tr}>
            <Text style={[styles.th, styles.cNo]}>ITEM NO.</Text>
            <Text style={[styles.th, styles.cDesc]}>DESCRIPTION</Text>
            <Text style={[styles.th, styles.cQty]}>QTY</Text>
            <Text style={[styles.th, styles.cPrice]}>PRICE EACH</Text>
            <Text style={[styles.th, styles.cTotal, styles.last]}>TOTAL PRICE</Text>
          </View>
          <View style={styles.tr}>
            <Text style={[styles.td, styles.cNo]}>1</Text>
            <Text style={[styles.td, styles.cDesc]}>{reward.name || "-"}</Text>
            <Text style={[styles.td, styles.cQty]}>{qty.toLocaleString()}</Text>
            <Text style={[styles.td, styles.cPrice]}>{money(price)}</Text>
            <Text style={[styles.td, styles.cTotal, styles.last]}>{money(lineTotal)}</Text>
          </View>
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Total</Text>
            <Text>{money(lineTotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Vat 7%</Text>
            <Text>{money(vat)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Total Amount</Text>
            <Text>{money(grand)}</Text>
          </View>
        </View>

        <Text style={{ marginTop: 10 }}>Remark : {data?.remark || "-"}</Text>
        <Text style={{ marginTop: 4 }}>Transaction ID : {data?.transaction_id || data?.transection_id || data?.id || "-"}</Text>

        <View style={styles.signRow}>
          <View style={styles.signCol}>
            <View style={styles.line} />
            <Text>Requested by</Text>
            <Text>Date : {dmy(data?.created_at)}</Text>
          </View>
          <View style={styles.signCol}>
            <View style={styles.line} />
            <Text>Approved by</Text>
            <Text>Date ........................</Text>
          </View>
          <View style={styles.signCol}>
            <View style={styles.line} />
            <Text>Approved by</Text>
            <Text>Date ........................</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default function PurchaseRequestPDF() {
  const [sp] = useSearchParams();
  const id = sp.get("id");
  const mode = sp.get("mode");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        const res = await useServiceAPI.get(
          `${paths.pathRedeemDetail}/${id}`,
          mode === "farmer" ? { mode: "farmer" } : {}
        );
        if (mounted && res?.status === 200) setData(res.data?.data || res.data || {});
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, mode]);

  if (!data) {
    return <div style={{ padding: 24 }}>Loading purchase request...</div>;
  }

  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <FormDoc data={data} />
    </PDFViewer>
  );
}
