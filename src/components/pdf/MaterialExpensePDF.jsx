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

  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 4,
    borderBottom: 0
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#f2f2f2",
  },

  cellBase: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    paddingVertical: 6,
    paddingHorizontal: 6,
    justifyContent: "center",
  },

  cellLast: {
    borderRightWidth: 0,
  },

  headerText: {
    fontSize: 8.5,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 1.3,
  },

  bodyTextCenter: {
    fontSize: 8.5,
    textAlign: "center",
    lineHeight: 1.35,
  },

  bodyTextLeft: {
    fontSize: 8.5,
    textAlign: "left",
    lineHeight: 1.35,
  },

  bodyTextRight: {
    fontSize: 8.5,
    textAlign: "right",
    lineHeight: 1.35,
  },

  totalBox: {
    borderStyle: "solid",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#000",
    padding: 8,
  },

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
  RemarkText: { fontSize: 8, lineHeight: 1.35 },

  footer: {
    marginTop: 10,
    fontSize: 9,
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
  },

  footerRow: {
    flexDirection: "row",
  },

  footerSection: {
    flex: 1,
    padding: 5,
    borderRightWidth: 1,
    height: 70,
    textAlign: "center",
    textDecoration: "underline",
    fontWeight: "bold",
  },

  footerSectionLast: {
    flex: 1,
    textAlign: "center",
    padding: 5,
    textDecoration: "underline",
    fontWeight: "bold",
  },

  footerLabel: { fontWeight: "bold" },
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
      minimumFractionDigits: 0,
    });
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

  const colWidths = {
    no: "7%",
    req: "10%",
    name: "28%",
    size: "10%",
    stock: "13%",
    packing: "10%",
    price: "10%",
    value: "12%",
  };
  const hasStockAt = Array.isArray(dataItems)
    ? dataItems.some((item) => item?.stock_at !== undefined && item?.stock_at !== null && item?.stock_at !== "")
    : false;
  const totalItems = Array.isArray(dataItems) ? dataItems.length : 0;

  const totalReqQty = Array.isArray(dataItems)
    ? dataItems.reduce((sum, item) => sum + Number(item.request || 0), 0)
    : 0;

  const totalAmount = Array.isArray(dataItems)
    ? dataItems.reduce(
      (sum, item) => sum + Number(item.request || 0) * Number(item.unit_price || 0),
      0
    )
    : 0;
  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Image style={styles.logo} src="/favicon.png" />
            <View style={styles.companyDetails}>
              <Text style={{ fontWeight: "bold", fontSize: 10, lineHeight: 1.5 }}>
                บริษัท อดามา (ประเทศไทย) จำกัด </Text>
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

          {/* Expense Information */}
          <View style={styles.sectionTop}>
            <Text style={{ fontWeight: "bold" }}>Expense Material No: {dataHeader.code}</Text>
            <Text style={{ fontWeight: "bold" }}>Date: {formatDate(dataHeader.created_at)}</Text>
          </View>

          {/* Name and Regions */}
          <View style={{ ...styles.sectionTop, borderStyle: "solid", borderWidth: 1, borderColor: "#000", padding: 8, marginBottom: 5 }}>
            <Text style={{ fontWeight: "bold", fontSize: 10, marginRight: "auto", width: "50%" }}>Name: {dataHeader.user_name || "-"}</Text>
            <Text style={{ fontWeight: "bold", fontSize: 10, marginRight: 'auto', width: "50%" }}>Regions: {dataHeader.area_name || "-"}</Text>
          </View>

          {/* Material List */}
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <View style={[styles.cellBase, { width: colWidths.no }]}>
                <Text style={styles.headerText}>No</Text>
              </View>
              <View style={[styles.cellBase, { width: colWidths.req }]}>
                <Text style={styles.headerText}>Req Unit</Text>
              </View>
              <View style={[styles.cellBase, { width: colWidths.name }]}>
                <Text style={styles.headerText}>Materials Name</Text>
              </View>
              <View style={[styles.cellBase, { width: colWidths.size }]}>
                <Text style={styles.headerText}>Size</Text>
              </View>
              <View style={[styles.cellBase, { width: colWidths.stock }]}>
                <Text style={styles.headerText}>{hasStockAt ? "Stock At" : "Stock"}</Text>
              </View>
              <View style={[styles.cellBase, { width: colWidths.packing }]}>
                <Text style={styles.headerText}>Type</Text>
              </View>
              <View style={[styles.cellBase, { width: colWidths.price }]}>
                <Text style={styles.headerText}>Price / Pc.</Text>
              </View>
              <View style={[styles.cellBase, styles.cellLast, { width: colWidths.value }]}>
                <Text style={styles.headerText}>Value</Text>
              </View>
            </View>

            {dataItems.map((item, index) => {
              const requestQty = Number(item.request || 0);
              const stockQty = Number(
                hasStockAt
                  ? (item.stock_at ?? item.qty ?? 0)
                  : (item.qty ?? 0)
              );
              const unitPrice = Number(item.unit_price || 0);
              const totalValue = requestQty * unitPrice;

              return (
                <View style={styles.tableRow} key={index}>
                  <View style={[styles.cellBase, { width: colWidths.no }]}>
                    <Text style={styles.bodyTextCenter}>{index + 1}</Text>
                  </View>

                  <View style={[styles.cellBase, { width: colWidths.req }]}>
                    <Text style={styles.bodyTextCenter}>{formatNumber(requestQty)}</Text>
                  </View>

                  <View style={[styles.cellBase, { width: colWidths.name }]}>
                    <Text style={styles.bodyTextLeft}>{item.name || "-"}</Text>
                  </View>

                  <View style={[styles.cellBase, { width: colWidths.size }]}>
                    <Text style={styles.bodyTextCenter}>{item.size || "-"}</Text>
                  </View>

                  <View style={[styles.cellBase, { width: colWidths.stock }]}>
                    <Text style={styles.bodyTextCenter}>{formatNumber(stockQty)}</Text>
                  </View>

                  <View style={[styles.cellBase, { width: colWidths.packing }]}>
                    <Text style={styles.bodyTextCenter}>{item.type || "-"}</Text>
                  </View>

                  <View style={[styles.cellBase, { width: colWidths.price }]}>
                    <Text style={styles.bodyTextRight}>{formatNumber2(unitPrice)}</Text>
                  </View>

                  <View style={[styles.cellBase, styles.cellLast, { width: colWidths.value }]}>
                    <Text style={styles.bodyTextRight}>{formatNumber2(totalValue)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
          {/* Remark Section */}
          <View
            style={{
              borderStyle: "solid",
              borderWidth: 1,
              borderColor: "#000",
              padding: 8,
              marginTop: 0,
              borderTopWidth: 0,
            }}
          >
            <Text style={{ ...styles.RemarkTitle, fontSize: 10, marginBottom: 0 }}>
              Item: {formatNumber(totalItems)} {"  |  "}
              Req QTY: {formatNumber(totalReqQty)} {"  |  "}
              Total (THB): {formatNumber2(totalAmount)}
            </Text>
          </View>


          {/* Remark Section */}
          <View style={styles.RemarkBox}>
            <Text style={styles.RemarkTitle}>Remark:</Text>
            <Text style={styles.RemarkText}>{dataHeader.remark || " "}</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <View style={styles.footerSection}>
                <Text style={styles.footerLabel}>Requested By</Text>
                {/* <Text>{dataHeader.requested_by || "-"}</Text> */}
              </View>
              <View style={styles.footerSection}>
                <Text style={styles.footerLabel}>Agreed By</Text>
                {/* <Text>{dataHeader.agreed_by || "-"}</Text> */}
              </View>
              <View style={styles.footerSection}>
                <Text style={styles.footerLabel}>Approved By</Text>
                {/* <Text>{dataHeader.approved_by || "-"}</Text> */}
              </View>
              <View style={styles.footerSectionLast}>
                <Text style={styles.footerLabel}>Delivered/Checked By</Text>
                {/* <Text>{dataHeader.delivered_by || "-"}</Text> */}
              </View>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default MaterialExpensePDF;
