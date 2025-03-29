import React, { useState } from "react";
import { Modal, Radio, Button } from "antd";
import { useSelector, useDispatch } from "react-redux";

const AddressModal = ({ isOpen, onClose, onSelect }) => {
  const user = useSelector((state) => state.user);
  const defaultAddress = user.address.find((addr) => addr.isDefault);
  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddress?._id || user.address[0]?._id || null
  );

  const handleOk = () => {
    if (!selectedAddressId) return;

    const chosenAddress = user.address.find(
      (addr) => addr._id === selectedAddressId
    );
    if (chosenAddress) {
      onSelect(chosenAddress);
      onClose();
    }
  };

  // Kiểm tra nếu không có địa chỉ
  if (!user.address || user.address.length === 0) {
    return (
      <Modal
        title="Chọn địa chỉ giao hàng"
        open={isOpen}
        onCancel={onClose}
        footer={[
          <Button key="cancel" onClick={onClose}>
            Đóng
          </Button>,
        ]}
      >
        <p>Bạn chưa có địa chỉ giao hàng nào</p>
      </Modal>
    );
  }

  return (
    <Modal
      title="Chọn địa chỉ giao hàng"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleOk}
          disabled={!selectedAddressId}
        >
          Xác nhận
        </Button>,
      ]}
    >
      <Radio.Group
        onChange={(e) => setSelectedAddressId(e.target.value)}
        value={selectedAddressId}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        {user.address.map((addr) => (
          <Radio key={addr._id} value={addr._id}>
            <div>
              <strong>{addr.name}</strong> -{" "}
              {addr.phoneDelivery || "Chưa có số điện thoại"}
            </div>
            <div>{addr.address}</div>
          </Radio>
        ))}
      </Radio.Group>
    </Modal>
  );
};

export default AddressModal;
