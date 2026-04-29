import React, { useState, useEffect, useContext } from "react";
import { Form, Input, Select } from "antd";
import MainLayout from "../../../layouts/MainLayout";
import FormCustom from "../../../components/form_custom/FormCustom";
import FormUser from "../../../components/form_user/FormUser";
import { useNavigate, useLocation } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponentTraveling from "../../../components/table/TableComponentTraveling";
import NumericInputTraveling from "../../../components/numeric_input/NumericInputTraveling";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import formatNumber from "../../../utils/number";

const formatNumberLocal = (input, digi = 2) => {
  const number = parseFloat(typeof input === "string" ? input.replace(/,/g, "") : input);
  if (!isNaN(number)) {
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: digi,
    });
  }
  return "0.00";
};

export default function ViewTraveling() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { showMsg, showNotification } = useContext(AuthContext);
  const [dataSource, setDataSource] = useState([]);
  const [dataSourceDetail, setDataSourceDetail] = useState([]);
  const [dataSale, setDataSale] = useState([]);
  const [dataYear, setDataYear] = useState([]);
  const [dataMonth, setDataMonth] = useState([]);

  const [saleId, setSaleId] = useState("");
  const [yearCode, setYearCode] = useState("");
  const [monthCode, setMonthCode] = useState("");

  const [dataRemark, setDataRemark] = useState("");
  const [dataTotalAdvanced, setDataTotalAdvanced] = useState(0);
  const [dataTotalExpenses, setDataTotalExpenses] = useState(0);
  const [returnToCompany, setReturnToCompany] = useState(0);
  const [returnToStaff, setReturnToStaff] = useState(0);

  const [formCustom] = Form.useForm();

  // Set Data
  const [getUserId, setGetUserId] = useState(location.state.user_id);
  const [getYearCode, setGetYearCode] = useState(location.state.year_code);
  const [getMonthCode, setGetMonthCode] = useState(location.state.month_code);

  // Get Master
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [sale, year, month] = await Promise.all([
          // useServiceAPI.get(paths.pathMasterUserAll),
          useServiceAPI.get(paths.pathMasterSaleExpense, { mode: "all" }),
          useServiceAPI.get(paths.pathMasterYear, {}),
          useServiceAPI.get(paths.pathMasterMonths, {}),
        ]);

        setDataSale(sale.data)
        setDataYear(year.data);
        setDataMonth(month.data);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);

  // Get Expenses Detail
  useEffect(() => {
    const getExpensesDetail = async () => {
      setLoading(true);
      try {
        const [expense] = await Promise.all([
          useServiceAPI.get(paths.pathGetExpenseTravelingDetail, {
            year_code: getYearCode,
            month_code: getMonthCode,
            user_id: getUserId,
          }),
        ]);

        setDataSourceDetail(expense.data);
        setDataSource(
          expense.data.data_items.map((data, index) => ({
            key: index + 1,
            date: data.date,
            from: data.traveling_from,
            to: data.traveling_to,
            mileage: parseFloat(data.mileage),
            petrol: parseFloat(data.petrol),
            cashPetrol: parseFloat(data.cash_petrol),
            hotel: parseFloat(data.hotel),
            allowance: parseFloat(data.allowance),
            tollFee: parseFloat(data.toll_fee),
            entertain: parseFloat(data.entertain),
            others: parseFloat(data.others),
            total: parseFloat(data.total),
            remark: data.remark,
          }))
        );

        setDataRemark(expense.data.remark);
        setSaleId(getUserId);
        setYearCode(getYearCode);
        setMonthCode(getMonthCode);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getExpensesDetail();
  }, []);

  const handleMonthChange = (filter, value) => {
    if (filter == "sale") {
      setSaleId(value);
    }
    if (filter == "year") {
      setYearCode(value);
    }
    if (filter == "month") {
      setMonthCode(value);
    }
  };

  const toNum = (v) => {
    if (v === null || v === undefined) return 0;
    if (typeof v === "number") return Number.isFinite(v) ? v : 0;
    const s = String(v).trim();
    if (s === "" || s === "-" || s === ".00" || s === "0.00") return 0;
    const n = Number(s.replace(/,/g, ""));
    return Number.isNaN(n) ? 0 : n;
  };

  // Fetch API Table Add Rows
  useEffect(() => {
    if (saleId && yearCode && monthCode) {
      const loadDataTraveling = async () => {
        setLoading(true);
        try {
          const [traveling] = await Promise.all([
            useServiceAPI.get(paths.pathGetExpenseTravelingDetail, {
              year_code: yearCode,
              month_code: monthCode,
              user_id: saleId
            }),
          ]);

          const dataItems = traveling.data.data_items;
          console.log(dataItems);
          const transformedData = dataItems.map((item, index) => ({
            key: `${index + 1}`,
            date: item.date || "",
            from: item.traveling_from || "",
            to: item.traveling_to || "",
            mileage: toNum(item.mileage),
            petrol: toNum(item.petrol),
            cashPetrol: toNum(item.cash_petrol),
            hotel: toNum(item.hotel),
            allowance: toNum(item.allowance),
            tollFee: toNum(item.toll_fee),
            entertain: toNum(item.entertain),
            others: toNum(item.others),
            total: toNum(item.total),
            remark: item.remark || "",
          }));
          // ตั้งค่า state
          setDataSource(transformedData);

        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาด");
        } finally {
          setLoading(false);
        }
      };

      // Load Data
      loadDataTraveling();

    } else {
      // Set State : Table data source
      setDataSource([]);
    }
  }, [saleId, yearCode, monthCode])

  // Function to add a new row
  // const addRow = () => {
  //   const newRow = {
  //     key: `${dataSource.length + 1}`,
  //     date: "",
  //     from: "",
  //     to: "",
  //     mileage: "0",
  //     petrol: "0",
  //     cashPetrol: "0",
  //     hotel: "0",
  //     allowance: "0",
  //     tollFee: "0",
  //     entertain: "0",
  //     others: "0",
  //     total: "0",
  //     remark: "",
  //   };
  //   setDataSource([...dataSource, newRow]);
  // };

  // Update individual cell values
  const updateField = (key, field, value) => {
    if (field !== 'mileage' || field !== 'petrol') {
      setDataSource((prevData) =>
        prevData.map((item) =>
          item.key === key ? { ...item, [field]: value, total: calculateTotal(item) } : item
        )
      );
    }
  };

  // Calculate total for each row
  const calculateTotal = (item) => (
    [
      // "mileage",
      // "petrol",
      "cashPetrol",
      "hotel",
      "allowance",
      "tollFee",
      "entertain",
      "others",
    ]).reduce((acc, field) => acc + parseFloat(item[field] || 0), 0);

  // Calculate total for the footer
  const calculateFooterTotal = (field) => {
    return dataSource.reduce(
      (acc, item) => acc + parseFloat(item[field] || 0),
      0
    );
  };

  // Update Footer Totals when Data Source Changes
  // คำนวณค่า Total Expenses, Total Advanced, Return to Company, Return to Staff
  useEffect(() => {
    // คำนวณค่าจาก dataSource
    const totalExpenses = dataSource.reduce((acc, item) => acc + parseFloat(item.total || 0), 0);
    const totalAdvanced = dataSourceDetail.total_advanced || 0;

    // คำนวณยอดที่ต้องคืนบริษัทและพนักงาน
    const returnToCompany = totalAdvanced > totalExpenses ? totalAdvanced - totalExpenses : 0;
    const returnToStaff = totalExpenses > totalAdvanced ? totalExpenses - totalAdvanced : 0;

    // อัปเดต State
    setDataTotalExpenses(totalExpenses);
    setDataTotalAdvanced(totalAdvanced);
    setReturnToCompany(returnToCompany);
    setReturnToStaff(returnToStaff);
  }, [dataSource, dataSourceDetail]);


  const formFields = [
    {
      label: "Name",
      name: "sale",
      type: "select",
      options: dataSale,
      required: false,
      disabled: true,
      col: 6,
      value: parseInt(saleId),
    },
    {
      label: "Year",
      name: "year",
      type: "select",
      options: dataYear,
      required: false,
      disabled: true,
      col: 6,
      value: yearCode,
    },
    {
      label: "Month",
      name: "month",
      type: "select",
      options: dataMonth,
      required: false,
      disabled: true,
      col: 6,
      value: monthCode,
    },
  ];

  // Table headers for the Traveling section
  const header = [
    {
      title: <span className="text-nowrap">Date</span>,
      dataIndex: "date",
      key: "date",
      render: (value, record) => (
        <Input
          value={value}
          style={{ width: 120 }}
          onChange={(e) => updateField(record.key, "date", e.target.value)}
          disabled
        />
      ),
    },
    {
      title: <span className="text-nowrap">Traveling From</span>,
      dataIndex: "from",
      key: "from",
      render: (value, record) => (
        <Input
          value={value}
          style={{ width: 120 }}
          onChange={(e) => updateField(record.key, "from", e.target.value)}
          disabled
        />
      ),
    },
    {
      title: <span className="text-nowrap">To</span>,
      dataIndex: "to",
      key: "to",
      render: (value, record) => (
        <Input
          value={value}
          style={{ width: 120 }}
          onChange={(e) => updateField(record.key, "to", e.target.value)}
          disabled
        />
      ),
    },
    {
      title: <span className="text-nowrap">Mileage</span>,
      dataIndex: "mileage",
      key: "mileage",
      render: (value, record) => (
        <Input
          style={{ width: 100, textAlign: "right" }}
          value={formatNumberLocal(value)}
          onChange={(val) => updateField(record.key, "mileage", val)}
          disabled
        />
      ),
    },
    {
      title: <span className="text-nowrap">Petrol</span>,
      dataIndex: "petrol",
      key: "petrol",
      render: (value, record) => (
        <Input
          style={{ width: 100, textAlign: "right" }}
          value={formatNumberLocal(value)}
          onChange={(val) => updateField(record.key, "petrol", val)}
          disabled
        />
      ),
    },
    {
      title: <span className="text-nowrap">Cash Petrol</span>,
      dataIndex: "cashPetrol",
      key: "cashPetrol",
      render: (value, record) => (
        <Input
          style={{ width: 100, textAlign: "right" }}
          value={formatNumberLocal(value)}
          onChange={(val) => updateField(record.key, "cashPetrol", val)}
          disabled
        />
      ),
    },
    {
      title: <span className="text-nowrap">Hotel</span>,
      dataIndex: "hotel",
      key: "hotel",
      render: (value, record) => (
        <Input
          style={{ width: 100, textAlign: "right" }}
          value={formatNumberLocal(value)}
          onChange={(val) => updateField(record.key, "hotel", val)}
          disabled
        />
      ),
    },
    {
      title: <span className="text-nowrap">Allowance</span>,
      dataIndex: "allowance",
      key: "allowance",
      render: (value, record) => (
        <Input
          style={{ width: 100, textAlign: "right" }}
          value={formatNumberLocal(value)}
          onChange={(val) => updateField(record.key, "allowance", val)}
          disabled
        />
      ),
    },
    {
      title: <span className="text-nowrap">Toll Fee</span>,
      dataIndex: "tollFee",
      key: "tollFee",
      render: (value, record) => (
        <Input
          style={{ width: 100, textAlign: "right" }}
          value={formatNumberLocal(value)}
          onChange={(val) => updateField(record.key, "tollFee", val)}
          disabled
        />
      ),
    },
    {
      title: <span className="text-nowrap">Entertain</span>,
      dataIndex: "entertain",
      key: "entertain",
      render: (value, record) => (
        <Input
          style={{ width: 100, textAlign: "right" }}
          value={formatNumberLocal(value)}
          onChange={(val) => updateField(record.key, "entertain", val)}
          disabled
        />
      ),
    },
    {
      title: <span className="text-nowrap">Others</span>,
      dataIndex: "others",
      key: "others",
      render: (value, record) => (
        <Input
          style={{ width: 100, textAlign: "right" }}
          value={formatNumberLocal(value)}
          onChange={(val) => updateField(record.key, "others", val)}
          disabled
        />
      ),
    },
    {
      title: <span className="text-nowrap">Total</span>,
      dataIndex: "total",
      key: "total",
      render: (value, record) => (
        <Input
          style={{ width: 100, textAlign: "right" }}
          value={formatNumberLocal(value)}
          onChange={(val) => updateField(record.key, "total", val)}
          disabled
        />
      ),
    },
    {
      title: <span className="text-nowrap">Remark</span>,
      dataIndex: "remark",
      key: "remark",
      render: (text) => <Input style={{ width: 250 }} defaultValue={text}
        disabled
      />,
    },
  ];

  const footerOrderList = () => (
    <tr className="bg-[#978B87] text-white text-start">
      <td colSpan={3}>Total (THB)</td>
      <td>
        <Input style={{ width: 100, textAlign: "right" }} value={formatNumber(calculateFooterTotal("mileage"), 0)} readOnly hidden />
      </td>
      <td>
        <Input style={{ width: 100, textAlign: "right" }} value={formatNumberLocal(calculateFooterTotal("petrol"))} readOnly />
      </td>
      <td>
        <Input style={{ width: 100, textAlign: "right" }} value={formatNumberLocal(calculateFooterTotal("cashPetrol"))} readOnly />
      </td>
      <td>
        <Input style={{ width: 100, textAlign: "right" }} value={formatNumberLocal(calculateFooterTotal("hotel"))} readOnly />
      </td>
      <td>
        <Input style={{ width: 100, textAlign: "right" }} value={formatNumberLocal(calculateFooterTotal("allowance"))} readOnly />
      </td>
      <td>
        <Input style={{ width: 100, textAlign: "right" }} value={formatNumberLocal(calculateFooterTotal("tollFee"))} readOnly />
      </td>
      <td>
        <Input style={{ width: 100, textAlign: "right" }} value={formatNumberLocal(calculateFooterTotal("entertain"))} readOnly />
      </td>
      <td>
        <Input style={{ width: 100, textAlign: "right" }} value={formatNumberLocal(calculateFooterTotal("others"))} readOnly />
      </td>
      <td>
        <Input style={{ width: 100, textAlign: "right" }} value={formatNumberLocal(calculateFooterTotal("total"))} readOnly />
      </td>
      <td></td>
    </tr>
  );


  return (
    <MainLayout loading={loading}>
      <div className="flex justify-between">
        <div className="title-page">View Traveling Expense</div>
      </div>

      {/* Form Section */}
      <FormUser
        fields={formFields}
        form={formCustom}
        onChange={handleMonthChange}
      />

      {/* Traveling Section */}
      <BoxPrimary>
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-lg font-semibold">
            Traveling
          </span>
          {/* <ActionButton mode="add" text="Add" onClick={addRow} /> */}
        </div>
        <TableComponentTraveling
          header={header}
          dataSource={dataSource}
          pagination={false}
          footer={footerOrderList}
          pageSize={31}
          scroll={{
            x: 100, // กำหนดให้เลื่อนแนวนอนได้ถ้ากว้างเกิน
          }}
        />
      </BoxPrimary>

      {/* Total Expense Summary */}
      <BoxPrimary>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-end">Total Advanced:</div>
          <Input style={{ textAlign: "right" }} value={formatNumberLocal(dataTotalAdvanced)} disabled />

          <div className="flex justify-end">Total Expenses:</div>
          <Input style={{ textAlign: "right" }} value={formatNumberLocal(dataTotalExpenses)} disabled />

          <div className="flex justify-end">Return to Company:</div>
          <Input style={{ textAlign: "right" }} value={formatNumberLocal(returnToCompany)} disabled />

          <div className="flex justify-end">Return to Staff:</div>
          <Input style={{ textAlign: "right" }} value={formatNumberLocal(returnToStaff)} disabled />
        </div>
      </BoxPrimary>


      {/* Remark Section */}
      <BoxPrimary title="Remark">
        <Input.TextArea
          rows={2}
          placeholder="Remark"
          value={dataRemark}
          onChange={(e) => setDataRemark(e.target.value)}
          disabled
        />
      </BoxPrimary>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/expenses/traveling")}
        />
        <ActionButton
          mode="saveDraft"
          text="Export PDF"
          // onClick={() => window.open("/expenses/traveling/pdf", "_blank")}
          // onClick={() => {
          //   navigate("/expenses/traveling/pdf", {
          //     state: {
          //       year_code: getYearCode,
          //       month_code: getMonthCode,
          //       user_id: getUserId,
          //     },
          //   });
          // }}
          onClick={() => {
            const targetUrl = `/expenses/traveling/pdf?year_code=${getYearCode}&month_code=${getMonthCode}&user_id=${getUserId}`;
            window.open(targetUrl, "_blank"); // เปิดในแท็บใหม่
          }}
        />
      </div>

    </MainLayout>
  );
}
