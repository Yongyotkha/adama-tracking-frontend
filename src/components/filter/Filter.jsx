import React, { useState } from 'react';
import { Select, Collapse, Input } from 'antd';
import DynamicButton from '../button/Button'; // Import the button component
import "./Filter.css";

const { Option } = Select;

const Filter = ({ onSearch, onClear, filters }) => {
  // Using a state object to store dynamic values of different filter types
  const [filterValues, setFilterValues] = useState({});

  // Handle input change based on the dynamic filter types
  const handleFilterChange = (filterKey, value) => {
    setFilterValues((prevValues) => ({
      ...prevValues,
      [filterKey]: value,
    }));
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
          <div className="grid grid-cols-3 gap-4 p-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-gray-700">{filter.label}</label>
                {/* Render different types of input based on the type */}
                {filter.type === 'select' && (
                  <Select
                    value={filterValues[filter.key] || ''}
                    onChange={(value) => handleFilterChange(filter.key, value)}
                    placeholder={filter.placeholder || 'Select'}
                    className="w-full"
                  >
                    <Option value="">{filter.placeholder || 'All'}</Option>
                    {filter.options.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                )}
                {filter.type === 'text' && (
                  <Input
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    placeholder={filter.placeholder || 'Enter value'}
                    className="w-full"
                  />
                )}
                {filter.type === 'number' && (
                  <Input
                    type="number"
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    placeholder={filter.placeholder || 'Enter number'}
                    className="w-full"
                  />
                )}
                {/* Add more input types as needed */}
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 px-4">
            <DynamicButton
              text="Search"
              iconSrc="/img/icons/expenses.png"
              className="text-white px-4 py-3 rounded"
              onClick={handleSearch}
              style={{
                backgroundColor: '#7DB41E', // Default background color
              }}
            />
            <DynamicButton
              text="Clear"
              iconSrc="/img/icons/expenses.png"
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

  return <Collapse defaultActiveKey={['1']} items={items} />;
};

export default Filter;
