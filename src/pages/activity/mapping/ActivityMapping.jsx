import React, { useState, useEffect, useMemo, useRef, useContext } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { Layout, Checkbox, Button, Collapse } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import MainLayout from "../../../layouts/MainLayout";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import DynamicAutoComplete from "../../../components/autocomplete/DynamicAutoComplete";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import FormMappingModal from "../../../components/modal/FormMappingModal";

export default function ActivityMapping() {
  const { Content } = Layout;
  const { Panel } = Collapse;

  const [loading, setLoading] = useState(false);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [checkedFilters, setCheckedFilters] = useState({});
  const [isAllChecked, setIsAllChecked] = useState(true);
  const { showNotification, showMsg } = useContext(AuthContext);
  const [dataApiKey] = useState("AIzaSyDUeNLdnx0CqDtfCXRywGdcizCnBVCdwik");

  const [dataMapping, setDataMapping] = useState([]);
  const [activityType, setActivityType] = useState([]);
  const [dataSales, setDataSales] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [dataSubDealer, setDataSubDealer] = useState([]);
  const [dataArea, setDataArea] = useState([]);
  const [dataYear, setDataYear] = useState([]);
  const [dataMonths, setDataMonths] = useState([]);
  const [dataUserStructure, setDataUserStructure] = useState([]);

  const [locations, setLocations] = useState([]);
  const [locationMarkerIcon, setLocationMarkerIcon] = useState([]);
  const [locationWindowInfo, setlocationWindowInfo] = useState(null);

  const [isMappingModalVisible, setIsMappingModalVisible] = useState(false);
  const [mappingData, setMappingData] = useState({});
  const [perceptionData, setPerceptionData] = useState([]);

  const [dataMapZoom, setDataMapZoom] = useState(6);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 15.33899,
    lng: 101.09336,
  });

  const [searchOptions, setSearchOptions] = useState([]);
  const renderCount = useRef(0);

  const mapContainerStyle = useMemo(() => ({ width: "100%", height: "100vh" }), []);

  const uniqById = (arr = []) =>
    [...new Map(arr.map((item) => [String(item.id), item])).values()];

  const getSaleTeamIds = (user) => {
    if (!user) return [];

    const saleTeam = Array.isArray(user.sale_team) ? user.sale_team : [];
    const flatTeamIds = saleTeam.flatMap((group) =>
      Array.isArray(group)
        ? group.map((id) => Number(id)).filter(Boolean)
        : [Number(group)].filter(Boolean)
    );

    const selfId = Number(user.sale_id);

    return [...new Set([selfId, ...flatTeamIds].filter(Boolean))];
  };

  const getExpandedSelectedSales = (selectedSales = [], userStructure = []) => {
    const selectedSaleNums = selectedSales.map((id) => Number(id)).filter(Boolean);

    return [
      ...new Set(
        userStructure
          .filter((user) => selectedSaleNums.includes(Number(user.sale_id)))
          .flatMap((user) => getSaleTeamIds(user))
      ),
    ];
  };

  const openMappingModal = (data) => {
    setMappingData(data);
    setIsMappingModalVisible(true);
  };

  const mockFilters = useMemo(
    () => [
      { key: 1, filter_type: "activity_type", filter_type_name: "Activity Type", data: activityType },
      { key: 6, filter_type: "sales", filter_type_name: "Sales", data: dataSales },
      { key: 2, filter_type: "dealer", filter_type_name: "Dealer", data: dataDealer },
      { key: 3, filter_type: "sub_dealers", filter_type_name: "Sub Dealer", data: dataSubDealer },
      { key: 4, filter_type: "year", filter_type_name: "Years", data: dataYear },
      { key: 5, filter_type: "month", filter_type_name: "Months", data: dataMonths },
    ],
    [activityType, dataSales, dataDealer, dataSubDealer, dataYear, dataMonths]
  );

  useEffect(() => {
    const fetchPerception = async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterPerception, {});
        setPerceptionData(res.data || []);
      } catch (error) {
        console.error("Failed to load perception data:", error);
      }
    };

    fetchPerception();
  }, []);

  useEffect(() => {
    if (!dataUserStructure?.length) return;

    const expandedSaleIds = getExpandedSelectedSales(checkedFilters.sales || [], dataUserStructure);

    const matchedDealers = dataUserStructure
      .filter((user) => expandedSaleIds.includes(Number(user.sale_id)))
      .flatMap((user) =>
        (user.dealers || []).map((d) => ({
          id: d.dealer_id,
          name: d.name,
        }))
      );

    const uniqueDealers = uniqById(matchedDealers).sort((a, b) => a.name.localeCompare(b.name));

    setDataDealer(uniqueDealers);

    setCheckedFilters((prev) => ({
      ...prev,
      dealer: uniqueDealers.map((d) => d.id),
    }));
  }, [checkedFilters.sales, dataUserStructure]);

  useEffect(() => {
    if (!dataUserStructure?.length) return;

    const selectedDealers = (checkedFilters.dealer || []).map(String);

    const matchedSubDealers = dataUserStructure
      .flatMap((u) => u.dealers || [])
      .filter((d) => selectedDealers.includes(String(d.dealer_id)))
      .flatMap((d) =>
        (d.sub_dealer || []).map((s) => ({
          id: s.id,
          name: s.name,
        }))
      );

    const uniqueSubs = uniqById(matchedSubDealers).sort((a, b) => a.name.localeCompare(b.name));

    setDataSubDealer(uniqueSubs);

    setCheckedFilters((prev) => ({
      ...prev,
      sub_dealers: uniqueSubs.map((s) => s.id),
    }));
  }, [checkedFilters.dealer, dataUserStructure]);

  useEffect(() => {
    const loadFirst = async () => {
      setLoading(true);

      try {
        const [mapping, activity, userStruck, areas, years, months] = await Promise.all([
          useServiceAPI.post(paths.pathActivityMapList, {
            keyword: "",
            activity_type: [],
            dealer: [],
            area: [],
            year: [],
            sub_dealers: [],
            month: [],
          }),
          useServiceAPI.get(paths.pathMasterActivityType, {}),
          useServiceAPI.get(paths.pathMasterUserStruck, {}),
          useServiceAPI.get(paths.pathMasterAreas, {}),
          useServiceAPI.get(paths.pathMasterYear, {}),
          useServiceAPI.get(paths.pathMasterMonths, {}),
        ]);

        const userStructure = userStruck.data || [];

        setDataMapping(mapping.data || []);
        setActivityType(activity.data || []);
        setDataUserStructure(userStructure);
        setDataArea(areas.data || []);
        setDataYear(years.data || []);
        setDataMonths(months.data || []);

        const salesList = userStructure.map((u, idx) => ({
          key: idx,
          id: u.sale_id,
          name: u.name,
        }));

        const dealerList = userStructure.flatMap((u) =>
          (u.dealers || []).map((d) => ({
            id: d.dealer_id,
            name: d.name,
          }))
        );

        const subDealerList = userStructure.flatMap((u) =>
          (u.dealers || []).flatMap((d) =>
            (d.sub_dealer || []).map((s) => ({
              id: s.id,
              name: s.name,
            }))
          )
        );

        const uniqDealer = uniqById(dealerList).sort((a, b) => a.name.localeCompare(b.name));
        const uniqSub = uniqById(subDealerList).sort((a, b) => a.name.localeCompare(b.name));

        setDataSales(salesList);
        setDataDealer(uniqDealer);
        setDataSubDealer(uniqSub);

        const yearList = years.data || [];
        const latestYearId =
          yearList.length > 0
            ? [...yearList].sort((a, b) => {
              const ay = Number(String(a.name ?? a.id).replace(/\D/g, "")) || 0;
              const by = Number(String(b.name ?? b.id).replace(/\D/g, "")) || 0;
              return by - ay;
            })[0]?.id
            : null;

        const initialFilters = {
          activity_type: (activity.data || []).map((i) => i.id),
          sales: salesList.map((i) => i.id),
          dealer: uniqDealer.map((i) => i.id),
          sub_dealers: uniqSub.map((i) => i.id),
          year: latestYearId ? [latestYearId] : [],
          month: (months.data || []).map((i) => i.id),
          area: (areas.data || []).map((i) => i.id),
        };

        setCheckedFilters(initialFilters);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadFirst();
  }, []);

  const loadDataMappingList = async (filters) => {
    setLoading(true);

    try {
      const activityTypeIds = Array.isArray(filters.activity_type) ? filters.activity_type : [];
      const selectedSales = Array.isArray(filters.sales) ? filters.sales : [];
      const subDealerIds = Array.isArray(filters.sub_dealers) ? filters.sub_dealers : [];
      const yearIds = Array.isArray(filters.year) ? filters.year.map(String) : [];
      const monthIds = Array.isArray(filters.month) ? filters.month.map(String) : [];

      if (activityTypeIds.length === 0 || yearIds.length === 0) {
        setLocations([]);
        setlocationWindowInfo(null);
        return;
      }

      const expandedSaleIds = getExpandedSelectedSales(selectedSales, dataUserStructure);

      let filtered = dataMapping || [];

      if (expandedSaleIds.length > 0) {
        filtered = filtered.filter((item) => {
          const itemSaleId = Number(item.sale_id ?? item.user_id);
          return expandedSaleIds.includes(itemSaleId);
        });
      } else {
        filtered = [];
      }

      filtered = filtered.filter((item) => {
        const itemYear = String(item.year ?? new Date(item.document_date).getFullYear());
        return yearIds.includes(itemYear);
      });

      if (subDealerIds.length > 0) {
        filtered = filtered.filter((item) =>
          subDealerIds.map(String).includes(String(item.sub_dealer_id))
        );
      }

      filtered = filtered.filter((item) =>
        activityTypeIds.map(String).includes(String(item.activity_type_id))
      );

      if (monthIds.length > 0) {
        filtered = filtered.filter((item) => {
          const docMonth = new Date(item.document_date).getMonth() + 1;
          return monthIds.includes(String(docMonth));
        });
      }

      setLocations(
        filtered.map((d, idx) => ({
          ...d,
          key: idx + 1,
          id: idx + 1,
          document_number: d.document_number,
          lat: parseFloat(d.location_latitude),
          lng: parseFloat(d.location_longitude),
          address: d.location_address,
          remark: d.remark ?? "",
          description: d.description,
          activity_type_id: d.activity_type_id,
          activity_type_name: d.activity_type_name,
          dealer_id: d.dealer_id,
          dealer_name: d.dealer_name,
          area_id: d.area_id,
          area_name: d.area_name,
          year: d.year,
          activity_image: d.activity_image,
          activity_image_location: d.activity_image_location,
          crop_id_list: d.crop_id_list,
          document_date_display: d.document_date_display,
          assing_user_list: d.assing_user_list ?? [],
          sub_dealer_id: d.sub_dealer_id,
          sub_dealer_name: d.sub_dealer_name,
          sale_id: d.sale_id ?? d.user_id,
          status_mapping: d.status_mapping || {
            name: d.status_mapping_name,
            color: d.status_mapping_color,
            background: d.status_mapping_bg_color,
          },
          status_code: d.status_code,
          status_mapping_name: d.status_mapping_name,
          status_mapping_color: d.status_mapping_color,
          status_mapping_bg_color: d.status_mapping_bg_color,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtersReady = mockFilters.every((f) => Array.isArray(f.data) && f.data.length > 0);

    if (!filtersReady || !dataMapping?.length) {
      setLocations([]);
      return;
    }

    loadDataMappingList(checkedFilters);
  }, [checkedFilters, mockFilters, dataMapping, dataUserStructure]);

  useEffect(() => {
    if (locations.length > 0) {
      setLocationMarkerIcon(
        locations.map((d, idx) => ({
          ...d,
          key: idx + 1,
          lat: d.lat,
          lng: d.lng,
        }))
      );
    } else {
      setLocationMarkerIcon([]);
    }
  }, [locations]);

  const toggleAll = (isChecked) => {
    if (!isChecked) {
      setCheckedFilters({});
      setIsAllChecked(false);
      setLocations([]);
      return;
    }

    const updated = {};
    const targetTypes = ["activity_type", "sales", "dealer", "sub_dealers", "year", "month"];

    targetTypes.forEach((t) => {
      const items = mockFilters.find((f) => f.filter_type === t)?.data || [];
      updated[t] = items.map((x) => x.id);
    });

    setCheckedFilters(updated);
    setIsAllChecked(true);
  };

  useEffect(() => {
    const allSelected = mockFilters.every((cat) => {
      const total = (cat.data || []).map((x) => x.id);
      const selected = checkedFilters[cat.filter_type] || [];

      if (total.length === 0) return false;

      return total.every((id) => selected.includes(id));
    });

    setIsAllChecked(allSelected);
  }, [checkedFilters, mockFilters]);

  const handleSearch = (text) => {
    if (!text) {
      setSearchOptions([]);
      return;
    }

    const regex = new RegExp(text, "i");
    const results = (dataMapping || []).filter(
      (item) => item.location_address && regex.test(item.location_address)
    );

    setSearchOptions(
      results.map((item) => ({
        value: item.location_address,
        lat: parseFloat(item.location_latitude),
        lng: parseFloat(item.location_longitude),
      }))
    );
  };

  const handleSelect = (_, option) => {
    setCurrentLocation({ lat: option.lat, lng: option.lng });
    setDataMapZoom(15);
  };

  const handleUpdateMapping = async (data) => {
    const body = {
      id: data.id,
      document_number: data.document_number,
      location_longitude: data.location_longitude,
      location_latitude: data.location_latitude,
      location_address: data.location_address,
      perception_id: data.perception_id,
      remark: data.remark || "",
      image_list: data.image_list || [],
      follow_image_list: data.follow_image_list || [],
      follow_remark: data.follow_remark || "",
    };

    try {
      setLoading(true);

      const res = await useServiceAPI.put(
        paths.pathActivityMappingStatusDetailUpdate,
        body
      );

      setIsMappingModalVisible(false);
      setlocationWindowInfo(null);

      await showNotification(
        "success",
        res?.data?.message || res?.message || "Notification",
        res?.data?.message_line || ["Update successful"]
      );

    } catch (err) {
      console.error("Mapping update failed:", err);
      showMsg("error", err?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout loading={loading}>
      <Layout>
        <div
          className={`absolute z-20 left-5 top-[8.5rem] bg-white shadow-lg rounded-md transition-all duration-300 overflow-hidden ${isFilterCollapsed ? "max-h-12" : "max-h-[600px] overflow-y-auto"
            }`}
          style={{ width: "300px" }}
        >
          <div
            className="sticky top-0 z-[1] bg-white flex justify-between items-center px-4 py-2 border-b cursor-pointer"
            onClick={() => setIsFilterCollapsed((s) => !s)}
          >
            <div className="flex items-center gap-2">
              <img src="/img/icons/filter-green.png" alt="Filter Icon" className="w-5 h-5" />
              <span className="text-lg text-[#00783F]">Filter</span>
            </div>

            <Button type="text" icon={isFilterCollapsed ? <DownOutlined /> : <UpOutlined />} />
          </div>

          <div className="w-full my-2 px-2">
            <DynamicAutoComplete
              options={searchOptions}
              placeholder="Search locations (Min length 3)"
              onSearch={handleSearch}
              onSelect={handleSelect}
              className="w-full rounded-md shadow-sm"
              style={{ width: "100%" }}
            />
          </div>

          <div className={`transition-all duration-300 ${isFilterCollapsed ? "opacity-0" : "opacity-100"} px-3 pb-4`}>
            <div className="flex justify-between">
              <Checkbox checked={isAllChecked} onChange={(e) => toggleAll(e.target.checked)}>
                Check All
              </Checkbox>
            </div>

            <Collapse defaultActiveKey={["Activity Type"]} className="rounded-lg border-0">
              {mockFilters.map((category) => {
                const selected = checkedFilters[category.filter_type] || [];
                const allIds = (category.data || []).map((x) => x.id);
                const checkAll = allIds.length > 0 && selected.length === allIds.length;
                const indeterminate = selected.length > 0 && selected.length < allIds.length;

                const onCheckAllChange = (e) => {
                  const newChecked = e.target.checked ? allIds : [];
                  setCheckedFilters((prev) => ({ ...prev, [category.filter_type]: newChecked }));
                };

                const onGroupChange = (list) => {
                  setCheckedFilters((prev) => ({ ...prev, [category.filter_type]: list }));
                };

                const panelHeader = (
                  <div className="flex justify-between items-center w-full">
                    <span>{category.filter_type_name}</span>
                    <Checkbox
                      indeterminate={indeterminate}
                      checked={checkAll}
                      onChange={onCheckAllChange}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                );

                return (
                  <Panel header={panelHeader} key={category.key} className="custom-collapse my-2">
                    <Checkbox.Group
                      options={(category.data || []).map((item) => ({
                        label: item.name,
                        value: item.id,
                      }))}
                      value={selected}
                      onChange={onGroupChange}
                      className="filter-checkbox-group"
                    />
                  </Panel>
                );
              })}
            </Collapse>
          </div>
        </div>

        <Layout>
          <Content>
            <LoadScript googleMapsApiKey={dataApiKey}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={currentLocation}
                zoom={dataMapZoom}
                options={{
                  styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
                }}
              >
                {locationMarkerIcon.map((loc) => (
                  <Marker
                    key={loc.key}
                    position={{
                      lat: parseFloat(loc.lat),
                      lng: parseFloat(loc.lng),
                    }}
                    icon={{
                      url: loc.activity_image_location,
                      scaledSize: { width: 25.5, height: 35 },
                    }}
                    options={{ suppressInfoWindow: true }}
                    onClick={() => {
                      setlocationWindowInfo({
                        ...loc,
                        url_img: loc.activity_image,
                        lat: parseFloat(loc.lat),
                        lng: parseFloat(loc.lng),
                        title: loc.activity_type_name || "No Activity Type",
                        crop_list: loc.crop_id_list,
                      });
                    }}
                  />
                ))}

                {locationWindowInfo && (
                  <InfoWindow
                    position={{
                      lat: parseFloat(locationWindowInfo.lat),
                      lng: parseFloat(locationWindowInfo.lng),
                    }}
                    onCloseClick={() => setlocationWindowInfo(null)}
                    options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
                  >
                    <div className="min-w-[260px] max-w-[300px] text-[#5f5653]">
                      <div className="text-sm mb-3">
                        {locationWindowInfo.document_date_display || "No Date Available"}
                      </div>

                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src={locationWindowInfo.url_img} className="w-7 h-7 rounded-full" alt="" />

                        <span className="font-semibold text-[#5f5653]">
                          {locationWindowInfo.title}
                        </span>

                        {locationWindowInfo.status_mapping?.name && (
                          <BadgeStatus
                            className="ms-auto cursor-pointer"
                            text={locationWindowInfo.status_mapping.name}
                            textColor={locationWindowInfo.status_mapping.color}
                            bgColor={locationWindowInfo.status_mapping.background}
                            onClick={() => openMappingModal(locationWindowInfo)}
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src="/img/icons/shop.png" className="w-6 h-6" alt="" />
                        {locationWindowInfo.dealer_name || "No Dealer Name"}
                      </div>

                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src="/img/icons/location.png" className="w-6 h-6" alt="" />
                        {locationWindowInfo.sub_dealer_name || "No Sub Dealer"}
                      </div>

                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src="/img/icons/crops.png" className="w-6 h-6" alt="" />
                        {Array.isArray(locationWindowInfo.crop_list) &&
                          locationWindowInfo.crop_list.length > 0
                          ? locationWindowInfo.crop_list.map((c) => c.name).join(", ")
                          : "No Crops Listed"}
                      </div>

                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src="/img/icons/details.png" className="w-6 h-6" alt="" />
                        {locationWindowInfo.remark || "No Description"}
                      </div>

                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        {Array.isArray(locationWindowInfo.assing_user_list) &&
                          locationWindowInfo.assing_user_list.length > 0 ? (
                          locationWindowInfo.assing_user_list.map((user) => (
                            <div key={user.id} className="flex items-center gap-2">
                              <img
                                src={user.profile_image || "/img/icons/default-avatar.png"}
                                alt={user.name}
                                className="w-6 h-6 rounded-full border border-gray-300"
                              />
                              <span className="text-sm text-gray-700">{user.name}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No assigned users</span>
                        )}

                        <img
                          src="/img/icons/view.png"
                          alt="View"
                          className="w-6 h-6 rounded-sm cursor-pointer ms-auto"
                          onClick={() => {
                            const url =
                              `/activity/view?documentNumber=${encodeURIComponent(locationWindowInfo.document_number)}` +
                              `&pageCode=${encodeURIComponent("activity_transaction")}` +
                              `&from=mapping`;
                            window.open(url, "_blank", "noopener,noreferrer");
                          }}
                        />
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          </Content>
        </Layout>
      </Layout>

      <FormMappingModal
        isVisible={isMappingModalVisible}
        onClose={() => setIsMappingModalVisible(false)}
        onOk={handleUpdateMapping}
        title="Mapping"
        dataSource={mappingData}
        perceptionData={perceptionData}
      />
    </MainLayout>
  );
}