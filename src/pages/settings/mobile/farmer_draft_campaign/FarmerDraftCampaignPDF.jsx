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
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";
import {
  formatDate,
  formatNumber,
  getDetailPayload,
  mapDraftCampaignDetail,
} from "../draft_campaign/draftCampaignUtils";

Font.register({
  family: "Sarabun",
  fonts: [
    { src: "/font/Sarabun/Sarabun-Regular.ttf" },
    { src: "/font/Sarabun/Sarabun-Bold.ttf", fontWeight: "bold" },
  ],
});

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getPdfUnitPrice = (item) => {
  const unitPrice = toNumber(
    item.farmer || item.unit_convert_order_value || item.master_price || item.bath_unit
  );

  if (unitPrice > 0) return unitPrice;

  const qty = toNumber(item.quantity);
  const netAmount = toNumber(item.net_amount);

  if (qty > 0 && netAmount > 0) {
    return netAmount / qty;
  }

  return 0;
};

const getPdfMasterPoint = (item) => {
  return toNumber(item.point_farmer || item.master_point || item.point);
};

const getPdfRowPoint = (item) => {
  const qty = toNumber(item.quantity);
  const xpoint = toNumber(item.xpoint) || 1;
  const masterPoint = getPdfMasterPoint(item);

  return qty * masterPoint * xpoint;
};

