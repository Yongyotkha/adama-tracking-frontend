import { useEffect, useMemo, useState } from "react";
import { GoogleMap, InfoWindow, LoadScript, Marker } from "@react-google-maps/api";
import { Button, Checkbox, Collapse, Layout, Tag } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import MainLayout from "../../../layouts/MainLayout";
import DynamicAutoComplete from "../../../components/autocomplete/DynamicAutoComplete";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

const CUSTOMER_TYPES = [
  { id: "dealer", name: "Dealer", icon: "/img/icons/customer.png", color: "#00783F", markerLabel: "D" },
  { id: "sub_dealer", name: "Sub Dealer", icon: "/img/icons/customer.png", color: "#1D72B8", markerLabel: "S" },
  { id: "farmer", name: "Farmer", icon: "/img/icons/customer.png", color: "#D88700", markerLabel: "F" },
];

const DEFAULT_CENTER = {
  lat: 15.33899,
  lng: 101.09336,
};

const EMPTY_FILTER_VALUE = {
  sale: "__no_sale__",
  dealer: "__no_dealer__",
  subDealer: "__no_sub_dealer__",
};

const uniqById = (arr = []) =>
  [...new Map(arr.map((item) => [String(item.id), item])).values()];

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const normalizeCoordinates = (latValue, lngValue) => {
  let lat = toNumber(latValue);
  let lng = toNumber(lngValue);

  if (lat === null || lng === null) return null;

  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
    [lat, lng] = [lng, lat];
  }

  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

  return { lat, lng };
};

