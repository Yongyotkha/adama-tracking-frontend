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

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
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
    fontSize: 9,
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
  },
  footerRow: { flexDirection: "row" },
  footerSection: { flex: 1, padding: 5, borderRightWidth: 1, borderRightColor: "#000" },
  footerSectionLast: { flex: 1, padding: 5 },
  footerLabel: { fontWeight: "bold" },

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
  const getPageCode = searchParams.get("page_code");

  const [dataItems, setDataItems] = useState([]);
  const [dataHeader, setDataHeader] = useState({});
  const [dataCrop, setDataCrop] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathExpenseMaterialOne, {
          code: getMaterial,
        });

        if (response.status === 200) {
          setDataItems(response.data.material_list || []);
          setDataHeader(response.data || {});
          setDataCrop(response.data.crops || []);
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
    if (!Number.isFinite(n)) return "0";
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  const getRowValue = (item, keys = [], fallback = "-") => {
    for (const key of keys) {
      const value = item?.[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return fallback;
  };

  const getNumericRowValue = (item, keys = [], fallback = 0) => {
    for (const key of keys) {
      const value = Number(item?.[key]);
      if (Number.isFinite(value)) return value;
    }
    return fallback;
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
              Expense Sample No: {safeVal(dataHeader.code)}
            </Text>
            <Text style={{ fontWeight: "bold" }}>
              Date: {formatDate(dataHeader.created_at)}
            </Text>
          </View>

          <View
            style={{
              ...styles.sectionTop,
              borderWidth: 1,
              borderColor: "#000",
              padding: 8,
              marginBottom: 5,
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 12,
                marginRight: "auto",
                width: "50%",
              }}
            >
              Name: {safeVal(dataHeader.user_name)}
            </Text>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 12,
                marginRight: "auto",
                width: "50%",
              }}
            >
              Regions: {safeVal(dataHeader.user_region)}
            </Text>
          </View>

          <View style={styles.table}>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.cellHeader, width: "4%" }}>No</Text>
              <Text style={{ ...styles.cellHeader, width: "6%" }}>Req.{"\n"}Unit</Text>
              <Text style={{ ...styles.cellHeader, width: "7%" }}>QTY{"\n"}KG/LT</Text>
              <Text style={{ ...styles.cellHeader, width: "22%" }}>Product Name</Text>
              <Text style={{ ...styles.cellHeader, width: "7%" }}>Unit{"\n"}/ CT</Text>
              <Text style={{ ...styles.cellHeader, width: "8%" }}>Total QTY{"\n"}/ CT</Text>
              <Text style={{ ...styles.cellHeader, width: "8%" }}>Total QTY{"\n"}/ Unit</Text>
              <Text style={{ ...styles.cellHeader, width: "10%" }}>Prod{"\n"}Code</Text>
              <Text style={{ ...styles.cellHeader, width: "8%" }}>Price{"\n"}/ Unit</Text>
              <Text style={{ ...styles.cellHeader, width: "8%" }}>Price{"\n"}/ Kg/Lt</Text>
              <Text style={{ ...styles.cellHeader, width: "12%" }}>Value</Text>
              <Text style={{ ...styles.cellHeader, ...styles.lastCol, width: "10%" }}>
                Remark
              </Text>
            </View>

            {dataItems.map((item, index) => {
              const reqUnit = getRowValue(item, ["request", "request_unit", "req_unit"], "-");
              const qtyKgLt = getNumericRowValue(item, ["qty_kg_lt", "qty", "request_qty"], 0);
              const productName = getRowValue(item, ["name", "product_name"], "-");
              const unitPerCt = getNumericRowValue(item, ["unit_per_ct", "unit_ct", "unit"], 0);
              const totalQtyPerCt = getNumericRowValue(
                item,
                ["total_qty_per_ct", "qty_per_ct", "total_ct"],
                0
              );
              const totalQtyPerUnit = getNumericRowValue(
                item,
                ["total_qty_per_unit", "qty_per_unit"],
                0
              );
              const prodCode = getRowValue(item, ["product_code", "code"], "-");
              const pricePerUnit = getNumericRowValue(
                item,
                ["price_per_unit", "unit_price"],
                0
              );
              const pricePerKgLt = getNumericRowValue(
                item,
                ["price_per_kg_lt", "unit_price_kg_lt"],
                0
              );
              const value = getNumericRowValue(item, ["value"], pricePerUnit * qtyKgLt);
              const remark = getRowValue(item, ["remark"], "-");

              return (
                <View style={styles.tableRow} key={index}>
                  <Text style={{ ...styles.cell, width: "4%" }}>{index + 1}</Text>
                  <Text style={{ ...styles.cell, width: "6%" }}>{safeVal(reqUnit)}</Text>
                  <Text style={{ ...styles.cell, width: "7%" }}>{formatNumber2(qtyKgLt)}</Text>
                  <Text style={{ ...styles.cell, ...styles.cellLeft, width: "22%" }}>
                    {safeVal(productName)}
                  </Text>
                  <Text style={{ ...styles.cell, width: "7%" }}>{formatNumber(unitPerCt)}</Text>
                  <Text style={{ ...styles.cell, width: "8%" }}>
                    {formatNumber(totalQtyPerCt)}
                  </Text>
                  <Text style={{ ...styles.cell, width: "8%" }}>
                    {formatNumber2(totalQtyPerUnit)}
                  </Text>
                  <Text style={{ ...styles.cell, width: "10%" }}>{safeVal(prodCode)}</Text>
                  <Text style={{ ...styles.cell, width: "8%" }}>
                    {formatNumber2(pricePerUnit)}
                  </Text>
                  <Text style={{ ...styles.cell, width: "8%" }}>
                    {formatNumber2(pricePerKgLt)}
                  </Text>
                  <Text style={{ ...styles.cell, width: "12%" }}>{formatNumber2(value)}</Text>
                  <Text style={{ ...styles.cell, ...styles.lastCol, width: "10%" }}>
                    {safeVal(remark)}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.totalBox}>
            <Text style={{ fontWeight: "bold" }}>
              Total (THB): {formatNumber2(dataHeader.request || dataHeader.total || 0)}
            </Text>
          </View>

          <View style={styles.remarkBox}>
            <Text style={styles.remarkTitle}>Remark:</Text>
            <Text style={styles.remarkText}>{safeVal(dataHeader.remark)}</Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <View style={styles.footerSection}>
                <Text style={styles.footerLabel}>Requested By</Text>
                <Text>{safeVal(dataHeader.requested_by)}</Text>
              </View>
              <View style={styles.footerSection}>
                <Text style={styles.footerLabel}>Agreed By</Text>
                <Text>{safeVal(dataHeader.agreed_by)}</Text>
              </View>
              <View style={styles.footerSection}>
                <Text style={styles.footerLabel}>Approved By</Text>
                <Text>{safeVal(dataHeader.approved_by)}</Text>
              </View>
              <View style={styles.footerSectionLast}>
                <Text style={styles.footerLabel}>Delivered/Checked By</Text>
                <Text>{safeVal(dataHeader.delivered_by)}</Text>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default SampleExpensePDF;