import styled from "styled-components";
import TableComponent from "../TableComponent/TableComponent";

export const WrapperHeader = styled.h1`
  color: black;
  font-size: 14px;
`;
export const CustomUpload = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;

  .ant-upload-list-item-name {
    display: none;
  }
  .ant-btn-icon {
    display: none;
  }
  .ant-upload-icon {
    display: none;
  }
  .ant-upload-list-item-container {
    display: none;
  }
`;

export const TableProduct = styled(TableComponent)`
  .row-blocked {
    color: red !important;
  }
`;
