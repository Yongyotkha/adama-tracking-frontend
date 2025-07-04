import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Layout, Checkbox, Button, Collapse, Tooltip } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import MainLayout from "../../../layouts/MainLayout";
import { useNavigate, useLocation } from "react-router-dom";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import DynamicAutoComplete from "../../../components/autocomplete/DynamicAutoComplete";
import dayjs from "dayjs";

export default function ActivityMapping() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false); // Manage vertical collapse state
  const [checkedFilters, setCheckedFilters] = useState({}); // Manage checked state for all filters
  const [isAllChecked, setIsAllChecked] = useState(true);

  const [dataApiKey, setDataApiKay] = useState(
    "AIzaSyDUeNLdnx0CqDtfCXRywGdcizCnBVCdwik"
  );

  const [locations, setLocations] = useState([]);
  const [locationMarkerIcon, setLocationMarkerIcon] = useState([]);
  const [locationWindowInfo, setlocationWindowInfo] = useState(null);
  const [dataMapZoom, setDataMapZoom] = useState(10);
  const [dataMapping, setDataMapping] = useState([]);
  const [activityType, setActivityType] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [dataSales, setDataSales] = useState([]);
  const [dataSubDealer, setDataSubDealer] = useState([]);
  const [dataArea, setDataArea] = useState([]);
  const [dataYear, setDataYear] = useState([]);
  const [dataMonths, setDataMonths] = useState([]);
  const [dataUserStructure, setDataUserStructure] = useState([]);
  const renderCount = useRef(0);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 0.0,
    lng: 0.0,
  });

  const [currentLocationAddress, setCurrentLocationAddress] = useState("");

  const [searchOptions, setSearchOptions] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    if (!dataUserStructure || dataUserStructure.length === 0) return;
    const selectedDealers = checkedFilters.dealer || [];

    const matchedSubDealers = dataUserStructure
      .flatMap((user) => user.dealers)
      .filter((dealer) => selectedDealers.includes(dealer.dealer_id))
      .flatMap((dealer) =>
        dealer.sub_dealer.map((sub) => ({ id: sub.id, name: sub.name }))
      );

    const uniqueSubs = [...new Map(matchedSubDealers.map((s) => [s.id, s])).values()]
      .sort((a, b) => a.name.localeCompare(b.name));

    setDataSubDealer(uniqueSubs);

    // ✅ Auto-select sub_dealer
    setCheckedFilters((prev) => ({
      ...prev,
      sub_dealers: uniqueSubs.map((s) => s.id),
    }));
  }, [checkedFilters.dealer, dataUserStructure]);

  useEffect(() => {
    if (!dataUserStructure || dataUserStructure.length === 0) return;
    const selectedSales = checkedFilters.sales || [];

    const matchedDealers = dataUserStructure
      .filter((user) => selectedSales.includes(user.sale_id))
      .flatMap((user) => user.dealers.map((d) => ({ id: d.dealer_id, name: d.name })));

    const uniqueDealers = [...new Map(matchedDealers.map((d) => [d.id, d])).values()]
      .sort((a, b) => a.name.localeCompare(b.name));

    setDataDealer(uniqueDealers);

    // ✅ Auto-select dealer
    setCheckedFilters((prev) => ({
      ...prev,
      dealer: uniqueDealers.map((d) => d.id),
    }));
  }, [checkedFilters.sales, dataUserStructure]);

  // Fetch Data
  useEffect(() => {

    const loadDataMappingListFirst = async () => {
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

        setDataMapping(mapping.data);
        setActivityType(activity.data);

        // 👉 เก็บข้อมูลที่ดึงมาจาก userStruck (API ใหม่)
        setDataUserStructure(userStruck.data || []);

        // 👇 ดึง sales, dealer, sub_dealer จาก userStruck
        const salesList = userStruck.data.map((user, index) => ({
          key: index,
          id: user.sale_id,
          name: user.name,
        }));
        const dealerList = userStruck.data.flatMap((user) =>
          user.dealers.map((dealer) => ({
            id: dealer.dealer_id,
            name: dealer.name,
          }))
        );
        const subDealerList = userStruck.data.flatMap((user) =>
          user.dealers.flatMap((dealer) =>
            dealer.sub_dealer.map((sub) => ({
              id: sub.id,
              name: sub.name,
            }))
          )
        );

        setDataSales(salesList);
        setDataDealer(
          [...new Map(dealerList.map((item) => [item.id, item])).values()].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );
        setDataSubDealer(
          [...new Map(subDealerList.map((item) => [item.id, item])).values()].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );

        // ตั้งค่าปีและเดือน
        setDataArea(areas.data);
        setDataYear(years.data);
        setDataMonths(months.data);

        const initialFilters = {
          activity_type: activity.data.map((i) => i.id),
          sales: salesList.map((i) => i.id),
          dealer: dealerList.map((i) => i.id),
          sub_dealers: subDealerList.map((i) => i.id),
          year: years.data.length > 0 ? [years.data[0].id] : [],
          month: months.data.map((i) => i.id),
        };

        setCheckedFilters(initialFilters); // ✅ ตั้งค่า default filters
        loadDataMappingList(initialFilters); // ✅ โหลดข้อมูลทันทีเมื่อหน้าโหลดเสร็จ


      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };


    loadDataMappingListFirst();
  }, []);

  useEffect(() => {
    const filtersReady = mockFilters.every((f) => f.data && f.data.length > 0);
    if (filtersReady) {
      loadDataMappingList(checkedFilters);
    } else {
      setLocations([])
    }
  }, [checkedFilters]);

  // useEffect(() => {

  //   const filtersReady = [activityType, dataSales, dataDealer, dataSubDealer, dataYear, dataMonths]
  //     .every((f) => f.length > 0);


  //   if (filtersReady) {
  //     loadDataMappingList(checkedFilters);

  //   } else {
  //     setLocations([])
  //   }
  // }, [activityType, dataSales, dataDealer, dataSubDealer, dataYear, dataMonths]);

  const { Content } = Layout;
  const { Panel } = Collapse;

  const mapContainerStyle = {
    width: "100%",
    height: "100vh",
  };

  const toggleAll = (isChecked) => {
    const updatedFilters = {};

    if (isChecked) {
      // ✅ Check เฉพาะกลุ่มที่ต้องการ
      const targetTypes = ["activity_type", "sales", "dealer", "sub_dealers", "year", "month"];

      targetTypes.forEach((filterType) => {
        const filterData = mockFilters.find((f) => f.filter_type === filterType)?.data || [];
        updatedFilters[filterType] = filterData.map((item) => item.id);
      });

      setCheckedFilters(updatedFilters);
      setIsAllChecked(isChecked);
      loadDataMappingList(updatedFilters);

    } else {
      // ❌ Uncheck ทั้งหมด
      // mockFilters.forEach((filter) => {
      //   updatedFilters[filter.filter_type] = [];
      // });
      console.log('uncheckkkkkkkkkkk')
      setCheckedFilters(updatedFilters);
      setIsAllChecked(isChecked);
      setLocations([])
    }



    // 🔥 เรียก API แสดงข้อมูลตาม filter ที่เลือก


    console.log("🌀 toggleAll executed with filters:", updatedFilters);
  };


  const loadDataMappingList = async (filters) => {
    setLoading(true);
    try {
      renderCount.current += 1;
      console.log(`🔄 loadDataMappingList รอบที่: ${renderCount.current}`);

      const activityType = Array.isArray(filters.activity_type) ? filters.activity_type : [];
      const sales = Array.isArray(filters.sales) ? filters.sales : [];
      const dealer = Array.isArray(filters.dealer) ? filters.dealer : [];
      const sub_dealers = Array.isArray(filters.sub_dealers) ? filters.sub_dealers : [];
      const area = Array.isArray(filters.area) ? filters.area : [];
      const year = Array.isArray(filters.year) ? filters.year.map(String) : [];
      const month = Array.isArray(filters.month) ? filters.month.map(String) : [];

      let filteredData = dataMapping;

      console.log('filteredData : ', filteredData.length)

      if (sub_dealers.length > 0) {
        filteredData = filteredData.filter((item) =>
          sub_dealers.includes(item.sub_dealer_id)
        );
      }

      if (activityType.length > 0) {
        filteredData = filteredData.filter((item) =>
          activityType.includes(item.activity_type_id)
        );
      }

      if (month.length > 0) {
        filteredData = filteredData.filter((item) => {
          const docMonth = new Date(item.document_date).getMonth() + 1; // getMonth() เริ่มที่ 0
          return month.includes(String(docMonth)); // เปรียบเทียบแบบ string
        });
      }

      console.log('month : ', month)
      console.log('sub_dealers : ', sub_dealers.length)
      console.log('filteredData : ', filteredData.length)
      console.log('=====================================================')

      setLocations(
        filteredData.map((data, index) => ({
          key: index + 1,
          id: index + 1,
          document_number: data.document_number,
          title: data.activity_type_name,
          lat: parseFloat(data.location_latitude),
          lng: parseFloat(data.location_longitude),
          address: data.location_address,
          details: data.description,
          activity_type_id: data.activity_type_id,
          activity_type_name: data.activity_type_name,
          dealer_id: data.dealer_id,
          dealer_name: data.dealer_name,
          area_id: data.area_id,
          area_name: data.area_name,
          year: data.year,
          activity_image: data.activity_image,
          activity_image_location: data.activity_image_location,
          crop_id_list: data.crop_id_list,
          document_date_display: data.document_date_display,
          assing_user_list: data.assing_user_list ?? [],
          remark: data.remark ?? "",
        }))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const mockFilters = useMemo(() => [
    { key: 1, filter_type: "activity_type", filter_type_name: "Activity Type", data: activityType },
    { key: 6, filter_type: "sales", filter_type_name: "Sales", data: dataSales },
    { key: 2, filter_type: "dealer", filter_type_name: "Dealer", data: dataDealer },
    { key: 3, filter_type: "sub_dealers", filter_type_name: "Sub Dealer", data: dataSubDealer },
    { key: 4, filter_type: "year", filter_type_name: "Years", data: dataYear },
    { key: 5, filter_type: "month", filter_type_name: "Months", data: dataMonths },
  ], [activityType, dataSales, dataDealer, dataSubDealer, dataYear, dataMonths]);



  //console.log('mockFilters : ', mockFilters)

  // Initialize all checkboxes as selected on page load
  useEffect(() => {
    // Set Current Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude);
          const lng = parseFloat(position.coords.longitude);

          const fetchCurrentLocation = async () => {
            // ดึงข้อมูลที่อยู่จาก Google Maps Geocoding API
            //const fetchedAddress = await fetchAddress(lat, lng);
            //setCurrentLocationAddress(fetchedAddress);
          };

          fetchCurrentLocation();

          const getCurrentLocation = {
            key: locations.length + 1,
            id: locations.length + 1,
            document_number: "",
            title: "",
            lat: lat,
            lng: lng,
            details: currentLocationAddress,
          };

          // Set State: ตำแหน่งปัจจุบัน
          setCurrentLocation(getCurrentLocation);
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    }
  }, [dataMapping]);

  // ดึงที่อยู่จาก Google Maps Geocoding API
  const fetchAddress = async (lat, lng) => {
    const apiKey = dataApiKey; // ใส่ Google Maps API Key ของคุณ
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address; // คืนค่าที่อยู่
      } else {
        console.error("Geocoding API error:", data.status);
        return "Address not found";
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Error fetching address";
    }
  };




  useEffect(() => {
    if (locations.length > 0) {
      renderMarkerLocation();
    } else {
      setLocationMarkerIcon([]); // 👉 clear marker ด้วยถ้าไม่มี location
    }
    //console.log("locations", locations);
  }, [locations]);

  const renderMarkerLocation = () => {
    // Set MarkerLocation
    setLocationMarkerIcon(
      locations.map((data, index) => ({
        key: index + 1,
        id: locations.length + 1,
        document_number: data.document_number,
        title: data.activity_type_name,
        lat: data.lat,
        lng: data.lng,
        address: data.address,
        details: data.description,
        activity_type_id: data.activity_type_id,
        activity_type_name: data.activity_type_name,
        dealer_id: data.dealer_id,
        dealer_name: data.dealer_name,
        area_id: data.area_id,
        area_name: data.area_name,
        year: data.year,
        activity_image: data.activity_image,
        activity_image_location: data.activity_image_location,
        crop_id_list: data.crop_id_list,
        document_date_display: data.document_date_display,
        assing_user_list: data.assing_user_list,
        remark: data.remark,
      }))
    );
  };

  // ฟังก์ชันสำหรับการตรวจสอบว่าเลือกทั้งหมดหรือไม่
  useEffect(() => {
    const allFiltersSelected = mockFilters.every((filterItem) => {
      return filterItem.data.every((item) =>
        checkedFilters[filterItem.filter_type]?.includes(item.id)
      );

    });

    setIsAllChecked(allFiltersSelected);
  }, [checkedFilters]);

  useEffect(() => {
    if (dataYear.length > 0) {
      setCheckedFilters((prev) => ({
        ...prev,
        year: [dataYear[0].id], // 👈 เลือก default ปีแรกใน list
      }));
    }
  }, [dataYear]);



  const handleSearch = (text) => {
    setSearchKeyword(text);

    if (text) {
      // ใช้ RegExp เพื่อค้นหาข้อความที่คล้ายกัน
      const regex = new RegExp(text, "i"); // 'i' หมายถึง case-insensitive
      console.log(regex);

      // ค้นหาใน dataMapping
      const results = dataMapping.filter(
        (item) => item.location_address && regex.test(item.location_address) // ค้นหาข้อความใน location_address
      );

      console.log(results);

      // อัปเดต options สำหรับ AutoComplete
      setSearchOptions(
        results.map((item) => ({
          value: item.location_address,
          lat: parseFloat(item.location_latitude),
          lng: parseFloat(item.location_longitude),
        }))
      );

      // อัปเดต checkbox ให้ตรงกับผลลัพธ์
      const updatedFilters = { ...checkedFilters };
      mockFilters.forEach((filterCategory) => {
        const matchingIds = results
          .map((result) => result[filterCategory.filter_type + "_id"])
          .filter((id) => id !== undefined); // ลบค่าที่เป็น undefined

        updatedFilters[filterCategory.filter_type] = [
          ...(updatedFilters[filterCategory.filter_type] || []),
          ...matchingIds,
        ].filter((id, index, self) => self.indexOf(id) === index); // ลบค่าซ้ำ
      });


      setCheckedFilters(updatedFilters);
    } else {
      setSearchOptions([]);
    }
  };


  useEffect(() => {
    if (mockFilters.every((f) => f.data.length > 0)) {
      setCheckedFilters((prevFilters) => {
        const updated = { ...prevFilters };
        mockFilters.forEach((filter) => {
          if (filter.filter_type !== 'sales' && !updated[filter.filter_type]) {
            updated[filter.filter_type] = filter.data.map((item) => item.id);
          }
        });
        return updated;
      });

      setIsAllChecked(true);
    }
  }, [activityType, dataDealer, dataSubDealer, dataYear, dataMonths]);

  const handleSelect = (value, option) => {
    // Set the map center to the selected lat and lng
    setCurrentLocation({ lat: option.lat, lng: option.lng });
    setDataMapZoom(15); // Set a higher zoom level for focusing
  };

  useEffect(() => {
    console.log(locationWindowInfo);
  }, [locationWindowInfo]);

  return (
    <MainLayout loading={loading}>
      <Layout>
        {/* Filter Section */}
        <div
          className={`absolute z-20 left-5 top-[8.5rem] bg-white shadow-lg rounded-md transition-all duration-300 overflow-hidden ${isFilterCollapsed ? "max-h-12" : "max-h-[600px] overflow-y-auto"
            }`}
          style={{ width: "300px" }}
        >
          <div className="sticky top-0 z-[1] bg-white flex justify-between items-center px-4 py-2 border-b cursor-pointer" onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}>
            <div className="flex items-center gap-2">
              <img
                src="/img/icons/filter-green.png"
                alt="Filter Icon"
                className="w-5 h-5"
              />
              <span className="text-lg text-[#00783F]">Filter</span>
            </div>
            <Button
              type="text"
              icon={isFilterCollapsed ? <DownOutlined /> : <UpOutlined />}
            // onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
            />
          </div>
          {/* Search Box */}
          <div className="w-full my-2 px-2">
            <DynamicAutoComplete
              options={searchOptions}
              placeholder="Search locations (Min length 3)"
              onSearch={handleSearch}
              onSelect={handleSelect} // Trigger when a location is selected
              className="w-full rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              style={{ width: "100%" }}
            />
          </div>

          <div
            className={`transition-all duration-300 ${isFilterCollapsed ? "opacity-0" : "opacity-100"
              } px-3 pb-4`}
          >
            {/* Master "All" Checkbox */}
            <div className="flex justify-between">

              <Checkbox
                indeterminate={Object.keys(checkedFilters).some(
                  (filterType) =>
                    checkedFilters[filterType]?.length > 0 &&
                    checkedFilters[filterType]?.length <
                    (mockFilters.find((filter) => filter.filter_type === filterType)?.data.length || 0)
                )}
                checked={isAllChecked}
                onChange={(e) => toggleAll(e.target.checked)}
              >
                Check All
              </Checkbox>


            </div>

            {/* Collapsible Filter Categories */}
            {/* <Collapse
              defaultActiveKey={["Activity Type"]}
              className="rounded-lg border-0"
            >
              {mockFilters.map((category) => {
                // console.log(category); // Log the full category object

                return (
                  <Panel
                    header={category.filter_type_name}
                    key={category.key}
                    className="custom-collapse my-2"
                  >
                    <Checkbox.Group
                      options={category.data.map((item) => ({
                        label: item.name,
                        value: item.id,
                      }))}
                      value={checkedFilters[category.filter_type]}
                      onChange={(list) => {
                        //console.log(list, category.filter_type);

                        setCheckedFilters((prevFilters) => ({
                          ...prevFilters,
                          [category.filter_type]: list,
                        }));

                        // เฉพาะเมื่อเป็น sales ให้เรียก fetch dealer ใหม่
                        if (category.filter_type === "sales") {
                          //fetchDealersBySale(list); // <-- เรียก API ที่เราเขียนไว้
                        }
                      }}

                      className="filter-checkbox-group"
                    />
                  </Panel>
                );
              })}

            </Collapse> */}

            {/* โค้ดใหม่ มี Checkbox sale , dealer */}
            <Collapse defaultActiveKey={["Activity Type"]} className="rounded-lg border-0">
              {mockFilters.map((category) => {
                const selected = checkedFilters[category.filter_type] || [];
                const totalOptions = category.data.map((item) => item.id);
                const checkAll = selected.length === totalOptions.length;
                const indeterminate = selected.length > 0 && selected.length < totalOptions.length;

                const onCheckAllChange = (e) => {
                  const newChecked = e.target.checked ? totalOptions : [];
                  setCheckedFilters((prev) => ({
                    ...prev,
                    [category.filter_type]: newChecked,
                  }));

                  if (category.filter_type === "sales") {
                    fetchDealersBySale(newChecked);
                  }
                };

                const onGroupChange = (list) => {
                  setCheckedFilters((prev) => ({
                    ...prev,
                    [category.filter_type]: list,
                  }));

                  if (category.filter_type === "sales") {
                    fetchDealersBySale(list);
                  }
                };

                const panelHeader = (
                  <div className="flex justify-between items-center w-full">
                    <span>{category.filter_type_name}</span>
                    <Checkbox
                      indeterminate={indeterminate}
                      checked={checkAll}
                      onChange={onCheckAllChange}
                      onClick={(e) => e.stopPropagation()} // ✅ ป้องกัน toggle collapse
                    />
                  </div>
                );

                return (
                  <Panel header={panelHeader} key={category.key} className="custom-collapse my-2">
                    <Checkbox.Group
                      options={category.data.map((item) => ({
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

        {/* Map Section */}
        <Layout>
          <Content>
            <LoadScript googleMapsApiKey={dataApiKey}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={currentLocation}
                zoom={dataMapZoom}
                options={{
                  styles: [
                    {
                      featureType: "poi", // Points of Interest
                      stylers: [{ visibility: "off" }], // Turn off POI visibility
                    },
                  ],
                }}
              >
                {locationMarkerIcon.length > 0 &&
                  locationMarkerIcon.map((location, locationIndex) => (
                    <Marker
                      key={crypto.randomUUID()}
                      position={{
                        lat: parseFloat(location.lat),
                        lng: parseFloat(location.lng),
                      }}
                      icon={{
                        url: location.activity_image_location,
                        scaledSize: { width: 25.5, height: 35 },
                      }}
                      options={{
                        suppressInfoWindow: true, // ปิดการแสดง InfoWindow เริ่มต้น
                      }}
                      onClick={() => {
                        const newLocationWindowInfo = {
                          url_img: location.activity_image,
                          lat: parseFloat(location.lat),
                          lng: parseFloat(location.lng),
                          address: location.address,
                          title: location.title || "No Title",
                          details: location.details || "No Details",
                          activity_type_name: location.activity_type_name,
                          dealer_name: location.dealer_name,
                          area_name: location.area_name,
                          crop_list: location.crop_id_list,
                          document_date_display: location.document_date_display,
                          assing_user_list: location.assing_user_list,
                          remark: location.remark,
                          document_number: location.document_number,
                        };
                        setlocationWindowInfo(newLocationWindowInfo);
                        console.log(
                          "newLocationWindowInfo",
                          newLocationWindowInfo
                        );
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
                    options={{
                      pixelOffset: new window.google.maps.Size(0, -30),
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img
                          src={locationWindowInfo.url_img}
                          className="w-6 h-6"
                          alt=""
                        />
                        {locationWindowInfo.activity_type_name ||
                          "No Activity Type"}
                        <img
                          src="/img/icons/view.png"
                          alt="View"
                          className="w-6 h-6 rounded-sm cursor-pointer ms-5"
                          onClick={() => {
                            navigate("/activity/view", {
                              state: {
                                documentNumber:
                                  locationWindowInfo.document_number,
                                pageCode: "activity_transaction",
                              },
                            });
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img
                          src="/img/icons/shop.png"
                          className="w-6 h-6"
                          alt=""
                        />
                        {locationWindowInfo.dealer_name || "No Dealer Name"}
                      </div>
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img
                          src="/img/icons/location.png"
                          className="w-6 h-6"
                          alt=""
                        />
                        {locationWindowInfo.address || "No Address Available"}
                      </div>
                      {/* <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src="/img/icons/crops.png" className="w-6 h-6" alt="" />{locationWindowInfo.crop_id_list || "No Crops Listed"}
                      </div> */}
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img
                          src="/img/icons/crops.png"
                          className="w-6 h-6"
                          alt=""
                        />
                        {locationWindowInfo.crop_list &&
                          locationWindowInfo.crop_list.length > 0
                          ? locationWindowInfo.crop_list
                            .map((crop) => crop.name)
                            .join(", ")
                          : "No Crops Listed"}
                      </div>

                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img
                          src="/img/icons/calendar.png"
                          className="w-6 h-6"
                          alt=""
                        />
                        {locationWindowInfo.document_date_display ||
                          "No Date Available"}
                      </div>
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img
                          src="/img/icons/details.png"
                          className="w-6 h-6"
                          alt=""
                        />
                        {locationWindowInfo.remark || "No Description"}
                      </div>

                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        {/* <img
                          src={"/img/icons/default-avatar.png"}
                          alt={"No Name"}
                          className="w-6 h-6 rounded-full border border-gray-300"
                        /> */}
                        {Array.isArray(locationWindowInfo?.assing_user_list) &&
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
