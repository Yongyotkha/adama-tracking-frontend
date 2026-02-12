import React, { useState, useEffect } from "react";
import {
  Page,
  Image,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
  Font,
} from "@react-pdf/renderer";
import { useLocation, useSearchParams } from "react-router-dom";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";

// Register Sarabun Font
Font.register({
  family: "Sarabun",
  fonts: [
    { src: "/font/Sarabun/Sarabun-Regular.ttf" },
    { src: "/font/Sarabun/Sarabun-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 15, fontSize: 8, fontFamily: "Sarabun" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: { width: 50, height: 50 },
  companyDetails: { flex: 1, paddingLeft: 10, fontSize: 8 },
  title: { textAlign: "center", fontSize: 14, fontWeight: "bold", marginBottom: 10 },
  sectionTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  sectionColumn: { width: "50%", borderWidth: 1, borderColor: "#000", padding: 5 },
  table: { display: "table", width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#000", borderRight: 0 },
  tableRow: { flexDirection: "row", lineHeight: 0.5 },
  tableCellMainHeader: { borderBottomWidth: 1, padding: 5, fontWeight: "bold", textAlign: "center", borderRightWidth: 1 },
  tableCellHeader: { borderBottomWidth: 1, padding: 5, fontWeight: "bold", textAlign: "center", flex: 1, borderRightWidth: 1 },
  tableCell: { padding: 5, flex: 1, textAlign: "center", borderRightWidth: 1 },
  tableCellLast: { borderRightWidth: 0 },
  RemarkBox: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
    paddingTop: 5,
    marginTop: 5,
  },
  RemarkTitle: { fontWeight: "bold", marginBottom: 4 },
  RemarkText: { fontSize: 8, lineHeight: 0.75 },
  footer: { marginTop: 10, fontSize: 9, display: "table", width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#000" },
  footerRow: { flexDirection: "row", lineHeight: 0.85 },
  footerSection: { flex: 1, padding: 5, borderRightWidth: 1 },
  footerSectionLast: { flex: 1, padding: 5 },
  footerText: { marginBottom: 3 },
  footerLabel: { fontWeight: "bold" },
  footerContentRow: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
});

const MaterialExpensePDF = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const getMaterial = searchParams.get("material_number"); // Fetch material number from query params
  const getPageCode = searchParams.get("page_code");
  const [dataItems, setDataItems] = useState([]);
  const [dataHeader, setDataHeader] = useState([]);
  const [dataCrop, setDataCrop] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathExpenseMaterialOne, {
          code: getMaterial,
        });

        if (response.status === 200) {
          setDataItems(response.data.material_list); // Assign material list data
          setDataHeader(response.data);
          setDataCrop(response.data.crops);
        }
      } catch (error) {
        console.error("Error fetching material data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getMaterial, getPageCode]);

  const formatNumber = (val) => {
    const n = Number(val);
    if (!Number.isFinite(n)) return "0.00";
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 0,});
  };

  const formatNumber2 = (val) => {
    const n = Number(val);
    if (!Number.isFinite(n)) return "0.00";
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Image style={styles.logo} src="/favicon.png" />
            <View style={styles.companyDetails}>
              <Text style={{ fontWeight: "bold", fontSize: 10, lineHeight: 1.5 }}>บริษัท อดามา (ประเทศไทย) จำกัด</Text>
              <Text style={{ fontWeight: "bold", fontSize: 10, lineHeight: 1.5 }}>ADAMA (Thailand) Limited</Text>
              <Text style={{ fontSize: 8, lineHeight: 1.5 }} >
                127/33  อาคารปัญจธานี ทาวเวอร์ ชั้น 28 ถนนนนทรี  แขวงช่องนนทรี เขตยานนาวา กรุงเทพฯ 10120
              </Text>
              <Text style={{ fontSize: 8, lineHeight: 1.5 }}>
                127/33 Panjathani Tower Building 28 floor, Nonsi Rd, Yannawa, Bangkok 10120
              </Text>
              <Text style={{ fontSize: 8, lineHeight: 1.5 }}>Tel: +66 2 681 1979 Fax: +66 2 681 1977</Text>
            </View>
          </View>
          <Text style={styles.title}>PROD/MKT REQUISITION FORM</Text>

          {/* Expense Information */}
          <View style={styles.sectionTop}>
            <Text style={{ fontWeight: "bold" }}>Expense Materials No: {dataHeader.code}</Text>
            <Text style={{ fontWeight: "bold" }}>Date: {formatDate(dataHeader.created_at)}</Text>
          </View>

          {/* Name and Regions */}
          <View style={{ ...styles.sectionTop, borderStyle: "solid", borderWidth: 1, borderColor: "#000", padding: 8, marginBottom: 5 }}>
            <Text style={{ fontWeight: "bold", fontSize: 12, marginRight: "auto", width: "50%" }}>Name: {dataHeader.user_name || "-"}</Text>
            <Text style={{ fontWeight: "bold", fontSize: 12, marginRight: 'auto', width: "50%" }}>Regions: {dataHeader.user_region || "-"}</Text>
          </View>

          {/* Material List */}
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={{ ...styles.tableCellHeader, width: "1%" }}>No</Text>
              <Text style={{ ...styles.tableCellHeader, width: "1%" }}>Req Unit</Text>
              <Text style={{ ...styles.tableCellHeader, width: "30%" }}>Materials Name</Text>
              <Text style={{ ...styles.tableCellHeader, width: "15%" }}>Stock At</Text>
              <Text style={{ ...styles.tableCellHeader, width: "15%" }}>Pc./Packing</Text>
              <Text style={{ ...styles.tableCellHeader, width: "15%" }}>Price Per Pc.</Text>
              <Text style={{ ...styles.tableCellHeader, width: "15%" }}>Value</Text>
            </View>

            {/* Map through the dataItems and display each row */}
            {dataItems.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={{ ...styles.tableCell, width: "1%" }}>{index + 1}</Text>
                <Text style={{ ...styles.tableCell, width: "1" }}>{item.request}</Text>
                <Text style={{ ...styles.tableCell, width: "30%" }}>{item.name}</Text>
                <Text style={{ ...styles.tableCell, width: "15%" }}>{formatNumber(item.qty)}</Text>
                <Text style={{ ...styles.tableCell, width: "15%" }}>{item.size}</Text>
                <Text style={{ ...styles.tableCell, width: "15%" }}>{formatNumber2(item.unit_price)}</Text>
                <Text style={{ ...styles.tableCell, width: "15%" }}>{formatNumber2(item.unit_price * item.qty)}</Text>
              </View>
            ))}
          </View>
          {/* Remark Section */}
          <View style={{ borderStyle: "solid", borderWidth: 1, borderColor: "#000", padding: 8, marginTop: 0, borderTopWidth: 0 }}>
            <Text style={styles.RemarkTitle}>Total(THB): {dataHeader.request || "-"}</Text>
          </View>


          {/* Remark Section */}
          <View style={styles.RemarkBox}>
            <Text style={styles.RemarkTitle}>Remark:</Text>
            <Text style={styles.RemarkText}>{dataHeader.remark || "-"}</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <View style={styles.footerSection}>
                <Text style={styles.footerLabel}>Requested By</Text>
                <Text>{dataHeader.requested_by || "-"}</Text>
              </View>
              <View style={styles.footerSection}>
                <Text style={styles.footerLabel}>Agreed By</Text>
                <Text>{dataHeader.agreed_by || "-"}</Text>
              </View>
              <View style={styles.footerSection}>
                <Text style={styles.footerLabel}>Approved By</Text>
                <Text>{dataHeader.approved_by || "-"}</Text>
              </View>
              <View style={styles.footerSectionLast}>
                <Text style={styles.footerLabel}>Delivered/Checked By</Text>
                <Text>{dataHeader.delivered_by || "-"}</Text>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default MaterialExpensePDF;
