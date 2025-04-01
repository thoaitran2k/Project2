// Trong file JS/TS của component
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styled from "styled-components";
import { Carousel } from "antd";

/* Container chính cho carousel */
export const CarouselStyled = styled(Carousel)`
  /* Chỉ áp dụng khi centerMode=false */
  .slick-slider:not(.slick-center-mode) .slick-slide {
    width: fit-content !important;
    margin: 0 5px; /* Thay thế padding bằng margin để không ảnh hưởng đến kích thước thực */
  }

  /* Điều chỉnh cho track */
  .slick-track {
    display: flex !important;
    align-items: stretch;
  }

  /* Đảm bảo nội dung slide không bị cắt */
  .slick-slide > div {
    width: max-content;
  }
`;
