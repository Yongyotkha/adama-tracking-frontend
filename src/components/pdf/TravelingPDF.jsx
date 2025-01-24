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
    flexDirection: "row", // Align items in a row
    justifyContent: "space-between", // Space between items
    alignItems: "center", // Align items vertically to the center
    marginBottom: 7, // Add spacing below the header
    lineHeight: 0.6,
  },
  logo: {
    width: 40,
    height: 40, // Set logo size
  },
  companyDetails: {
    flexGrow: 1, // Allow the company details section to grow
    paddingLeft: 10, // Add spacing between logo and text
    textAlign: "left",
  },
  formDetails: {
    minWidth: 200, // Set minimum width to 200px
    textAlign: "left", // Align text to the right
    marginLeft: "auto", // Push this section to the far right
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
    marginBottom: 5, // Reduce margin between elements
  },
  tableRow: {
    flexDirection: "row",
    // borderStyle: "solid",
    // borderWidth: 1,
    // borderTop: 0,
  },
  tableCell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderTop: 0,
    borderRight: 0,
    borderColor: "#000",
    paddingLeft: 2, // Reduce padding
    paddingRight: 2, // Reduce padding
    paddingTop: 1.25, // Reduce padding
    paddingBottom: 1.25, // Reduce padding
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
    flex: 1, // Ensure equal width for all cells
    textAlign: "center",
  },
  footerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  footerInfoCell: {
    width: "50%", // Ensure cells are evenly distributed
    height: 50, // Ensure cells are evenly distributed
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
    tollWay: 0,
    others: 0,
  });
  // Set Data
  const [getUserId, setGetUserId] = useState(location.state.user_id);
  const [getYearCode, setGetYearCode] = useState(location.state.year_code);
  const [getMonthCode, setGetMonthCode] = useState(location.state.month_code);

  useEffect(() => {
    console.log(location);
  }, []);

  // Extract parameters from location.state

  useEffect(() => {
    if (getUserId && getUserId && getUserId) {
      const loadDataTraveling = async () => {
        setLoading(true);
        try {
          const [traveling] = await Promise.all([
            useServiceAPI.get(paths.pathGetExpenseTravelingDetail, {
              year_code: getYearCode,
              month_code: getMonthCode,
              user_id: getUserId,
            }),
          ]);

          const dataItems = traveling.data.data_items || [];
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
          console.log(transformedData);
          setTotals(calculatedTotals);
        } catch (error) {
          console.error("Error fetching traveling data:", error.message);
        } finally {
          setLoading(false);
        }
      };

      loadDataTraveling();
    } else {
      setDataItems([]);
    }
  }, [getUserId, getUserId, getUserId]);

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
              <Text style={styles.bold}>Name: Kitti S.</Text>
              <Text>Department: BD</Text>
              <Text style={styles.bold}>Car no.: </Text>
            </View>
          </View>

          {/* Table */}
          <View style={styles.table}>
            {/* Header Row */}
            <View style={[styles.tableRow, styles.bold]}>
              <Text style={[styles.tableCell, { width: "10%" }]}>Date</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>Travelling From</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>To</Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>Petrol</Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>Cash Petrol</Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>Hotel</Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>Allowance</Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>Toll Way</Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>Entertain</Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>Others</Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>Remark</Text>
            </View>

            {/* Data Rows */}
            {dataItems.map((row, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "10%" }]}>{row.date}</Text>
                <Text style={[styles.tableCell, { width: "15%" }]}>{row.from}</Text>
                <Text style={[styles.tableCell, { width: "15%" }]}>{row.to}</Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>{row.petrol}</Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>{row.cashPetrol}</Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>{row.hotel}</Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>{row.allowance}</Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>{row.tollFee}</Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>{row.others}</Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>{row.remark}</Text>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {/* Totals Row */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerCell]}>Total Petrol: {totals.petrol}</Text>
              <Text style={[styles.footerCell]}>Total Cash Petrol: {totals.cashPetrol}</Text>
              <Text style={[styles.footerCell]}>Total Toll Way: {totals.tollWay}</Text>
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
