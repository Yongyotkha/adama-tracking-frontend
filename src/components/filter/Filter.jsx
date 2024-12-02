import React, { useState } from "react";
import { Select, Collapse, Input, Row, Col, DatePicker } from "antd";
import "./Filter.css";
import DynamicButton from "../button/DynamicButton";
import dayjs from "dayjs";

const { Option } = Select;

const Filter = ({ onSearch, onClear, onChange, filters }) => {
  const [filterValues, setFilterValues] = useState({});
  const [activeKey, setActiveKey] = useState([]);

  const handleFilterChange = (filterKey, value) => {
    setFilterValues((prevValues) => {
      const updatedValues = {
        ...prevValues,
        [filterKey]: value,
      };

      filters.forEach((data) => {
        if (data.moderef) {
          onChange(updatedValues);
        }
      });

      return updatedValues;
    });
  };

  const handleSearch = () => {
    onSearch(filterValues);
  };

  const handleClear = () => {
    setFilterValues({});
    onClear();
  };

  const items = [
    {
      key: "1",
      label: (
        <div className="filter-header flex items-center gap-2">
          <img
            src="/img/icons/filter.png"
            alt="Filter Icon"
            className="w-5 h-5"
          />
          <span className="text-lg">Filter</span>
        </div>
      ),
      children: (
        <>
          <Row gutter={16} className="p-4">
            {filters.map((filter) => (
              <Col
                className="mb-3"
                key={filter.key}
                xs={24}
                sm={12}
                md={8}
                lg={6}
              >
                <label className="block text-gray-700">{filter.label}</label>
                {filter.type === "select" && (
                  <Select
                    value={filterValues[filter.key] || ""}
                    onChange={(value) => handleFilterChange(filter.key, value)}
                    placeholder={filter.placeholder || "Select"}
                    className="w-full"
                  >
                    <Option value="">{filter.placeholder || "All"}</Option>
                    {filter.options.map((option, key) => (
                      <Option
                        key={key}
                        value={filter.key === "status" ? option.code : option.id}
                      >
                        {option.name}
                      </Option>
                    ))}
                  </Select>
                )}
                {filter.type === "text" && (
                  <Input
                    value={filterValues[filter.key] || ""}
                    onChange={(e) =>
                      handleFilterChange(filter.key, e.target.value)
                    }
                    placeholder={filter.placeholder || "Enter value"}
                    className="w-full"
                  />
                )}
                {filter.type === "number" && (
                  <Input
                    type="number"
                    value={filterValues[filter.key] || ""}
                    onChange={(e) =>
                      handleFilterChange(filter.key, e.target.value)
                    }
                    placeholder={filter.placeholder || "Enter number"}
                    className="w-full"
                  />
                )}
                {filter.type === "date" && (
                  <DatePicker
                    value={
                      filterValues[filter.key]
                        ? dayjs(filterValues[filter.key])
                        : null
                    }
                    onChange={(date, dateString) =>
                      handleFilterChange(filter.key, dateString)
                    }
                    placeholder={filter.placeholder || "Select date"}
                    className="w-full"
                    format="YYYY-MM-DD"
                  />
                )}
              </Col>
            ))}
          </Row>

          <div className="flex justify-end gap-4 px-4">
            <DynamicButton
              text="Search"
              iconSrc="/img/icons/search.png"
              className="text-white px-4 py-3 rounded-[4px] bg-[#7DB41E]"
              onClick={handleSearch}
            />
            <DynamicButton
              text="Clear"
              iconSrc="/img/icons/trash.png"
              className="text-white px-4 py-3 rounded-[4px] bg-[#B6AEAB]"
              onClick={handleClear}
            />
          </div>
        </>
      ),
    },
  ];

  return (
    <Collapse
      activeKey={activeKey}
      onChange={(key) => setActiveKey(key)}
      expandIconPosition="end" // เพิ่มไอคอนไว้ด้านขวามือ
      items={items}
    />
  );
};

export default Filter;
