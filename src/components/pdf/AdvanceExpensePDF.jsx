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
import { useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import useServiceAPI from "../../services/CorsService";
import formatNumber from "../../utils/number";
import { paths } from "../../services/CorsPath";

// Register Sarabun Font
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

const styles = StyleSheet.create({
  page: { padding: 15, fontSize: 8, fontFamily: "Sarabun" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 0 },
  logo: { width: 50, height: 50 },
  companyDetails: { flex: 1, paddingLeft: 10, fontSize: 8 },
  title: { textAlign: "center", fontSize: 14, fontWeight: "bold", marginBottom: 10 },
  sectionTop: { flexDirection: "row", justifyContent: "space-between", lineHeight: 0.75, },
  section: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5, borderStyle: "solid", lineHeight: 0.75 },
  sectionColumn: { width: "100%", borderWidth: 1, borderColor: "#000", padding: 5 },
  sectionColumn2: { width: "100%", borderWidth: 1, borderColor: "#000", borderLeft: 0 },
  sectionColumnTop: { width: "50%", borderWidth: 1, borderColor: "#000", padding: 5, borderLeft: 0, borderBottom: 0 },
  table: { display: "table", width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#000", lineHeight: 0.5, },
  tableRow: { flexDirection: "row", lineHeight: 0.5 },
  tableCellMainHeader: { borderBottomWidth: 1, padding: 5, fontWeight: "bold", textAlign: "center", borderRightWidth: 1 },
  tableCellHeader: { borderBottomWidth: 1, padding: 5, fontWeight: "bold", textAlign: "center", flex: 1, borderRightWidth: 1, },
  tableCell: { padding: 5, flex: 1, textAlign: "center", borderRightWidth: 1 },
  tableCellLast: { borderRightWidth: 0 },
  descriptionBox: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
    paddingTop: 5,
    marginTop: 5,
  },
  descriptionTitle: { fontWeight: "bold", marginBottom: 4 }, // ถ้าไม่เอาสีแดงก็ลบ color ได้
  descriptionText: { fontSize: 8, lineHeight: 0.75 },

  footer: {
    marginTop: 5,
    fontSize: 9,
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
  },
  footerRow: { flexDirection: "row", lineHeight: 0.85 },
  footerSection: { flex: 1, padding: 5, borderRightWidth: 1 },
  footerSectionLast: { flex: 1, padding: 5 },
  footerText: { marginBottom: 3 },
  footerLabel: { fontWeight: "bold" },
  // footerContentRow: { flexDirection: "row", justifyContent: "space-between" },
  footerContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",  // เพื่อให้คอลัมน์กระจายตัวออกไป
    width: "100%", // ทำให้แถวเต็มความกว้าง
  },
});

