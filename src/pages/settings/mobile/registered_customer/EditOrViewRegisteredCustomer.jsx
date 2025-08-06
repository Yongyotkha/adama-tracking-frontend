import React, { useState, useEffect, useContext } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import { Form, Tabs } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ActionButton from "../../../../components/button/ActionButton";
import FormUser from "../../../../components/form_user/FormUser";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import { AuthContext } from "../../../../contexts/AuthContext";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import TableComponent from "../../../../components/table/TableComponent";

const { TabPane } = Tabs;

export default function EditOrViewRegisteredCustomer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useParams();
  const isViewMode = mode === "view";
  const id = location?.state?.id;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { showNotification } = useContext(AuthContext);
  const [profileImage, setProfileImage] = useState("/img/profile.jpg");
  const [fields, setFields] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await useServiceAPI.get(paths.pathCustomerRegisDetail, { id });
      if (res.status === 200 && res.data) {
        const d = res.data;
        const profile = d.photo_path || "/img/profile.jpg";
        setProfileImage(profile);

        setFields([
          { label: "", name: "profile", type: "picture", col: 24, value: profile },
          { name: "customer_id", label: "Customer ID", type: "text", col: 6, disabled: true, value: d.user_code },
          { name: "shop_name", label: "Shop Name", type: "text", col: 6, disabled: true, value: d.shop_name },
          {
            name: "customer_name",
            label: "Customer Name",
            type: "text",
            col: 6,
            disabled: true,
            value: `${d.contact_first_name || ""} ${d.contact_last_name || ""}`,
          },
          {
            name: "contact_number",
            label: "Contact Number",
            type: "text",
            col: 6,
            disabled: true,
            value: d.phone_number,
          },
          {
            name: "dob",
            label: "Date of birth",
            type: "date",
            col: 6,
            disabled: true,
            value: d.contact_birth_date_year
              ? `${d.contact_birth_date_year}-${d.contact_birth_date_month}-${d.contact_birth_date_day}`
              : null,
          },
          {
            name: "line_id",
            label: "Line ID",
            type: "text",
            col: 6,
            disabled: true,
            value: d.line_id || "-",
          },
          {
            name: "address",
            label: "Address",
            type: "text",
            col: 12,
            disabled: true,
            value: "-",
          },
          {
            name: "register_date",
            label: "Subscribed",
            type: "date",
            col: 6,
            disabled: true,
            value: d.line_join_last_datetime,
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            col: 6,
            value: d.status_code === "1" ? "active" : "inactive",
            options: [
              { id: "active", name: "Active" },
              { id: "inactive", name: "Inactive" },
            ],
            disabled: isViewMode,
          },
        ]);
      }
    } catch (err) {
      showNotification("error", "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderHistory = async () => {
    if (!id) return;
    setOrderLoading(true);
    try {
      const res = await useServiceAPI.get(paths.pathCustomerRegisOrderList, {
        keyword: "",
        use_flag: "1",
        user_id: "",
        dealer_id: '',
        trasaction_status_code: "",
        payment_status_code: "",
        page: "all",
        page_size: 10,
        page_length: 1,
      });

      if (res.status === 200 && res.data?.data?.length > 0) {
        const orders = res.data.data.map((order, idx) => ({
          key: idx + 1,
          order_no: order.document_number,
          date: order.document_date,
          dealer: order.dealer_name,
          amount: order.net_amount_display,
          status: (
            <BadgeStatus
              text={order.status_transaction_name}
              bgColor={order.status_transaction_bg_color}
              textColor={order.status_transaction_color}
            />
          ),
        }));
        setOrderData(orders);
      }
    } catch (err) {
      showNotification("error", "ไม่สามารถโหลดประวัติคำสั่งซื้อได้");
    } finally {
      setOrderLoading(false);
    }
  };


  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        id,
        status_code: values.status === "active" ? 1 : 0,
      };
      const res = await useServiceAPI.put(paths.pathCustomerRegisUpdate, payload);
      if (res.status === 200) {
        showNotification("success", res.data?.message || "บันทึกสำเร็จ");
        navigate(-1); // กลับไปหน้าก่อนหน้า
      }
    } catch (err) {
      showNotification("error", err?.response?.data?.message || "ไม่สามารถอัปเดตได้");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (id) {
      fetchDetail();
      fetchOrderHistory();
    }
  }, [id]);

  const orderColumns = [
    { title: "Order No", dataIndex: "order_no" },
    { title: "Order Date", dataIndex: "date" },
    { title: "Dealer", dataIndex: "dealer" },
    { title: "Amount", dataIndex: "amount" },
    { title: "Status", dataIndex: "status" },
  ];

  const transactionColumns = [
    { title: "Reward Code", dataIndex: "reward_code" },
    { title: "Category", dataIndex: "category" },
    { title: "Reward Name", dataIndex: "reward_name" },
    { title: "QTY (Pcs)", dataIndex: "qty" },
    { title: "Cost (THB)", dataIndex: "cost" },
    { title: "Points Redeem", dataIndex: "points" },
    { title: "Send By", dataIndex: "send_by" },
    { title: "Send Date", dataIndex: "send_date" },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => (
        <BadgeStatus text={text} bgColor="#00783F" textColor="#fff" />
      ),
    },
  ];

  const transactionData = [
    {
      key: 1,
      reward_code: "RW000000001",
      category: "อิเล็กทรอนิกส์",
      reward_name: "พัดลม (14 นิ้ว)",
      qty: 1,
      cost: "790",
      points: "2,000",
      send_by: "Mail/Shipping",
      send_date: "2025-05-26",
      status: "Delivered",
    },
  ];


  return (
    <MainLayout loading={loading}>
      <div className="title-page">Detail</div>

      <Tabs defaultActiveKey="1" className="custom-tabs">
        <TabPane tab={<span className="tab-title">Information</span>} key="1">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <FormUser
              profile={profileImage}
              fields={fields}
              form={form}
              onChange={() => { }}
              disableImageUpload={true}
            />
            <div className="flex justify-end gap-2 mt-4">
              <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
              {!isViewMode && (
                <ActionButton
                  mode="save"
                  text="Update"
                  onClick={() => handleSubmit(form.getFieldsValue())}
                />
              )}
            </div>
          </Form>
        </TabPane>



        <TabPane tab={<span className="tab-title">Order History</span>} key="2">
          <TableComponent
            header={orderColumns}
            dataSource={orderData}
            loading={orderLoading}
            pagination={false}
          />
        </TabPane>

        <TabPane tab={<span className="tab-title">Transaction</span>} key="3">
          <TableComponent
            header={transactionColumns}
            dataSource={transactionData}
            pagination={false}
          />
        </TabPane>

      </Tabs>
    </MainLayout>
  );
}
