import { Spin } from "antd";
import styled from "styled-components";
import { LoadingOutlined } from "@ant-design/icons";

const Overlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const CustomSpin = styled(Spin)`
  .ant-spin-dot {
    font-size: 40px; /* Kích thước icon */
  }
`;

const antIcon = (
  <LoadingOutlined style={{ fontSize: 40, color: "#1890ff" }} spin />
);

export default function PagingLoading() {
  return (
    <Overlay>
      <CustomSpin indicator={antIcon} />
    </Overlay>
  );
}
