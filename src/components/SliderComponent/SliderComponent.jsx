import React from "react";
import { Image } from "antd";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styled from "styled-components";

const SliderComponent = ({ arrImages }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <SliderWrapper>
      <Slider {...settings}>
        {arrImages.map((image, index) => (
          <div key={index}>
            <Image
              src={image}
              alt={`slider-${index}`}
              preview={false} // Ẩn chức năng phóng to của Ant Design
              style={{ width: "100%", height: "auto", objectFit: "cover" }}
            />
          </div>
        ))}
      </Slider>
    </SliderWrapper>
  );
};

export default SliderComponent;

// Định dạng lại wrapper để không có khoảng trắng thừa
const SliderWrapper = styled.div`
  width: 100%;
  max-width: 1550px;
  margin: 0 auto;
  padding: 0;
`;
