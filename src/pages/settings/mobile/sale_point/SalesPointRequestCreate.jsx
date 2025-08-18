import React, { useEffect, useState, useContext } from "react";
import { Form, Input, Select } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../../contexts/AuthContext";
import dayjs from "dayjs";
import FormCustom from "../../../../components/form_custom/FormCustom";
import FormUser from "../../../../components/form_user/FormUser";
import TableComponent from "../../../../components/table/TableComponent";
import customParseFormat from "dayjs/plugin/customParseFormat";
import DynamicModal from "../../../../components/modal/DynamicModal";
dayjs.extend(customParseFormat);

export default function SalesPointRequestCreate() {
    const navigate = useNavigate();
    const location = useLocation();
    const { showMsg } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);

    // รายการสินค้า
    const [dataSource, setDataSource] = useState([]);
    const [dataSourceOther, setDataSourceOther] = useState([]);

    // เก็บ "id" ที่จะใช้ทำงานต่อ
    const [dataSaleId, setDataSaleId] = useState("");
    const [dealerId, setDealerId] = useState("");
    const [subDealerId, setSubDealerId] = useState("");

    // เก็บ "name" สำหรับแสดงใน textbox
    const [saleName, setSaleName] = useState("");
    const [dealerName, setDealerName] = useState("");
    const [subDealerName, setSubDealerName] = useState("");

    const [searchProductData, setSearchProductData] = useState([]);
    const [getOtherProductData, setGetOtherProductData] = useState([]);
    const [inputRemark, setInputRemark] = useState("");
    const request_id = location.state?.request_id;
    const [formCustom] = Form.useForm();

    // 1) โหลดรายละเอียด Request จาก request_id แล้วเติมชื่อ + id
    useEffect(() => {

        if (!request_id) return;

        const fetchRequestDetail = async () => {
            setLoading(true);
            try {
                const res = await useServiceAPI.get(paths.pathSalePointOrderRequestDetail, {
                    platform: "web",
                    id: request_id,
                });

                const detail = res?.data;
                console.log('detail : ', detail)
                if (detail) {
                    // set IDs (ใช้ทำงานต่อ)
                    setDataSaleId(detail.sale_id || "");
                    setDealerId(detail.dealer_id || "");
                    setSubDealerId(detail.sub_dealer_id || "");

                    // set Names (โชว์ใน textbox)
                    setSaleName(detail.sale_name || "");
                    setDealerName(detail.dealer_name || "");
                    setSubDealerName(detail.sub_dealer_name || "");
                }
            } catch (e) {
                console.error(e);
                showMsg?.("error", "ไม่สามารถโหลดรายละเอียดคำขอได้");
            } finally {
                setLoading(false);
            }
        };

        fetchRequestDetail();
    }, [location.state?.request_id]);

    // 2) ถ้ามี state.data (กลับจากหน้าอื่น) ให้เติมค่าให้ด้วย
    useEffect(() => {
        if (!location.state?.data) return;
        const { user_id, dealer_id, sub_dealer_id, others, products, remark } =
            location.state.data;

        if (user_id) setDataSaleId(String(user_id));
        if (dealer_id) setDealerId(String(dealer_id));
        if (sub_dealer_id) setSubDealerId(String(sub_dealer_id));
        setDataSource(products || []);
        setDataSourceOther(others || []);
        setInputRemark(remark || "");
    }, [location.state?.data]);

    // ---------------- Modal & Promotion ----------------
    const handleOpenTeamModal = () => {
        setGetOtherProductData([]);
        const loadProductDetail = async () => {
            setLoading(true);
            try {
                const otherProduct = await useServiceAPI.get(paths.pathMasterPromotionList, {
                    page_size: 10,
                    page_length: 1,
                });
                const list = (otherProduct?.data?.data || []).map((d, i) => ({
                    key: d.id,
                    no: i + 1,
                    name: d.name,
                    unit: d.unit,
                    value: parseFloat(d.value),
                }));
                setGetOtherProductData(list);
            } catch (err) {
                showMsg?.("error", err.message || "เกิดข้อผิดพลาด");
            } finally {
                setLoading(false);
            }
        };
        loadProductDetail();
        setIsTeamModalVisible(true);
    };

    const handleCloseTeamModal = () => {
        setGetOtherProductData([]);
        setIsTeamModalVisible(false);
    };

    const handleAddSelectedRows = (selectedRows) => {
        setGetOtherProductData((prev) => {
            const newRows = selectedRows.filter((row) => !prev.some((r) => r.key === row.key));
            return [...prev, ...newRows];
        });

        selectedRows.forEach((data) => {
            const loadOtherProductDetail = async () => {
                setLoading(true);
                try {
                    const otherProduct = await useServiceAPI.get(paths.pathMasterPromotionDetail, {
                        promotion_id: data.key,
                    });
                    const pd = otherProduct.data;

                    setDataSourceOther((prev) => {
                        const idx = prev.findIndex((i) => i.product_id === pd.id);
                        if (idx !== -1) {
                            const updated = prev.map((it, i) => {
                                if (i === idx) {
                                    const quantity = it.quantity + 1;
                                    const net_amount = (
                                        quantity * parseFloat(it.product_unit_thb.replace(/,/g, ""))
                                    ).toFixed(2);
                                    return {
                                        ...it,
                                        product_unit: it.unit,
                                        product_unit_value: it.unit_value,
                                        quantity,
                                        net_amount,
                                    };
                                }
                                return it;
                            });
                            return updated.map((it, i) => ({ ...it, key: i + 1, no: i + 1 }));
                        }
                        const added = [
                            ...prev,
                            {
                                key: prev.length + 1,
                                no: prev.length + 1,
                                product_id: pd.id,
                                product_code: pd.code || "",
                                product_name: pd.name,
                                product_unit: pd.unit,
                                product_unit_thb: pd.value,
                                quantity: 1,
                                net_amount: pd.value,
                            },
                        ];
                        return added.map((it, i) => ({ ...it, key: i + 1, no: i + 1 }));
                    });
                } catch (err) {
                    showMsg?.("error", err.message || "เกิดข้อผิดพลาด");
                } finally {
                    setLoading(false);
                }
            };
            loadOtherProductDetail();
        });
    };

    // ---------------- Form fields: แสดง "ชื่อ" ใน textbox แต่ใช้ "id" จาก state ----------------
    const formFields = [
        {
            label: "Sales",
            name: "sale",
            type: "text",
            disabled: true, // ถ้าอยากกันการแก้ไขชื่อ ให้ตั้งเป็น true
            required: false,
            value: saleName,
            placeholder: "Sales Name",
        },
        {
            label: "Dealer",
            name: "dealer",
            type: "text",
            disabled: true,
            required: false,
            moderef: false,
            value: dealerName,
            placeholder: "Dealer Name",
        },
        {
            label: "Sub Dealer",
            name: "sub_dealer",
            type: "text",
            disabled: true,
            required: false,
            moderef: false,
            value: subDealerName,
            placeholder: "Sub Dealer Name",
        },
        {
            label: "Order No",
            name: "order_no",
            type: "text",
            disabled: true,
            required: false,
            moderef: false,
            placeholder: "Generate order no",
            value: "",
        },
        {
            label: "Date",
            name: "order_date",
            type: "date",
            disabled: true,
            required: false,
            moderef: false,
            value: dayjs().format("YYYY-MM-DD"),
        },
    ];

    // ถ้ามีการแก้ข้อความชื่อเอง (ถ้าต้องการล็อกไม่ให้แก้ ให้ disabled: true ด้านบน)
    const handleChange = (field, value) => {
        if (field === "sale") setSaleName(value);
        else if (field === "dealer") setDealerName(value);
        else if (field === "sub_dealer") setSubDealerName(value);
    };

    // ---------------- ตารางสินค้า ----------------
    const handleQuantityChange = (key, newQuantity) => {
        setDataSource((prev) =>
            prev.map((it) => {
                if (it.key !== key) return it;
                const quantity = Math.max(0, newQuantity);
                const net_amount = (
                    quantity * parseFloat(it.product_unit_thb.replace(/,/g, ""))
                ).toFixed(2);
                const foc = parseInt(quantity / it.product_campaign_order_min_foc);
                return { ...it, quantity, net_amount, foc };
            })
        );
    };

    const handleQuantityChangeOther = (key, newQuantity) => {
        setDataSourceOther((prev) =>
            prev.map((it) => {
                if (it.key !== key) return it;
                const quantity = Math.max(1, newQuantity);
                const net_amount = (
                    quantity * parseFloat(it.product_unit_thb.replace(/,/g, ""))
                ).toFixed(2);
                return { ...it, quantity, net_amount };
            })
        );
    };

    const handleDeleteOtherRow = (key) => {
        setDataSourceOther((prev) =>
            prev
                .filter((it) => it.key !== key)
                .map((it, i) => ({ ...it, key: i + 1, no: i + 1 }))
        );
    };

    const header = [
        { title: "No", dataIndex: "no", key: "no" },
        { title: "SKU", dataIndex: "product_code", key: "product_code" },
        { title: "Product Name", dataIndex: "product_name", key: "product_name" },
        { title: "Unit", dataIndex: "product_unit", key: "product_unit" },
        {
            title: "THB/Unit",
            dataIndex: "product_unit_thb",
            key: "product_unit_thb",
            render: (text) =>
                parseFloat(text || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }),
        },
        {
            title: <div className="text-center">QTY (ctn)</div>,
            dataIndex: "quantity",
            key: "quantity",
            render: (_, record) => (
                <div className="quantity-control flex justify-center items-center">
                    <img
                        src="/img/icons/collapse.png"
                        alt="decrease"
                        className="cursor-pointer w-6 h-6"
                        onClick={() => handleQuantityChange(record.key, record.quantity - 1)}
                    />
                    <Input
                        inputMode="numeric"
                        min={0}
                        value={record.quantity}
                        onChange={(e) =>
                            handleQuantityChange(record.key, parseInt(e.target.value) || 0)
                        }
                        className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 w-20"
                    />
                    <img
                        src="/img/icons/expand.png"
                        alt="increase"
                        className="cursor-pointer w-6 h-6"
                        onClick={() => handleQuantityChange(record.key, record.quantity + 1)}
                    />
                </div>
            ),
        },
        { title: "FOC (ctn)", dataIndex: "foc", key: "foc" },
        {
            title: "Sub Total (THB)",
            dataIndex: "net_amount",
            key: "net_amount",
            render: (text) =>
                parseFloat(text || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }),
        },
        {
            title: <div className="text-center">Action</div>,
            key: "action",
            render: (_, record) => (
                <button className="delete-button flex justify-center mx-auto">
                    <img
                        src="/img/icons/delete.png"
                        alt="delete"
                        className="cursor-pointer w-6 h-6"
                        onClick={() => {
                            const updated = dataSource.filter((i) => i.key !== record.key);
                            const reset = updated.map((it, i) => ({ ...it, key: i + 1, no: i + 1 }));
                            setDataSource(reset);
                        }}
                    />
                </button>
            ),
        },
    ];

    const headerOther = [
        { title: "No", dataIndex: "no", key: "no" },
        { title: "Product Name", dataIndex: "product_name", key: "product_name" },
        { title: "Unit", dataIndex: "product_unit", key: "product_unit" },
        { title: "Value(THB/Unit)", dataIndex: "product_unit_value", key: "product_unit_value" },
        {
            title: <div className="text-center">QTY</div>,
            dataIndex: "quantity",
            key: "quantity",
            render: (_, record) => (
                <div className="quantity-control flex justify-center items-center">
                    <img
                        src="/img/icons/collapse.png"
                        alt="decrease"
                        className="cursor-pointer w-6 h-6"
                        onClick={() =>
                            handleQuantityChangeOther(record.key, record.quantity - 1)
                        }
                    />
                    <Input
                        inputMode="numeric"
                        min={1}
                        value={record.quantity}
                        onChange={(e) =>
                            handleQuantityChangeOther(record.key, parseInt(e.target.value) || 1)
                        }
                        className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 w-20"
                    />
                    <img
                        src="/img/icons/expand.png"
                        alt="increase"
                        className="cursor-pointer w-6 h-6"
                        onClick={() =>
                            handleQuantityChangeOther(record.key, record.quantity + 1)
                        }
                    />
                </div>
            ),
        },
        {
            title: "Sub Total (THB)",
            dataIndex: "net_amount",
            key: "net_amount",
            render: (text) =>
                parseFloat(text || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }),
        },
        {
            title: <div className="text-center">Action</div>,
            key: "action",
            render: (_, record) => (
                <button onClick={() => handleDeleteOtherRow(record.key)} className="delete-button">
                    <img src="/img/icons/delete.png" alt="delete" className="cursor-pointer w-6 h-6" />
                </button>
            ),
        },
    ];

    const footerOrderList = () => {
        const totalQuantity = dataSource.reduce((t, it) => t + parseFloat(it.quantity), 0);
        const totalFOC = dataSource.reduce((t, it) => t + parseFloat(it.foc || 0), 0);
        const totalAmount = dataSource.reduce((t, it) => t + parseFloat(it.net_amount || 0), 0);

        return (
            <tr className="bg-[#978B87]">
                <td colSpan={9} className="text-right pr-2 text-white">
                    Item: {dataSource.length} &nbsp; QTY (ctn): {totalQuantity}+{totalFOC} &nbsp; Total:{" "}
                    {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
            </tr>
        );
    };

    const footerOther = () => (
        <tr className="bg-[#978B87]">
            <td colSpan={7} className="text-right pr-2 text-white">
                Item: {dataSourceOther.length} &nbsp; QTY:{" "}
                {dataSourceOther.reduce((t, it) => t + it.quantity, 0)} &nbsp; Total:{" "}
                {dataSourceOther
                    .reduce((t, it) => t + parseFloat(it.net_amount.replace(/,/g, "")), 0)
                    .toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </td>
        </tr>
    );

    // ---------------- ค้นหาสินค้า ----------------
    const onChangeProduct = (value) => {
        setSearchProductData([]);
        const loadProductDetail = async () => {
            setLoading(true);
            try {
                const productDetail = await useServiceAPI.get(paths.pathMasterProductDetail, {
                    product_id: value,
                });
                const data = productDetail.data;

                const existingIndex = dataSource.findIndex(
                    (it) => it.product_code === data.product_code
                );
                if (existingIndex !== -1) {
                    const updated = dataSource.map((it, i) => {
                        if (i === existingIndex) {
                            const quantity = it.quantity + 1;
                            const net_amount = (
                                quantity * parseFloat(it.product_unit_thb.replace(/,/g, ""))
                            ).toFixed(2);
                            return { ...it, quantity, net_amount };
                        }
                        return it;
                    });
                    setDataSource(updated);
                } else {
                    const added = [
                        ...dataSource,
                        {
                            key: dataSource.length + 1,
                            no: dataSource.length + 1,
                            product_id: data.id,
                            product_code: data.product_code,
                            product_name: data.product_name,
                            product_unit: data.packing_list,
                            product_unit_thb: data.bath_unit,
                            product_campaign_order_min_foc: data.product_campaign_order_min_foc,
                            product_campaign_foc: data.product_campaign_foc,
                            quantity: 1,
                            foc: parseInt(1 / data.product_campaign_order_min_foc),
                            net_amount: (1 * parseFloat(data.bath_unit.replace(/,/g, ""))).toFixed(2),
                        },
                    ].map((it, i) => ({ ...it, key: i + 1, no: i + 1 }));
                    setDataSource(added);
                }
            } catch (err) {
                showMsg?.("error", err.message || "เกิดข้อผิดพลาด");
            } finally {
                setLoading(false);
            }
        };
        loadProductDetail();
    };

    const onSearchProduct = (value) => {
        if (value.length < 3) return;
        const loadProducts = async () => {
            setLoading(true);
            try {
                const product = await useServiceAPI.get(paths.pathMasterProducts, {
                    keyword: value,
                });
                const options = (product?.data || []).map((d) => ({ value: d.id, label: d.name }));
                setSearchProductData(options);
            } catch (err) {
                showMsg?.("error", err.message || "เกิดข้อผิดพลาด");
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    };

    // ---------------- Confirm: ส่ง id (ไม่ส่งชื่อ) ----------------
    const handleNavigateToOrderView = () => {
        formCustom
            .validateFields()
            .then((values) => {
                const body = {
                    request_id:request_id,
                    document_date: values.order_date,
                    user_id: dataSaleId,        // ใช้ id
                    dealer_id: dealerId,        // ใช้ id
                    sub_dealer_id: subDealerId, // ใช้ id
                    remark: inputRemark,
                    products: dataSource,
                    others: dataSourceOther,
                };
                navigate("/points/line/sales-points-list/detail", { state: { data: body } });
            })
            .catch((err) => console.error("Validation Failed:", err));
    };

    return (
        <MainLayout loading={loading}>
            <div className="title-page">Create Sale Point Request</div>

            <FormUser fields={formFields} form={formCustom} onChange={handleChange} />

            <BoxPrimary title="Product">
                <div className="mb-3 flex justify-end">
                    <Select
                        showSearch
                        placeholder="Search Product"
                        optionFilterProp="label"
                        className="w-full"
                        onChange={onChangeProduct}
                        onSearch={onSearchProduct}
                        options={searchProductData}
                        value=""
                    />
                </div>
            </BoxPrimary>

            <BoxPrimary title="Order List">
                <TableComponent header={header} dataSource={dataSource} pageSize={10} footer={footerOrderList} />
            </BoxPrimary>

            <BoxPrimary>
                <div className="flex justify-between space-x-4 mb-3">
                    <span className="text-[#00783F] text-lg font-semibold">Other</span>
                    <div className="flex space-x-2">
                        <ActionButton mode="add" text="Add" onClick={handleOpenTeamModal} />
                    </div>
                </div>
                <TableComponent header={headerOther} dataSource={dataSourceOther} pageSize={10} footer={footerOther} />
            </BoxPrimary>

            <BoxPrimary title="Remark">
                <div className="mb-3 flex justify-end">
                    <Input.TextArea
                        placeholder="Remark"
                        rows={2}
                        value={inputRemark}
                        onChange={(e) => setInputRemark(e.target.value)}
                    />
                </div>
            </BoxPrimary>

            <div className="flex justify-end space-x-4">
                <ActionButton mode="back" text="Back" onClick={() => navigate("/points/line/sales-points-list")} />
                <ActionButton mode="save" text="Confirm" onClick={handleNavigateToOrderView} />
            </div>

            <DynamicModal
                title="Add"
                isVisible={isTeamModalVisible}
                onClose={handleCloseTeamModal}
                header={[
                    { title: "No", dataIndex: "no", key: "no", width: 50 },
                    { title: "Name", dataIndex: "name", key: "name", width: 150 },
                    { title: "Unit", dataIndex: "unit", key: "unit", width: 150 },
                    { title: "Value (THB)", dataIndex: "value", key: "value", width: 150 },
                ]}
                dataSource={getOtherProductData}
                width="1200px"
                onAddSelected={handleAddSelectedRows}
                type="add"
            />
        </MainLayout>
    );
}
