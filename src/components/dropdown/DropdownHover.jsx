import React from 'react';
import { Button, Dropdown } from 'antd';

const DropdownHover = ({ items, triggerText = 'Hover me' }) => (
  <Dropdown className={`cursor-pointer p-5 m-2`}
    menu={{
      items,
    }}
    placement="bottomLeft"
  >
    <Button>
      {triggerText}
    </Button>
  </Dropdown>
);

export default DropdownHover;
