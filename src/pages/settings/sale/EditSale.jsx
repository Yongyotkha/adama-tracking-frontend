import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Input } from "antd";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../components/button/ActionButton";
import TableExpand from "../../../components/table/TableExpand";
import DynamicModal from "../../../components/modal/DynamicModal"; // Adjust path if needed
import DynamicButton from "../../../components/button/DynamicButton";
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/corsService";
import { Form } from "antd";
import { AuthContext } from "../../../contexts/AuthContext";
import { useLocation } from "react-router-dom";

const { Option } = Select;

export default function CreateSale() {
  const [loading, setLoading] = useState(false);
  const [isTerritoryModalVisible, setIsTerritoryModalVisible] = useState(false);
  const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);
  const [selectedSalesData, setSelectedSalesData] = useState([]);
  const navigate = useNavigate();
  const { showMsg, showNotification } = useContext(AuthContext);
  const location = useLocation();
  // const id = location.state?.id; // รับค่า id จาก state
  const [id, setId] = useState(location.state?.id);
  const [formFields, setFormFields] = useState([]);
  const [userList, setUserList] = useState([]);
  const [salesDataTeam, setSalesDataTeam] = useState([]);
  const [saleManagementHeaderId, setSaleManagementHeaderId] = useState(null);
  const [saleManagementId, setSaleManagementId] = useState(null);
  const [saleHeads, setSaleHeads] = useState([]); // สำหรับ Sale Head
  const [saleAreas, setSaleAreas] = useState([]); // สำหรับ Sale Area
  const [selectedSaleHead, setSelectedSaleHead] = useState(null); // เก็บค่าที่เลือกจาก Sale Head
  const [selectedSaleArea, setSelectedSaleArea] = useState(null); // เก็บค่าที่เลือกจาก Sale Area
  const [defaultSaleHead, setDefaultSaleHead] = useState(null);
  const [defaultSaleArea, setDefaultSaleArea] = useState(null);
  const [permission, setPermission] = useState({});

  useEffect(() => {
    fetchData();
    fetchSaleHeads();
    fetchSaleAreas();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const requestData = {
        platform: "web",
        sale_management_id: id,
      };
      const response = await useServiceAPI.get(
        `${paths.pathSaleManagementDetail}`,
        requestData
      );

      if (response.status === 200) {
        const { data } = response;
        setSaleManagementId(id);
        setPermission(data.permission); 
               
        const transformedData = data.items.map((item, index) => ({
          key: item.sale_management_header_id,
          no: index + 1,
          name: item.name,
          position: item.position_name,
          territory: item.territory_name,
          actionmain: (
            <>
              {permission?.edit !== false && (
                <DynamicButton
                  iconSrc="/img/icons/create.png"
                  onClick={() =>
                    handleOpenTeamModal(
                      data.area_id,
                      item.position_id,
                      item.department_id,
                      item.sale_management_header_id
                    )
                  }
                />
              )}
            {
              permission?.view !== false && ( 
                <DynamicButton
                iconSrc="/img/icons/delete.png"
                onClick={() => handleDelete(item.sale_management_header_id)}
              />
            )}
            </>
          ),

          nestedData: item.sub_items.map((subItem, index) => ({
            key: subItem.sale_management_item_id,
            no: index + 1,
            name: subItem.name,
            position: subItem.position_name,
            territory: subItem.territory_name,
            actionsubitem: (
              <>
                <DynamicButton
                  iconSrc="/img/icons/delete.png"
                  onClick={() =>
                    handleDeleteItem(subItem.sale_management_item_id)
                  }
                />
              </>
            ),
          })),
        }));

        setSelectedSalesData(transformedData);
      } else {
        console.error("Failed to fetch promotion details:", response.message);
      }
    } catch (error) {
      console.error("Error fetching promotion details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserList = async (page_size = 20, page_length = 1) => {
    setLoading(true);
    const requestData = {
      platform: "web",
      page_size,
      page_length,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathMasterUserlist,
        requestData
      );

      if (response.status === 200) {
        const Test = response.data.data;        
        const territoryData = Test.map((item, index) => ({
          key: index + 1,
          name: item.name,
          territory: item.territory_name,
          position: item.position_name,
        }));
        setUserList(territoryData);
      }
      
    } catch (error) {
      console.error("Error fetching user list:", error);
    } finally {
      setLoading(false);
    }
  };

  // const salesDataTeam = [
  //   { key: "1", no: 1, name: "Passakorn Kong-In", position: "Sales Assistant", territory: "Right North" },
  //   { key: "2", no: 2, name: "Tossaphon Suphaksitthikorn", position: "Business Development Executive", territory: "Right Lower North" },
  //   { key: "3", no: 3, name: "Panudech Srithong", position: "Business Development Executive", territory: "Upper Central" },
  //   { key: "4", no: 4, name: "Sarawut Nisap", position: "Business Development Executive", territory: "Central" },
  //   { key: "5", no: 5, name: "Tanadol Kaewyai", position: "Sales Assistant", territory: "Central" },
  //   { key: "6", no: 6, name: "Thanakit Kongkrapan", position: "Sales Assistant", territory: "West" },
  //   { key: "7", no: 7, name: "Wisisak Prakobsin", position: "Business Development Executive", territory: "South" },
  //   { key: "8", no: 8, name: "Chinnawat Bunmakaew", position: "Sales Assistant", territory: "South" },
  //   // Add more entries if needed
  // ];


  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      width: 200,
    },
    {
      title: "Territory",
      dataIndex: "territory",
      key: "territory",
      width: 150,
    },
    {
      title: "Action",
      dataIndex: "actionmain",
      key: "actionmain",
      width: 100,
    },
  ];

  // Define the nested table columns
  const nestedColumns = [
    { title: "No", dataIndex: "no", key: "no", width: 80 },
    { title: "Name", dataIndex: "name", key: "name", width: 150 },
    { title: "Position", dataIndex: "position", key: "position", width: 200 },
    { title: "Territory",dataIndex: "territory", key: "territory", width: 150,},
    { title: "Action", dataIndex: "actionsubitem", key: "action", width: 100,
      // render: (_, nestedRecord) => (
      //   <DynamicButton iconSrc="/img/icons/delete.png" onClick={() => handleDelete(nestedRecord.key)} />
      // ),
    },
  ];

  const handleOpenTerritoryModal = async () => {
    await fetchUserList(); // ดึงข้อมูลผู้ใช้ก่อนเปิดโมดอล
    setIsTerritoryModalVisible(true); // แสดงโมดอลหลังข้อมูลพร้อม
  };

  // const handleOpenTeamModal = () => {
  //   setIsTeamModalVisible(true);
  // };

  const handleOpenTeamModal = async (
    area,
    positionId,
    departmentId,
    sale_management_header_id,
    pageSize = 1,
    pageLength = 10
  ) => {
    const saleManagementHeaderId = sale_management_header_id;
    setSaleManagementHeaderId(saleManagementHeaderId);
    setLoading(true);
    try {
      const requestData = {
        platform: "web",
        area_id: area,
        role_id: [positionId, departmentId],
        page_size: pageSize,
        page_length: pageLength,
      };
      const response = await useServiceAPI.get(
        `${paths.pathMasterUserlist}`,
        requestData
      );

      if (response.status === 200) {
        const userData = response.data.data; // Extract user data
        const filteredUserData = userData.filter(
          (user) => !user.is_assign_sale
        );
        const updatedSalesDataTeam = filteredUserData.map((user, index) => ({
          key: user.id,
          no: index + 1,
          name: user.name,
          position: user.position_name,
          territory: user.territory_name,
          is_assign_sale: user.is_assign_sale,
          sale_management_id: user.id,
        }));

        setSalesDataTeam(updatedSalesDataTeam);
        setIsTeamModalVisible(true);
      } else {
        console.error("Failed to fetch user list:", response.message);
        showMsg("error", response.message || "Failed to fetch user list.");
      }
    } catch (error) {
      console.error("Error fetching user list:", error);
      showMsg("error", "An error occurred while fetching user list.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTerritoryModal = () => {
    setIsTerritoryModalVisible(false);
  };

  const handleCloseTeamModal = () => {
    setIsTeamModalVisible(false);
  };

  const handleAddSelectedRows = (selectedRows) => {
    const updatedRows = selectedRows.map((row) => ({
      ...row,
      sale_management_id: saleManagementId,
      sale_management_header_id: saleManagementHeaderId,
      sub_user_id: row.key,
    }));

    saveSelectedRows(updatedRows);
    setSelectedSalesData((prev) => [...prev, ...updatedRows]);
  };

  const saveSelectedRows = async (rows) => {
    try {
      const groupedData = rows.reduce((acc, row) => {
        const { sale_management_id, sale_management_header_id, sub_user_id } =
          row;
        const existing = acc.find(
          (item) =>
            item.sale_management_id === sale_management_id &&
            item.sale_management_header_id === sale_management_header_id
        );

        if (existing) {
          existing.sub_user_id.push(sub_user_id);
        } else {
          acc.push({
            sale_management_id,
            sale_management_header_id,
            sub_user_id: [sub_user_id],
          });
        }

        return acc;
      }, []);
      const requestData = groupedData[0];
      const response = await useServiceAPI.post(
        paths.pathSaleManagementCreate,
        requestData
      );
      if (response.status === 200) {
        fetchData();
        showNotification(
          "success",
          response.data.message,
          response.data.message_line
        );
      } else {
        console.error("Failed to save data:", response.message);
        showNotification("error", response.message, response.message_line);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      showNotification("error", response.message, response.message_line);
    }
  };

  const handleDelete = async (record) => {
    try {
      const requestData = {
        sale_management_header_id: record, // ส่ง ID ที่ต้องการลบ
      };

      const response = await useServiceAPI.delete(
        paths.pathSaleManagementDeleteSub,
        requestData
      );

      if (response.status === 200) {
        fetchData();
        showNotification(
          "success",
          response.data.message,
          response.data.message_line
        );
      } else {
        console.error("Failed to delete record:", response.message);
        showNotification("error", response.message, response.message_line);
      }
    } catch (error) {
      console.error("Error deleting record:", error);

      showNotification("error", error.message, error.message_line);
    }
  };

  const handleDeleteItem = async (record) => {
    try {
      const requestData = {
        sale_management_items_id: record, // ส่ง ID ที่ต้องการลบ
      };

      const response = await useServiceAPI.delete(
        paths.pathSaleManagementDeleteSubItem,
        requestData
      );

      if (response.status === 200) {
        fetchData();
        // showMsg("success", "Record deleted successfully.");
        showNotification(
          "success",
          response.data.message,
          response.data.message_line
        );
      } else {
        console.error("Failed to delete record:", response.message);
        showNotification("error", response.message, response.message_line);
      }
    } catch (error) {
      console.error("Error deleting record:", error);

      showNotification("error", error.message, error.message_line);
    }
  };

  const fetchSaleHeads = async () => {
    try {
      const response = await useServiceAPI.get(paths.pathMasterHeadofsale);
      if (response.status === 200) {
        const saleHeadData = response.data.map((item) => ({
          value: item.id, // สมมติว่ามี id ในข้อมูล
          label: item.name, // สมมติว่ามี name ในข้อมูล
        }));
        setSaleHeads(saleHeadData);

        // เซ็ตค่า default
        if (response.data.length > 0) {
          setDefaultSaleHead(response.data[0].id); // เลือกอันแรกเป็น default
          setSelectedSaleHead(response.data[0].id); // เซ็ต selected value
        }
      } else {
        console.error("Failed to fetch Sale Heads:", response.message);
      }
    } catch (error) {
      console.error("Error fetching Sale Heads:", error);
    }
  };

  const fetchSaleAreas = async () => {
    try {
      const response = await useServiceAPI.get(paths.pathMasterSalearea);
      if (response.status === 200) {
        const saleAreaData = response.data.map((item) => ({
          value: item.id, // สมมติว่ามี id ในข้อมูล
          label: item.name, // สมมติว่ามี name ในข้อมูล
        }));
        setSaleAreas(saleAreaData);

        // เซ็ตค่า default
        if (response.data.length > 0) {
          setDefaultSaleArea(response.data[0].id); // เลือกอันแรกเป็น default
          setSelectedSaleArea(response.data[0].id); // เซ็ต selected value
        }
      } else {
        console.error("Failed to fetch Sale Areas:", response.message);
      }
    } catch (error) {
      console.error("Error fetching Sale Areas:", error);
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Edit Sale Management</div>

      <BoxPrimary>
        <div className="grid gap-4 mb-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
          <div>
            <label className="block mb-1 text-sm text-gray-600">
              Sale Head
            </label>
            <Select
              value={selectedSaleHead}
              defaultValue={defaultSaleHead}
              className="w-full"
              placeholder="Select Sale Head"
              onChange={(value) => setSelectedSaleHead(value)}
            >
              {saleHeads.map((head) => (
                <Option key={head.value} value={head.value}>
                  {head.label}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-600">
              Sale Area
            </label>
            <Select
              value={selectedSaleArea}
              defaultValue={defaultSaleArea}
              className="w-full"
              placeholder="Select Sale Area"
              onChange={(value) => setSelectedSaleArea(value)}
            >
              {saleAreas.map((area) => (
                <Option key={area.value} value={area.value}>
                  {area.label}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-600">Area</label>
            <Input defaultValue="Area 1" disabled className="w-full" />
          </div>
        </div>
      </BoxPrimary>

      <BoxPrimary>
        <div className="flex justify-between space-x-4 mb-3">
          <span className="text-[#00783F] text-lg font-semibold">
            Sale Team
          </span>
          <div className="flex space-x-2">
            {/* <ActionButton
              mode="add"
              text="Add"
              onClick={handleOpenTerritoryModal}
            /> */}
            {
              permission.btn_add !== false && ( 
              <ActionButton
                mode="add"
                text="Add"
                onClick={handleOpenTerritoryModal}
              />
            )}


          </div>
          
        </div>

        <TableExpand
          data={selectedSalesData}
          columns={columns}
          nestedColumns={nestedColumns}
        />
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/setting/sale")}
        />
      {
        permission.btn_save !== false && ( 
        <ActionButton
          mode="save"
          text="Save"
          onClick={() => navigate("/setting/sale")}
        />
      )}
      </div>

      {/* Modal for Add Sale Territory */}
      <DynamicModal
        title="Add Sale Territory"
        isVisible={isTerritoryModalVisible}
        onClose={handleCloseTerritoryModal}
        header={[
          { title: "No", dataIndex: "no", key: "no", width: 50 },
          { title: "Name", dataIndex: "name", key: "name", width: 150 },
          {
            title: "Territory",
            dataIndex: "territory",
            key: "territory",
            width: 150,
          },
          {
            title: "Position",
            dataIndex: "position",
            key: "position",
            width: 150,
          },
        ]}
        dataSource={userList}
        width="1200px"
        onAddSelected={handleAddSelectedRows}
        type="add"
      />

      {/* Modal for Add Sale Team */}
      <DynamicModal
        title="Add Sale Team"
        isVisible={isTeamModalVisible}
        onClose={handleCloseTeamModal}
        header={[
          { title: "No", dataIndex: "no", key: "no", width: 50 },
          { title: "Name", dataIndex: "name", key: "name", width: 150 },
          {
            title: "Territory",
            dataIndex: "territory",
            key: "territory",
            width: 150,
          },
          {
            title: "Position",
            dataIndex: "position",
            key: "position",
            width: 150,
          },
        ]}
        dataSource={salesDataTeam}
        width="1200px"
        onAddSelected={handleAddSelectedRows}
        type="add"
      />
    </MainLayout>
  );
}
