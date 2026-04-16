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
    fontSize: 9,
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

  totalBox: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#000",
    padding: 8,
    fontSize: 10,
  },
  infoSection: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 5,
  },

  infoRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },

  infoRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  infoLabel: {
    width: "15%",
    fontSize: 8,
  },

  infoValue: {
    width: "25%",
    fontSize: 8,
  },

  infoTopLabel: {
    fontWeight: "bold",
    fontSize: 10,
    width: "8%",
  },

  infoTopValue: {
    fontWeight: "bold",
    fontSize: 10,
    width: "42%",
  },

  sentByBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 5,
  },

  sentByRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 28,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  sentByLabel: {
    width: 58,
    fontSize: 8,
  },

  sentByItems: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    flex: 1,
  },

  sentByItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
  },

  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 4,
  },

  sentByText: {
    fontSize: 7.5,
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

  const toNumber = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
  };

  const formatNumber2 = (val) => {
    const n = Number(val);
    if (!Number.isFinite(n)) return "0.00";
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatInteger = (val) => {
    const n = Number(val);
    if (!Number.isFinite(n)) return "0";
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  const safeVal = (value, fallback = "  ") => {
    if (value === undefined || value === null || value === "") return fallback;

    return String(value)
      .replace(/\t/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const truncateText = (value, maxLength = 12) => {
    const text = safeVal(value, "");
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const normalizedItems = dataItems.map((item, index) => {
    const quantity = toNumber(item?.quantity || 0);
    const packingUnitSize = toNumber(
      item?.packing_unit_size ?? item?.product_packing_unit_size ?? 0
    );
    const unitSize = toNumber(item?.unit_size ?? 0);
    const qtyUnitSize = toNumber(item?.qty_unit_size ?? 0);
    const sumUnitQty = toNumber(item?.sum_unit_qty ?? packingUnitSize * quantity);
    const unitPrice = toNumber(item?.product_unit_thb ?? item?.net_price ?? 0);
    const pricePerKgLt = toNumber(item?.bath_ltkg ?? 0);
    const totalValue = quantity * unitPrice;

    return {
      key: index + 1,
      no: index + 1,
      sku: safeVal(item?.product_code, ""),
      productName: safeVal(item?.product_name),
      packSize: safeVal(item?.product_unit || item?.packing_list),
      unitPerCt: unitSize,
      qtyPerCt: qtyUnitSize,
      qtyPerUnit: packingUnitSize,
      requestUnit: quantity,
      qtyKgLt: sumUnitQty,
      pricePerUnit: unitPrice,
      pricePerKgLt,
      value: totalValue,
      ref_remark: safeVal(item?.ref_remark, ""),
    };
  });

  const totalQty = normalizedItems.reduce((sum, item) => sum + toNumber(item.requestUnit), 0);
  const totalQtyKgLt = normalizedItems.reduce((sum, item) => sum + toNumber(item.qtyKgLt), 0);
  const totalValue = normalizedItems.reduce((sum, item) => sum + toNumber(item.value), 0);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <Document>
        <Page size="A4" orientation="" style={styles.page}>
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

          <View style={styles.sectionTop}>
            <Text style={{ fontWeight: "bold" }}>
              Expense Sample No: {safeVal(dataHeader.document_number)}
            </Text>
            <Text style={{ fontWeight: "bold" }}>
              Date: {formatDate(dataHeader.document_date || dataHeader.document_datetime)}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRowTop}>
              <Text style={styles.infoTopLabel}>Name :</Text>
              <Text style={styles.infoTopValue}>{safeVal(dataHeader.created_by_name)}</Text>

              <Text style={styles.infoTopLabel}>Regions :</Text>
              <Text style={styles.infoTopValue}>{safeVal(dataHeader.created_area_name)}</Text>
            </View>

            {!!safeVal(dataHeader.dealer_name, "") && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Dealer Name :</Text>
                <Text style={styles.infoValue}>{safeVal(dataHeader.dealer_name, "")}</Text>
              </View>
            )}

            {!!safeVal(dataHeader.sub_dealer_name, "") && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sub Dealer Name :</Text>
                <Text style={styles.infoValue}>{safeVal(dataHeader.sub_dealer_name, "")}</Text>
              </View>
            )}

            {!!safeVal(dataHeader.crop_name, "") && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Crop :</Text>
                <Text style={styles.infoValue}>{safeVal(dataHeader.crop_name, "")}</Text>
              </View>
            )}
          </View>

          <View style={styles.table}>
            <View style={styles.headerRow}>
              <Text style={{ ...styles.cellHeader, width: "4%" }}>No</Text>
              <Text style={{ ...styles.cellHeader, width: "5%" }}>Req Unit</Text>
              <Text style={{ ...styles.cellHeader, width: "7%" }}>QTY Kg/Lt</Text>
              <Text style={{ ...styles.cellHeader, width: "12%" }}>Prod. Code</Text>
              <Text style={{ ...styles.cellHeader, width: "18%" }}>Product Name</Text>
              {/* <Text style={{ ...styles.cellHeader, width: "10%" }}>Pack Size</Text> */}
              <Text style={{ ...styles.cellHeader, width: "7%" }}>Unit / CT</Text>
              <Text style={{ ...styles.cellHeader, width: "7%" }}>QTY / CT</Text>
              <Text style={{ ...styles.cellHeader, width: "7%" }}>QTY / Unit</Text>
              <Text style={{ ...styles.cellHeader, width: "8%" }}>Price / Unit</Text>
              <Text style={{ ...styles.cellHeader, width: "8%" }}>Price /{"\n"}(Kg/Lt)</Text>
              <Text style={{ ...styles.cellHeader, width: "10%" }}>Value</Text>
              <Text style={{ ...styles.cellHeader, ...styles.lastCol, width: "10%" }}>Remark</Text>
            </View>

            {normalizedItems.map((item) => (
              <View style={styles.tableRow} key={item.key}>
                <Text style={{ ...styles.cell, width: "4%" }}>{item.no}</Text>
                <Text style={{ ...styles.cell, width: "5%" }}>
                  {formatInteger(item.requestUnit)}
                </Text>
                <Text style={{ ...styles.cell, width: "7%" }}>
                  {formatNumber2(item.qtyKgLt)}
                </Text>
                <Text style={{ ...styles.cell, width: "12%" }}>{item.sku}</Text>
                <Text style={{ ...styles.cell, ...styles.cellLeft, width: "18%" }}>
                  {item.productName} ({item.packSize})
                </Text>
                {/* <Text style={{ ...styles.cell, width: "10%" }}>{item.packSize}</Text> */}
                <Text style={{ ...styles.cell, width: "7%" }}>
                  {formatNumber2(item.unitPerCt)}
                </Text>
                <Text style={{ ...styles.cell, width: "7%" }}>
                  {formatNumber2(item.qtyPerCt)}
                </Text>
                <Text style={{ ...styles.cell, width: "7%" }}>
                  {formatNumber2(item.qtyPerUnit)}
                </Text>

                <Text style={{ ...styles.cell, width: "8%" }}>
                  {formatNumber2(item.pricePerUnit)}
                </Text>
                <Text style={{ ...styles.cell, width: "8%" }}>
                  {formatNumber2(item.pricePerKgLt)}
                </Text>
                <Text style={{ ...styles.cell, width: "10%" }}>
                  {formatNumber2(item.value)}
                </Text>
                <Text style={{ ...styles.cell, ...styles.lastCol, width: "10%" }}>
                  {truncateText(item.ref_remark, 12)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalBox}>
            <Text style={{ fontWeight: "bold" }}>
              {/* Item: {normalizedItems.length}
              {"  |  "} */}
              Req Unit QTY: {formatInteger(totalQty)}
              {"  |  "}
              QTY Kg/Lt: {formatNumber2(totalQtyKgLt)}
              {"  |  "}
              Total (THB): {formatNumber2(totalValue)}
            </Text>
          </View>

          <View style={styles.remarkBox}>
            <Text style={styles.remarkTitle}>Remark:</Text>
            <Text style={styles.remarkText}>{safeVal(dataHeader.ref_remark)}</Text>
          </View>

          <View style={styles.sentByBox}>
            <View style={styles.sentByRow}>
              <Text style={styles.sentByLabel}>Sent by :</Text>

              <View style={styles.sentByItems}>
                <View style={styles.sentByItem}>
                  <View style={styles.checkbox} />
                  <Text style={styles.sentByText}>Express / post office</Text>
                </View>
                <View style={styles.sentByItem}>
                  <View style={styles.checkbox} />
                  <Text style={styles.sentByText}>Staff</Text>
                </View>
                <View style={styles.sentByItem}>
                  <View style={styles.checkbox} />
                  <Text style={styles.sentByText}>Adama Transportation</Text>
                </View>
                <View style={styles.sentByItem}>
                  <View style={styles.checkbox} />
                  <Text style={styles.sentByText}>Yourself</Text>
                </View>
                <View style={styles.sentByItem}>
                  <View style={styles.checkbox} />
                  <Text style={styles.sentByText}>Vouchers</Text>
                </View>
                <View style={styles.sentByItem}>
                  <View style={styles.checkbox} />
                  <Text style={styles.sentByText}>Etc.</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <View style={styles.signBox}>
                <Text style={styles.signTitle}>Requested By</Text>
                <View style={styles.signSpace}>
                  <Text> </Text>
                </View>
              </View>

              <View style={styles.signBox}>
                <Text style={styles.signTitle}>Agreed By</Text>
                <View style={styles.signSpace}>
                  <Text> </Text>
                </View>
              </View>

              <View style={styles.signBox}>
                <Text style={styles.signTitle}>Approved By</Text>
                <View style={styles.signSpaceApproved}>
                  <Text> </Text>
                </View>
              </View>

              <View style={styles.signBox}>
                <Text style={styles.signTitle}>Approved By</Text>
                <View style={styles.signSpaceApproved}>
                  <Text> </Text>
                </View>
              </View>

              <View style={styles.signBoxLast}>
                <Text style={styles.signTitle}>Delivered / Checked By</Text>
                <View style={styles.signSpace}>
                  <Text> </Text>
                </View>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default SampleExpensePDF;