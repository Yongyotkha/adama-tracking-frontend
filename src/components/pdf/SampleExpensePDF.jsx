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
import { useSearchParams } from "react-router-dom";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";

Font.register({
  family: "Sarabun",
  fonts: [
    { src: "/font/Sarabun/Sarabun-Regular.ttf" },
    { src: "/font/Sarabun/Sarabun-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontSize: 8,
    fontFamily: "Sarabun",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: { width: 50, height: 50 },
  companyDetails: { flex: 1, paddingLeft: 10, fontSize: 8 },
  title: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  infoBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#000",
    padding: 8,
    marginBottom: 5,
  },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    borderBottom: 0,
    marginTop: 4,
  },
  tableRow: {
    flexDirection: "row",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f3f3f3",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  cellHeader: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    fontWeight: "bold",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
    justifyContent: "center",
  },
  cell: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  cellLeft: {
    textAlign: "left",
  },
  lastCol: {
    borderRightWidth: 0,
  },

  remarkBox: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
    paddingTop: 5,
    marginTop: 5,
  },
  remarkTitle: { fontWeight: "bold", marginBottom: 4 },
  remarkText: { fontSize: 8, lineHeight: 1.2 },

  footer: {
    marginTop: 10,
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
  },
  footerRow: {
    flexDirection: "row",
  },
  signBox: {
    flex: 1,
    minHeight: 70,
    borderRightWidth: 1,
    borderRightColor: "#000",
    paddingTop: 6,
    paddingHorizontal: 8,
    paddingBottom: 6,
    justifyContent: "space-between",
  },
  signBoxLast: {
    flex: 1,
    minHeight: 70,
    paddingTop: 6,
    paddingHorizontal: 8,
    paddingBottom: 6,
    justifyContent: "space-between",
  },
  signTitle: {
    fontSize: 8,
    textAlign: "center",
    textDecoration: "underline",
    fontWeight: "bold",
  },
  signSpace: {
    height: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  signSpaceApproved: {
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  signName: {
    fontSize: 10,
    textAlign: "center",
    fontWeight: "bold",
    height: 20,
  },
  signRole: {
    fontSize: 8,
    textAlign: "center",
    fontWeight: "bold",
  },

  totalBox: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#000",
    padding: 8,
  },
});

