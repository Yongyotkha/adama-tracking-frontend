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
import useServiceAPI from "../../services/CorsService";
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
  sectionColumn: { width: "68%", borderWidth: 1, borderColor: "#000", padding: 5 },
  sectionColumn2: { width: "68%", borderWidth: 1, borderColor: "#000", padding: 5, borderLeft: 0 },
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
  footerContentRow: { flexDirection: "row", justifyContent: "space-between" },
});

const AdvanceExpensePDF = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [getDocumentNumber, setGetDocumentNumber] = useState(location.state.document_number);
  const [getPageCode, setGetPageCode] = useState(location.state.page_code);
  const [getAdvanceDetail, setAdvanceDetail] = useState(location.state.page_code);
  const [dataItems, setDataItems] = useState([]);
  const [dataHeader, setDataHeader] = useState([]);
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
          console.log(response.data);

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
            {location.state.page_code === 'expense_clearing'
              ? 'Clearing Expense'
              : location.state.page_code === 'expense_advance'
                ? 'Advance Expense'
                : location.state.page_code}
          </Text>

          <Text style={{ marginLeft: 'auto', paddingBottom: 5 }} ><Text style={{ fontWeight: 'bold' }}>Date</Text> : {dataHeader.created_at}</Text>

          {/* Details Section */}
          
          <View style={styles.section}>
            <View style={styles.sectionColumn}>
              <Text>Advance No: {location.state.document_number}</Text>
              <Text>Activity Type: {dataHeader.activity_type_name}</Text>
              <Text>Shop Name: {dataHeader.dealer_name}</Text>
              <Text>
                Crop:{" "}
                {dataCrop.map((crop, index) => (
                  <Text key={index}>{crop.name}{index < dataCrop.length - 1 && ", "}</Text> // ใช้เครื่องหมาย , หลังแต่ละรายการ
                ))}
              </Text>
              <Text>Sale Name: {dataHeader.user_name}</Text>
            </View>

            <View style={styles.sectionColumn2}>
              <Text>Event Date:  {dataHeader.document_date} </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'between', width: '100%' }}>
                <Text style={{ width: '140px' }}>Est. Participant: {dataHeader.participant_estimate} </Text>
                <Text>Actual Participant: 0</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'between', width: '100%' }}>
                {/* <Text style={{ width: '140px' }}>
                  Advance Exp: {parseFloat(dataHeader.expense_advance).toLocaleString()}
                </Text> */}
                <Text style={{ width: '140px' }}>
                  Advance Exp: {parseFloat(dataHeader.expense_advance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text>
                  Actual Exp: {parseFloat(dataHeader.expense_actual_exp).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'between', width: '100%' }}>
                <Text style={{ width: '140px' }}>Exp: 0 %</Text>
                <Text>Exp: 0 %</Text>
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
            {dataItems.filter(item => Number(item.estimate_sale_qty) !== 0).length > 0 ? (
              dataItems.map((item, index) =>
                Number(item.estimate_sale_qty) !== 0 && (
                  <View style={styles.tableRow} key={index}>
                    <Text style={[styles.tableCell, { flex: 2, minWidth: 21, textAlign: 'start' }]}>{item.product_name}</Text>
                    <Text style={[styles.tableCell, { flex: 2, minWidth: 21, textAlign: 'start' }]}>{item.packing_list}</Text>
                    <Text style={styles.tableCell}>{item.estimate_sale_qty}</Text>
                    <Text style={styles.tableCell}>{dataHeader.product_total_estimate_sale}</Text>
                    <Text style={styles.tableCell}>{item.actual_qty_kg || '-'}</Text>
                    <Text style={[styles.tableCell, styles.tableCellLast]}>{item.actual_value_thb || '-'}</Text>
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
              <Text style={[styles.tableCell, { flex: 4, minWidth: 42, borderRightWidth: 1, textAlign: 'start', fontWeight: 'bold' }]}>Total (THB)</Text>
              <Text style={[styles.tableCell]}>{dataHeader.total_plan_value_thb || '-'}</Text>
              <Text style={[styles.tableCell]}>-</Text>
              <Text style={[styles.tableCell]}>-</Text>
              <Text style={[styles.tableCell, styles.tableCellLast]}>-</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              {/* Advance Section */}
              <View style={styles.footerSection}>
                <Text style={styles.footerLabel}>Advance</Text>
                <View style={styles.footerContentRow}>
                  <Text>Request By :  {dataHeader.user_name}</Text>
                  <Text>Date: {dataHeader.document_date}</Text>
                </View>
                <View style={styles.footerContentRow}>
                  <Text>Approved By :</Text>
                  <Text>Date</Text>
                </View>
                <View style={styles.footerContentRow}>
                  <Text>Clearing By :</Text>
                  <Text>Date</Text>
                </View>
              </View>

              {/* Clearing Section */}
              <View style={styles.footerSectionLast}>
                <Text style={styles.footerLabel}>Clearing</Text>
                <View style={styles.footerContentRow}>
                  <Text>Request By :</Text>
                  <Text>Chainarong Jitsawaeng</Text>
                  <Text>Date</Text>
                  <Text>19/2/2568</Text>
                </View>
                <View style={styles.footerContentRow}>
                  <Text>Approved By :</Text>
                  <Text>Date</Text>
                </View>
                <View style={styles.footerContentRow}>
                  <Text>Clearing By :</Text>
                  <Text>Chainarong Jitsawaeng</Text>
                  <Text>Date</Text>
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
