import React, { useState } from 'react';
import { Select, Collapse } from 'antd';
import DynamicButton from '../button/Button'; // Import the button component
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import "./Filter.css";

const { Option } = Select;

const Filter = ({ onSearch, onClear, years, statuses }) => {
  const [year, setYear] = useState(null);
  const [status, setStatus] = useState(null);

  const handleSearch = () => {
    onSearch({ year, status });
  };

  const handleClear = () => {
    setYear(null);
    setStatus(null);
    onClear();
  };

  const items = [
    {
      key: '1',
      label: (
        <div className="filter-header flex items-center gap-2">
          {/* Replacing the icon with the image */}
          <img src="/img/icons/filter.png" alt="Filter Icon" className="w-5 h-5" />
          <span className="text-lg">Filter</span>
        </div>
      ),
      showArrow: false, // Removing arrow icon
      children: (
        <>
          <div className="grid grid-cols-2 gap-4 p-4">
            {/* Year Filter */}
            <div>
              <label className="block text-gray-700">Year</label>
              <Select
                value={year}
                onChange={(value) => setYear(value)}
                placeholder="All"
                className="w-full"
              >
                <Option value={null}>All</Option>
                {years.map((y) => (
                  <Option key={y} value={y}>
                    {y}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-gray-700">Status</label>
              <Select
                value={status}
                onChange={(value) => setStatus(value)}
                placeholder="All"
                className="w-full"
              >
                <Option value={null}>All</Option>
                {statuses.map((s) => (
                  <Option key={s} value={s}>
                    {s}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 px-4">
            <DynamicButton
              text="Search"
              icon={<SearchOutlined />}
              className="text-white px-4 py-3 rounded"
              onClick={handleSearch}
              style={{
                backgroundColor: '#7DB41E', // Default background color
              }}
            />
            <DynamicButton
              text="Clear"
              icon={<DeleteOutlined />}
              className="text-white px-4 py-3 rounded"
              onClick={handleClear}
              style={{
                backgroundColor: '#B6AEAB', // Default background color
              }}
            />
          </div>
        </>
      ),
    },
  ];

  return (
    // Applying the className `m-3` to the Collapse component
    <Collapse defaultActiveKey={['1']} items={items}/>
  );
};

export default Filter;
