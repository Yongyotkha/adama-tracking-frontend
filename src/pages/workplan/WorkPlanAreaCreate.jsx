import React, { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import DynamicButton from "../../components/button/DynamicButton";
import { Input, InputNumber } from "antd";
import { useNavigate } from "react-router-dom";
import TableCustomComponent from "../../components/table/TableCustomComponent";

export default function WorkPlanAreaCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    const data = [
      {
        key: "1",
        productName: "Product A",
        packSize: "Small",
        originalPlan: "100",
        valueTHB: "2000",
        originalPlanManupong: "150",
        valueTHBManupong: "2500",
      },
    ];
    setDataSource(data);
  }, []);

  const columns = [
    {
      title: "Sale Territory Name",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#00783F",
          color: "white",
          fontWeight: "bold",
        },
      }),
      children: [
        {
          title: "Territory",
          children: [
            {
              title: "Sale Plan (THB)",
              children: [
                {
                  title: "Product Name",
                  dataIndex: "productName",
                  key: "productName",
                  fixed: "left",
                  width: 200,
                },
                {
                  title: "Pack Size",
                  dataIndex: "packSize",
                  key: "packSize",
                  width: 200,
                  fixed: "left",
                },
                {
                  title: "Original Plan",
                  dataIndex: "originalPlan",
                  key: "originalPlan",
                  width: 200,
                  fixed: "left",
                },
                {
                  title: "Value (THB)",
                  dataIndex: "valueTHB",
                  key: "valueTHB",
                  width: 200,
                  fixed: "left",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Manupong Wongpuang",
      children: [
        {
          title: "Lower North",
          children: [
            {
              title: <Input placeholder="Input" />,
              children: [
                {
                  title: "Original Plan",
                  dataIndex: "originalPlanManupong",
                  key: "originalPlanManupong",
                  width: 200,
                },
                {
                  title: "Value (THB)",
                  dataIndex: "valueTHBManupong",
                  key: "valueTHBManupong",
                  width: 200,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Manupong Wongpuang",
      children: [
        {
          title: "Lower North",
          children: [
            {
              title: <Input placeholder="Input" />,
              children: [
                {
                  title: "Original Plan",
                  dataIndex: "originalPlanManupong",
                  key: "originalPlanManupong",
                  width: 200,
                },
                {
                  title: "Value (THB)",
                  dataIndex: "valueTHBManupong",
                  key: "valueTHBManupong",
                  width: 200,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Manupong Wongpuang",
      children: [
        {
          title: "Lower North",
          children: [
            {
              title: <Input placeholder="Input" />,
              children: [
                {
                  title: "Original Plan",
                  dataIndex: "originalPlanManupong",
                  key: "originalPlanManupong",
                  width: 200,
                },
                {
                  title: "Value (THB)",
                  dataIndex: "valueTHBManupong",
                  key: "valueTHBManupong",
                  width: 200,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Manupong Wongpuang",
      children: [
        {
          title: "Lower North",
          children: [
            {
              title: <Input placeholder="Input" />,
              children: [
                {
                  title: "Original Plan",
                  dataIndex: "originalPlanManupong",
                  key: "originalPlanManupong",
                  width: 200,
                },
                {
                  title: "Value (THB)",
                  dataIndex: "valueTHBManupong",
                  key: "valueTHBManupong",
                  width: 200,
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <div className="title-page">Create Work Plan</div>

        <BoxPrimary>
          <div className="flex flex-col gap-2">
            <div>Yearly Target</div>
            <div className="w-[25%]">
              <Input suffix="THB" disabled value={"205,250,000"} />
            </div>
          </div>
        </BoxPrimary>

        <BoxPrimary>
          <div className="text-[#00783F] text-2xl pb-3">
            Sale Territory Name
          </div>

          <TableCustomComponent
            header={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={true}
          />
        </BoxPrimary>

        <div className="flex justify-end space-x-4">
          <DynamicButton
            text="Back"
            className="bg-[#B6AEAB] text-[#ffff] rounded-lg p-2"
            onClick={() =>
              navigate("/sale-plan/work-plan/create", {
                state: { data: {} },
              })
            }
          />
          <DynamicButton
            text="Save Draft"
            className="bg-[#F89E18] text-[#ffff] rounded-lg p-2"
            onClick={() => navigate("/sale-plan/work-plan")}
          />

          <DynamicButton
            text="Save and Next"
            className="bg-[#00783F] text-[#ffff] rounded-lg p-2"
            onClick={() => navigate("/sale-plan/work-plan")}
          />
        </div>
      </MainLayout>
    </>
  );
}
