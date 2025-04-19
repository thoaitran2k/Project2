import React, { useState } from "react";
import { Tabs } from "antd";
import styled from "styled-components";
import CreatePromotion from "./CreatePromotion";
import PromotionTable from "./PromotionTable";

const ManagementContainer = styled.div`
  max-width: 1900px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
  background-color: #f8fafc;
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 24px;
    &::before {
      border-bottom: 1px solid #e2e8f0;
    }
  }

  .ant-tabs-tab {
    font-size: 16px;
    font-weight: 500;
    padding: 12px 24px;
    color: #64748b;
    transition: all 0.3s ease;

    &:hover {
      color: #334155;
    }

    &.ant-tabs-tab-active .ant-tabs-tab-btn {
      color: #2563eb;
      font-weight: 600;
    }
  }

  .ant-tabs-ink-bar {
    background: #2563eb;
    height: 3px;
  }
`;

const PromotionManagement = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePromotionCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const items = [
    {
      key: "1",
      label: "Danh sách mã giảm giá",
      children: <PromotionTable refreshKey={refreshKey} />,
    },
    {
      key: "2",
      label: "Tạo mã giảm giá mới",
      children: <CreatePromotion onSuccess={handlePromotionCreated} />,
    },
  ];

  return (
    <ManagementContainer>
      <StyledTabs defaultActiveKey="1" items={items} />
    </ManagementContainer>
  );
};

export default PromotionManagement;
