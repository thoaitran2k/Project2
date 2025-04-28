import React, { useState, useRef, useEffect } from "react";
import { Button, Drawer, Input, List, Avatar } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import axios from "axios";

const { TextArea } = Input;

// Bộ câu hỏi & trả lời mẫu
const faqData = [
  {
    keywords: ["phí vận chuyển", "giao hàng"],
    answer:
      "🚚 Phí vận chuyển là 30.000đ cho đơn dưới 500.000đ, miễn phí cho đơn từ 500.000đ trở lên.",
  },
  {
    keywords: ["thời gian giao hàng", "mất bao lâu"],
    answer: "⏳ Thời gian giao hàng từ 2-5 ngày tuỳ khu vực.",
  },
  {
    keywords: ["đổi trả", "chính sách"],
    answer:
      "🔄 Bạn có thể đổi trả trong vòng 7 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên tag và hoá đơn.",
  },
  {
    keywords: ["momo", "ví điện tử"],
    answer:
      "💳 Website hỗ trợ thanh toán bằng ví Momo, VNPAY và thẻ ngân hàng.",
  },
  {
    keywords: ["hỗ trợ", "tư vấn"],
    answer: "📞 Bạn có thể liên hệ hotline 1900-1234 để được tư vấn miễn phí!",
  },
  {
    keywords: ["khuyến mãi", "sale"],
    answer:
      "🔥 Hiện tại đang có chương trình SALE OFF 50%! Bạn có thể xem tại trang 'Sale Off'.",
  },
];

const ChatbotComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Xin chào! Bạn cần hỗ trợ gì không?" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    const userMessage = { from: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);

    setInputValue(""); // Clear trước để UX tốt hơn

    try {
      const response = await axios.post(
        "http://localhost:3002/api/chatbot",
        {
          message: inputValue,
        },
        { withCredentials: true }
      ); // thêm withCredentials nếu server cần cookie

      const botReply = response.data.reply;

      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Xin lỗi, hiện tại không thể gửi tin nhắn." },
      ]);
    }
  };

  // Auto scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<MessageOutlined />}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1000,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
        onClick={toggleDrawer}
      />

      <Drawer
        title="Hỗ trợ khách hàng"
        placement="right"
        onClose={toggleDrawer}
        open={isOpen}
        width={350}
      >
        <div style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: 8 }}>
          <List
            dataSource={messages}
            renderItem={(item) => (
              <List.Item
                style={{
                  justifyContent:
                    item.from === "user" ? "flex-end" : "flex-start",
                }}
              >
                <List.Item.Meta
                  avatar={
                    item.from === "bot" ? (
                      <Avatar src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" />
                    ) : (
                      <Avatar style={{ backgroundColor: "#87d068" }}>U</Avatar>
                    )
                  }
                  description={item.text}
                  style={{ maxWidth: "70%" }}
                />
              </List.Item>
            )}
          />
          <div ref={messagesEndRef} />
        </div>

        <TextArea
          placeholder="Nhập tin nhắn..."
          autoSize={{ minRows: 1, maxRows: 3 }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSendMessage}
          style={{ marginTop: 12 }}
        />
        <Button
          type="primary"
          block
          onClick={handleSendMessage}
          style={{ marginTop: 8 }}
        >
          Gửi
        </Button>
      </Drawer>
    </>
  );
};

export default ChatbotComponent;
