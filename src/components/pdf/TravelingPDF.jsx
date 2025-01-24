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

// Register the fonts with correct paths
Font.register({
  family: "Anuphan",
  fonts: [
    { src: "/font/Anuphan/Anuphan-Regular.ttf" },
    { src: "/font/Anuphan/Anuphan-Bold.ttf", fontWeight: "bold" },
    { src: "/font/Anuphan/Anuphan-Light.ttf", fontWeight: "300" },
    { src: "/font/Anuphan/Anuphan-Medium.ttf", fontWeight: "500" },
    { src: "/font/Anuphan/Anuphan-SemiBold.ttf", fontWeight: "600" },
    { src: "/font/Anuphan/Anuphan-Thin.ttf", fontWeight: "100" },
  ],
});

Font.register({
  family: "Sarabun",
  fonts: [
    { src: "/font/Sarabun/Sarabun-Regular.ttf" },
    { src: "/font/Sarabun/Sarabun-Bold.ttf", fontWeight: "bold" },
    { src: "/font/Sarabun/Sarabun-Italic.ttf", fontStyle: "italic" },
    { src: "/font/Sarabun/Sarabun-BoldItalic.ttf", fontWeight: "bold", fontStyle: "italic" },
    { src: "/font/Sarabun/Sarabun-ExtraLight.ttf", fontWeight: "200" },
    { src: "/font/Sarabun/Sarabun-Light.ttf", fontWeight: "300" },
    { src: "/font/Sarabun/Sarabun-Medium.ttf", fontWeight: "500" },
    { src: "/font/Sarabun/Sarabun-SemiBold.ttf", fontWeight: "600" },
    { src: "/font/Sarabun/Sarabun-Thin.ttf", fontWeight: "100" },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 5,
    paddingRight: 5,
    paddingLeft: 5,
    fontSize: 7,
    fontFamily: "Sarabun", // Use the registered font
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
    lineHeight: 0.6,
  },
  logo: {
    width: 40,
    height: 40,
  },
  companyDetails: {
    flexGrow: 1,
    paddingLeft: 10,
    textAlign: "left",
  },
  formDetails: {
    minWidth: 200,
    textAlign: "left",
    marginLeft: "auto",
    lineHeight: 0.6,
  },
  bold: {
    fontWeight: "bold",
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderTop: 1,
    borderRight: 1,
    borderColor: "#000",
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderTop: 0,
    borderRight: 0,
    borderColor: "#000",
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 1.25,
    paddingBottom: 1.25,
    flexGrow: 1,
  },
  footer: {
    fontSize: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  footerCell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 2,
    marginLeft: 2,
    marginRight: 2,
    flex: 1,
    textAlign: "center",
  },
  footerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  footerInfoCell: {
    width: "50%",
    height: 50,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 2,
    margin: 2,
    textAlign: "left",
  },
});

