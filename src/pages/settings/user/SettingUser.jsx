import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import TableComponent from "../../../components/table/TableComponent";
import { Dropdown } from "antd";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../../services/corsService";
import { paths } from "../../../services/CorsPath";

export default function SettingUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const filters = [
    {
      key: "name",
      type: "select",
      label: "Name",
      options: [
        // { value: "John Doe", label: "John Doe" },
        // { value: "Jane Smith", label: "Jane Smith" },
        // Add more names as options if needed
      ],
    },
    {
      key: "contact_number",
      type: "text",
      label: "Contact Number",
      placeholder: "All",
    },
    {
      key: "position",
      type: "select",
      label: "Position",
      options: [
        // { value: "Manager", label: "Manager" },
        // { value: "Sales Assistant", label: "Sales Assistant" },
        // { value: "Director", label: "Director" },
        // Add more positions as needed
      ],
    },
    {
      key: "role",
      type: "select",
      label: "Role",
      options: [
        // { value: "Admin", label: "Admin" },
        // { value: "User", label: "User" },
        // { value: "Viewer", label: "Viewer" },
        // Add more roles as needed
      ],
    },
  ];

  const handleSearch = (filter) => {
    // console.log("Search filters applied:", filter);
    const filtered = dataSource.filter((user) => {
      const matchesName =
        !filter.name ||
        user.name.toLowerCase().includes(filter.name.toLowerCase());
      const matchesContactNumber =
        !filter.contact_number ||
        user.contact_number.includes(filter.contact_number);
      const matchesPosition =
        !filter.position || user.position === filter.position;
      const matchesRole = !filter.role || user.role === filter.role;

      return (
        matchesName && matchesContactNumber && matchesPosition && matchesRole
      );
    });

    setFilteredUsers(filtered);
  };

  const handleClear = () => {
    // console.log("Filters cleared");
    // Reset search fields
    // setSearch("");

    // Reset filtered data to show all users
    setFilteredUsers(dataSource);
  };

  // Data in Table
  const header = [
    {
      title: "No",
      width: 50,
      dataIndex: "key",
      align: "left",
    },
    {
      title: "Name(EN)",
      width: 100,
      dataIndex: "name",
      align: "left",
    },
    {
      title: "Contact Number",
      width: 100,
      dataIndex: "contact_number",
      align: "left",
    },
    {
      title: "Email",
      width: 100,
      dataIndex: "email",
      align: "left",
    },
    {
      title: "Position",
      width: 100,
      dataIndex: "position",
      align: "left",
    },
    {
      title: "Role",
      width: 100,
      dataIndex: "role",
      align: "left",
    },
    {
      title: "Status",
      width: 100,
      dataIndex: "status",
      align: "left",
    },
    {
      title: "Action",
      width: 100,
      dataIndex: "action",
      align: "left",
    },
  ];

  // Action Option
  const items = [
    {
      key: "1",
      label: (
        <a
          rel="noopener noreferrer"
          href="/setting/user/edit/"
          className="flex gap-1"
        >
          <img
            src="/img/icons/edit.png"
            alt="button icon"
            className="inline-block h-5"
          />
          <span className="text-[#978B87]">Edit</span>
        </a>
      ),
    },
  ];

  // Fetch Data -> Table
  useEffect(() => {
    const body = {};
    useServiceAPI
      .get(paths.pathMasterUsers, body, setLoading)
      .then((response) => {
        if (response.status == 200) {
          const newDataSource = response.data.map((data, index) => ({
            key: index + 1,
            action: (
              <Dropdown
                menu={{
                  items,
                }}
                placement="bottom"
              >
                <a onClick={(e) => e.preventDefault()}>
                  <img
                    src="/img/icons/action.png"
                    alt="button icon"
                    className="inline-block w-5 h-5 mr-2"
                  />
                </a>
              </Dropdown>
            ),
            name: data.name_en,
            status: (
              <BadgeStatus
                text={data.use_flag}
                bgColor="#00783F"
                textColor="#FFFFFF"
              />
            ),
            contact_number: data.username,
            email: data.email,
            position: data.position_name,
            role: data.role_name,
          }));

          setDataSource(newDataSource);
          setFilteredUsers(newDataSource);
        }
      })
      .catch((error) => {
        console.log(error.message);
        setError(error.message);
        if (error.status == 422) {
          showMsg("error", error.message);
        } else {
          showMsg("error", "เกิดข้อผิดพลาด");
        }
      });
  }, []);

  return (
    <>
      <MainLayout loading={loading}>
        <div className="flex items-center justify-between">
          <div className="title-page">Manage Users</div>
          <ActionButton
            mode="sync"
            text="Sync SAP"
            onClick=""
            className="ms-auto me-2"
          />
          <ActionButton
            mode="create"
            text="Create"
            onClick={(e) => navigate("/setting/user/create")}
          />
        </div>

        <Filter
          onSearch={handleSearch}
          onClear={handleClear}
          filters={filters}
        />

        <BoxPrimary>
          <TableComponent header={header} dataSource={filteredUsers} />
        </BoxPrimary>
      </MainLayout>
    </>
  );
}