const SampleExpensePDF = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const getMaterial = searchParams.get("sample_number");

  const [dataItems, setDataItems] = useState([]);
  const [dataHeader, setDataHeader] = useState({});

  useEffect(() => {
    const loadData = async () => {
      if (!getMaterial) return;

      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathSampleExpenseDetailsAndCreate, {
          document_number: getMaterial,
        });

        if (response.status === 200) {
          setDataItems(response.data?.items || []);
          setDataHeader(response.data?.header || {});
        }
      } catch (error) {
        console.error("Error fetching sample expense data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getMaterial]);

  const formatNumber2 = (val) => {
    const n = Number(val);
    if (!Number.isFinite(n)) return "0.00";
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const safeVal = (value, fallback = "-") => {
    return value !== undefined && value !== null && value !== "" ? value : fallback;
  };

  const safeRole = (value) => {
    if (value === undefined || value === null || value === "") return "(-)";
    return `(${value})`;
  };

  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Image style={styles.logo} src="/favicon.png" />
            <View style={styles.companyDetails}>
              <Text style={{ fontWeight: "bold", fontSize: 10, lineHeight: 1.5 }}>บริษัท อดามา (ประเทศไทย) จำกัด </Text>
              <Text style={{ fontWeight: "bold", fontSize: 10, lineHeight: 1.5 }}>
                ADAMA (Thailand) Limited
              </Text>
              <Text style={{ fontSize: 8, lineHeight: 1.5 }}>
                127/33 อาคารปัญจธานี ทาวเวอร์ ชั้น 28 ถนนนนทรี แขวงช่องนนทรี เขตยานนาวา กรุงเทพฯ 10120
              </Text>
              <Text style={{ fontSize: 8, lineHeight: 1.5 }}>
                127/33 Panjathani Tower Building 28 floor, Nonsi Rd, Yannawa, Bangkok 10120
              </Text>
              <Text style={{ fontSize: 8, lineHeight: 1.5 }}>
                Tel: +66 2 681 1979 Fax: +66 2 681 1977
              </Text>
            </View>
          </View>

          <Text style={styles.title}>PROD/MKT REQUISITION FORM</Text>

          <View style={styles.sectionTop}>
            <Text style={{ fontWeight: "bold" }}>
              Expense Sample No: {safeVal(dataHeader.document_number)}
            </Text>
            <Text style={{ fontWeight: "bold" }}>
              Date: {formatDate(dataHeader.document_date || dataHeader.document_datetime)}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 12,
                width: "50%",
              }}
            >
              Name: {safeVal(dataHeader.user_name)}
            </Text>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 12,
                width: "50%",
              }}
            >
              Regions: {safeVal(dataHeader.dealer_name || dataHeader.sub_dealer_name)}
            </Text>
          </View>

          <View style={styles.table}>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.cellHeader, width: "4%" }}>No</Text>
              <Text style={{ ...styles.cellHeader, width: "6%" }}>Req.{"\n"}Unit</Text>
              <Text style={{ ...styles.cellHeader, width: "7%" }}>QTY{"\n"}KG/LT</Text>
              <Text style={{ ...styles.cellHeader, width: "22%" }}>Product Name</Text>
              <Text style={{ ...styles.cellHeader, width: "7%" }}>Unit{"\n"}/ CT</Text>
              {/* <Text style={{ ...styles.cellHeader, width: "8%" }}>Total QTY{"\n"}/ CT</Text> */}
              <Text style={{ ...styles.cellHeader, width: "10%" }}>Total QTY{"\n"}/ Unit</Text>
              <Text style={{ ...styles.cellHeader, width: "14%" }}>Product{"\n"}Code</Text>
              <Text style={{ ...styles.cellHeader, width: "10%" }}>Price{"\n"}/ Unit</Text>
              {/* <Text style={{ ...styles.cellHeader, width: "8%" }}>Price{"\n"}Kg/Lt</Text> */}
              <Text style={{ ...styles.cellHeader, width: "12%" }}>Value</Text>
              <Text style={{ ...styles.cellHeader, ...styles.lastCol, width: "10%" }}>
                Remark
              </Text>
            </View>

            {dataItems.map((item, index) => {
              const qty = Number(item?.quantity || 0);
              const unitPrice = Number(item?.product_unit_thb || item?.net_amount || 0);
              const totalValue = qty * unitPrice;

              return (
                <View style={styles.tableRow} key={index}>
                  <Text style={{ ...styles.cell, width: "4%" }}>{index + 1}</Text>
                  <Text style={{ ...styles.cell, width: "6%" }}>Unit</Text>
                  <Text style={{ ...styles.cell, width: "7%" }}>{formatNumber2(qty)}</Text>
                  <Text style={{ ...styles.cell, ...styles.cellLeft, width: "22%" }}>
                    {safeVal(item?.product_name)}
                  </Text>
                  <Text style={{ ...styles.cell, width: "7%" }}>
                    {safeVal(item?.product_unit)}
                  </Text>
                  {/* <Text style={{ ...styles.cell, width: "8%" }}>
                    {formatNumber2(qty)}
                  </Text> */}
                  <Text style={{ ...styles.cell, width: "10%" }}>
                    {formatNumber2(qty)}
                  </Text>
                  <Text style={{ ...styles.cell, width: "14%" }}>
                    {safeVal(item?.product_code)}
                  </Text>
                  <Text style={{ ...styles.cell, width: "10%" }}>
                    {formatNumber2(unitPrice)}
                  </Text>
                  {/* <Text style={{ ...styles.cell, width: "8%" }}>
                    {formatNumber2(unitPrice)}
                  </Text> */}
                  <Text style={{ ...styles.cell, width: "12%" }}>
                    {formatNumber2(totalValue)}
                  </Text>
                  <Text style={{ ...styles.cell, ...styles.lastCol, width: "10%" }}>
                    {safeVal(item?.ref_remark)}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.totalBox}>
            <Text style={{ fontWeight: "bold" }}>
              Total (THB): {formatNumber2(dataHeader.net_amount || 0)}
            </Text>
          </View>

          <View style={styles.remarkBox}>
            <Text style={styles.remarkTitle}>Remark:</Text>
            <Text style={styles.remarkText}>{safeVal(dataHeader.ref_remark)}</Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <View style={styles.signBox}>
                <Text style={styles.signTitle}>Requested By</Text>
                <View style={styles.signSpace}>
                  <Text> </Text>
                </View>
                {/* <Text style={styles.signName}>
                  {safeVal(dataHeader.requested_by_name || dataHeader.created_by)}
                </Text> */}
                {/* <Text style={styles.signRole}>
                  {safeRole(dataHeader.requested_by_role || "Sale / BD")}
                </Text> */}
              </View>

              <View style={styles.signBox}>
                <Text style={styles.signTitle}>Agreed By</Text>
                <View style={styles.signSpace}>
                  <Text> </Text>
                </View>
                {/* <Text style={styles.signName}>
                  {safeVal(dataHeader.agreed_by_name)}
                </Text> */}
                {/* <Text style={styles.signRole}>
                  {safeRole(dataHeader.agreed_by_role || "Area Manager")}
                </Text> */}
              </View>

              <View style={styles.signBox}>
                <Text style={styles.signTitle}>Approved By</Text>
                <View style={styles.signSpaceApproved}>
                  <Text> </Text>
                </View>
                {/* <Text style={styles.signName}>
                  {safeVal(dataHeader.approved_by_name)}
                </Text> */}
                {/* <Text style={styles.signRole}>
                  {safeRole(dataHeader.approved_by_role || "Sales Director")}
                </Text> */}
              </View>

              <View style={styles.signBoxLast}>
                <Text style={styles.signTitle}>Delivered / Checked By</Text>
                <View style={styles.signSpace}>
                  <Text> </Text>
                </View>
                {/* <Text style={styles.signName}>
                  {safeVal(dataHeader.delivered_by_name)}
                </Text> */}
                {/* <Text style={styles.signRole}>
                  {safeRole(dataHeader.delivered_by_role)}
                </Text> */}
              </View>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default SampleExpensePDF;