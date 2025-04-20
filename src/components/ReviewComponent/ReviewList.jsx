import React, { useEffect, useState } from "react";
import Review from "./Review";
import { List, Spin } from "antd";
import axios from "axios";

const ReviewList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/reviews/product/${productId}`
        );
        setReviews(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách review:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  return loading ? (
    <Spin />
  ) : (
    <List
      itemLayout="vertical"
      dataSource={reviews}
      renderItem={(review) => <Review review={review} />}
    />
  );
};

export default ReviewList;
