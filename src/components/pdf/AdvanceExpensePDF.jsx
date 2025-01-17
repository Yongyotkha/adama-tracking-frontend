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
    padding: 20,
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
  headercenter: {
    display: "flex",
    flexDirection: "row", // Align items in a row
    justifyContent: "center", // Space between items
    alignItems: "center", // Align items vertically to the center
    marginTop: 8,
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
  formDetailsCenter: {
    minWidth: 200, // Set minimum width to 200px
    textAlign: "center", // Align text to the right
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
  // tableCell: {
  //   borderStyle: "solid",
  //   borderWidth: 1,
  //   borderColor: "#000",
  //   paddingLeft: 1, // Reduce padding
  //   paddingRight: 1, // Reduce padding
  //   flexGrow: 1,
  // },
  tableCell: {
    borderBottomWidth: 1, 
    borderColor: "#000", 
    borderStyle: "solid", 
    paddingLeft: 1, 
    paddingRight: 1, 
    paddingTop: 2, 
    paddingBottom: 2, 
    flexGrow: 1, 
  },
  tableCellTd: {
    borderColor: "#000", // กำหนดสีของเส้นขอบ
    borderStyle: "solid", // กำหนดรูปแบบของเส้นขอบ
    paddingLeft: 1, // Reduce padding
    paddingRight: 1, 
    paddingBottom: 4,
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
    borderTopWidth: 1,
    borderStyle: "solid",
    borderColor: "#000",
    padding: 2,
    paddingLeft: 2,
    flex: 1, 
    textAlign: "left",
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
  footerTableInfoCell: {
    width: "25%", // Ensure cells are evenly distributed
    height: 60, // Ensure cells are evenly distributed
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 2,
    margin: 2,
    textAlign: "left",
  },
  marginBottom: {
    marginBottom: 4
  },

});


const AdvanceExpensePDF = ({ title }) => {
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
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Image style={styles.logo} src="/favicon.png" />
            <View style={styles.companyDetails}>
              <Text>ADAMA (Thailand) Limited</Text>
              <Text>127/33 Panjathani Tower Building 28th floor,</Text>
              <Text>Nonsi Rd., Chongnonsi, Yannawa, Bangkok 10120 Thailand</Text>
              <Text>Tel: +662 681 1979 Fax: +662 681 1977</Text>
            </View>
          </View>

            <View style={styles.headercenter}>
            <Text style={[styles.bold, { fontSize: 13 }]}>Advance Expense</Text>
            </View>

          <View style={styles.header}> 
            <View style={styles.companyDetails}>
              <Text>Advance Expense No: AE2025010073</Text>
              <Text>Activity Type: Smaill Farmer Meeting</Text>
              <Text>Shop: SP สาขาเขาปั๊ป</Text>
              <Text>Product: Product</Text>
            </View>
            <View style={[styles.formDetails,{ marginBottom: 10 }]}>
              <Text>Sale: Chainarong Jitsawaeng</Text>
              <Text>Date: 11/01/2025 </Text>
              <Text> </Text>
            </View>
          </View>


          {/* Table */}
          <View style={styles.table}>
            {/* Header Row */}
            <View style={[styles.tableRow, styles.bold]}>
              <Text style={[styles.tableCell, { width: "10%" }]}>Product Name</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>Pack Size</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>Estimate Sale (KG,IT)</Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>Acutal Sale (KG,IT)</Text>
            </View>

            {/* Data Rows */}
            {data.map((row, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCellTd, { width: "10%" }]}>{row.date}</Text>
                <Text style={[styles.tableCellTd, { width: "15%" }]}>{row.from}</Text>
                <Text style={[styles.tableCellTd, { width: "15%" }]}>{row.to}</Text>
                <Text style={[styles.tableCellTd, { width: "10%" }]}>{row.petrol}</Text>
              </View>
            ))}
            <View style={styles.footerRow}>
              <Text style={[styles.footerCell]}>Total (THB): {totals.petrol}</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {/* Totals Row */}
            {/* <View style={styles.footerRow}>
              <Text style={[styles.footerCell]}>Total (THB): {totals.petrol}</Text>
            </View> */}

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
              <View style={styles.footerTableInfoCell}>
                <Text>Approved By</Text>
                <Text>Approved By</Text>
              </View>
              <View style={styles.footerTableInfoCell}>
                <Text>Received By</Text>
                <Text>Approved By</Text>
              </View>
              <View style={styles.footerTableInfoCell}>
                <Text>Received By</Text>
                <Text>Approved By</Text>
              </View>              
              <View style={styles.footerTableInfoCell}>
                <Text>Received By</Text>
                <Text>Approved By</Text>
              </View>
            </View>
            
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default AdvanceExpensePDF;
