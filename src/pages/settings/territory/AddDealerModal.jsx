import { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Input, Modal } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import TableComponent from "../../../components/table/TableComponent";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import { apiError, asList, mapDealer, totalOf } from "./territoryShared";

// Popup that lists dealers without an active Sales mapping
// (GET /territory/available-dealers). Selection is returned to the form only;
// nothing is saved until the form's Save button.
export default function AddDealerModal({ open, onCancel, onConfirm, excludeIds = [], territoryId }) {
  const { showMsg } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    if (!open) return;
    setSelected({});
    setKeyword("");
    setSearch("");
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const params = {
          page_length: pagination.current,
          page_size: pagination.pageSize,
          search,
        };
        if (territoryId) params.territory_id = territoryId;
        const response = await useServiceAPI.get(paths.pathTerritoryAvailableDealers, params);
        if (cancelled) return;
        const list = asList(response?.data ?? response).map(mapDealer);
        setRows(list);
        setPagination((prev) => ({ ...prev, total: totalOf(response, list.length) }));
      } catch (error) {
        if (!cancelled) {
          setRows([]);
          showMsg("error", apiError(error, "โหลดรายการ Dealer ไม่สำเร็จ"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, search, pagination.current, pagination.pageSize, territoryId, showMsg]);

  const excluded = new Set(excludeIds.map(String));
  const dataSource = rows.map((row) => ({ ...row, disabled: excluded.has(row.key) }));

  const header = [
    { title: "No", dataIndex: "no", key: "no", width: 70, align: "center" },
    { title: "Dealer Name (EN)", dataIndex: "dealer_name", key: "dealer_name", width: 240 },
    { title: "Address", dataIndex: "address", key: "address" },
  ];

  const selectedKeys = Object.keys(selected);

  return (
    <Modal
      open={open}
      title="Add Dealer"
      width={1000}
      centered
      okText={`Confirm (${selectedKeys.length})`}
      cancelText="Cancel"
      okButtonProps={{ disabled: !selectedKeys.length }}
      onCancel={onCancel}
      onOk={() => onConfirm(Object.values(selected))}
      destroyOnClose
    >
      <div className="mb-3 flex justify-end">
        <Input
          allowClear
          value={keyword}
          placeholder="Search dealer name / address"
          prefix={<SearchOutlined className="text-[#978B87]" />}
          onChange={(event) => {
            setKeyword(event.target.value);
            if (!event.target.value) {
              setSearch("");
              setPagination((prev) => ({ ...prev, current: 1 }));
            }
          }}
          onPressEnter={() => {
            setSearch(keyword.trim());
            setPagination((prev) => ({ ...prev, current: 1 }));
          }}
          className="w-full sm:w-[320px]"
        />
      </div>
      <TableComponent
        header={header}
        dataSource={dataSource}
        loading={loading}
        pagination={{ ...pagination, showSizeChanger: true, pageSizeOptions: ["10", "20", "50", "100"] }}
        onChange={(next) =>
          setPagination((prev) => ({
            ...prev,
            current: next.current,
            pageSize: next.pageSize,
          }))
        }
        rowSelection={{
          selectedRowKeys: selectedKeys,
          preserveSelectedRowKeys: true,
          getCheckboxProps: (record) => ({ disabled: record.disabled }),
          onChange: (keys, records) => {
            setSelected((prev) => {
              const next = {};
              keys.forEach((key) => {
                const row = records.find((r) => r?.key === key) || prev[key];
                if (row) next[key] = row;
              });
              return next;
            });
          },
        }}
      />
    </Modal>
  );
}

const idType = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);

AddDealerModal.propTypes = {
  open: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  excludeIds: PropTypes.arrayOf(idType),
  territoryId: idType,
};