const createCustomerMarkerIcon = (color = "#00783F", label = "") => {
  const svg = `
    <svg width="44" height="54" viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 51C22 51 39 33.6 39 20.5C39 10.835 31.389 3 22 3C12.611 3 5 10.835 5 20.5C5 33.6 22 51 22 51Z" fill="${color}" stroke="white" stroke-width="3"/>
      <circle cx="22" cy="20.5" r="11.5" fill="white" fill-opacity="0.96"/>
      <text x="22" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${color}">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const InfoIcon = ({ src, color = "#00783F" }) => (
  <span
    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
    style={{ backgroundColor: `${color}18`, borderColor: `${color}55` }}
  >
    <img src={src} className="h-4 w-4 object-contain" alt="" />
  </span>
);

const mapCustomerRows = (rows = [], type) =>
  rows
    .map((item, index) => {
      const typeMeta = CUSTOMER_TYPES.find((customerType) => customerType.id === type);
      const coords = normalizeCoordinates(item.lat, item.long);
      const customerId = item[`${type}_id`] ?? item.id;
      const customerName = item[`${type}_name`] ?? item.name;

      if (!coords || !customerId) return null;

      return {
        ...item,
        ...coords,
        id: `${type}-${customerId}-${index}`,
        customer_id: customerId,
        customer_name: customerName || "-",
        customer_type: type,
        customer_type_name: typeMeta?.name || type,
        marker_icon: typeMeta?.icon,
        marker_color: typeMeta?.color,
        marker_label: typeMeta?.markerLabel,
        dealer_id: item.dealer_id,
        dealer_name: item.dealer_name,
        sub_dealer_id: item.sub_dealer_id,
        sub_dealer_name: item.sub_dealer_name,
        sale_id: item.sale_id,
        sale_name: item.sale_name,
        sale_filter_id: item.sale_id ?? EMPTY_FILTER_VALUE.sale,
        dealer_filter_id: item.dealer_id ?? EMPTY_FILTER_VALUE.dealer,
        sub_dealer_filter_id: item.sub_dealer_id ?? EMPTY_FILTER_VALUE.subDealer,
      };
    })
    .filter(Boolean);

export default function CustomerMapping() {
  const { Content } = Layout;
  const { Panel } = Collapse;

  const [loading, setLoading] = useState(false);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [checkedFilters, setCheckedFilters] = useState({});
  const [isAllChecked, setIsAllChecked] = useState(true);
  const [dataMapZoom, setDataMapZoom] = useState(6);
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_CENTER);
  const [allLocations, setAllLocations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locationWindowInfo, setLocationWindowInfo] = useState(null);
  const [searchOptions, setSearchOptions] = useState([]);
  const [dataApiKey] = useState("AIzaSyDUeNLdnx0CqDtfCXRywGdcizCnBVCdwik");

  const mapContainerStyle = useMemo(() => ({ width: "100%", height: "100vh" }), []);

  const filterOptions = useMemo(() => {
    const sales = uniqById(
      allLocations.map((item) => ({
        id: item.sale_filter_id,
        name: item.sale_name || "No Sale",
      }))
    ).sort((a, b) => a.name.localeCompare(b.name));

    const dealers = uniqById(
      allLocations.map((item) => ({
        id: item.dealer_filter_id,
        name: item.dealer_name || "No Dealer",
      }))
    ).sort((a, b) => a.name.localeCompare(b.name));

    const subDealers = uniqById(
      allLocations.map((item) => ({
        id: item.sub_dealer_filter_id,
        name: item.sub_dealer_name || "No Sub Dealer",
      }))
    ).sort((a, b) => a.name.localeCompare(b.name));

    return [
      { key: 1, filter_type: "customer_type", filter_type_name: "Customer Type", data: CUSTOMER_TYPES },
      { key: 2, filter_type: "sales", filter_type_name: "Sales", data: sales },
      { key: 3, filter_type: "dealer", filter_type_name: "Dealer", data: dealers },
      { key: 4, filter_type: "sub_dealer", filter_type_name: "Sub Dealer", data: subDealers },
    ];
  }, [allLocations]);

  useEffect(() => {
    const loadCustomerMapping = async () => {
      setLoading(true);

      try {
        const [dealers, subDealers, farmers] = await Promise.all([
          useServiceAPI.get(paths.pathCustomerMappingDealers, {}),
          useServiceAPI.get(paths.pathCustomerMappingSubDealers, {}),
          useServiceAPI.get(paths.pathCustomerMappingFarmers, {}),
        ]);

        const mappedLocations = [
          ...mapCustomerRows(dealers.data || [], "dealer"),
          ...mapCustomerRows(subDealers.data || [], "sub_dealer"),
          ...mapCustomerRows(farmers.data || [], "farmer"),
        ];

        setAllLocations(mappedLocations);
      } catch (error) {
        console.error("Failed to load customer mapping:", error);
        setAllLocations([]);
      } finally {
        setLoading(false);
      }
    };

    loadCustomerMapping();
  }, []);

  useEffect(() => {
    if (!allLocations.length) return;

    const initialFilters = {
      customer_type: CUSTOMER_TYPES.map((item) => item.id),
      sales: filterOptions.find((item) => item.filter_type === "sales")?.data.map((item) => item.id) || [],
      dealer: filterOptions.find((item) => item.filter_type === "dealer")?.data.map((item) => item.id) || [],
      sub_dealer:
        filterOptions.find((item) => item.filter_type === "sub_dealer")?.data.map((item) => item.id) || [],
    };

    setCheckedFilters(initialFilters);
  }, [allLocations, filterOptions]);

  useEffect(() => {
    const selectedTypes = checkedFilters.customer_type || [];
    const selectedSales = checkedFilters.sales || [];
    const selectedDealers = checkedFilters.dealer || [];
    const selectedSubDealers = checkedFilters.sub_dealer || [];

    const filtered = allLocations.filter((item) => {
      if (!selectedTypes.includes(item.customer_type)) return false;

      const isSalesFilterActive = selectedSales.length > 0;
      const isDealerFilterActive = selectedDealers.length > 0;
      const isSubDealerFilterActive = selectedSubDealers.length > 0;

      if (!isSalesFilterActive && !isDealerFilterActive && !isSubDealerFilterActive) {
        return false;
      }

      const matchesSale = isSalesFilterActive && selectedSales.map(String).includes(String(item.sale_filter_id));
      const matchesDealer = isDealerFilterActive && selectedDealers.map(String).includes(String(item.dealer_filter_id));
      const matchesSubDealer = isSubDealerFilterActive && selectedSubDealers.map(String).includes(String(item.sub_dealer_filter_id));

      const conditions = [];
      if (isSalesFilterActive) conditions.push(matchesSale);
      if (isDealerFilterActive) conditions.push(matchesDealer);
      if (isSubDealerFilterActive) conditions.push(matchesSubDealer);

      return conditions.some(Boolean);
    });

    setLocations(filtered);
  }, [allLocations, checkedFilters]);

  useEffect(() => {
    const allSelected = filterOptions.every((category) => {
      const total = (category.data || []).map((item) => item.id);
      const selected = checkedFilters[category.filter_type] || [];

      if (total.length === 0) return true;

      return total.every((id) => selected.includes(id));
    });

    setIsAllChecked(allSelected);
  }, [checkedFilters, filterOptions]);

  const toggleAll = (isChecked) => {
    if (!isChecked) {
      setCheckedFilters({
        customer_type: [],
        sales: [],
        dealer: [],
        sub_dealer: [],
      });
      setIsAllChecked(false);
      setLocationWindowInfo(null);
      return;
    }

    const updated = {};
    filterOptions.forEach((category) => {
      updated[category.filter_type] = (category.data || []).map((item) => item.id);
    });

    setCheckedFilters(updated);
    setIsAllChecked(true);
  };

  const handleSearch = (text) => {
    if (!text || text.length < 3) {
      setSearchOptions([]);
      return;
    }

    const regex = new RegExp(text, "i");
    const results = allLocations.filter((item) =>
      [item.customer_name, item.dealer_name, item.sub_dealer_name, item.sale_name].some((value) =>
        value ? regex.test(value) : false
      )
    );

    setSearchOptions(
      results.map((item) => ({
        value: `${item.customer_type_name}: ${item.customer_name}`,
        lat: item.lat,
        lng: item.lng,
        id: item.id,
      }))
    );
  };

  const handleSelect = (_, option) => {
    setCurrentLocation({ lat: option.lat, lng: option.lng });
    setDataMapZoom(15);
    setLocationWindowInfo(allLocations.find((item) => item.id === option.id) || null);
  };

  return (
    <MainLayout loading={loading}>
      <Layout>
        <div
          className={`absolute z-20 left-5 top-[8.5rem] bg-white shadow-lg rounded-md transition-all duration-300 overflow-hidden ${
            isFilterCollapsed ? "max-h-12" : "max-h-[600px] overflow-y-auto"
          }`}
          style={{ width: "300px" }}
        >
          <div
            className="sticky top-0 z-[1] bg-white flex justify-between items-center px-4 py-2 border-b cursor-pointer"
            onClick={() => setIsFilterCollapsed((state) => !state)}
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
              placeholder="Search customer (Min length 3)"
              onSearch={handleSearch}
              onSelect={handleSelect}
              className="w-full rounded-md shadow-sm"
              style={{ width: "100%" }}
            />
          </div>

          <div className={`transition-all duration-300 ${isFilterCollapsed ? "opacity-0" : "opacity-100"} px-3 pb-4`}>
            <div className="flex justify-between">
              <Checkbox checked={isAllChecked} onChange={(event) => toggleAll(event.target.checked)}>
                Check All
              </Checkbox>
            </div>

            <Collapse defaultActiveKey={["1"]} className="rounded-lg border-0">
              {filterOptions.map((category) => {
                const selected = checkedFilters[category.filter_type] || [];
                const allIds = (category.data || []).map((item) => item.id);
                const checkAll = allIds.length > 0 && selected.length === allIds.length;
                const indeterminate = selected.length > 0 && selected.length < allIds.length;

                const onCheckAllChange = (event) => {
                  const newChecked = event.target.checked ? allIds : [];
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
                      onClick={(event) => event.stopPropagation()}
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
                {locations.map((loc) => (
                  <Marker
                    key={loc.id}
                    position={{ lat: loc.lat, lng: loc.lng }}
                    icon={{
                      url: createCustomerMarkerIcon(loc.marker_color, loc.marker_label),
                      scaledSize: new window.google.maps.Size(44, 54),
                      anchor: new window.google.maps.Point(22, 51),
                    }}
                    options={{ suppressInfoWindow: true }}
                    onClick={() => setLocationWindowInfo(loc)}
                  />
                ))}

                {locationWindowInfo && (
                  <InfoWindow
                    position={{ lat: locationWindowInfo.lat, lng: locationWindowInfo.lng }}
                    onCloseClick={() => setLocationWindowInfo(null)}
                    options={{ pixelOffset: new window.google.maps.Size(0, -18) }}
                  >
                    <div className="min-w-[260px] max-w-[320px] pt-4 text-[#5f5653]">
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white"
                          style={{ backgroundColor: locationWindowInfo.marker_color }}
                        >
                          <img src={locationWindowInfo.marker_icon} className="h-5 w-5 object-contain" alt="" />
                        </span>
                        <span className="min-w-0 flex-1 truncate font-semibold text-[#5f5653]">
                          {locationWindowInfo.customer_name}
                        </span>
                        <Tag className="ms-auto mr-0" color={locationWindowInfo.marker_color}>
                          {locationWindowInfo.customer_type_name}
                        </Tag>
                      </div>

                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <InfoIcon src="/img/icons/profile.png" color="#00783F" />
                        <span className="min-w-0 flex-1 break-words">
                          {locationWindowInfo.sale_name || "No Sale"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <InfoIcon src="/img/icons/dealer.png" color="#00783F" />
                        <span className="min-w-0 flex-1 break-words">
                          {locationWindowInfo.dealer_name || "No Dealer"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <InfoIcon src="/img/icons/sub-dealer.png" color="#1D72B8" />
                        <span className="min-w-0 flex-1 break-words">
                          {locationWindowInfo.sub_dealer_name || "No Sub Dealer"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <InfoIcon src="/img/icons/location.png" color="#978B87" />
                        <span className="min-w-0 flex-1 break-words">
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${locationWindowInfo.lat},${locationWindowInfo.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1D72B8] hover:underline"
                          >
                            {locationWindowInfo.lat}, {locationWindowInfo.lng}
                          </a>
                        </span>
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
