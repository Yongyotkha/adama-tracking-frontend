const IMAGE_EXT = /^(apng|avif|bmp|dpg|gif|heic|heif|ico|jfif|jpe?g|png|svg|webp)$/i;

const extensionOf = (value) => {
  const clean = String(value || "").split(/[#?]/)[0];
  const match = /\.([^./\\]+)$/.exec(clean);
  return match ? match[1] : "";
};

export function isImageAttachment(file = {}) {
  const type = String(file.type || file.originFileObj?.type || "").toLowerCase();
  if (type.startsWith("image/")) return true;
  if (type) return false;

  const candidates = [file.name, file.file_name, file.url, file.thumbUrl, file.preview];
  let sawExtension = false;

  for (const value of candidates) {
    const text = String(value || "");
    if (/^data:image\//.test(text)) return true;
    if (/^data:/.test(text)) return false;

    const ext = extensionOf(text);
    if (!ext) continue;
    sawExtension = true;
    if (IMAGE_EXT.test(ext)) return true;
  }

  return !sawExtension;
}

export function attachmentUrl(file = {}) {
  if (file.url) return file.url;
  if (file.originFileObj) return URL.createObjectURL(file.originFileObj);
  return "";
}

export function isPdfAttachment(file = {}) {
  const type = String(file.type || file.originFileObj?.type || "").toLowerCase();
  if (type === "application/pdf") return true;

  return [file.name, file.file_name, file.url].some((value) => extensionOf(value).toLowerCase() === "pdf");
}

export function openAttachmentInNewTab(url) {
  if (!url) return false;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}
