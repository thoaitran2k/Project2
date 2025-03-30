import { Badge } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";

const CartIcon = ({ cartCount, handleToOrder }) => {
  return (
    <Badge count={cartCount} showZero>
      <ShoppingCartOutlined
        style={{
          fontSize: "30px",
          color: "rgb(65, 44, 189)",
          transition: "transform 0.2s ease, color 0.2s ease",
          cursor: "pointer",
        }}
        onClick={handleToOrder}
        onMouseEnter={(e) => {
          e.target.style.color = "red";
          e.target.style.transform = "scale(1.2)";
        }}
        onMouseLeave={(e) => {
          e.target.style.color = "rgb(65, 44, 189)";
          e.target.style.transform = "scale(1)";
        }}
      />
    </Badge>
  );
};

export default CartIcon;
