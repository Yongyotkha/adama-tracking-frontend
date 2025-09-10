import React, { useEffect, useState } from "react";
import { Form, Input, DatePicker, Select, notification } from "antd";
import dayjs from "dayjs";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../../components/table/TableComponent";
import ActionButton from "../../../../components/button/ActionButton";

import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";

const SEND_BY_OPTIONS = [
  { value: "mail", label: "Mail/Ship" },
  { value: "staff", label: "Staff" },
];

export default function TransportationDetail() {
  const { mode } = useParams(); // 'view' | 'prepare'
  const isView = String(mode || "view").toLowerCase() === "view";
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [formTop] = Form.useForm(); // Top form (read-only)
  const [formBottom] = Form.useForm(); // Bottom form (editable for prepare)

  const columns = [
    { title: "Reward Code", dataIndex: "reward_code", align: "left" },
    { title: "Reward Name", dataIndex: "reward_name", align: "left" },
    { title: "Cost (THB)", dataIndex: "reward_cost", align: "right", width: 120 },
    { title: "QTY (Pcs)", dataIndex: "reward_value", align: "right", width: 100 },
  ];

  const fillForm = (data) => {
    formTop.setFieldsValue({
      sub_dealer_name: data.sub_dealer_name || "-",
      shop_name: data.shop_name || "-",
      contact_number: data.contact_number || "-",
      send_date: data.send_at ? dayjs(data.send_at).format("YYYY-MM-DD") : "-",
      status_name: data.status_tran_namsse || "-",
      remark: data.remark_tran || "-",
    });

    formBottom.setFieldsValue({
      send_by: data.send_by || "mail",
      send_date: data.send_date ? dayjs(data.send_date) : null,
      remark: data.remark || "",
    });
  };

  const fetchDetail = async () => {
    setLoading(true);
    const id = location?.state?.id;

    try {
      const res = await useServiceAPI.get(`${paths.pathTransportDetail}/${id}`);
      if (res.status === 200) {
        const data = res.data || {};
        setDetail(data);
        fillForm(data);
      }
    } catch (error) {
      console.error("Failed to fetch transportation detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await formBottom.validateFields();
      const payload = {
        id: detail.id,
        send_by: values.send_by,
        send_date: values.send_date ? dayjs(values.send_date).format("YYYY-MM-DD") : null,
        remark: values.remark || "",
      };

      const res = await useServiceAPI.post(paths.pathTransportSend, payload);
      if (res.status === 200) {
        notification.success({
          message: "Success",
          description: "Transportation details have been successfully sent.",
        });
        navigate(-1); // Navigate back to the list
      }
    } catch (error) {
      console.error("Failed to save transportation detail:", error);
      notification.error({
        message: "Error",
        description: "Failed to send transportation details.",
      });
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Transportation Detail</div>

      {/* Top Form */}
      <BoxPrimary>
        <Form form={formTop} layout="vertical" disabled>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Form.Item label="Sub Dealer Name" name="sub_dealer_name">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Shop Name" name="shop_name">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Contact Number" name="contact_number">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Send Date" name="send_date">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Status" name="status_name">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Remark" name="remark">
              <Input disabled />
            </Form.Item>
          </div>
        </Form>
      </BoxPrimary>

      {/* Reward Table */}
      <BoxPrimary>
        <TableComponent
          header={columns}
          dataSource={detail ? [detail] : []}
          pagination={false}
        />
      </BoxPrimary>

      {/* Bottom Form */}
      <BoxPrimary>
        <Form form={formBottom} layout="vertical" disabled={isView}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Form.Item
              label="Send By"
              name="send_by"
              rules={[{ required: true, message: "Please select send by" }]}
            >
              <Select
                options={SEND_BY_OPTIONS}
                placeholder="Select"
                allowClear={false}
                disabled={isView}
              />
            </Form.Item>

            <Form.Item
              label="Send Date"
              name="send_date"
              rules={[{ required: true, message: "Please select send date" }]}
            >
              <DatePicker className="w-full" disabled={isView} />
            </Form.Item>

            <Form.Item label="Remark" name="remark">
              <Input placeholder="Enter" disabled={isView} />
            </Form.Item>
          </div>
        </Form>
      </BoxPrimary>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        {!isView && (
          <ActionButton mode="save" text="Save" onClick={handleSave} />
        )}
      </div>
    </MainLayout>
  );
}