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
  page: { padding: 20, fontSize: 9, fontFamily: "Sarabun" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  logo: { width: 60, height: 60 },
  companyDetails: { flex: 1, paddingLeft: 10, fontSize: 8 },
  title: { textAlign: "center", fontSize: 14, fontWeight: "bold", marginBottom: 10 },
  section: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10, borderStyle: "solid", lineHeight: 1 },
  sectionColumn: { width: "100%", borderWidth: 1, borderColor: "#000", padding: 5 },
  sectionColumn2: { width: "100%", borderWidth: 1, borderColor: "#000", padding: 5, borderLeft: 0 },
  table: { display: "table", width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#000" },
  tableRow: { flexDirection: "row" },
  tableCellMainHeader: { borderBottomWidth: 1, padding: 5, fontWeight: "bold", textAlign: "center", borderRightWidth: 1 },
  tableCellHeader: { borderBottomWidth: 1, padding: 5, fontWeight: "bold", textAlign: "center", flex: 1, borderRightWidth: 1, },
  tableCell: { padding: 5, flex: 1, textAlign: "center", borderRightWidth: 1 },
  tableCellLast: { borderRightWidth: 0 },
  footer: {
    marginTop: 10,
    fontSize: 9,
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
  },
  footerRow: { flexDirection: "row", lineHeight: 1 },
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
    return `${percentage.toFixed(2)} %`; // ให้แสดงผลเป็นทศนิยม 2 ตำแหน่ง
  };

  const calculateActualPercentage = (actualSale, actualExpense) => {
    if (!actualSale || !actualExpense || actualExpense === 0) return "0 %"; // ป้องกันการหารด้วย 0
    const percentage = (parseFloat(actualSale) / parseFloat(actualExpense)) * 100;
    return `${percentage.toFixed(2)} %`; // ให้แสดงผลเป็นทศนิยม 2 ตำแหน่ง
  };
  
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
            {getPageCode === "expense_clearing" ? "Clearing Expense" :  "Advance Expense" }
          </Text>

          <Text style={{ marginLeft: 'auto', paddingBottom: 5 }} ><Text style={{ fontWeight: 'bold' }}>Date</Text> : {formatDate(dataHeader.created_at)}</Text>

          {/* Details Section */}
          
          <View style={styles.section}>
            <View style={styles.sectionColumn}>
              {/* <Text>Advance No: {getDocumentNumber}</Text>
              <Text>Activity Type: {dataHeader.activity_type_name}</Text>
              <Text>Shop Name: {dataHeader.dealer_name}</Text>
              <Text>Crop: {dataCrop.map(crop => crop.name).join(" , ")}</Text>
              <Text>Sale Name: {dataHeader.user_name}</Text> */}
              <View style={{flexDirection: "row", justifyContent: "space-between",width: "100%", }}>
                  <Text style={{flex: 2,textAlign: "start"}}>Advance No:</Text>
                  <Text style={{flex: 7,textAlign: "start"}}>{getDocumentNumber}</Text>
              </View>
              <View style={{flexDirection: "row", justifyContent: "space-between",width: "100%", }}>
                  <Text style={{flex: 2,textAlign: "start"}}>Activity Type :</Text>
                  <Text style={{flex: 7,textAlign: "start"}}>{dataHeader.activity_type_name}</Text>
              </View>
              <View style={{flexDirection: "row", justifyContent: "space-between",width: "100%", }}>
                  <Text style={{flex: 2,textAlign: "start"}}>Shop Name :</Text>
                  <Text style={{flex: 7,textAlign: "start"}}>{dataHeader.dealer_name}</Text>
              </View>
              <View style={{flexDirection: "row", justifyContent: "space-between",width: "100%", }}>
                  <Text style={{flex: 2,textAlign: "start"}}>Crop :</Text>
                  <Text style={{flex: 7,textAlign: "start"}}>{dataCrop.map(crop => crop.name).join(" , ")}</Text>
              </View>
              <View style={{flexDirection: "row", justifyContent: "space-between",width: "100%", }}>
                  <Text style={{flex: 2,textAlign: "start"}}>Sale Name :</Text>
                  <Text style={{flex: 7,textAlign: "start"}}>{dataHeader.user_name}</Text>
              </View>
            </View>

            <View style={styles.sectionColumn2}>
              <Text>Event Date: {formatDate(dataHeader.document_date)}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'between', width: '100%' }}>
                <Text style={{ width: '140px' }}>Est. Participant: {formatNumber(dataHeader.participant_estimate)} </Text>
                <Text>Actual Participant: {formatNumber(dataHeader.particapant_actual)}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'between', width: '100%' }}>
                {/* <Text style={{ width: '140px' }}>
                  Advance Exp: {parseFloat(dataHeader.expense_advance).toLocaleString()}
                </Text> */}
                <Text style={{ width: '140px' }}>
                  Advance Exp: {formatNumber(dataHeader.expense_advance || 0)}
                </Text>
                <Text>
                  Actual Exp: {formatNumber(dataHeader.expense_actual)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'between', width: '100%' }}>
                <Text style={{ width: '140px' }}>
                    EXP: {calculatePercentage(Number(dataHeader.expense_advance),Number(dataHeader.product_total_estimate_sale) )}
                </Text>
                <Text>EXP: {calculateActualPercentage(Number(dataHeader.expense_actual), Number(dataHeader.product_total_acutal_sale))}</Text>
              </View>
            </View>
          </View>

          {/* Table */}
          {/* <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellHeader}>Product Name</Text>
              <Text style={styles.tableCellHeader}>Pack Size</Text>
              <Text style={styles.tableCellHeader}>Plan QTY (KG)</Text>
              <Text style={styles.tableCellHeader}>Plan Value (THB)</Text>
              <Text style={[styles.tableCellHeader, styles.tableCellLast]}>Actual QTY (KG)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Custodia 320 SC</Text>
              <Text style={styles.tableCell}>20 x 0.5 Lt</Text>
              <Text style={styles.tableCell}>100</Text>
              <Text style={styles.tableCell}>154,018</Text>
              <Text style={[styles.tableCell, styles.tableCellLast]}></Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Kanto 50 SC</Text>
              <Text style={styles.tableCell}>1 Lt x 10</Text>
              <Text style={styles.tableCell}>50</Text>
              <Text style={styles.tableCell}>22,257</Text>
              <Text style={[styles.tableCell, styles.tableCellLast]}></Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Kohinor X 350 SC</Text>
              <Text style={styles.tableCell}>1 Lt x 12</Text>
              <Text style={styles.tableCell}>10</Text>
              <Text style={styles.tableCell}>8,775.5</Text>
              <Text style={[styles.tableCell, styles.tableCellLast]}></Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Kestrel</Text>
              <Text style={styles.tableCell}>0.25 Lt x 20</Text>
              <Text style={styles.tableCell}>10</Text>
              <Text style={styles.tableCell}>6,548</Text>
              <Text style={[styles.tableCell, styles.tableCellLast]}></Text>
            </View>
          </View> */}

          <View style={styles.table}>
            {/* Header ของ Table */}
            {/* <View style={styles.tableRow}>
              <Text style={styles.tableCellHeader}>Product Name</Text>
              <Text style={styles.tableCellHeader}>Pack Size</Text>
              <Text style={styles.tableCellHeader}>Plan QTY (KG)</Text>
              <Text style={styles.tableCellHeader}>Plan Value (THB)</Text>
              <Text style={styles.tableCellHeader}>Actual QTY (KG)</Text>
              <Text style={[styles.tableCellHeader, styles.tableCellLast]}>Actual Value (THB)</Text>
            </View> */}

            {/* Header Row */}
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
            {dataItems.filter(item => Number(item.estimate_sale_qty) != 0).length > 0 ? (
              dataItems.map((item, index) =>
                Number(item.estimate_sale_qty) != 0 && (
                  <View style={styles.tableRow} key={index}>
                    <Text style={[styles.tableCell, { flex: 2, minWidth: 21, textAlign: 'start' }]}>{item.product_name}</Text>
                    <Text style={[styles.tableCell, { flex: 2, minWidth: 21, textAlign: 'start' }]}>{item.packing_list}</Text>
                    <Text style={styles.tableCell}>{formatNumber(item.estimate_sale_qty)}</Text>
                    <Text style={styles.tableCell}>{formatNumber(Number(item.bath_ltkg || 1) * Number(item.estimate_sale_qty || 0))}</Text>
                    <Text style={styles.tableCell}>{formatNumber(item.acutal_sale_qty)}</Text>
                    <Text style={[styles.tableCell, styles.tableCellLast]}>{formatNumber(Number(item.bath_ltkg || 1) * Number(item.acutal_sale_qty || 0))}</Text>
                  </View>
                )
              )
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
              <Text style={[styles.tableCell]}> {formatNumber(dataHeader.expense_expense_actual_exp || 0)}</Text>
              <Text style={[styles.tableCell]}>-</Text>
              <Text style={[styles.tableCell, styles.tableCellLast]}> { formatNumber(dataHeader.expense_actual_sale || 0)} </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              {/* Advance Section */}
              <View style={styles.footerSection}>
                <Text style={styles.footerLabel}>Advance</Text>
                <View style={styles.footerContentRow}>
                  <Text style={{flex: 2,textAlign: "start"}}>Request By :</Text>
                  <Text style={{flex: 4,textAlign: "start"}}>{dataHeader.user_name}</Text>
                  <Text style={{flex: 1,textAlign: "start"}}>Date</Text>
                  <Text style={{flex: 2,textAlign: "start"}}>{formatDate(dataHeader.document_date)}</Text>
                </View>
                <View style={styles.footerContentRow}>
                  <Text style={{flex: 2,textAlign: "start"}}>Approved By :</Text>
                  <Text style={{flex: 4,textAlign: "start"}}> </Text>
                  <Text style={{flex: 1,textAlign: "start"}}>Date</Text>
                  <Text style={{flex: 2,textAlign: "start"}}> </Text>
                </View>
                <View style={styles.footerContentRow}>
                  <Text style={{flex: 2,textAlign: "start"}}>Clearing By :</Text>
                  <Text style={{flex: 4,textAlign: "start"}}> </Text>
                  <Text style={{flex: 1,textAlign: "start"}}>Date</Text>
                  <Text style={{flex: 2,textAlign: "start"}}> </Text>
                </View>
              </View>

              {/* Clearing Section */}
              <View style={styles.footerSectionLast}>
                <Text style={styles.footerLabel}>Clearing</Text>
                <View style={styles.footerContentRow}>
                  <Text style={{flex: 2,textAlign: "start"}}>Request By :</Text>
                  <Text style={{flex: 4,textAlign: "start"}}></Text>
                  <Text style={{flex: 1,textAlign: "start"}}>Date</Text>
                  <Text style={{flex: 2,textAlign: "start"}}></Text>
                </View>
                <View style={styles.footerContentRow}>
                  <Text style={{flex: 2,textAlign: "start"}}>Approved By :</Text>
                  <Text style={{flex: 4,textAlign: "start"}}> </Text>
                  <Text style={{flex: 1,textAlign: "start"}}>Date</Text>
                  <Text style={{flex: 2,textAlign: "start"}}> </Text>
                </View>
                <View style={styles.footerContentRow}>
                <Text style={{flex: 2,textAlign: "start"}}>Clearing By :</Text>
                  <Text style={{flex: 4,textAlign: "start"}}> </Text>
                  <Text style={{flex: 1,textAlign: "start"}}>Date</Text>
                  <Text style={{flex: 2,textAlign: "start"}}> </Text>
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
