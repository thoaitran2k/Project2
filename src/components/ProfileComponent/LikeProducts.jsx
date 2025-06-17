import React, { useEffect, useState } from "react";
import axios from "axios";
import CardComponent from "../../components/CardComponent/CardComponent";
import styled from "styled-components";
import { Spin } from "antd";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";

const LikeProducts = () => {
  const [likedProducts, setLikedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedProducts = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        console.log("token", token);

        const response = await axios.get(
          "http://localhost:3002/api/like/get-liked-products",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const products = response.data.map((item) => item.product);
        setLikedProducts(products);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm yêu thích:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedProducts();
  }, []);

  console.log("res", likedProducts);

  return (
    <Container>
      {loading ? (
        <Spin size="large" />
      ) : likedProducts.length === 0 ? (
        <p>
          Hãy{" "}
          <span style={{ color: "#ff4d4f" }}>
            {" "}
            <HeartFilled />{" "}
          </span>{" "}
          cho sản phẩm bạn yêu thích!
        </p>
      ) : (
        <CardComponent
          products={likedProducts}
          totalProducts={likedProducts.length}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 24px;
`;

export default LikeProducts;
