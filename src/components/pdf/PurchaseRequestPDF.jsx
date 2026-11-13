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

const ink = "#000";

const styles = StyleSheet.create({
  page: { padding: 28, fontFamily: "Sarabun", fontSize: 10, color: ink },
  title: { textAlign: "center", fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  headBox: { borderWidth: 1, borderColor: ink, marginBottom: 10 },
  headTop: { flexDirection: "row", borderBottomWidth: 1, borderColor: ink },
  headCol: { width: "50%", paddingHorizontal: 6, paddingVertical: 4, justifyContent: "center" },
  headColLeft: { borderRightWidth: 1, borderColor: ink },
  headLine: { flexDirection: "row", alignItems: "center", minHeight: 16, marginBottom: 2 },
  hLabel: { width: 132, fontWeight: "bold" },
  hValue: { flex: 1 },
  full: { flexDirection: "row", alignItems: "center", minHeight: 20, paddingHorizontal: 6, paddingVertical: 3, borderBottomWidth: 1, borderColor: ink },
  table: { borderWidth: 1, borderColor: ink },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderColor: ink, minHeight: 18, alignItems: "center" },
  td: { borderRightWidth: 1, borderColor: ink, paddingHorizontal: 4, paddingVertical: 3, justifyContent: "center" },
  last: { borderRightWidth: 0 },
  label: { fontWeight: "bold", fontSize: 8 },
  lab: { width: 118 },
  val: { flex: 1 },
  cNo: { width: 36, textAlign: "center" },
  cDesc: { flex: 1 },
  cQty: { width: 40, textAlign: "right" },
  cPrice: { width: 70, textAlign: "right" },
  cTotal: { width: 74, textAlign: "right" },
  sumGap: { flex: 1 },
  sumLabel: { width: 110, textAlign: "right", fontWeight: "bold" },
  note: { marginTop: 8, paddingVertical: 4 },
  signPush: { flexGrow: 1 },
  signRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  signCol: { width: "30%", alignItems: "center" },
  line: { borderBottomWidth: 1, borderColor: ink, height: 28, width: "100%", marginBottom: 4 },
  signText: { textAlign: "center" },
  dateRow: { flexDirection: "row", justifyContent: "center", marginTop: 12 },
  dateSlot: { width: 62, borderBottomWidth: 1, borderColor: ink, height: 11, marginLeft: 4 },
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
  const user = data?.user || {};
  const lines = Array.isArray(data?.items) && data.items.length
    ? data.items
    : [{ name: reward.name || data?.reward_name || "", qty: data?.qty || 1, price: reward.cost || 0 }];
  const priced = lines.map((line) => {
    const qty = Number(line.qty || 1);
    const price = Number(line.price ?? line.cost ?? reward.cost ?? 0);
    return { name: line.name || line.reward_name || reward.name || "", qty, price, total: qty * price };
  });
  const lineTotal = priced.reduce((sum, line) => sum + line.total, 0);
  const vat = lineTotal * 0.07;
  const grand = lineTotal + vat;
  const shopName = user.shop_name || data?.shop_name || "";

  const Cell = ({ children, style, bold }) => (
    <View style={[styles.td, style]}>
      <Text style={bold ? styles.label : undefined}>{children}</Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.title}>PURCHASE REQUEST FORM</Text>

        <View style={styles.headBox}>
          <View style={styles.headTop}>
            <View style={[styles.headCol, styles.headColLeft]}>
              <View style={styles.headLine}><Text style={styles.hLabel}>DATE OF REQUESTED :</Text><Text style={styles.hValue}>{dmy(data?.created_at)}</Text></View>
              <View style={styles.headLine}><Text style={styles.hLabel}>EXPECT DELIVERY DATE :</Text><Text style={styles.hValue}>{data?.expect_delivery_date ? dmy(data.expect_delivery_date) : ""}</Text></View>
              <View style={[styles.headLine, { marginBottom: 0 }]}><Text style={styles.hLabel}>REQUESTED BY :</Text><Text style={styles.hValue}>{shopName}</Text></View>
            </View>
            <View style={styles.headCol}>
              <View style={styles.headLine}><Text style={styles.hLabel}>SUGGESTION VENDER :</Text><Text style={styles.hValue}>{""}</Text></View>
              <View style={styles.headLine}><Text style={styles.hLabel}>ATTN :</Text><Text style={styles.hValue}>{""}</Text></View>
              <View style={[styles.headLine, { marginBottom: 0 }]}><Text style={styles.hLabel}>PHONE NO. :</Text><Text style={styles.hValue}>{user.phone_number || data?.vendor_phone || ""}</Text></View>
            </View>
          </View>
          <View style={styles.full}>
            <Text style={styles.hLabel}>DEPARTMENT :</Text>
            <Text style={styles.hValue}>{data?.department || "Marketing"}</Text>
          </View>
          <View style={styles.full}>
            <Text style={styles.hLabel}>PURCHASE FOR :</Text>
            <Text style={styles.hValue}>{reward.name || data?.reward_name || ""}</Text>
          </View>
          <View style={[styles.full, { borderBottomWidth: 0 }]}>
            <Text style={styles.hLabel}>SHIP TO ADDRESS :</Text>
            <Text style={styles.hValue}>{data?.tranUserAddress?.address || data?.address || ""}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View wrap={false} style={styles.tr}>
            <Cell style={styles.cNo} bold>NO.</Cell>
            <Cell style={styles.cDesc} bold>DESCRIPTION</Cell>
            <Cell style={styles.cQty} bold>QTY</Cell>
            <Cell style={styles.cPrice} bold>PRICE EACH</Cell>
            <Cell style={[styles.cTotal, styles.last]} bold>TOTAL</Cell>
          </View>
          {priced.map((line, index) => (
            <View wrap={false} key={index} style={styles.tr}>
              <Cell style={styles.cNo}>{index + 1}</Cell>
              <Cell style={styles.cDesc}>{line.name}</Cell>
              <Cell style={styles.cQty}>{line.qty.toLocaleString()}</Cell>
              <Cell style={styles.cPrice}>{money(line.price)}</Cell>
              <Cell style={[styles.cTotal, styles.last]}>{money(line.total)}</Cell>
            </View>
          ))}
          {[
            ["Total", lineTotal],
            ["Vat 7%", vat],
            ["Total Amount", grand],
          ].map(([name, amount], index, rows) => (
            <View wrap={false} key={name} style={[styles.tr, index === rows.length - 1 ? { borderBottomWidth: 0 } : null]}>
              <View style={styles.sumGap} />
              <Cell style={styles.sumLabel} bold>{name}</Cell>
              <Cell style={[styles.cTotal, styles.last]}>{money(amount)}</Cell>
            </View>
          ))}
        </View>

        <Text style={styles.note}>Remark : {data?.remark && data.remark !== "-" ? data.remark : ""}</Text>
        <Text style={{ marginTop: 4 }}>Transaction ID : {data?.transaction_id || data?.transection_id || data?.id || ""}</Text>

        <View style={styles.signPush} />
        <View style={styles.signRow}>
          <View style={styles.signCol}>
            <View style={styles.line} />
            <Text style={styles.signText}>Requested by</Text>
            <View style={styles.dateRow}><Text>Date :</Text><View style={styles.dateSlot} /></View>
          </View>
          <View style={styles.signCol}>
            <View style={styles.line} />
            <Text style={styles.signText}>Approved by</Text>
            <View style={styles.dateRow}><Text>Date :</Text><View style={styles.dateSlot} /></View>
          </View>
          <View style={styles.signCol}>
            <View style={styles.line} />
            <Text style={styles.signText}>Approved by</Text>
            <View style={styles.dateRow}><Text>Date :</Text><View style={styles.dateSlot} /></View>
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
