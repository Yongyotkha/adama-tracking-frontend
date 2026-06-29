/* eslint-disable react/prop-types */
import { AutoComplete } from 'antd';

const DynamicAutoComplete = ({ options, placeholder, onSearch, onSelect, style, className }) => {
  return (
    <AutoComplete
      style={style || { width: 200 }}
      options={options}
      placeholder={placeholder || "Search..."}
      filterOption={(inputValue, option) =>
        option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
      }
      onSearch={onSearch}
      onSelect={onSelect}
      className={className}
    />
  );
};

export default DynamicAutoComplete;
