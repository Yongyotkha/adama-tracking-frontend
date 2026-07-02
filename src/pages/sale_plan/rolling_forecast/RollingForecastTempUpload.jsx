import React, { useContext, useState } from "react";
import { Upload, Checkbox, Alert } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../components/button/ActionButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

const { Dragger } = Upload;

export default function RollingForecastTempUpload() {
  const { showMsg, showNotification } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [clearExisting, setClearExisting] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!selectedFile) {
      showMsg("error", "กรุณาเลือกไฟล์ CSV");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("clear_existing", clearExisting ? "1" : "0");

    try {
      const response = await useServiceAPI.post(
        paths.pathTempMasterRollingUpload,
        formData,
        setLoading
      );

      if (response.status === 200) {
        setResult(response.data || null);
        showNotification(
          "success",
          response.message || "นำเข้าข้อมูลสำเร็จ",
          response.data?.failed_count
            ? [`นำเข้า ${response.data.inserted} แถว`, `ล้มเหลว ${response.data.failed_count} แถว`]
            : [`นำเข้า ${response.data?.inserted ?? 0} แถว`]
        );
        setSelectedFile(null);
      }
    } catch (error) {
      showMsg("error", error.message || "อัปโหลดไม่สำเร็จ");
      setResult(error.data || null);
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Upload Rolling Forecast CSV</div>

      <BoxPrimary>
        <div className="mb-4 text-sm text-[#666]">
          อัปโหลดไฟล์ CSV เพื่อ insert ลงตาราง <strong>temp_master_rolling</strong>
        </div>

        <div className="mb-4 text-xs text-[#888] leading-6">
          รองรับคอลัมน์ตาม export เดิม รวมถึง qty/value ที่ซ้ำกัน (คอลัมน์ที่ 2 จะถูก map เป็น qty2/value2)
        </div>

        <Dragger
          accept=".csv,text/csv"
          multiple={false}
          maxCount={1}
          beforeUpload={(file) => {
            setSelectedFile(file);
            setResult(null);
            return false;
          }}
          onRemove={() => {
            setSelectedFile(null);
            return true;
          }}
          fileList={
            selectedFile
              ? [
                  {
                    uid: "-1",
                    name: selectedFile.name,
                    status: "done",
                  },
                ]
              : []
          }
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">คลิกหรือลากไฟล์ CSV มาวางที่นี่</p>
          <p className="ant-upload-hint">รองรับเฉพาะไฟล์ .csv</p>
        </Dragger>

        <div className="mt-4">
          <Checkbox
            checked={clearExisting}
            onChange={(e) => setClearExisting(e.target.checked)}
          >
            ลบข้อมูลเดิมในตาราง temp_master_rolling ก่อนนำเข้า
          </Checkbox>
        </div>

        <div className="mt-6 flex justify-end">
          <ActionButton
            mode="create"
            text="Upload"
            onClick={handleUpload}
            disabled={!selectedFile || loading}
          />
        </div>

        {result && (
          <div className="mt-6">
            <Alert
              type={result.failed_count > 0 ? "warning" : "success"}
              showIcon
              message={`นำเข้าสำเร็จ ${result.inserted ?? 0} แถว`}
              description={
                result.failed_count > 0
                  ? `มีแถวที่นำเข้าไม่สำเร็จ ${result.failed_count} แถว`
                  : "นำเข้าข้อมูลครบถ้วน"
              }
            />
          </div>
        )}
      </BoxPrimary>
    </MainLayout>
  );
}