const TravelingPDF = ({ title }) => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [data, setData] = useState([]);
  const [dataItems, setDataItems] = useState([]);
  const [totals, setTotals] = useState({
    petrol: 0,
    cashPetrol: 0,
    tollFee: 0,
    others: 0,
  });

  const columns = [
    { title: "Date", dataIndex: "date", width: "10%" },
    { title: "Travelling From", dataIndex: "from", width: "15%" },
    { title: "To", dataIndex: "to", width: "15%" },
    { title: "Petrol", dataIndex: "petrol", width: "10%" },
    { title: "Cash Petrol", dataIndex: "cashPetrol", width: "10%" },
    { title: "Hotel", dataIndex: "hotel", width: "10%" },
    { title: "Allowance", dataIndex: "allowance", width: "10%" },
    { title: "Toll Way", dataIndex: "tollFee", width: "10%" },
    { title: "Entertain", dataIndex: "entertain", width: "10%" },
    { title: "Others", dataIndex: "others", width: "10%" },
    { title: "Remark", dataIndex: "remark", width: "20%" },
  ];

  const [getUserId, setGetUserId] = useState(location.state.user_id);
  const [getYearCode, setGetYearCode] = useState(location.state.year_code);
  const [getMonthCode, setGetMonthCode] = useState(location.state.month_code);

  useEffect(() => {
    const loadDataTraveling = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathGetExpenseTravelingDetail, {
          year_code: getYearCode,
          month_code: getMonthCode,
          user_id: getUserId,
        });

        if (response.result) {
          setData(response.data); // Store response data
          const dataItems = response.data.data_items || [];

          const calculatedTotals = {
            petrol: 0,
            cashPetrol: 0,
            tollFee: 0,
            others: 0,
          };

          const transformedData = dataItems.map((item, index) => {
            calculatedTotals.petrol += parseFloat(item.petrol || 0);
            calculatedTotals.cashPetrol += parseFloat(item.cash_petrol || 0);
            calculatedTotals.tollFee += parseFloat(item.toll_fee || 0);
            calculatedTotals.others += parseFloat(item.others || 0);

            return {
              key: `${index + 1}`,
              date: item.date || "-",
              from: item.traveling_from || "-",
              to: item.traveling_to || "-",
              mileage: item.mileage || "0",
              petrol: item.petrol || "0",
              cashPetrol: item.cash_petrol || "0",
              hotel: item.hotel || "0",
              allowance: item.allowance || "0",
              tollFee: item.toll_fee || "0",
              entertain: item.entertain || "0",
              others: item.others || "0",
              total: item.total || "0",
              remark: item.remark || "-",
            };
          });

          setDataItems(transformedData);
          setTotals(calculatedTotals);
        }
      } catch (error) {
        console.error("Error fetching traveling data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDataTraveling();
  }, [getUserId, getYearCode, getMonthCode]);

  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <Document>
        <Page size="A4" style={styles.page} orientation="landscape">
          {/* Header */}
          <View style={styles.header}>
            <Image style={styles.logo} src="/favicon.png" />
            <View style={styles.companyDetails}>
              <Text>ADAMA (Thailand) Limited</Text>
              <Text>127/33 Panjathani Tower Building 28th floor,</Text>
              <Text>Nonsi Rd., Chongnonsi, Yannawa, Bangkok 10120 Thailand</Text>
              <Text>Tel: +662 681 1979 Fax: +662 681 1977</Text>
            </View>
            <View style={styles.formDetails}>
              <Text style={styles.bold}>Name: {data.user_name || "-"}</Text>
              <Text>Department: BD</Text>
              <Text style={styles.bold}>Car no.: </Text>
            </View>
          </View>

          {/* Table */}
          <View style={styles.table}>
            {/* Header Row */}
            <View style={[styles.tableRow, styles.bold]}>
              {columns.map((col, index) => (
                <Text key={index} style={[styles.tableCell, { width: col.width }]}>
                  {col.title}
                </Text>
              ))}
            </View>

            {/* Data Rows */}
            {dataItems.map((row, index) => (
              <View key={index} style={styles.tableRow}>
                {columns.map((col, colIndex) => (
                  <Text key={colIndex} style={[styles.tableCell, { width: col.width }]}>
                    {row[col.dataIndex] || "-"}
                  </Text>
                ))}
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {/* Totals Row */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerCell]}>Total Petrol: {totals.petrol}</Text>
              <Text style={[styles.footerCell]}>Total Cash Petrol: {totals.cashPetrol}</Text>
              <Text style={[styles.footerCell]}>Total Toll Fee: {totals.tollFee}</Text>
              <Text style={[styles.footerCell]}>Total Others: {totals.others}</Text>
            </View>

            {/* Approval Section */}
            <View style={styles.footerInfo}>
              <View style={styles.footerInfoCell}>
                <Text>Requested By</Text>
              </View>
              <View style={styles.footerInfoCell}>
                <Text>Checked By</Text>
              </View>
            </View>
            <View style={styles.footerInfo}>
              <View style={styles.footerInfoCell}>
                <Text>Approved By</Text>
              </View>
              <View style={styles.footerInfoCell}>
                <Text>Received By</Text>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default TravelingPDF;
