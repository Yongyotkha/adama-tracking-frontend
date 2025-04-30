import React, { useState, useEffect, useContext } from "react";
import { Form, Input, Select } from "antd";
import MainLayout from "../../../layouts/MainLayout";
import FormCustom from "../../../components/form_custom/FormCustom";
import FormUser from "../../../components/form_user/FormUser";
import { useNavigate, useLocation } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import NumericInput from "../../../components/numeric_input/NumericInput";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import TableComponentTraveling from "../../../components/table/TableComponentTraveling";
import formatNumber from "../../../utils/number";

export default function EditTraveling() {
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
          useServiceAPI.get(paths.pathMasterUserAll),

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
            tollFee:parseFloat(data.toll_fee),
            entertain: parseFloat(data.entertain),
            others: parseFloat(data.others),
            total: parseFloat(data.total),
            remark: data.remark,
          }))
        );

        setDataRemark(expense.data.remark);
        setDataTotalAdvanced(expense.data.total_advanced || 0);
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
          console.log(traveling);
          const transformedData = dataItems.map((item, index) => ({
            key: `${index + 1}`,
            date: item.date || "",
            from: item.traveling_from || "",
            to: item.traveling_to || "",
            mileage: item.mileage || "0",
            petrol: item.petrol || "0",
            cashPetrol: item.cash_petrol || "0",
            hotel: item.hotel || "0",
            allowance: item.allowance || "0",
            tollFee: item.toll_fee || "0",
            entertain: item.entertain || "0",
            others: item.others || "0",
            total: item.total || "0",
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
      // setDataSource((prevData) =>
      //   prevData.map((item) =>
      //     item.key === key ? { ...item, [field]: value, total: calculateTotal(item) } : item
      //   )
      // );
      setDataSource((prevData) =>
        prevData.map((item) =>
          item.key === key
            ? {
                ...item,
                [field]: value, // อัพเดตฟิลด์ที่ถูกเลือก
                total: calculateTotal({ ...item, [field]: value }) // คำนวณค่า total ใหม่
              }
            : item
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
  useEffect(() => {
    const totalExpenses = calculateFooterTotal("total");
    const totalAdvanced = calculateFooterTotal("total"); // Adjust field as per requirement
    setDataTotalExpenses(totalExpenses);
    // setDataTotalAdvanced(totalAdvanced);

    // Optionally calculate "Return to Company" and "Return to Staff"
    // const returnToCompany = totalAdvanced - totalExpenses > 0 ? totalAdvanced - totalExpenses : 0;
    // const returnToStaff = totalExpenses - totalAdvanced > 0 ? totalExpenses - totalAdvanced : 0;

    // setReturnToCompany(returnToCompany);
    // setReturnToStaff(returnToStaff);
  }, [dataSource, dataTotalExpenses]);

  useEffect(() => {
    // console.log(dataTotalAdvanced);
    // console.log(dataTotalExpenses);
    if (dataTotalAdvanced > dataTotalExpenses) {
      setReturnToCompany(dataTotalAdvanced - dataTotalExpenses);
      setReturnToStaff(0);
    } else if (dataTotalAdvanced < dataTotalExpenses) {
      setReturnToStaff(dataTotalExpenses - dataTotalAdvanced);
      setReturnToCompany(0);
    } else {
      setReturnToCompany(0);
      setReturnToStaff(0);
    }
  }, [dataTotalAdvanced, dataTotalExpenses]);

  // console.log(returnToCompany);
  // console.log(returnToStaff);

  const formFields = [
    {
      label: "Name",
      name: "sale",
      type: "select",
      options: dataSale,
      required: false,
      col: 6,
      value: parseInt(saleId),
    },
    {
      label: "Year",
      name: "year",
      type: "select",
      options: dataYear,
      required: false,
      col: 6,
      value: yearCode,
    },
    {
      label: "Month",
      name: "month",
      type: "select",
      options: dataMonth,
      required: false,
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
        />
      ),
    },
    {
      title: <span className="text-nowrap">Mileage</span>,
      dataIndex: "mileage",
      key: "mileage",
      render: (value, record) => (
        <NumericInput
          style={{ width: 100 }}
          value={value}
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
        <NumericInput
          style={{ width: 100 }}
          value={parseFloat(value)}
          onChange={(val) => updateField(record.key, "petrol", val)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">Cash Petrol</span>,
      dataIndex: "cashPetrol",
      key: "cashPetrol",
      render: (value, record) => (
        <NumericInput
          style={{ width: 100 }}
          value={parseFloat(value)}
          onChange={(val) => updateField(record.key, "cashPetrol", val)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">Hotel</span>,
      dataIndex: "hotel",
      key: "hotel",
      render: (value, record) => (
        <NumericInput
          style={{ width: 100 }}
          value={parseFloat(value)}
          onChange={(val) => updateField(record.key, "hotel", val)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">Allowance</span>,
      dataIndex: "allowance",
      key: "allowance",
      render: (value, record) => (
        <NumericInput
          style={{ width: 100 }}
          value={parseFloat(value)}
          onChange={(val) => updateField(record.key, "allowance", val)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">Toll Fee</span>,
      dataIndex: "tollFee",
      key: "tollFee",
      render: (value, record) => (
        <NumericInput
          style={{ width: 100 }}
          value={parseFloat(value)}
          onChange={(val) => updateField(record.key, "tollFee", val)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">Entertain</span>,
      dataIndex: "entertain",
      key: "entertain",
      render: (value, record) => (
        <NumericInput
          style={{ width: 100 }}
          value={parseFloat(value)}
          onChange={(val) => updateField(record.key, "entertain", val)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">Others</span>,
      dataIndex: "others",
      key: "others",
      render: (value, record) => (
        <NumericInput
          style={{ width: 100 }}
          value={parseFloat(value)}
          onChange={(val) => updateField(record.key, "others", val)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">Total</span>,
      dataIndex: "total",
      key: "total",
      render: (value, record) => (
        <NumericInput
          style={{ width: 100 }}
          value={formatNumber(value)}
          onChange={(val) => updateField(record.key, "total", val)}
          disabled
        />
      ),
    },
    {
      title: <span className="text-nowrap">Remark</span>,
      dataIndex: "remark",
      key: "remark",
      render: (value, record) => (
        <Input
          style={{ width: 250 }}
          value={value}
          onChange={(e) => updateField(record.key, "remark", e.target.value)}
          maxLength={25}
        />
      ),
    },
  ];

  const footerOrderList = () => (
    <tr className="bg-[#978B87] text-white text-start">
      <td colSpan={3}>Total (THB)</td>
      <td>
        <Input style={{ width: 100 }}  value={calculateFooterTotal("mileage")} readOnly hidden />
      </td>
      <td>
        <Input style={{ width: 100 }}  value={formatNumber(calculateFooterTotal("petrol"))} readOnly />
      </td>
      <td>
        <Input style={{ width: 100 }}  value={formatNumber(calculateFooterTotal("cashPetrol"))} readOnly />
      </td>
      <td>
        <Input style={{ width: 100 }}  value={formatNumber(calculateFooterTotal("hotel"))} readOnly />
      </td>
      <td>
        <Input style={{ width: 100 }}  value={formatNumber(calculateFooterTotal("allowance"))} readOnly />
      </td>
      <td>
        <Input style={{ width: 100 }}  value={formatNumber(calculateFooterTotal("tollFee"))} readOnly />
      </td>
      <td>
        <Input style={{ width: 100 }}  value={formatNumber(calculateFooterTotal("entertain"))} readOnly />
      </td>
      <td>
        <Input style={{ width: 100 }}  value={formatNumber(calculateFooterTotal("others"))} readOnly />
      </td>
      <td>
        <Input style={{ width: 100 }}  value={formatNumber(calculateFooterTotal("total"))} readOnly />
      </td>
      <td></td>
    </tr>
  );

  const removeComma = (value) => (typeof value === "string" ? value.replace(/,/g, "") : value);
  const handleSave = () => {
    formCustom
      .validateFields()
      .then((values) => {
        //
        const transformedData = dataSource.map((item, index) => ({
          key: `${index + 1}`,
          date: item.date || "",
          traveling_from: item.from || "",
          traveling_to: item.to || "",
          mileage: item.mileage || "0",
          petrol: removeComma(item.petrol) || "0",
          cash_petrol: removeComma(item.cashPetrol) || "0",
          hotel: removeComma(item.hotel) || "0",
          allowance: removeComma(item.allowance) || "0",
          toll_fee: removeComma(item.tollFee) || "0",
          entertain: removeComma(item.entertain) || "0",
          others: removeComma(item.others) || "0",
          total: removeComma(item.total) || "0",
          remark: item.remark || "",
        }));

        const body = {
          action_code: "save",
          year_code: yearCode,
          month_code: monthCode,
          user_id: saleId,
          total_advanced: dataTotalAdvanced,
          total_expenses: dataTotalExpenses,
          total_return_to_company: returnToCompany,
          total_to_staff: returnToStaff,
          remark: dataRemark,
          data_items: transformedData,
        };
        console.log(body);
        // return;
        const saveExpensesTraveling = async () => {
          setLoading(true);
          try {
            const [response] = await Promise.all([
              useServiceAPI.put(paths.pathGetExpenseTravelingUpdate, body),
            ]);

            showNotification(
              "success",
              response.data.message,
              response.data.message_line
            ).then(() => {
              navigate("/expenses/traveling");
            });
          } catch (error) {
            showMsg("error", error.message || "เกิดข้อผิดพลาด");
            console.log(error);
          } finally {
            setLoading(false);
          }
        };
        //
        saveExpensesTraveling();
      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
      });
  };
  // console.log(dataTotalAdvanced);
  return (
    <MainLayout loading={loading}>
      <div className="flex justify-between">
        <div className="title-page">Edit Traveling Expense</div>
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
          pageSize={31}
          footer={footerOrderList}
          scroll={{
            y: 55 * 5,
          }}
        />
      </BoxPrimary>

      {/* Total Expense Summary */}
      {/* <BoxPrimary>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-end">Total Advanced:</div>
          <NumericInput value={dataTotalAdvanced} disabled />
          
          <div className="flex justify-end">Total Expenses:</div>
          <NumericInput value={dataTotalExpenses} disabled />

          <div className="flex justify-end">Return to Company:</div>
          <NumericInput value={returnToCompany} disabled />

          <div className="flex justify-end">Return to Staff:</div>
          <NumericInput value={returnToStaff} disabled />
        </div>
      </BoxPrimary> */}

      {/* Total Expense Summary */}
      <BoxPrimary>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-end">Total Advanced:</div>
          <NumericInput
            value = {formatNumber(dataTotalAdvanced)}
            // onChange={(value) => setDataTotalAdvanced(parseFloat(value) || 0) }
            onChange={(value) => {
              const parsedValue = parseFloat(value) || 0;
              console.log("setDataTotalAdvanced:", parsedValue);
              setDataTotalAdvanced(parsedValue);
            }}
          />

          <div className="flex justify-end">Total Expenses:</div>
          <NumericInput value={formatNumber(dataTotalExpenses)} disabled />

          <div className="flex justify-end">Return to Company:</div>
          <NumericInput value={formatNumber(returnToCompany)} disabled />

          <div className="flex justify-end">Return to Staff:</div>
          <NumericInput value={formatNumber(returnToStaff)} disabled />
        </div>
      </BoxPrimary>



      {/* Remark Section */}
      <BoxPrimary title="Remark">
        <Input.TextArea
          rows={2}
          placeholder="Remark"
          value={dataRemark}
          onChange={(e) => setDataRemark(e.target.value)}
        />
      </BoxPrimary>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/expenses/traveling")}
        />
        <ActionButton mode="save" text="Save" onClick={() => handleSave()} />
      </div>
    </MainLayout>
  );
}
