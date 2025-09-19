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
import formatNumber from "../../utils/number";

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
    // paddingTop: 5,
    // paddingRight: 5,
    // paddingBottom: 5,
    // paddingLeft: 5,
    padding: 16,
    fontSize: 8,
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
    marginBottom: 4,
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
    alignItems: "flex-start",
    justifyContent: 'space-between'
  },
  footerColTotalsRow: {
    flexDirection: "column",
    gap: 4,
  },
  footerTotalsRow: {
    flexDirection: "row",
    gap: 4,
  },
  footerRemarkRow: {
    flexDirection: "column",
    gap: 4,
  },
  footerRemarkCell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 5,
    marginLeft: 2,
    marginRight: 2,
    textAlign: "left",
    width: 200,
    height: 91,
  },
  footerCell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 3.5,
    marginLeft: 2,
    marginRight: 2,
    textAlign: "left",
    width: 200,
  },
  footerInfoRow: {
    flexDirection: "row",
  },
  footerInfo: {
    flexDirection: "row",
    justifyContent: 'center',
  },
  footerInfoCell: {
    width: 200,
    height: 43,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 4,
    marginLeft: 2,
    marginRight: 2,
    marginBottom: 4,
    textAlign: "left",
  },
});

const TravelingPDF = ({ title }) => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const [data, setData] = useState([]);
  const [dataItems, setDataItems] = useState([]);

  const columns = [
    { title: "Date", dataIndex: "date", width: "10%" },
    { title: "Traveling From", dataIndex: "from", width: "15%" },
    { title: "To", dataIndex: "to", width: "15%" },
    { title: "Petrol", dataIndex: "petrol", width: "10%" },
    { title: "Cash Petrol", dataIndex: "cashPetrol", width: "10%" },
    { title: "Hotel", dataIndex: "hotel", width: "10%" },
    { title: "Allowance", dataIndex: "allowance", width: "10%" },
    { title: "Toll Fee", dataIndex: "tollFee", width: "10%" },
    { title: "Entertain", dataIndex: "entertain", width: "10%" },
    { title: "Others", dataIndex: "others", width: "10%" },
    // { title: "Total", dataIndex: "total", width: "10%" },
    { title: "Remark", dataIndex: "remark", width: "20%" },
  ];

  const columnsTotal = [
    { title: "Total Petrol", dataIndex: "total_petrol", width: "10%" },
    { title: "Total Cash Petrol", dataIndex: "total_cashPetrol", width: "10%" },
    { title: "Total Hotel", dataIndex: "total_hotel", width: "10%" },
    { title: "Total Allowance", dataIndex: "total_allowance", width: "10%" },
    { title: "Total Toll Way", dataIndex: "total_tollFee", width: "10%" },
    { title: "Total Entertain", dataIndex: "total_entertain", width: "10%" },
    { title: "Total Others", dataIndex: "total_others", width: "10%" },
    { title: "Remark", dataIndex: "remark", width: "20%" },
  ];

  // แทนที่ของเดิม
  const cleanNumber = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return isFinite(value) ? value : 0;

    const s = String(value).trim();
    if (s === "" || s === "-" || s === ".00" || s === "0.00") return 0;

    const n = parseFloat(s.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const totalValues = dataItems.reduce(
    (totals, item) => {
      totals.total_petrol += cleanNumber(item.petrol);
      totals.total_cashPetrol += cleanNumber(item.cashPetrol);
      totals.total_hotel += cleanNumber(item.hotel);
      totals.total_allowance += cleanNumber(item.allowance);
      totals.total_tollFee += cleanNumber(item.tollFee);
      totals.total_entertain += cleanNumber(item.entertain);
      totals.total_others += cleanNumber(item.others);
      return totals;
    },
    {
      total_petrol: 0,
      total_cashPetrol: 0,
      total_hotel: 0,
      total_allowance: 0,
      total_tollFee: 0,
      total_entertain: 0,
      total_others: 0,
    }
  );

  const formatValue = (value) => {
    if (value === ".00") return '-'; // Replace .00 with 0
    if (!isNaN(value)) return parseFloat(value); // Otherwise, return as float
    return value; // If it's neither, return the value as is
  };

  // const [getUserId, setGetUserId] = useState(location.state.user_id);
  // const [getYearCode, setGetYearCode] = useState(location.state.year_code);
  // const [getMonthCode, setGetMonthCode] = useState(location.state.month_code);

  const queryParams = new URLSearchParams(location.search);

  const getYearCode = queryParams.get("year_code");
  const getMonthCode = queryParams.get("month_code");
  const getUserId = queryParams.get("user_id");
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
          // console.log(response.data);

          const dataItems = response.data.data_items || [];

          const transformedData = dataItems.map((item, index) => {
            return {
              key: `${index + 1}`,
              date: item.date || "-",
              from: item.traveling_from || "-",
              to: item.traveling_to || "-",
              mileage: item.mileage || "",
              petrol: (formatValue(item.petrol)) || " ",
              cashPetrol: (formatValue(item.cash_petrol)) || " ",
              hotel: (formatValue(item.hotel)) || " ",
              allowance: (formatValue(item.allowance)) || " ",
              tollFee: (formatValue(item.toll_fee)) || " ",
              entertain: (formatValue(item.entertain)) || " ",
              others: (formatValue(item.others)) || " ",
              total: (formatValue(item.total)) || " ",
              remark: item.remark || "-",
            };
          });
          // console.log(transformedData);
          setDataItems(transformedData);
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
              <Text>Department: {data.department_name || "-"}</Text>
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
                    {row[col.dataIndex] || " "}
                  </Text>
                ))}
              </View>
            ))}

            {/* Total Row (Footer at Bottom of Table) */}


            {/* Total Row (Footer at Bottom of Table) */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '40%', textAlign: 'center' }]}>
                Total(THB)
              </Text>
              {columnsTotal.map((col, colIndex) => (
                <Text key={colIndex} style={[styles.tableCell, { width: col.width }]}>
                  {formatNumber(totalValues[col.dataIndex]) || "-"}
                </Text>
              ))}
            </View>

          </View>


          {/* Footer */}
          <View style={styles.footer}>
            {/* Totals Row */}
            <View style={styles.footerRow}>
              {/* <View style={styles.footerRemarkRow}>
                <Text style={[styles.footerRemarkCell]}>Remark: {data.remark}</Text>
              </View> */}
              <View style={styles.footerColTotalsRow}>
                <View style={styles.footerTotalsRow}>
                  <Text style={[styles.footerCell]}>
                    Total Advanced: {formatNumber(parseFloat(data.total_advanced) === 0 ? "-" : data.total_advanced)}
                  </Text>
                  <Text style={[styles.footerCell]}>
                    Total Expenses: {formatNumber(parseFloat(data.total_expenses) === 0 ? "-" : data.total_expenses)}
                  </Text>
                </View>
                <View style={styles.footerTotalsRow}>
                  <Text style={[styles.footerCell]}>
                    Return to Company: {formatNumber(parseFloat(data.total_return_to_company) === 0 ? "-" : data.total_return_to_company)}
                  </Text>
                  <Text style={[styles.footerCell]}>
                    Return to Staff: {formatNumber(parseFloat(data.total_to_staff) === 0 ? "-" : data.total_to_staff)}
                  </Text>
                </View>
              </View>

              {/* Approval Section */}
              <View style={styles.footerInfoRow}>
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
            </View>

          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default TravelingPDF;
