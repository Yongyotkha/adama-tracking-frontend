import React, { useState, useEffect, useMemo, useRef } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { Layout, Checkbox, Button, Collapse } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import MainLayout from "../../../layouts/MainLayout";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import DynamicAutoComplete from "../../../components/autocomplete/DynamicAutoComplete";

export default function ActivityMapping() {
  const { Content } = Layout;
  const { Panel } = Collapse;

  const [loading, setLoading] = useState(false);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [checkedFilters, setCheckedFilters] = useState({});
  const [isAllChecked, setIsAllChecked] = useState(true);

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

  const [dataMapZoom, setDataMapZoom] = useState(10);
  const [currentLocation, setCurrentLocation] = useState({ lat: 0.0, lng: 0.0 });
  const [currentLocationAddress] = useState("");

  const [searchOptions, setSearchOptions] = useState([]);
  const renderCount = useRef(0);

  const mapContainerStyle = useMemo(() => ({ width: "100%", height: "100vh" }), []);

  // -----------------------------
  // ✅ Filters model (ประกาศก่อนใช้)
  // -----------------------------
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

  // -----------------------------
  // ✅ Auto-sync: Sales -> Dealer (จาก dataUserStructure)
  // -----------------------------
  useEffect(() => {
    if (!dataUserStructure?.length) return;

    const selectedSales = checkedFilters.sales || [];
    const matchedDealers = dataUserStructure
      .filter((user) => selectedSales.includes(user.sale_id))
      .flatMap((user) => user.dealers.map((d) => ({ id: d.dealer_id, name: d.name })));

    const uniqueDealers = [...new Map(matchedDealers.map((d) => [d.id, d])).values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    setDataDealer(uniqueDealers);

    // ✅ Auto-select dealer ตาม sales
    setCheckedFilters((prev) => ({
      ...prev,
      dealer: uniqueDealers.map((d) => d.id),
    }));
  }, [checkedFilters.sales, dataUserStructure]);

  // -----------------------------
  // ✅ Auto-sync: Dealer -> SubDealer (จาก dataUserStructure)
  // -----------------------------
  useEffect(() => {
    if (!dataUserStructure?.length) return;

    const selectedDealers = checkedFilters.dealer || [];
    const matchedSubDealers = dataUserStructure
      .flatMap((u) => u.dealers)
      .filter((d) => selectedDealers.includes(d.dealer_id))
      .flatMap((d) => d.sub_dealer.map((s) => ({ id: s.id, name: s.name })));

    const uniqueSubs = [...new Map(matchedSubDealers.map((s) => [s.id, s])).values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    setDataSubDealer(uniqueSubs);

    // ✅ Auto-select sub_dealer ตาม dealer
    setCheckedFilters((prev) => ({
      ...prev,
      sub_dealers: uniqueSubs.map((s) => s.id),
    }));
  }, [checkedFilters.dealer, dataUserStructure]);

  // -----------------------------
  // ✅ First load: fetch masters + mapping list
  // -----------------------------
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

        setDataMapping(mapping.data || []);
        setActivityType(activity.data || []);
        setDataUserStructure(userStruck.data || []);
        setDataArea(areas.data || []);
        setDataYear(years.data || []);
        setDataMonths(months.data || []);

        // sales/dealer/subdealer จาก userStruck
        const salesList = (userStruck.data || []).map((u, idx) => ({
          key: idx,
          id: u.sale_id,
          name: u.name,
        }));

        const dealerList = (userStruck.data || []).flatMap((u) =>
          u.dealers.map((d) => ({ id: d.dealer_id, name: d.name }))
        );

        const subDealerList = (userStruck.data || []).flatMap((u) =>
          u.dealers.flatMap((d) => d.sub_dealer.map((s) => ({ id: s.id, name: s.name })))
        );

        const uniqDealer = [...new Map(dealerList.map((x) => [x.id, x])).values()].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        const uniqSub = [...new Map(subDealerList.map((x) => [x.id, x])).values()].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

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
          dealer: dealerList.map((i) => i.id),
          sub_dealers: subDealerList.map((i) => i.id),

          // ✅ latest year
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

  // -----------------------------
  // ✅ Load mapping by filters (client-side filter)
  // -----------------------------
  const loadDataMappingList = async (filters) => {
    setLoading(true);
    try {
      const activityTypeIds = Array.isArray(filters.activity_type) ? filters.activity_type : [];
      const subDealerIds = Array.isArray(filters.sub_dealers) ? filters.sub_dealers : [];
      const yearIds = Array.isArray(filters.year) ? filters.year.map(String) : [];
      const monthIds = Array.isArray(filters.month) ? filters.month.map(String) : [];

      // ✅ Priority 1: ถ้าไม่เลือก Activity Type → ไม่แสดง
      if (activityTypeIds.length === 0) {
        setLocations([]);
        setlocationWindowInfo(null);
        return;
      }

      // ✅ Priority 2: ถ้าไม่เลือก Year → ไม่แสดง
      if (yearIds.length === 0) {
        setLocations([]);
        setlocationWindowInfo(null);
        return;
      }


      let filtered = dataMapping;

      // YEAR ก่อน
      if (yearIds.length > 0) {
        filtered = filtered.filter((item) => {
          const itemYear = String(item.year ?? new Date(item.document_date).getFullYear());
          return yearIds.includes(itemYear);
        });
      }

      // sub dealer
      if (subDealerIds.length > 0) {
        filtered = filtered.filter((item) => subDealerIds.includes(item.sub_dealer_id));
      }

      // ✅ activity type (ตอนนี้บังคับแล้วว่า length > 0 เสมอ)
      filtered = filtered.filter((item) => activityTypeIds.includes(item.activity_type_id));

      // month หลัง year
      if (monthIds.length > 0) {
        filtered = filtered.filter((item) => {
          const docMonth = new Date(item.document_date).getMonth() + 1;
          return monthIds.includes(String(docMonth));
        });
      }

      setLocations(
        filtered.map((d, idx) => ({
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
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  // โหลดเมื่อ filter พร้อม + เปลี่ยนค่า
  useEffect(() => {
    const filtersReady = mockFilters.every((f) => Array.isArray(f.data) && f.data.length > 0);
    if (!filtersReady) {
      setLocations([]);
      return;
    }
    if (!dataMapping?.length) {
      setLocations([]);
      return;
    }
    loadDataMappingList(checkedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedFilters, mockFilters, dataMapping]);

  // -----------------------------
  // ✅ Markers state
  // -----------------------------
  useEffect(() => {
    if (locations.length > 0) {
      setLocationMarkerIcon(
        locations.map((d, idx) => ({
          key: idx + 1,
          document_number: d.document_number,

          lat: d.lat,
          lng: d.lng,

          address: d.address,
          remark: d.remark,
          description: d.description,

          activity_type_name: d.activity_type_name,
          dealer_name: d.dealer_name,
          dealer_id: d.dealer_id,
          area_name: d.area_name,

          activity_image: d.activity_image,
          activity_image_location: d.activity_image_location,

          crop_id_list: d.crop_id_list,
          document_date_display: d.document_date_display,
          assing_user_list: d.assing_user_list,

          // ✅ เพิ่ม
          sub_dealer_id: d.sub_dealer_id,
          sub_dealer_name: d.sub_dealer_name,
        }))
      );
    } else {
      setLocationMarkerIcon([]);
    }
  }, [locations]);

  // -----------------------------
  // ✅ Current GPS location
  // -----------------------------
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude);
        const lng = parseFloat(pos.coords.longitude);
        setCurrentLocation({ lat, lng });
      },
      (err) => console.error("Error getting current location:", err)
    );
  }, [dataMapping]);

  // -----------------------------
  // ✅ Master "Check All"
  // -----------------------------
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

  // update isAllChecked
  useEffect(() => {
    const allSelected = mockFilters.every((cat) => {
      const total = (cat.data || []).map((x) => x.id);
      const selected = checkedFilters[cat.filter_type] || [];
      if (total.length === 0) return false;
      return total.every((id) => selected.includes(id));
    });
    setIsAllChecked(allSelected);
  }, [checkedFilters, mockFilters]);

  // -----------------------------
  // ✅ Search box
  // -----------------------------
  const handleSearch = (text) => {
    if (!text) {
      setSearchOptions([]);
      return;
    }
    const regex = new RegExp(text, "i");
    const results = (dataMapping || []).filter((item) => item.location_address && regex.test(item.location_address));
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

  // -----------------------------
  // ✅ Render
  // -----------------------------
  return (
    <MainLayout loading={loading}>
      <Layout>
        {/* Filter */}
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

          {/* Search */}
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

            {/* ✅ ทุกหัวข้อมี check all */}
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
                      options={(category.data || []).map((item) => ({ label: item.name, value: item.id }))}
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

        {/* Map */}
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
                    position={{ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) }}
                    icon={{ url: loc.activity_image_location, scaledSize: { width: 25.5, height: 35 } }}
                    options={{ suppressInfoWindow: true }}
                    onClick={() => {
                      setlocationWindowInfo({
                        url_img: loc.activity_image,
                        lat: parseFloat(loc.lat),
                        lng: parseFloat(loc.lng),
                        title: loc.activity_type_name || "No Activity Type",
                        dealer_name: loc.dealer_name,
                        area_name: loc.area_name,
                        crop_list: loc.crop_id_list,
                        document_date_display: loc.document_date_display,
                        assing_user_list: loc.assing_user_list,
                        remark: loc.remark,
                        address: loc.address,
                        document_number: loc.document_number,

                        // ✅ เพิ่ม
                        sub_dealer_id: loc.sub_dealer_id,
                        sub_dealer_name: loc.sub_dealer_name,
                      });
                    }}
                  />
                ))}

                {locationWindowInfo && (
                  <InfoWindow
                    position={{ lat: parseFloat(locationWindowInfo.lat), lng: parseFloat(locationWindowInfo.lng) }}
                    onCloseClick={() => setlocationWindowInfo(null)}
                    options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
                  >
                    <div>
                      {/* Header + View icon (new tab) */}
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src={locationWindowInfo.url_img} className="w-6 h-6" alt="" />
                        {locationWindowInfo.title}

                        <img
                          src="/img/icons/view.png"
                          alt="View"
                          className="w-6 h-6 rounded-sm cursor-pointer ms-5"
                          onClick={() => {
                            const url =
                              `/activity/view?documentNumber=${encodeURIComponent(locationWindowInfo.document_number)}` +
                              `&pageCode=${encodeURIComponent("activity_transaction")}` +
                              `&from=mapping`;
                            window.open(url, "_blank", "noopener,noreferrer");
                          }}
                        />
                      </div>

                      {/* Dealer */}
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src="/img/icons/shop.png" className="w-6 h-6" alt="" />
                        {locationWindowInfo.dealer_name || "No Dealer Name"}
                      </div>

                      {/* ✅ SubDealer แทน Address */}
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src="/img/icons/location.png" className="w-6 h-6" alt="" />
                        {locationWindowInfo.sub_dealer_name || "No Sub Dealer"}
                      </div>

                      {/* Crops */}
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src="/img/icons/crops.png" className="w-6 h-6" alt="" />
                        {Array.isArray(locationWindowInfo.crop_list) && locationWindowInfo.crop_list.length > 0
                          ? locationWindowInfo.crop_list.map((c) => c.name).join(", ")
                          : "No Crops Listed"}
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src="/img/icons/calendar.png" className="w-6 h-6" alt="" />
                        {locationWindowInfo.document_date_display || "No Date Available"}
                      </div>

                      {/* Description */}
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src="/img/icons/details.png" className="w-6 h-6" alt="" />
                        {locationWindowInfo.remark || "No Description"}
                      </div>

                      {/* Assigned users */}
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
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          </Content>
        </Layout>
      </Layout>
    </MainLayout>
  );
}
