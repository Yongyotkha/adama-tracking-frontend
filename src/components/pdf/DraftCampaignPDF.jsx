import React, { useMemo } from "react";
import {
  Document,
  Font,
  Image,
  Page,
  PDFViewer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { useSearchParams } from "react-router-dom";
import { draftCampaignFarmerOptions, draftCampaignList, draftCampaignSalesOptions, draftCampaignSubDealerOptions } from "../../pages/settings/mobile/draft_campaign/mockDraftCampaignData";

Font.register({
  family: "Sarabun",
  fonts: [
    { src: "/font/Sarabun/Sarabun-Regular.ttf" },
    { src: "/font/Sarabun/Sarabun-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 26,
    paddingBottom: 32,
    paddingHorizontal: 28,
    fontFamily: "Sarabun",
    fontSize: 10,
    color: "#2E2A28",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 18,
  },
  logo: {
    width: 72,
    height: 72,
  },
  companyWrap: {
    flex: 1,
    gap: 3,
  },
  companyNameTh: {
    fontSize: 10,
    fontWeight: "bold",
  },
  companyNameEn: {
    fontSize: 10,
    fontWeight: "bold",
  },
  companyLine: {
    fontSize: 8.5,
    lineHeight: 1.45,
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 22,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    fontSize: 10,
  },
  metaLabel: {
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#222",
    minHeight: 74,
  },
  infoLeft: {
    width: "49%",
    borderRightWidth: 1,
    borderColor: "#222",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  saleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    fontSize: 11,
  },
  saleName: {
    fontSize: 11,
    fontWeight: "bold",
  },
  infoRight: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    gap: 8,
  },
  lowerRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  lowerLeft: {
    width: "49%",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#222",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  lowerLabel: {
    width: 86,
  },
  table: {
    borderWidth: 1,
    borderColor: "#222",
  },
  tr: {
    flexDirection: "row",
  },
  trBorder: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#222",
  },
  th: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderColor: "#222",
    textAlign: "center",
  },
  td: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderColor: "#222",
  },
  tdCenter: {
    textAlign: "center",
  },
  tdRight: {
    textAlign: "right",
  },
  lastCell: {
    borderRightWidth: 0,
  },
  totalLabelCell: {
    borderRightWidth: 1,
    borderColor: "#222",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
});

const findName = (options, id) =>
  options.find((item) => String(item.id) === String(id))?.name || "-";

const formatNumber = (value, digits = 0) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const formatDate = (value) => {
  if (!value) return "-";
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return value;
  return `${day}-${month}-${year}`;
};

export default function DraftCampaignPDF() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const data = useMemo(() => {
    return (
      draftCampaignList.find((item) => String(item.id) === String(id)) ||
      draftCampaignList[0]
    );
  }, [id]);

  const saleName = findName(draftCampaignSalesOptions, data.sale);
  const subDealerName = findName(draftCampaignSubDealerOptions, data.subDealer);
  const farmerName = findName(draftCampaignFarmerOptions, data.farmer);
  const totalPoint = data.products.reduce((sum, item) => sum + Number(item.point || 0), 0);
  const totalValue = data.products.reduce((sum, item) => sum + Number(item.subTotal || 0), 0);

  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Image src="/favicon.png" style={styles.logo} />
            <View style={styles.companyWrap}>
              <Text style={styles.companyNameTh}>บริษัท อดามา (ประเทศไทย) จำกัด</Text>
              <Text style={styles.companyNameEn}>ADAMA (Thailand) Limited</Text>
              <Text style={styles.companyLine}>
                127/33 อาคารปัญจธานี ทาวเวอร์ ชั้น 28 ถนนนนทรี แขวงช่องนนทรี เขตยานนาวา กรุงเทพฯ 10120
              </Text>
              <Text style={styles.companyLine}>
                127/33 Panjathani Tower Building 28 floor , Nonsi Rd, Chong nonsi , Yannawa Bangkok 10120
              </Text>
              <Text style={styles.companyLine}>Tel. +66 2 681 1979  Fax. +66 2 681 1977</Text>
            </View>
          </View>

          <Text style={styles.title}>Draft Campaign</Text>

          <View style={styles.metaRow}>
            <Text>
              <Text style={styles.metaLabel}>Document No :</Text> {data.documentNo || "-"}
            </Text>
            <Text>
              <Text style={styles.metaLabel}>Date :</Text> {formatDate(data.draftDate)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <View style={styles.saleLine}>
                <Text>Sale Name :</Text>
                <Text style={styles.saleName}>{saleName}</Text>
              </View>
            </View>
            <View style={styles.infoRight}>
              <View style={styles.labelRow}>
                <Text style={styles.lowerLabel}>Current Point :</Text>
                <Text>{formatNumber(data.currentPoint)}</Text>
              </View>
              <View style={styles.labelRow}>
                <Text style={styles.lowerLabel}>Target Point :</Text>
                <Text>{formatNumber(data.targetPoint)}</Text>
              </View>
              <View style={styles.labelRow}>
                <Text style={styles.lowerLabel}>Diff From Target :</Text>
                <Text>{formatNumber(data.diffFromTarget)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.lowerRow}>
            <View style={styles.lowerLeft}>
              <View style={styles.labelRow}>
                <Text style={styles.lowerLabel}>Dealer Name :</Text>
                <Text>{data.dealer || "-"}</Text>
              </View>
              <View style={styles.labelRow}>
                <Text style={styles.lowerLabel}>Sub Dealer Name :</Text>
                <Text>{subDealerName}</Text>
              </View>
              <View style={styles.labelRow}>
                <Text style={styles.lowerLabel}>Farmer Name :</Text>
                <Text>{farmerName}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }} />
          </View>

          <View style={styles.table}>
            <View style={styles.tr}>
              <Text style={[styles.th, { width: "28%" }]}>Product Name</Text>
              <Text style={[styles.th, { width: "18%" }]}>Pack Size</Text>
              <Text style={[styles.th, { width: "16%" }]}>QTY (ctn)</Text>
              <Text style={[styles.th, { width: "12%" }]}>X Point</Text>
              <Text style={[styles.th, { width: "12%" }]}>Point</Text>
              <Text style={[styles.th, { width: "14%" }, styles.lastCell]}>Sub Total (THB)</Text>
            </View>

            {data.products.map((item, index) => (
              <View key={`${item.sku}-${index}`} style={styles.trBorder}>
                <Text style={[styles.td, { width: "28%" }]}>{item.productName}</Text>
                <Text style={[styles.td, { width: "18%" }]}>{item.unit}</Text>
                <Text style={[styles.td, { width: "16%" }, styles.tdCenter]}>
                  {formatNumber(item.qty)}
                </Text>
                <Text style={[styles.td, { width: "12%" }, styles.tdCenter]}>
                  {formatNumber(item.xPoint)}
                </Text>
                <Text style={[styles.td, { width: "12%" }, styles.tdRight]}>
                  {formatNumber(item.point)}
                </Text>
                <Text style={[styles.td, { width: "14%" }, styles.tdRight, styles.lastCell]}>
                  {formatNumber(item.subTotal, 2)}
                </Text>
              </View>
            ))}

            <View style={styles.trBorder}>
              <Text style={[styles.totalLabelCell, { width: "58%" }]}>Total (THB)</Text>
              <Text style={[styles.td, { width: "16%" }]} />
              <Text style={[styles.td, { width: "12%" }, styles.tdRight]}>
                {formatNumber(totalPoint)}
              </Text>
              <Text style={[styles.td, { width: "14%" }, styles.tdRight, styles.lastCell]}>
                {formatNumber(totalValue, 2)}
              </Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
}
