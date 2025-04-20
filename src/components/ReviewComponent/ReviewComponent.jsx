import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Rate,
  Typography,
  Image,
  Space,
  Button,
  List,
  Input,
  Spin,
  Upload,
  message,
  Select,
  Collapse,
} from "antd";
import {
  LikeOutlined,
  MessageOutlined,
  PlusOutlined,
  DownOutlined,
} from "@ant-design/icons";
import {
  addCommentToReview,
  createReview,
  fetchReviews,
  likeReview,
} from "../../redux/slices/reviewSlice";
import axios from "axios";

const { Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// Danh sách options
const COLOR_OPTIONS = [
  "Đỏ",
  "Xanh dương",
  "Xanh lá",
  "Vàng",
  "Đen",
  "Trắng",
  "Hồng",
  "Tím",
  "Cam",
  "Xám",
  "Nâu",
  "Be",
];
const SIZE_OPTIONS = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "36",
  "38",
  "40",
  "42",
  "44",
  "46",
];
const DIAMETER_OPTIONS = ["38mm", "39mm", "40mm", "41mm", "42mm", "43mm"];

const ReviewComponent = ({ productId, onReviewSubmitted }) => {
  const dispatch = useDispatch();
  const reviews = useSelector((state) => state.reviews.reviews || []);
  const loading = useSelector((state) => state.reviews.loading);

  const [expandedCommentBoxId, setExpandedCommentBoxId] = useState(null);
  const [commentTextMap, setCommentTextMap] = useState({});
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: "",
    comment: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState({
    color: undefined,
    size: undefined,
    diameter: undefined,
  });
  const [visibleReviews, setVisibleReviews] = useState(5); // Số lượng reviews hiển thị ban đầu
  const [loadingMore, setLoadingMore] = useState(false);

  const formatDiameter = (d) => {
    if (!d) return undefined;
    const match = d.match(/\d+/);
    return match ? parseInt(match[0]) : undefined;
  };

  const handleAttributeChange = (key, value) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    if (productId) {
      dispatch(fetchReviews(productId));
    }
  }, [productId, dispatch]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    // Giả lập việc tải thêm dữ liệu (trong thực tế có thể gọi API phân trang)
    setTimeout(() => {
      setVisibleReviews((prev) => prev + 5);
      setLoadingMore(false);
    }, 500);
  };

  const handleChangePreviewImage = (info) => {
    const newFiles = info.fileList
      .slice(0, 4)
      .map((file) => file.originFileObj || file);

    // Hiển thị ảnh preview ngay lập tức
    const previewUrls = newFiles.map((file) => URL.createObjectURL(file));

    setImagePreviews(previewUrls);
    setSelectedFiles(newFiles);
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleUploadImages = async () => {
    console.log("📤 Bắt đầu upload ảnh...");

    if (!selectedFiles || selectedFiles.length === 0) {
      message.warning("Vui lòng chọn ảnh trước khi upload!");
      return [];
    }

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      console.log("🖼 Đang thêm file vào FormData:", file);
      formData.append("images", file);
    });

    try {
      const response = await axios.post(
        `http://localhost:3002/api/product/upload-images`,
        formData,
        { headers: { Accept: "application/json" } }
      );

      console.log("📥 Kết quả API upload:", response.data);

      if (
        response.data &&
        response.data.imageUrls &&
        response.data.imageUrls.length > 0
      ) {
        return response.data.imageUrls;
      } else {
        throw new Error("Không tìm thấy danh sách imageUrls trong response!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi tải ảnh lên:", error);
      message.error("Tải ảnh lên thất bại!");
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitReview = async () => {
    const { rating, title, comment } = newReview;
    if (!rating || !comment.trim()) return;

    let imageUrls = [];
    if (selectedFiles.length > 0) {
      imageUrls = await handleUploadImages();
    }

    dispatch(
      createReview({
        productId,
        rating,
        title,
        comment,
        images: imageUrls,
        diameter: formatDiameter(selectedAttributes.diameter),
        ...selectedAttributes,
      })
    )
      .unwrap()
      .then(async (res) => {
        message.success("Đánh giá thành công");
        try {
          await axios.put(
            `http://localhost:3002/api/product/${productId}/update-rating`
          );
          if (onReviewSubmitted) {
            onReviewSubmitted();
          }
        } catch (error) {
          console.error("Lỗi khi cập nhật rating sản phẩm:", error);
        }
        setNewReview({ rating: 0, title: "", comment: "" });
        setSelectedFiles([]);
        setImagePreviews([]);
        setVisibleReviews(5);
        dispatch(fetchReviews(productId));
      })
      .catch((err) => {
        if (err?.message === "Bạn đã đánh giá sản phẩm này rồi") {
          message.warning(err.message);
        } else {
          message.error("Không thể gửi đánh giá");
        }
      });
  };

  const handleLike = (reviewId) => {
    dispatch(likeReview(reviewId));
  };

  const handleCommentChange = (reviewId, value) => {
    setCommentTextMap((prev) => ({ ...prev, [reviewId]: value }));
  };

  const handleAddComment = (reviewId) => {
    const comment = commentTextMap[reviewId]?.trim();
    if (comment) {
      dispatch(addCommentToReview(reviewId, comment));
      setCommentTextMap((prev) => ({ ...prev, [reviewId]: "" }));
      setExpandedCommentBoxId(null);
    }
  };

  const displayedReviews = reviews.slice(0, visibleReviews);
  const hasMoreReviews = reviews.length > visibleReviews;

  return loading ? (
    <Spin />
  ) : (
    <>
      <List
        itemLayout="vertical"
        dataSource={displayedReviews}
        locale={{ emptyText: "Chưa có bình luận" }}
        renderItem={(review) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                review.userSnapshot?.avatar ? (
                  <Avatar src={review.userSnapshot.avatar} />
                ) : (
                  <Avatar>
                    {review.userSnapshot?.username?.[0]?.toUpperCase()}
                  </Avatar>
                )
              }
              title={<Text strong>{review.userSnapshot?.username}</Text>}
              description={
                <>
                  <Rate
                    disabled
                    defaultValue={review.rating}
                    className="mb-2"
                  />
                  <Text strong className="block mt-1">
                    {review.title || "Không có tiêu đề"}
                  </Text>
                  <Paragraph>{review.comment}</Paragraph>

                  {review.images?.length > 0 && (
                    <Space style={{ marginTop: 8 }}>
                      {review.images.map((img, idx) => (
                        <Image key={idx} width={80} src={img} />
                      ))}
                    </Space>
                  )}

                  <Text type="secondary" className="block mt-2">
                    {review.color && (
                      <>
                        Màu: <Text strong>{review.color}</Text> ·{" "}
                      </>
                    )}
                    {review.size && (
                      <>
                        Size: <Text strong>{review.size}</Text> ·{" "}
                      </>
                    )}
                    {review.diameter && (
                      <>
                        Đường kính: <Text strong>{review.diameter}</Text> ·{" "}
                      </>
                    )}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>

                  <div className="mt-3 flex gap-3">
                    <Button
                      icon={<LikeOutlined />}
                      type="text"
                      onClick={() => handleLike(review._id)}
                    >
                      {review.likes?.length || 0}
                    </Button>

                    <Button
                      icon={<MessageOutlined />}
                      type="text"
                      onClick={() =>
                        setExpandedCommentBoxId((prev) =>
                          prev === review._id ? null : review._id
                        )
                      }
                    >
                      Bình luận
                    </Button>
                  </div>

                  {/* Danh sách bình luận */}
                  {review.comments?.length > 0 && (
                    <div style={{ marginTop: 16, paddingLeft: 30 }}>
                      {review.comments.map((c, i) => (
                        <div key={i} style={{ marginBottom: 10 }}>
                          <Avatar src={c.avatar} style={{ marginRight: 8 }} />
                          <Text strong>{c.username || "Người dùng"}</Text>:{" "}
                          {c.content}
                          <div style={{ fontSize: 12, color: "#888" }}>
                            {new Date(c.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Form bình luận */}
                  {expandedCommentBoxId === review._id && (
                    <div style={{ marginTop: 12, paddingLeft: 30 }}>
                      <Input.TextArea
                        rows={2}
                        value={commentTextMap[review._id] || ""}
                        onChange={(e) =>
                          handleCommentChange(review._id, e.target.value)
                        }
                        placeholder="Thêm bình luận..."
                      />
                      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                        <Button
                          type="primary"
                          onClick={() => handleAddComment(review._id)}
                        >
                          Gửi
                        </Button>
                        <Button onClick={() => setExpandedCommentBoxId(null)}>
                          Hủy
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              }
            />
          </List.Item>
        )}
      />

      {/* Nút xem thêm */}
      {hasMoreReviews && (
        <div style={{ textAlign: "center" }}>
          <Button
            style={{ width: "100%", height: "40px" }}
            onClick={handleLoadMore}
            loading={loadingMore}
            type="primary"
          >
            Xem thêm bình luận
          </Button>
        </div>
      )}

      <div style={{ marginBottom: 24, marginTop: 24 }}>
        <Text strong style={{ fontSize: 16 }}>
          Viết đánh giá của bạn
        </Text>
        <div style={{ marginTop: 12 }}>
          <Rate
            value={newReview.rating}
            onChange={(val) =>
              setNewReview((prev) => ({ ...prev, rating: val }))
            }
          />
          <Input
            placeholder="Tiêu đề (tuỳ chọn)"
            style={{ marginTop: 8 }}
            value={newReview.title}
            onChange={(e) =>
              setNewReview((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <Input.TextArea
            rows={3}
            placeholder="Nhận xét của bạn..."
            style={{ marginTop: 8 }}
            value={newReview.comment}
            onChange={(e) =>
              setNewReview((prev) => ({ ...prev, comment: e.target.value }))
            }
          />

          <div style={{ marginTop: 8 }}>
            <Button
              type="link"
              icon={<DownOutlined />}
              onClick={() => setShowAdvancedFields(!showAdvancedFields)}
            >
              Thêm thông tin sản phẩm
            </Button>
          </div>

          {/* Các trường thông tin thêm */}
          {showAdvancedFields && (
            <div
              style={{
                marginTop: 8,
                padding: 16,
                border: "1px dashed #d9d9d9",
                borderRadius: 4,
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <Select
                  placeholder="Chọn màu sắc"
                  style={{ width: "100%" }}
                  value={selectedAttributes.color}
                  onChange={(value) => handleAttributeChange("color", value)}
                  allowClear
                >
                  {COLOR_OPTIONS.map((color) => (
                    <Option key={color} value={color}>
                      {color}
                    </Option>
                  ))}
                </Select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <Select
                  placeholder="Chọn kích thước"
                  style={{ width: "100%" }}
                  value={selectedAttributes.size}
                  onChange={(value) => handleAttributeChange("size", value)}
                  allowClear
                >
                  {SIZE_OPTIONS.map((size) => (
                    <Option key={size} value={size}>
                      {size}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Select
                  placeholder="Chọn đường kính"
                  style={{ width: "100%" }}
                  value={selectedAttributes.diameter}
                  onChange={(value) => handleAttributeChange("diameter", value)}
                  allowClear
                >
                  {DIAMETER_OPTIONS.map((diameter) => (
                    <Option key={diameter} value={diameter}>
                      {diameter}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          {/* Phần upload ảnh */}
          <Upload
            beforeUpload={() => false}
            onChange={handleChangePreviewImage}
            multiple
            maxCount={4}
            showUploadList={false}
            disabled={uploading}
          >
            <Button icon={<PlusOutlined />} disabled={uploading}>
              Chọn ảnh (tối đa 4)
            </Button>
          </Upload>

          {/* Hiển thị preview ảnh */}
          {imagePreviews.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              {imagePreviews.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`preview-${index}`}
                  style={{ width: 80, height: 80, objectFit: "cover" }}
                />
              ))}
            </div>
          )}

          <div style={{ marginTop: 8 }}>
            <Button
              type="primary"
              onClick={handleSubmitReview}
              loading={uploading}
              disabled={uploading}
            >
              {uploading ? "Đang tải lên..." : "Gửi đánh giá"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewComponent;
