import React from "react";
import Review from "./Review";
import { List } from "antd";

const reviews = [
  {
    userName: "Nguyễn Thị Thúy Liễu",
    userInitials: "TL",
    rating: 5,
    title: "Cực kì hài lòng",
    content: "Màu đẹp. Chất dưỡng mềm môi...",
    images: [
      "https://via.placeholder.com/100",
      "https://via.placeholder.com/100",
    ],
    color: "Red Pink (Hồng Đỏ)",
    date: "2 năm trước",
    likes: 2,
  },
  {
    userName: "Tiên Tiên",
    userInitials: "TT",
    rating: 5,
    title: "Cực kì hài lòng",
    content: "Mình đã nhận được hàng Tiki giao rất nhanh...",
    images: ["https://via.placeholder.com/100"],
    color: "Red Orange (Cam Đỏ)",
    date: "5 năm trước",
    likes: 8,
  },
];

const ReviewList = () => {
  return (
    <List
      itemLayout="vertical"
      dataSource={reviews}
      renderItem={(review) => <Review review={review} />}
    />
  );
};

export default ReviewList;
