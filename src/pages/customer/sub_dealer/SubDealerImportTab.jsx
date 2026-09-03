import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Modal, Select, Tag } from "antd";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import ActionButton from "../../../components/button/ActionButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

const TEMP_STATUS = {
  pending: { color: "gold", label: "รอการนำเข้า" },
  inserted: { color: "green", label: "นำเข้าข้อมูลแล้ว" },
  exists: { color: "red", label: "สมาชิกมีในระบบแล้ว" },
  failed: { color: "red", label: "นำเข้าจริงไม่สำเร็จ" },
};

const displayValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return value;
};

const isTruthyFlag = (value) => value === true || value === 1 || value === "1";

export default function SubDealerImportTab({
  subDealerId,
  isViewMode,
  onMapped,
  onBack,
}) {
  const { showNotification } = useContext(AuthContext);
  const [groupLoading, setGroupLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [importGroups, setImportGroups] = useState([]);
  const [selectedUploadId, setSelectedUploadId] = useState(undefined);
  const [dataSource, setDataSource] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const fetchImportGroups = useCallback(async () => {
    setGroupLoading(true);

    try {
      const response = await useServiceAPI.get(
        paths.pathCustomerFarmersImportUploadList,
        {
          page_length: 100,
          page_size: 1,
        }
      );

      const list = Array.isArray(response?.data) ? response.data : [];
      setImportGroups(
        list.map((item) => ({
          value: Number(item.upload_id),
          label: item.file_name
            ? `${item.file_name} (Upload #${item.upload_id})`
            : `Upload #${item.upload_id}`,
          status_code: item.status_code,
        }))
      );
    } catch (error) {
      setImportGroups([]);
      showNotification("error", error.message || "โหลดรายการ Import ไม่สำเร็จ");
    } finally {
      setGroupLoading(false);
    }
  }, [showNotification]);

  const fetchImportFarmers = useCallback(
    async (uploadId) => {
      if (!uploadId) {
        setDataSource([]);
        setSelectedRowKeys([]);
        return;
      }

      setTableLoading(true);

      try {
        const response = await useServiceAPI.get(paths.pathCustomerFarmersImportList, {
          page_length: 100,
          page_size: 1,
          upload_id: uploadId,
          sub_dealer_id: subDealerId,
        });

        const list = Array.isArray(response?.data) ? response.data : [];
        setDataSource(
          list.map((item, index) => ({
            key: Number(item.id),
            id: Number(item.id),
            no: index + 1,
            name: displayValue(item.name),
            mobile_phone: displayValue(item.mobile_phone),
            email: displayValue(item.email),
            farmer_id: item.farmer_id || "-",
            status_code: item.status_code,
            status_message: item.status_message,
            can_map: isTruthyFlag(item.can_map),
            is_mapped: isTruthyFlag(item.is_mapped),
          }))
        );
        setSelectedRowKeys([]);
      } catch (error) {
        setDataSource([]);
        showNotification("error", error.message || "โหลดรายชื่อ Farmer ไม่สำเร็จ");
      } finally {
        setTableLoading(false);
      }
    },
    [showNotification, subDealerId]
  );

  useEffect(() => {
    fetchImportGroups();
  }, [fetchImportGroups]);

  useEffect(() => {
    fetchImportFarmers(selectedUploadId);
  }, [fetchImportFarmers, selectedUploadId]);

  const mappableKeys = useMemo(
    () => dataSource.filter((row) => row.can_map).map((row) => row.key),
    [dataSource]
  );

  const selectedMappableKeys = useMemo(
    () => selectedRowKeys.filter((key) => mappableKeys.includes(key)),
    [mappableKeys, selectedRowKeys]
  );

  const handleMap = (mapAll = false) => {
    if (!selectedUploadId) {
      showNotification("error", "กรุณาเลือกกลุ่ม Import");
      return;
    }

    if (!mapAll && selectedMappableKeys.length === 0) {
      showNotification("error", "กรุณาเลือกรายการที่ต้องการ mapping");
      return;
    }

    const count = mapAll ? mappableKeys.length : selectedMappableKeys.length;

    if (count === 0) {
      showNotification("error", "ไม่มีรายการที่สามารถ mapping ได้");
      return;
    }

    Modal.confirm({
      title: "Mapping Farmer กับ Sub Dealer",
      content: mapAll
        ? `ผูก farmer ทั้งกลุ่ม ${count} ราย กับ sub dealer นี้ ?`
        : `ผูก farmer ที่เลือก ${count} ราย กับ sub dealer นี้ ?`,
      okText: "Mapping",
      cancelText: "ปิด",
      onOk: async () => {
        try {
          const response = await useServiceAPI.post(
            paths.pathCustomerFarmersImportMap,
            {
              upload_id: Number(selectedUploadId),
              sub_dealer_id: Number(subDealerId),
              ...(mapAll
                ? { map_all: true }
                : { ids: selectedMappableKeys }),
            },
            setMapLoading
          );

          if (response?.status === 200) {
            showNotification("success", response.message || "Mapping สำเร็จ", [
              `Mapping ${response.data?.mapped ?? 0} แถว`,
              `ข้าม ${response.data?.skipped ?? 0} แถว`,
              `ล้มเหลว ${response.data?.failed ?? 0} แถว`,
            ]);
            await fetchImportFarmers(selectedUploadId);
            if (typeof onMapped === "function") {
              onMapped();
            }
          }
        } catch (error) {
          showNotification(
            "error",
            error?.response?.data?.message || error.message || "Mapping ไม่สำเร็จ"
          );
        }
      },
    });
  };

  const rowSelection = useMemo(
    () =>
      isViewMode
        ? undefined
        : {
            selectedRowKeys,
            preserveSelectedRowKeys: true,
            onChange: (keys) => {
              setSelectedRowKeys(
                keys.map(Number).filter((key) => mappableKeys.includes(key))
              );
            },
            getCheckboxProps: (record) => ({
              disabled: !record.can_map,
            }),
          },
    [isViewMode, mappableKeys, selectedRowKeys]
  );

  const header = [
    { title: "No", dataIndex: "no", width: 70, align: "center" },
    { title: "Name", dataIndex: "name", width: 220 },
    { title: "Mobile Phone", dataIndex: "mobile_phone", width: 150, align: "center" },
    { title: "Email", dataIndex: "email", width: 220 },
    { title: "Farmer ID", dataIndex: "farmer_id", width: 110, align: "center" },
    {
      title: "สถานะนำเข้า",
      dataIndex: "status_code",
      width: 180,
      align: "center",
      render: (value, row) => {
        const status = TEMP_STATUS[value] || {
          color: "default",
          label: row.status_message || value || "-",
        };
        return <Tag color={status.color}>{row.status_message || status.label}</Tag>;
      },
    },
    {
      title: "Mapping",
      dataIndex: "is_mapped",
      width: 160,
      align: "center",
      render: (_value, row) => {
        if (row.is_mapped) {
          return <Tag color="blue">Mapping แล้ว</Tag>;
        }

        if (!row.can_map) {
          return <Tag>ยังไม่พร้อม mapping</Tag>;
        }

        return <Tag color="gold">รอ Mapping</Tag>;
      },
    },
  ];

  return (
    <>
      <BoxPrimary>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div className="w-full md:max-w-xl">
              <div className="mb-1 text-sm text-[#333]">กลุ่ม Import</div>
              <Select
                className="w-full"
                placeholder="เลือกไฟล์ เช่น dummy_customers_10_more.csv"
                allowClear
                showSearch
                optionFilterProp="label"
                loading={groupLoading}
                options={importGroups}
                value={selectedUploadId}
                onChange={(value) => setSelectedUploadId(value || undefined)}
              />
            </div>
            {!isViewMode && (
              <div className="flex items-center gap-2">
                <ActionButton
                  mode="custom"
                  text="Mapping ที่เลือก"
                  className="bg-[#009845]"
                  disabled={mapLoading || selectedMappableKeys.length === 0}
                  onClick={() => handleMap(false)}
                />
                <ActionButton
                  mode="custom"
                  text="Mapping ทั้งกลุ่ม"
                  className="bg-[#1677ff]"
                  disabled={mapLoading || mappableKeys.length === 0}
                  onClick={() => handleMap(true)}
                />
              </div>
            )}
          </div>

          <div className="text-sm text-[#666]">
            เลือกกลุ่มไฟล์ CSV แล้ว mapping farmer เข้ากับ sub dealer นี้
            {selectedMappableKeys.length > 0
              ? ` (เลือกไว้ ${selectedMappableKeys.length} ราย)`
              : ""}
          </div>

          <TableComponent
            header={header}
            dataSource={dataSource}
            loading={tableLoading || mapLoading}
            pagination={{ pageSize: 10 }}
            rowSelection={rowSelection}
            rowKey="id"
            scroll
          />
        </div>
      </BoxPrimary>

      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton mode="back" text="Back" onClick={onBack} />
      </div>
    </>
  );
}
