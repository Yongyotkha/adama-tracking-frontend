import React from "react";
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

// Register the BrownLLHeb font family
Font.register({
  family: "BrownLLHeb",
  fonts: [
    { src: "/font/BrownLLHeb/BrownLLHebTT-Regular.ttf" },
    { src: "/font/BrownLLHeb/BrownLLHebTT-Bold.ttf", fontWeight: "bold" },
    { src: "/font/BrownLLHeb/BrownLLHebTT-Italic.ttf", fontStyle: "italic" },
    { src: "/font/BrownLLHeb/BrownLLHebTT-BoldItalic.ttf", fontWeight: "bold", fontStyle: "italic" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 5,
    fontSize: 8,
    fontFamily: "BrownLLHeb", // Use the registered font
  },
  header: {
    display: "flex",
    flexDirection: "row", // Align items in a row
    justifyContent: "space-between", // Space between items
    alignItems: "center", // Align items vertically to the center
    marginBottom: 8, // Add spacing below the header
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
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 5, // Reduce margin between elements
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    paddingLeft: 1, // Reduce padding
    paddingRight: 1, // Reduce padding
    flexGrow: 1,
  },
  footer: {
    marginTop: 2,
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
    height: 60, // Ensure cells are evenly distributed
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 2,
    margin: 2,
    textAlign: "left",
  },
});


const TravelingPDF = ({ title }) => {
  const data = Array.from({ length: 31 }, (_, index) => {
    const date = `${index + 1}-Apr-2024`;
    const from = "Chanthaburi";
    const to = "Chanthaburi";
    const petrol = Math.floor(Math.random() * 2000) + 500; // Random petrol cost between 500 and 2500
    const cashPetrol = Math.floor(Math.random() * 500) + 100; // Random cash petrol between 100 and 600
    const hotel = Math.random() > 0.5 ? Math.floor(Math.random() * 2000) + 500 : "-";
    const allowance = Math.random() > 0.5 ? Math.floor(Math.random() * 500) + 100 : "-";
    const tollWay = Math.random() > 0.5 ? Math.floor(Math.random() * 300) + 50 : "-";
    const entertain = Math.random() > 0.5 ? Math.floor(Math.random() * 1000) + 100 : "-";
    const others = Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 1 : "-";
    const remarks = Math.random() > 0.7 ? "ค่าซื้อเอกสาร" : "";

    return { date, from, to, petrol, cashPetrol, hotel, allowance, tollWay, entertain, others, remarks };
  });

  const totals = {
    petrol: data.reduce((sum, row) => (row.petrol !== "-" ? sum + Number(row.petrol) : sum), 0),
    cashPetrol: data.reduce((sum, row) => (row.cashPetrol !== "-" ? sum + Number(row.cashPetrol) : sum), 0),
    tollWay: data.reduce((sum, row) => (row.tollWay !== "-" ? sum + Number(row.tollWay) : sum), 0),
    others: data.reduce((sum, row) => (row.others !== "-" ? sum + Number(row.others) : sum), 0),
  };


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
            {data.map((row, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "10%" }]}>{row.date}</Text>
                <Text style={[styles.tableCell, { width: "15%" }]}>{row.from}</Text>
                <Text style={[styles.tableCell, { width: "15%" }]}>{row.to}</Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>{row.petrol}</Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>{row.cashPetrol}</Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>{row.hotel || "-"}</Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>{row.allowance || "-"}</Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>{row.tollWay || "-"}</Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>{row.entertain || "-"}</Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>{row.others || "-"}</Text>
                <Text style={[styles.tableCell, { width: "20%" }]}>{row.remarks || "-"}</Text>
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
