import React from "react";
import { Avatar, Rate, Typography, Image, Space, Button, List } from "antd";
import {
  LikeOutlined,
  MessageOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";

const { Text, Paragraph } = Typography;

// Dummy data (giả lập dữ liệu review)
const dummyReviews = [
  {
    id: 1,
    userInitials: "A",
    userName: "Anh Nguyễn",
    rating: 5,
    title: "Sản phẩm rất tốt!",
    content: "Mình rất hài lòng với chất lượng sản phẩm, giao hàng nhanh.",
    images: [
      "https://res.cloudinary.com/dxwqi77i8/image/upload/v1741787802/products/jb9sahztjfgg36vcy7i9.png",
      "https://res.cloudinary.com/dxwqi77i8/image/upload/v1741787802/products/jb9sahztjfgg36vcy7i9.png",
    ],
    color: "Xanh",
    date: "17/03/2025",
    likes: 12,
  },
  {
    id: 2,
    userInitials: "B",
    userName: "Bảo Trần",
    rating: 4,
    title: "Đáng tiền!",
    content: "Chất liệu ổn, màu đẹp, sẽ ủng hộ shop lần sau.",
    images: [
      "https://res.cloudinary.com/dxwqi77i8/image/upload/v1741787802/products/jb9sahztjfgg36vcy7i9.png",
    ],
    color: "Đen",
    date: "16/03/2025",
    likes: 8,
  },
];

const ReviewComponent = () => {
  return (
    <List
      itemLayout="horizontal"
      dataSource={dummyReviews}
      renderItem={(review) => (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar size={48}>{review.userInitials}</Avatar>}
            title={<Text strong>{review.userName}</Text>}
            description={
              <>
                {/* Đánh giá sao */}
                <Rate disabled defaultValue={review.rating} className="mb-2" />

                {/* Tiêu đề + Nội dung */}
                <Text strong className="block mt-1">
                  {review.title}
                </Text>
                <Paragraph>{review.content}</Paragraph>

                {/* Ảnh sản phẩm */}
                {review.images?.length > 0 && (
                  <Space>
                    {review.images.map((img, index) => (
                      <Image key={index} width={80} src={img} />
                    ))}
                  </Space>
                )}

                {/* Thông tin thêm */}
                <Text type="secondary" className="block mt-2">
                  Màu: <Text strong>{review.color}</Text> · Đánh giá vào{" "}
                  {review.date}
                </Text>

                {/* Hành động */}
                <div className="mt-3 flex gap-3">
                  <Button icon={<LikeOutlined />} type="text">
                    {review.likes}
                  </Button>
                  <Button icon={<MessageOutlined />} type="text">
                    Bình luận
                  </Button>
                  <Button icon={<ShareAltOutlined />} type="text">
                    Chia sẻ
                  </Button>
                </div>
              </>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default ReviewComponent;
