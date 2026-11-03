// src/components/export/ExportActivityTypeExcelButton.jsx
import { useContext, useState } from "react";
import PropTypes from "prop-types";
import { saveAs } from "file-saver";
import DynamicButton from "../../components/button/DynamicButton";
import { axiosInstance } from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";

export default function ExportActivityTypeExcelButton({
  params = {},
  fileName = "Activity_Report_By_Type",
  buttonProps,
  text = "Export Excel",
  iconSrc = "/img/icons/excel.png",
  className,
}) {
  const [loading, setLoading] = useState(false);
  const { showNotification } = useContext(AuthContext);

  const safeFileName = (v) =>
    (typeof v === "string" && v.trim() ? v.trim() : "Activity_Report_By_Type")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "_");

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axiosInstance.get(paths.pathReportActivityTypeExport, {
        params: { ...params, platform: "web" },
        responseType: "blob",
      });
      saveAs(response.data, `${safeFileName(fileName)}.xlsx`);
    } catch (err) {
      console.error(err);
      showNotification?.("error", err.message || "Export ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const baseClass = "text-white px-4 py-3 rounded-[4px] bg-[#009845]";
  const combinedClass = [baseClass, buttonProps?.className, className]
    .filter(Boolean)
    .join(" ");

  return (
    <DynamicButton
      type="button"
      onClick={handleExport}
      text={loading ? "Exporting..." : text}
      iconSrc={iconSrc}
      className={combinedClass}
      disabled={loading}
    />
  );
}

ExportActivityTypeExcelButton.propTypes = {
  params: PropTypes.object,
  fileName: PropTypes.string,
  buttonProps: PropTypes.shape({
    className: PropTypes.string,
  }),
  text: PropTypes.string,
  iconSrc: PropTypes.string,
  className: PropTypes.string,
};
