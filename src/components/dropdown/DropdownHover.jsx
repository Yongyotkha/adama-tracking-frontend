import React from 'react';
import { Dropdown } from 'antd';

const DropdownHover = ({ items, triggerText = 'Hover me', className = '' }) => (
	<Dropdown
		className={`cursor-pointer p-5 m-2 ${className}`} // Add the className prop here
		menu={{
			items,
		}}
		placement="bottomLeft"
	>
		<span className={className}>
			{triggerText}
		</span>
	</Dropdown>
);

export default DropdownHover;
