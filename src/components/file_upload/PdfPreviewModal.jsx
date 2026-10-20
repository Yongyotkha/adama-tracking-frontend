import { Modal } from "antd";

export default function PdfPreviewModal({ open, url, title, onClose }) {
  return (
    <Modal
      open={open}
      title={title || "PDF"}
      onCancel={onClose}
      centered
      destroyOnClose
      width={960}
      footer={
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#00783F]">
            เปิดในแท็บใหม่
          </a>
        ) : null
      }
      styles={{ body: { padding: 12 } }}
    >
      {url ? (
        <iframe
          title={title || "PDF preview"}
          src={url}
          style={{ width: "100%", height: "75vh", border: 0, background: "#f5f5f5" }}
        />
      ) : null}
    </Modal>
  );
}
