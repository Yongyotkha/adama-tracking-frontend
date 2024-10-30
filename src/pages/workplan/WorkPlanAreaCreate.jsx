import React, { useCallback, useEffect, useRef, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableComponent from "../../components/table/TableComponent";
import DynamicButton from "../../components/button/DynamicButton";
import { Input, InputNumber } from "antd";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../components/button/ActionButton";

export default function WorkPlanAreaCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    const data = [
      {
        productName: "Ossinate 15%SL",
        packSize: "1Kg.",
        originalPlan: 30000,
        valueThb: 7500000,
        quantities: [
          { qty: 8000, value: 30000 },
          { qty: 8000, value: 2000000 },
          { qty: 7000, value: 1750000 },
          { qty: 7000, value: 1750000 },
        ],
      },
    ];

    setDataSource(data);
  }, []);

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
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white ">
                {/* First header row for Sale Territory Names */}
                <thead>
                  <tr className="text-white">
                    <th colSpan="4" className=" bg-[#00783F]">
                      Sale Territory Name
                    </th>
                    <th colSpan="2" className=" bg-[#009845]">
                      Manupong Wongpuang
                    </th>
                    <th colSpan="2" className=" bg-[#00783F]">
                      Phaisan Jethuen
                    </th>
                    <th colSpan="2" className="  bg-[#009845]">
                      Kornkan Induang
                    </th>
                    <th colSpan="2" className=" bg-[#00783F]">
                      Kriangkrai Kraikaew
                    </th>
                  </tr>
                </thead>

                {/* Second header row for Territories and Totals */}
                <thead>
                  <tr className="bg-gray-200">
                    <th colSpan="4" className=" ">
                      Territory
                    </th>
                    <th colSpan="2" className=" ">
                      Lower North
                    </th>
                    <th colSpan="2" className=" ">
                      Left Lower North
                    </th>
                    <th colSpan="2" className=" ">
                      Left North
                    </th>
                    <th colSpan="2" className=" ">
                      Central Left North
                    </th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th colSpan="4" className=" ">
                      Sale Plan (THB)
                    </th>
                    <th colSpan="2" className=" ">
                      <Input
                        defaultValue={50750000}
                        className="w-full text-center"
                      />
                    </th>
                    <th colSpan="2" className=" ">
                      <Input
                        defaultValue={63325000}
                        className="w-full text-center"
                      />
                    </th>
                    <th colSpan="2" className=" ">
                      <Input
                        defaultValue={26525000}
                        className="w-full text-center"
                      />
                    </th>
                    <th colSpan="2" className=" ">
                      <Input
                        defaultValue={64650000}
                        className="w-full text-center"
                      />
                    </th>
                  </tr>
                </thead>

                {/* Main header for Product details */}
                <thead>
                  <tr className="bg-green-700 text-white">
                    <th className="bg-[#00783F]">Product Name</th>
                    <th className="bg-[#00783F]">Pack Size</th>
                    <th className="bg-[#00783F]">Original Plan</th>
                    <th className="bg-[#00783F]">Value (THB)</th>
                    <th className="bg-[#009845]">Qty (KG)</th>
                    <th className="bg-[#009845]">Value (THB)</th>
                    <th className="bg-[#00783F]">Qty (KG)</th>
                    <th className="bg-[#00783F]">Value (THB)</th>
                    <th className="bg-[#009845]">Qty (KG)</th>
                    <th className="bg-[#009845]">Value (THB)</th>
                    <th className="bg-[#00783F]">Qty (KG)</th>
                    <th className="bg-[#00783F]">Value (THB)</th>
                  </tr>
                </thead>

                {/* Table body with product rows */}
                <tbody>
                  {dataSource.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="  text-center">{item.productName}</td>
                      <td className="  text-center">{item.packSize}</td>
                      <td className=" ">
                        <Input
                          defaultValue={item.originalPlan}
                          className="w-full text-center"
                        />
                      </td>
                      <td className=" ">
                        <Input
                          defaultValue={item.valueThb}
                          className="w-full text-center"
                        />
                      </td>
                      {item.quantities.map((q, idx) => (
                        <React.Fragment key={idx}>
                          <td className=" ">
                            <Input
                              defaultValue={q.qty}
                              className="w-full text-center"
                            />
                          </td>
                          <td className=" ">
                            <Input
                              defaultValue={q.value}
                              className="w-full text-center"
                            />
                          </td>
                        </React.Fragment>
                      ))}
                    </tr>
                  ))}
                </tbody>

                {/* Footer row for Totals */}
                <tbody>
                  <tr className="bg-gray-200">
                    <td
                      colSpan="2"
                      className="py-2 px-4 text-center font-semibold "
                    >
                      Total (THB)
                    </td>
                    <td className="py-2 px-4 ">
                      {/* Example total input; replace with dynamic calculation as needed */}
                      <Input
                        defaultValue={50750000}
                        className="w-full text-center"
                      />
                    </td>
                    {/* Add cells for other total values here */}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </BoxPrimary>

        <div className="flex justify-end space-x-4">
          <ActionButton
            text="Back"
            mode="back"
            onClick={() => {
              navigate("/sale-plan/work-plan/create");
            }}
          />
          <ActionButton
            text="Save Draft"
            mode="saveDraft"
            onClick={() => navigate("/sale-plan/work-plan")}
          />

          <ActionButton
            text="Save and Next"
            mode="save"
            onClick={() => navigate("/sale-plan/work-plan")}
          />
        </div>
      </MainLayout>
    </>
  );
}
