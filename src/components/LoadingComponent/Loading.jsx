import { Spin } from "antd";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { LoadingOutlined } from "@ant-design/icons";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const antIcon = (
  <LoadingOutlined style={{ fontSize: 48, color: "#1890ff" }} spin />
);

export default function Loading({ children }) {
  const isLoading = useSelector((state) => state.loading.isLoading);
  const isLoggingOut = useSelector((state) => state.user.isLoggingOut);

  return (
    <>
      {(isLoading || isLoggingOut) && (
        <Overlay>
          <Spin indicator={antIcon} />
        </Overlay>
      )}
      {children}
    </>
  );
}