const getPdfSubTotal = (item) => {
  return toNumber(item.quantity) * getPdfUnitPrice(item);
};

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
  infoRight: {
    width: "51%",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  infoLine: {
    fontSize: 9.5,
    marginBottom: 6,
  },
  pointGrid: {
    flexDirection: "row",
    marginTop: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#222",
  },
  pointCell: {
    width: "33.33%",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderColor: "#222",
  },
  pointCellLast: {
    width: "33.34%",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  pointLabel: {
    fontSize: 9.5,
    marginBottom: 4,
  },
  pointValue: {
    fontSize: 11,
    fontWeight: "bold",
  },
  table: {
    borderWidth: 1,
    borderColor: "#222",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#222",
  },
  tableRowNoBorder: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#F5F5F5",
    fontWeight: "bold",
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
  current_value: 0,
  target_value: 0,
  diff_value_form_target: 0,
  value_to_point: 0,
  point_your_get: 0,
  total_point: 0,
  net_amount: 0,
  products: [],
};

export default function FarmerDraftCampaignPDF() {
  const [searchParams] = useSearchParams();
  const documentNumber = searchParams.get("document_number");
  const [data, setData] = useState(emptyDetail);

  useEffect(() => {
    const load = async () => {
      if (!documentNumber) return;

      try {
        const detailRes = await useServiceAPI.get(paths.pathDraftCampaignDetail, {
          document_number: documentNumber,
          mode: "farmer",
        });

        const payload = getDetailPayload(detailRes);

        const pointPayload = payload?.farmer_id
          ? { shop_type: "farmer", id: payload.farmer_id }
          : payload?.sub_dealer_id
            ? { shop_type: "sub_dealer", id: payload.sub_dealer_id }
            : payload?.dealer_id
              ? { shop_type: "dealer", id: payload.dealer_id }
              : null;

        const pointRes = pointPayload
          ? await useServiceAPI.get(paths.pathDraftCampaignUserInfo, {
              ...pointPayload,
              platform: "web",
              mode: "farmer",
            })
          : null;

        const mapped = mapDraftCampaignDetail(
          payload,
          pointRes?.data?.data?.users?.balance_point ?? 0,
          { isFarmer: true }
        );

        const detailItems = Array.isArray(payload?.items) ? payload.items : [];

        const products = detailItems.map((item) => ({
          ...item,
          quantity: toNumber(item.quantity),
          xpoint: toNumber(item.xpoint) || 1,
          unit_convert_order_value:
            item.farmer || item.unit_convert_order_value || item.master_price,
          bath_unit: item.farmer || item.unit_convert_order_value || item.master_price,
          master_price: item.farmer || item.master_price || item.unit_convert_order_value,
          master_point: item.point_farmer || item.master_point || item.point,
        }));

        setData({
          ...mapped,
          products,
          target_point: toNumber(payload?.target_point),
          diff_form_target: toNumber(payload?.diff_form_target),
          current_value: toNumber(
            payload?.value_of_year ?? payload?.current_value
          ),
          target_value: toNumber(payload?.target_value),
          diff_value_form_target: toNumber(payload?.diff_value_form_target),
          value_to_point: toNumber(payload?.value_to_point),
          point_your_get: toNumber(payload?.point_your_get),
        });
      } catch (error) {
        console.error("Load Draft Campaign PDF error:", error);
      }
    };

    load();
  }, [documentNumber]);

  const totalQty = data.products.reduce(
    (acc, item) => acc + toNumber(item.quantity),
    0
  );

  const totalPoints = data.products.reduce(
    (acc, item) => acc + getPdfRowPoint(item),
    0
  );

  const totalAmount = data.products.reduce(
    (acc, item) => acc + getPdfSubTotal(item),
    0
  );

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <PDFViewer width="100%" height="100%">
        <Document title={`Farmer-Draft-Campaign-${data.document_number || "detail"}`}>
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <Image src="/img/logo.png" style={styles.logo} />
              <View style={styles.companyWrap}>
                <Text style={styles.companyNameTh}>
                  บริษัท อดามา (ประเทศไทย) จำกัด
                </Text>
                <Text style={styles.companyNameEn}>ADAMA (Thailand) Co.,Ltd</Text>
                <Text style={styles.companyLine}>
                  สำนักงานใหญ่ 88 อาคารปาโซ่ ทาวเวอร์ ชั้น 18 ถนนสีลม แขวงสุริยวงศ์
                  เขตบางรัก กรุงเทพมหานคร 10500
                </Text>
                <Text style={styles.companyLine}>
                  โทร. 0-2634-3580-9 แฟกซ์. 0-2634-3590 เลขประจำตัวผู้เสียภาษี
                  0105537084224
                </Text>
              </View>
            </View>

            <Text style={styles.title}>Draft Campaign (Farmer)</Text>

            <View style={styles.metaRow}>
              <Text>
                <Text style={styles.metaLabel}>Document No : </Text>
                {data.document_number}
              </Text>
              <Text>
                <Text style={styles.metaLabel}>Draft Date : </Text>
                {formatDate(data.document_date)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Text style={styles.infoLine}>
                  Dealer Name : {data.dealer_name || "-"}
                </Text>
                <Text style={styles.infoLine}>
                  Sub Dealer Name : {data.sub_dealer_name || "-"}
                </Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoLine}>
                  Farmer Name : {data.farmer_name || "-"}
                </Text>
                <Text style={styles.infoLine}>
                  Sales Name : {data.sale_name || "-"}
                </Text>
              </View>
            </View>

            <View style={styles.pointGrid}>
              <View style={styles.pointCell}>
                <Text style={styles.pointLabel}>Current Point</Text>
                <Text style={styles.pointValue}>
                  {formatNumber(data.current_point)}
                </Text>
              </View>
              <View style={styles.pointCell}>
                <Text style={styles.pointLabel}>Target Point</Text>
                <Text style={styles.pointValue}>
                  {formatNumber(data.target_point)}
                </Text>
              </View>
              <View style={styles.pointCellLast}>
                <Text style={styles.pointLabel}>Diff from Target</Text>
                <Text style={styles.pointValue}>
                  {formatNumber(data.diff_form_target)}
                </Text>
              </View>
            </View>

            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.th, { width: "5%" }]}>No.</Text>
                <Text style={[styles.th, { width: "13%" }]}>Item Code</Text>
                <Text style={[styles.th, { width: "24%" }]}>Product Description</Text>
                <Text style={[styles.th, { width: "10%" }]}>Pack Size</Text>
                <Text style={[styles.th, { width: "10%" }]}>THB / Unit</Text>
                <Text style={[styles.th, { width: "10%" }]}>Point / ctn</Text>
                <Text style={[styles.th, { width: "8%" }]}>Qty (ctn)</Text>
                <Text style={[styles.th, { width: "6%" }]}>xPoint</Text>
                <Text style={[styles.th, { width: "8%" }]}>Point</Text>
                <Text style={[styles.th, styles.lastCell, { width: "11%" }]}>Sub Total</Text>
              </View>

              {data.products.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.td, styles.tdCenter, { width: "5%" }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.td, { width: "13%" }]}>
                    {item.product_code || item.code || "-"}
                  </Text>
                  <Text style={[styles.td, { width: "24%" }]}>
                    {item.product_name || item.name || "-"}
                  </Text>
                  <Text style={[styles.td, styles.tdCenter, { width: "10%" }]}>
                    {item.packing_list || item.unit || "-"}
                  </Text>
                  <Text style={[styles.td, styles.tdRight, { width: "10%" }]}>
                    {formatNumber(getPdfUnitPrice(item), 2)}
                  </Text>
                  <Text style={[styles.td, styles.tdRight, { width: "10%" }]}>
                    {formatNumber(getPdfMasterPoint(item))}
                  </Text>
                  <Text style={[styles.td, styles.tdRight, { width: "8%" }]}>
                    {formatNumber(item.quantity)}
                  </Text>
                  <Text style={[styles.td, styles.tdRight, { width: "6%" }]}>
                    {formatNumber(item.xpoint || 1)}
                  </Text>
                  <Text style={[styles.td, styles.tdRight, { width: "8%" }]}>
                    {formatNumber(getPdfRowPoint(item))}
                  </Text>
                  <Text
                    style={[
                      styles.td,
                      styles.tdRight,
                      styles.lastCell,
                      { width: "11%" },
                    ]}
                  >
                    {formatNumber(getPdfSubTotal(item), 2)}
                  </Text>
                </View>
              ))}

              <View style={styles.tableRowNoBorder}>
                <View style={[styles.totalLabelCell, { width: "62%" }]}>
                  <Text style={{ textAlign: "right", fontWeight: "bold" }}>
                    Total:
                  </Text>
                </View>
                <View style={[styles.td, { width: "8%" }]}>
                  <Text style={[styles.tdRight, { fontWeight: "bold" }]}>
                    {formatNumber(totalQty)}
                  </Text>
                </View>
                <View style={[styles.td, { width: "6%" }]}>
                  <Text style={[styles.tdCenter, { fontWeight: "bold" }]}>-</Text>
                </View>
                <View style={[styles.td, { width: "8%" }]}>
                  <Text style={[styles.tdRight, { fontWeight: "bold" }]}>
                    {formatNumber(totalPoints)}
                  </Text>
                </View>
                <View style={[styles.td, styles.lastCell, { width: "11%" }]}>
                  <Text style={[styles.tdRight, { fontWeight: "bold" }]}>
                    {formatNumber(totalAmount, 2)}
                  </Text>
                </View>
              </View>
            </View>
          </Page>
        </Document>
      </PDFViewer>
    </div>
  );
}
