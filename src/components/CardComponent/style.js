import styled from "styled-components";
import { Button } from "antd";

export const WrapperButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 50px;
  text-align: center;
`;

export const WrapperButtonMore = styled(Button)`
  border: 1px solid rgb(11, 116, 229);
  color: rgb(11, 116, 229);
  width: 240px;
  height: 38px;
  font-weight: 500;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    color: #fff;
    background: rgb(18, 96, 190) !important;
    span {
      color: #fff;
    }
  }
`;
