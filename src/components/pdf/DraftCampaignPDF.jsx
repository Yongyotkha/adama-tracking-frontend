import React, { useEffect, useState } from "react";
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
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import {
  formatDate,
  formatNumber,
  getDetailPayload,
  mapDraftCampaignDetail,
} from "../../pages/settings/mobile/draft_campaign/draftCampaignUtils";

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
    fontSize: 8,
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
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderColor: "#222",
    textAlign: "center",
  },
  td: {
    paddingHorizontal: 4,
    paddingVertical: 6,
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

const emptyDetail = {
  document_number: "-",
  document_date: "",
  sale_name: "-",
  dealer_name: "-",
  sub_dealer_name: "-",
  farmer_name: "-",
  current_point: 0,
  target_point: 0,
  diff_form_target: 0,
  total_point: 0,
  net_amount: 0,
  products: [],
};

export default function DraftCampaignPDF() {
  const [searchParams] = useSearchParams();
  const documentNumber = searchParams.get("document_number");
  const [data, setData] = useState(emptyDetail);

  useEffect(() => {
    const load = async () => {
      if (!documentNumber) return;
      try {
        const detailRes = await useServiceAPI.get(paths.pathDraftCampaignDetail, {
          document_number: documentNumber,
        });
        const payload = getDetailPayload(detailRes);
        const pointRes = payload?.sub_dealer_id
          ? await useServiceAPI.get(paths.pathDraftCampaignUserInfo, {
            shop_type: "sub_dealer",
            id: payload.sub_dealer_id,
          })
          : null;

        setData(
          mapDraftCampaignDetail(
            payload,
            pointRes?.data?.data?.users?.balance_point ?? 0
          )
        );
      } catch (_) {
        setData(emptyDetail);
      }
    };

    load();
  }, [documentNumber]);

  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <Document>
        <Page size="A4" orientation="portrait" style={styles.page}>
          <View style={styles.header}>
            <Image src="/favicon.png" style={styles.logo} />
            <View style={styles.companyWrap}>
              <Text style={styles.companyNameTh}>บริษัท อดามา (ประเทศไทย) จำกัด </Text>
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
              <Text style={styles.metaLabel}>Document No :</Text> {data.document_number || "-"}
            </Text>
            <Text>
              <Text style={styles.metaLabel}>Date :</Text> {formatDate(data.document_date, "DD-MM-YYYY")}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <View style={styles.saleLine}>
                <Text>Sale Name :</Text>
                <Text style={styles.saleName}>{data.sale_name}</Text>
              </View>
            </View>
            <View style={styles.infoRight}>
              <View style={styles.labelRow}>
                <Text style={styles.lowerLabel}>Current Point :</Text>
                <Text>{formatNumber(data.current_point)}</Text>
              </View>
              <View style={styles.labelRow}>
                <Text style={styles.lowerLabel}>Target Point :</Text>
                <Text>{formatNumber(data.target_point)}</Text>
              </View>
              <View style={styles.labelRow}>
                <Text style={styles.lowerLabel}>Diff Form Target :</Text>
                <Text>{formatNumber(data.diff_form_target)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.lowerRow}>
            <View style={styles.lowerLeft}>
              <View style={styles.labelRow}>
                <Text style={styles.lowerLabel}>Dealer Name :</Text>
                <Text>{data.dealer_name || "-"}</Text>
              </View>
              <View style={styles.labelRow}>
                <Text style={styles.lowerLabel}>Sub Dealer Name :</Text>
                <Text>{data.sub_dealer_name || "-"}</Text>
              </View>
              <View style={styles.labelRow}>
                <Text style={styles.lowerLabel}>Farmer Name :</Text>
                <Text>{data.farmer_name || "-"}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }} />
          </View>

          <View style={styles.table}>
            <View style={styles.tr}>
              <Text style={[styles.th, { width: "15%" }]}>SKU</Text>
              <Text style={[styles.th, { width: "20%" }]}>Product Name</Text>
              <Text style={[styles.th, { width: "13%" }]}>Unit</Text>
              <Text style={[styles.th, { width: "10%" }]}>THB / Unit</Text>
              <Text style={[styles.th, { width: "10%" }]}>Point / Ctn</Text>
              <Text style={[styles.th, { width: "9%" }]}>QTY (ctn)</Text>
              <Text style={[styles.th, { width: "8%" }]}>X Point</Text>
              <Text style={[styles.th, { width: "8%" }]}>Point</Text>
              <Text style={[styles.th, { width: "11%" }, styles.lastCell]}>Sub Total (THB)</Text>
            </View>

            {data.products.map((item, index) => (
              <View key={`${item.product_id || item.product_code}-${index}`} style={styles.trBorder}>
                <Text style={[styles.td, { width: "15%" }]}>{item.product_code}</Text>
                <Text style={[styles.td, { width: "20%" }]}>{item.product_name}</Text>
                <Text style={[styles.td, { width: "13%" }]}>{item.packing_list}</Text>
                <Text style={[styles.td, { width: "10%" }, styles.tdRight]}>
                  {formatNumber(item.unit_convert_value, 2)}
                </Text>
                <Text style={[styles.td, { width: "10%" }, styles.tdRight]}>
                  {formatNumber(item.master_point)}
                </Text>
                <Text style={[styles.td, { width: "9%" }, styles.tdCenter]}>
                  {formatNumber(item.quantity)}
                </Text>
                <Text style={[styles.td, { width: "8%" }, styles.tdCenter]}>
                  {formatNumber(item.xpoint)}
                </Text>
                <Text style={[styles.td, { width: "8%" }, styles.tdRight]}>
                  {formatNumber(item.point)}
                </Text>
                <Text style={[styles.td, { width: "11%" }, styles.tdRight, styles.lastCell]}>
                  {formatNumber(item.net_amount, 2)}
                </Text>
              </View>
            ))}

            <View style={styles.trBorder}>
              <Text style={[styles.totalLabelCell, { width: "77%" }]}>
                Item : {data.products.length} | QTY (ctn):{" "}
                {formatNumber(
                  data.products.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
                )}
              </Text>

              {/* Point column */}
              <Text style={[styles.td, { width: "16%" }, styles.tdRight]}>
                {formatNumber(data.total_point)}
              </Text>

              {/* Sub Total column */}
              <Text style={[styles.td, { width: "11%" }, styles.tdRight, styles.lastCell]}>
                {formatNumber(data.net_amount, 2)}
              </Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
}
