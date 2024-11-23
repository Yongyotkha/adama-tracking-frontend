import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown } from "antd";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import CalendarActivityApp from "../../../components/calendar/calendarActivity";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import TableExpand from "../../../components/table/TableExpand";

export default function ActivityPlanList() {
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const navigate = useNavigate();

    const filters = [
        {
            key: "dealer",
            type: 'select',
            label: "Dealer",
            placeholder: "All",
            options: [
                { value: 'Dealer A', label: 'Dealer A' }
            ],
        },
        {
            key: "Date",
            type: 'date',
            label: "Date",
        },
        {
            key: "status",
            type: 'select',
            label: "Status",
            placeholder: "All",
            options: [
                { value: 'Active', label: 'Active' },
                { value: 'InActive', label: 'InActive' }
            ],
        },
    ];

    const handleSearch = (filter) => {
        console.log("Search filters applied:", filter);
    };

    const handleClear = () => {
        console.log("Filters cleared");
    };

    const actionItems = [
        { key: "1", label: <ItemDropDown mode="create" link="/activity/create" /> },
        { key: "2", label: <ItemDropDown mode="edit" link="/activity/edit" /> },
        { key: "3", label: <ItemDropDown mode="delete" link="#" /> },
    ];

    const actionSubItems = [
        { key: "1", label: <ItemDropDown mode="edit" link="/activity/edit" /> },
    ];


    const header = [
        { title: "Dealer", width: 150, dataIndex: "dealer", align: "start" },
        { title: "Work Plan (THB)", width: 150, dataIndex: "workPlan", align: "start" },
        { title: "Last Modifiled", width: 150, dataIndex: "lastModifiled", align: "start" },
        { title: "Status", width: 100, dataIndex: "status", align: "start" },
        { title: "Action", width: 100, dataIndex: "action", align: "center" },
    ];

    useEffect(() => {
        const dataSource = [
            {
                key: 1,
                dealer: "Chaifar",
                workPlan: "10,150,000",
                lastModifiled: "2024-02-01",
                status: <BadgeStatus text="Waiting for create" bgColor="#F89E18" textColor="#FFFFFF" />,
                action: (
                    <Dropdown menu={{ items: actionItems }} placement="bottomRight">
                        <a onClick={(e) => e.preventDefault()}>
                        <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
                        </a>
                    </Dropdown>
                ),
                nestedData: [
                    {
                        key: "1-1",
                        no: "1",
                        subDealer: "On Shop",
                        value: "10,150,000",
                        status: <BadgeStatus text="Edit Activity" bgColor="#F89E18" textColor="#FFFFFF" />,
                        action: (
                            <Dropdown menu={{ items: actionSubItems }} placement="bottomRight">
                                <a onClick={(e) => e.preventDefault()}>
                                <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
                                </a>
                            </Dropdown>
                        ),
                    },
                ],
            },
            {
                key: 2,
                dealer: "Chaifar",
                workPlan: "10,150,000",
                lastModifiled: "2024-02-01",
                status: <BadgeStatus text="Completed" bgColor="#009845" textColor="#FFFFFF" />,
                action: (
                    <Dropdown menu={{ items: actionItems }} placement="bottomRight">
                        <a onClick={(e) => e.preventDefault()}>
                        <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
                        </a>
                    </Dropdown>
                ),
            },
            {
                key: 3,
                dealer: "Chaifar",
                workPlan: "10,150,000",
                lastModifiled: "2024-02-01",
                status: <BadgeStatus text="Completed" bgColor="#009845" textColor="#FFFFFF" />,
                action: (
                    <Dropdown menu={{ items: actionItems }} placement="bottomRight">
                        <a onClick={(e) => e.preventDefault()}>
                        <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
                        </a>
                    </Dropdown>
                ),
            },
        ];

        setDataSource(dataSource);
    }, []);

    const nestedColumns = [
        { title: "No", width: 50, dataIndex: "no", align: "start" },
        { title: "Sub Dealer", width: 150, dataIndex: "subDealer", align: "start" },
        { title: "Value (THB)", width: 150, dataIndex: "value", align: "start" },
        { title: "Status", width: 100, dataIndex: "status", align: "start" },
        { title: "Action", width: 100, dataIndex: "action", align: "center" },
    ];

    // Example events passed via props
    const events = {
        "2024-11-01": [
            { id: 1, title: "Meeting", color: "purple", icons: ["👩‍👩‍👧👩‍👩‍👧👩‍👩‍👧", "+3"], type: "ribbon" },
            { id: 2, title: "Meeting", color: "red", icons: ["👩‍👩‍👧", "+2"], type: "ribbon" },
            { id: 3, title: "Meeting", color: "green", icons: ["👩‍👩‍👧", "+1"], type: "ribbon" },
            { id: 4, title: "Meeting", color: "blue", icons: ["👩‍👩‍👧", "+3"], type: "ribbon" },
        ],
        "2024-11-07": [
            { id: 1, color: "red", icons: ["⭐"], type: "badge" },
            { id: 2, color: "blue", icons: ["📹"], type: "badge" },
            { id: 3, color: "green", icons: ["➕"], type: "badge" },
            { id: 4, color: "orange", icons: ["🍊"], type: "badge" },
            { id: 5, title: "Visit", color: "purple", icons: ["👨‍👩‍👦"], type: "ribbon" },
        ],
    };

    return (
        <MainLayout loading={loading}>

            <div className="flex items-center justify-between">
                <div className="title-page">Activity Plan</div>
            </div>

            <div style={{ padding: "0px" }}>
                <CalendarActivityApp events={events}/>
            </div>

            <Filter
                onSearch={handleSearch}
                onClear={handleClear}
                filters={filters}
            />

            <BoxPrimary>
                <TableExpand data={dataSource} columns={header} nestedColumns={nestedColumns} />
            </BoxPrimary>
        </MainLayout>
    );
}
