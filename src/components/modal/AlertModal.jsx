// src/components/modal/AlertModal.jsx
import React, { forwardRef, useImperativeHandle } from 'react';
import { Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

const { confirm } = Modal;

// eslint-disable-next-line react/display-name
const AlertModal = forwardRef(
  ({ title, content, onOk, onCancel, okText, cancelText, okType, okButtonProps }, ref) => {
    // Define the showModal function
    const showModal = () => {
      confirm({
        title: title || 'Are you sure?',
        icon: <ExclamationCircleFilled />,
        content: content || null,
        okText: okText || 'Yes',
        cancelText: cancelText || 'No',
        okType: okType || 'primary',
        okButtonProps: okButtonProps,
        onOk: onOk || (() => console.log('OK')),
        onCancel: onCancel || (() => console.log('Cancel')),
      });
    };

    // Expose the showModal method to the parent via the ref
    useImperativeHandle(ref, () => ({
      showModal,
    }));

    return null; // Render nothing
  }
);

export default AlertModal;