const AdvanceExpensePDF = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const getDocumentNumber = searchParams.get("document_number"); // ดึงค่าจาก query params
  const getPageCode = searchParams.get("page_code");
  const [dataItems, setDataItems] = useState([]);
  const [dataHeader, setDataHeader] = useState([]);
  const [dataClearing, setDataClearing] = useState([]);

  const [dataCrop, setDataCrop] = useState([]);

  useEffect(() => {
    const loadDataAdvance = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathActivityExpenseDetail, {
          document_number: getDocumentNumber,
          page_code: getPageCode,
        });
        if (response.status == 200) {
          // console.log(response.data);
          setDataItems(response.data.expense_product_data_list); // เซ็ตค่าให้กับ state
          setDataHeader(response.data);

          // console.log(dataHeader.approve_by.user_name_en)
          setDataClearing(response.data);

          setDataCrop(response.data.crop_id_list)
        }
      } catch (error) {
        console.error("Error fetching traveling data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDataAdvance();
  }, [getDocumentNumber, getPageCode]);

  const getUnitPrice = (item) => {
    const parseVal = (v) => {
      if (v === null || v === undefined || v === "") return NaN;
      const num = typeof v === "string" ? parseFloat(v.replace(/,/g, "")) : Number(v);
      return Number.isFinite(num) && num > 0 ? num : NaN;
    };
    const bathUnit = parseVal(item?.bath_unit);
    if (!isNaN(bathUnit)) return bathUnit;
    const bathLtkg = parseVal(item?.bath_ltkg);
    if (!isNaN(bathLtkg)) return bathLtkg;
    return 1;
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
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // เดือนเริ่มจาก 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year}`;
  };

  const calculatePercentage = (estimateSale, advanceExpense) => {
    if (!estimateSale || !advanceExpense || advanceExpense === 0) return "0 %"; // ป้องกันการหารด้วย 0
    const percentage = (parseFloat(estimateSale) / parseFloat(advanceExpense)) * 100;
    return `${formatNumber(percentage)} %`; // ให้แสดงผลเป็นทศนิยม 2 ตำแหน่ง
  };

  const calculateActualPercentage = (actualSale, actualExpense) => {
    if (!actualSale || !actualExpense || actualExpense === 0) return "0 %"; // ป้องกันการหารด้วย 0
    const percentage = (parseFloat(actualSale) / parseFloat(actualExpense)) * 100;
    return `${formatNumber(percentage)} %`; // ให้แสดงผลเป็นทศนิยม 2 ตำแหน่ง
  };

  //console.log(dataHeader.approve_by.user_name_en)
  const formatDateLong = (dateString) => {
    if (!dateString) return "-";

    const trimmedDate = dateString.split(".")[0]; // ตัดส่วน microseconds ออก
    const date = new Date(trimmedDate); // ใช้ new Date() ได้แล้ว

    if (isNaN(date)) return "-"; // ตรวจสอบกรณีแปลงไม่ได้

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };


  // ✅ แก้ตรงนี้: เลือกรายการที่มี estimate หรือ actual ไม่เท่ากับ 0
  const visibleItems = dataItems.filter(
    (item) =>
      Number(item.estimate_sale_qty || 0) !== 0 ||
      Number(item.acutal_sale_qty || 0) !== 0
  );

  const stripHtml = (html) => {
    if (!html) return "-";
    return String(html)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim() || "-";
  };

  const descriptionText = stripHtml(dataHeader?.description);
  const rawFreeKeyItems = dataHeader?.expense_clearing_freekey ?? dataHeader?.freekey ?? [];
  const freeKeyItems = (Array.isArray(rawFreeKeyItems) ? rawFreeKeyItems : [])
    .filter((item) => String(item?.list ?? "").trim() !== "" || Number(item?.value || 0) !== 0)
    .map((item, index) => ({
      line: Number(item?.line) || index + 1,
      list: String(item?.list ?? "").trim(),
      value: Number(item?.value || 0),
    }));
  const freeKeyTotal = freeKeyItems.reduce((sum, item) => sum + Number(item.value || 0), 0);


  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Image style={styles.logo} src="/favicon.png" />
            <View style={styles.companyDetails}>
              <Text style={{ fontWeight: "bold", fontSize: 10, lineHeight: 1.5 }}>บริษัท อดามา (ประเทศไทย) จำกัด </Text>
              <Text style={{ fontWeight: "bold", fontSize: 10, lineHeight: 1.5 }}>ADAMA (Thailand) Limited</Text>
              <Text style={{ fontSize: 8, lineHeight: 1.5 }}>127/33  อาคารปัญจธานี ทาวเวอร์ ชั้น 28 ถนนนนทรี  แขวงช่องนนทรี เขตยานนาวา กรุงเทพฯ 10120</Text>
              <Text style={{ fontSize: 8, lineHeight: 1.5 }}>127/33 Panjathani Tower Building 28 floor, Nonsi Rd, Yannawa, Bangkok 10120</Text>
              <Text style={{ fontSize: 8, lineHeight: 1.5 }}>Tel: +66 2 681 1979 Fax: +66 2 681 1977</Text>
            </View>
          </View>
          <Text style={styles.title}>
            {getPageCode === "expense_clearing" ? "Clearing Expense" : "Advance Expense"}
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
            <Text style={{ marginRight: 'auto', paddingBottom: 5 }} >
              <Text style={{ fontWeight: 'bold' }}>
                {getPageCode === "expense_clearing" ? "Clearing Expense" : "Advance Expense"} No
              </Text>
              : {getDocumentNumber}

              {/* Conditional rendering for "Advance Reference" section */}
              {getPageCode === "expense_clearing" && (
                <Text style={{ fontWeight: 'bold' }}>
                  &nbsp; | Advance Reference No <Text style={{ fontWeight: 'light' }}> : {dataHeader.advance_reference_no}</Text>
              </Text>
              )}
            </Text>



            <Text style={{ marginLeft: 'auto', paddingBottom: 5 }} >
              <Text style={{ fontWeight: 'bold' }}>Date</Text> : {formatDate(dataHeader.created_at)}
            </Text>
          </View>


          {/* Details Section */}

          <View style={styles.sectionTop}>
            <View style={[styles.sectionColumn, { borderBottomWidth: 0 }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", margin: 'auto' }}>
                <Text style={{ fontWeight: "bold", textAlign: "center" }}>Sales Name :</Text>
                <Text style={{ flex: 7, textAlign: "start", paddingLeft: 7 }}>{dataHeader.user_name}</Text>
              </View>
            </View>
            <View style={styles.sectionColumnTop}>
              <Text style={{ fontWeight: "bold" }}>Advance Exp : {formatNumber2(dataHeader.expense_advance)} THB</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", margin: 'auto' }}>
                <Text style={{ textAlign: "center" }}>Exp :</Text>
                <Text style={{ flex: 7, textAlign: "start", paddingLeft: 7 }}>
                  {calculatePercentage(Number(dataHeader.expense_advance), Number(dataHeader.product_total_estimate_sale))}
                </Text>
              </View>
            </View>
            <View style={styles.sectionColumnTop}>
              <Text style={{ fontWeight: "bold" }}>
                Actual Exp: {formatNumber2(dataHeader.expense_actual)} THB
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", margin: 'auto' }}>
                <Text style={{ textAlign: "center" }}>Exp :</Text>
                <Text style={{ flex: 7, textAlign: "start", paddingLeft: 7 }}>
                  {calculateActualPercentage(Number(dataHeader.expense_actual), Number(dataHeader.product_total_acutal_sale))}
                </Text>
              </View>
            </View>

          </View>

          <View style={styles.section}>
            <View style={styles.sectionColumn}>
              {/* <Text>Advance No: {getDocumentNumber}</Text>
              <Text>Activity Type: {dataHeader.activity_type_name}</Text>
              <Text>Shop Name: {dataHeader.dealer_name}</Text>
              <Text>Crop: {dataCrop.map(crop => crop.name).join(" , ")}</Text>
              <Text>Sale Name: {dataHeader.user_name}</Text> */}

              <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", }}>
                <Text style={{ flex: 3, textAlign: "start" }}>Activity Type :</Text>
                <Text style={{ flex: 7, textAlign: "start" }}>{dataHeader.activity_type_name}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", }}>
                <Text style={{ flex: 3, textAlign: "start" }}>Dealer Name :</Text>
                <Text style={{ flex: 7, textAlign: "start" }}>{dataHeader?.dealer_name?.trim()}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", }}>
                <Text style={{ flex: 3, textAlign: "start" }}>Sub Dealer Name :</Text>
                <Text style={{ flex: 7, textAlign: "start" }}>{dataHeader?.sub_dealer_name?.trim()}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", }}>
                <Text style={{ flex: 3, textAlign: "start" }}>Crop :</Text>
                <Text style={{ flex: 7, textAlign: "start" }}>{dataCrop.map(crop => crop.name).join(" , ")}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", }}>
                <Text style={{ flex: 3, textAlign: "start" }}>Location :</Text>
                <Text style={{ flex: 7, textAlign: "start" }}>{dataHeader.activity_transaction_mapping_location_address}</Text>
              </View>
            </View>


            <View style={styles.sectionColumn2}>

              {getPageCode === "expense_clearing" && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    borderColor: "#000",
                    borderBottomWidth: 1,
                    marginBottom: 5,
                    padding: 5,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 11 }}>
                      Return to Company:{" "}
                      {Number(dataHeader.expense_advance) - Number(dataHeader.expense_actual) > 0
                        ? `${formatNumber(Number(dataHeader.expense_advance) - Number(dataHeader.expense_actual))} THB`
                        : "0"}
                    </Text>
                    <Text style={{ fontWeight: "bold", fontSize: 11 }}>
                      Return to Staff:{" "}
                      {Number(dataHeader.expense_advance) - Number(dataHeader.expense_actual) < 0
                        ? `${formatNumber(Math.abs(Number(dataHeader.expense_advance) - Number(dataHeader.expense_actual)))} THB`
                        : "0"}
                    </Text>
                  </View>
                </View>
              )}
              <View style={{ flexDirection: 'column', alignItems: 'start', justifyContent: 'start', width: '100%', padding: 5, }}>
                <Text>Event Date: {formatDate(dataHeader.document_date)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'start', width: '100%', }}>
                  <Text style={{ width: '140px' }}>Est. Participant: {formatNumber(dataHeader.participant_estimate)} Person </Text>
                  <Text>Actual Participant: {formatNumber(dataHeader.particapant_actual)} Person</Text>
                </View>
              </View>
              {/* <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'between', width: '100%' }}>
                <Text style={{ width: '140px' }}>
                  Advance Exp: {formatNumber(dataHeader.expense_advance || 0)}
                </Text>
                <Text>
                  Actual Exp: {formatNumber(dataHeader.expense_actual)}
                </Text>
              </View> */}

              {/* <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'between', width: '100%' }}>
                <Text style={{ width: '140px' }}>
                  EXP: {calculatePercentage(Number(dataHeader.expense_advance), Number(dataHeader.product_total_estimate_sale))}
                </Text>
                <Text>EXP: {calculateActualPercentage(Number(dataHeader.expense_actual), Number(dataHeader.product_total_acutal_sale))}</Text>
              </View> */}
            </View>
          </View>


          <View style={styles.table}>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCellHeader, { flex: 2, minWidth: 25, paddingTop: '15' }]}>Product Name</Text>
              <Text style={[styles.tableCellHeader, { flex: 2, minWidth: 25, paddingTop: '15' }]}>Pack Size</Text>
              <View style={{ flex: 2, minWidth: 25, borderRightWidth: 1, borderBottomWidth: 1 }}>
                <Text style={[styles.tableCellMainHeader, { borderRightWidth: 0, borderBottomWidth: 1 }]}>Plan</Text>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={[styles.tableCellHeader, { flex: 1, borderBottomWidth: 0 }]}>QTY (KG)</Text>
                  <Text style={[styles.tableCellHeader, { flex: 1, borderRightWidth: 0, borderBottomWidth: 0 }]}>Value (THB)</Text>
                </View>
              </View>
              <View style={{ flex: 2, minWidth: 25, borderBottomWidth: 1 }}>
                <Text style={[styles.tableCellMainHeader, { borderRightWidth: 0, borderBottomWidth: 1 }]}>Actual</Text>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={[styles.tableCellHeader, { flex: 1, borderBottomWidth: 0 }]}>QTY (KG)</Text>
                  <Text style={[styles.tableCellHeader, { flex: 1, borderRightWidth: 0, borderBottomWidth: 0 }]}>Value (THB)</Text>
                </View>
              </View>
            </View>
            {/* Data Rows */}
            {visibleItems.length > 0 ? (
              visibleItems.map((item, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={[styles.tableCell, { flex: 2, minWidth: 21, textAlign: 'start' }]}>
                    {item.product_name}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 2, minWidth: 21, textAlign: 'start' }]}>
                    {item.packing_list}
                  </Text>
                  <Text style={styles.tableCell}>
                    {formatNumber2(item.estimate_sale_qty)}
                  </Text>
                  <Text style={styles.tableCell}>
                    {formatNumber2(getUnitPrice(item) * Number(item.estimate_sale_qty || 0))}
                  </Text>
                  <Text style={styles.tableCell}>
                    {formatNumber(item.acutal_sale_qty)}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellLast]}>
                    {formatNumber(getUnitPrice(item) * Number(item.acutal_sale_qty || 0))}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2, minWidth: 21, textAlign: 'start' }]}>-</Text>
                <Text style={[styles.tableCell, { flex: 2, minWidth: 21, textAlign: 'start' }]}>-</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>-</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>-</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>-</Text>
                <Text style={[styles.tableCell, styles.tableCellLast]}>-</Text>
              </View>
            )}


            {/* Total Row */}
            <View style={[styles.tableRow, { borderTopWidth: 1 }]}>
              <Text style={[styles.tableCell, { flex: 4, minWidth: 42, borderRightWidth: 1, textAlign: 'start', fontWeight: 'bold' }]}>Total (THB) </Text>
              <Text style={[styles.tableCell]}>-</Text>
              <Text style={[styles.tableCell]}> {formatNumber2(dataHeader.expense_expense_actual_exp || 0)}</Text>
              <Text style={[styles.tableCell]}>-</Text>
              <Text style={[styles.tableCell, styles.tableCellLast]}> {formatNumber2(dataHeader.expense_actual_sale || 0)} </Text>
            </View>
          </View>

          {getPageCode === "expense_clearing" && freeKeyItems.length > 0 && (
            <View style={[styles.table, { marginTop: 5 }]}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCellHeader, { flex: 4, textAlign: "left" }]}>Other Clearing</Text>
                <Text style={[styles.tableCellHeader, { flex: 1, borderRightWidth: 0 }]}>Value (THB)</Text>
              </View>

              {freeKeyItems.map((item, index) => (
                <View style={styles.tableRow} key={`freekey-${index}`}>
                  <Text style={[styles.tableCell, { flex: 4, textAlign: "left" }]}>
                    {item.list + " " || "-"}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellLast, { flex: 1 }]}>
                    {formatNumber2(item.value)}
                  </Text>
                </View>
              ))}

              <View style={[styles.tableRow, { borderTopWidth: 1 }]}>
                <Text style={[styles.tableCell, { flex: 4, textAlign: "left", fontWeight: "bold" }]}>
                  Total (THB)
                </Text>
                <Text style={[styles.tableCell, styles.tableCellLast, { flex: 1 }]}>
                  {formatNumber2(freeKeyTotal)}
                </Text>
              </View>
            </View>
          )}

          {/* Description (ต่อจาก Products ก่อน Footer) */}
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionTitle}>Description :</Text>
            <Text style={styles.descriptionText}>{descriptionText}</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              {/* Advance Section */}
              <View style={styles.footerSection}>
                <Text style={styles.footerLabel}>Advance</Text>
                <View style={styles.footerContentRow}>
                  <Text style={{ flex: 2, textAlign: "start" }}>Request By :</Text>
                  {/* <Text style={{ flex: 4, textAlign: "start" }}>{dataHeader.user_name}</Text> */}
                  <Text style={{ flex: 4, textAlign: "start", lineHeight: 1.25 }}>   </Text>
                  <Text style={{ flex: 1, textAlign: "start" }}>Date</Text>
                  {/* <Text style={{ flex: 2, textAlign: "start" }}>{formatDate(dataHeader.created_at)}</Text> */}
                  <Text style={{ flex: 2, textAlign: "start", lineHeight: 1.25 }}>   </Text>
                </View>
                <View style={styles.footerContentRow}>
                  <Text style={{ flex: 2, textAlign: "start" }}>Checked by :</Text>
                  {/* <Text style={{ flex: 4, textAlign: "start" }}> {dataHeader?.approve_by?.user_name_en || "-"}</Text> */}
                  <Text style={{ flex: 4, textAlign: "start", lineHeight: 1.25 }}>   </Text>
                  <Text style={{ flex: 1, textAlign: "start" }}>Date</Text>
                  {/* <Text style={{ flex: 2, textAlign: "start" }}> {formatDate(dataHeader?.approve_by?.created_at)}</Text> */}
                  <Text style={{ flex: 2, textAlign: "start", lineHeight: 1.25 }}>   </Text>
                </View>
                <View style={styles.footerContentRow}>
                  <Text style={{ flex: 2, textAlign: "start" }}>Approved by :</Text>
                  {/* <Text style={{ flex: 4, textAlign: "start" }}> {dataHeader?.approve_clearing_by?.user_name_en || "-"}</Text> */}
                  <Text style={{ flex: 4, textAlign: "start", lineHeight: 1.25 }}>   </Text>
                  <Text style={{ flex: 1, textAlign: "start" }}>Date</Text>
                  {/* <Text style={{ flex: 2, textAlign: "start" }}> {formatDate(dataHeader?.approve_clearing_by?.created_at)}</Text> */}
                  <Text style={{ flex: 2, textAlign: "start", lineHeight: 1.25 }}>   </Text>
                </View>
              </View>

              {/* Clearing Section */}
              <View style={styles.footerSectionLast}>
                <Text style={styles.footerLabel}>Clearing</Text>
                <View style={styles.footerContentRow}>
                  <Text style={{ flex: 2, textAlign: "start" }}>Request By :</Text>
                  {/* <Text style={{ flex: 4, textAlign: "start" }}> {dataHeader?.clearing_create?.user_name_en || "-"}</Text> */}
                  <Text style={{ flex: 4, textAlign: "start", lineHeight: 1.25 }}>   </Text>
                  <Text style={{ flex: 1, textAlign: "start" }}>Date</Text>
                  {/* <Text style={{ flex: 2, textAlign: "start" }}> {formatDate(dataHeader?.clearing_create?.created_at)}</Text> */}
                  <Text style={{ flex: 2, textAlign: "start", lineHeight: 1.25 }}>   </Text>
                </View>
                <View style={styles.footerContentRow}>
                  <Text style={{ flex: 2, textAlign: "start" }}>Checked by :</Text>
                  {/* <Text style={{ flex: 4, textAlign: "start" }}>  {dataHeader?.clearing_approve?.user_name_en || "-"}</Text> */}
                  <Text style={{ flex: 4, textAlign: "start", lineHeight: 1.25 }}>   </Text>
                  <Text style={{ flex: 1, textAlign: "start" }}>Date</Text>
                  {/* <Text style={{ flex: 2, textAlign: "start" }}> {formatDate(dataHeader?.clearing_approve?.created_at)}</Text> */}
                  <Text style={{ flex: 2, textAlign: "start", lineHeight: 1.25 }}>   </Text>
                </View>
                <View style={styles.footerContentRow}>
                  <Text style={{ flex: 2, textAlign: "start" }}>Approved by :</Text>
                  {/* <Text style={{ flex: 4, textAlign: "start" }}> {dataHeader?.clearing_by?.user_name_en || "-"} </Text> */}
                  <Text style={{ flex: 4, textAlign: "start", lineHeight: 1.25 }}>   </Text>
                  <Text style={{ flex: 1, textAlign: "start" }}>Date</Text>
                  {/* <Text style={{ flex: 2, textAlign: "start" }}>  {formatDate(dataHeader?.clearing_by?.created_at)}</Text> */}
                  <Text style={{ flex: 2, textAlign: "start", lineHeight: 1.25 }}>   </Text>
                </View>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer >
  );
};

export default AdvanceExpensePDF;
