import { Skeleton } from "antd";

export const ProductCardSkeleton = ({ count = 8 }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "16px",
        padding: "20px",
        width: "100%",
      }}
    >
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #f0f0f0",
            borderRadius: "8px",
            padding: "16px",
            height: "350px",
          }}
        >
          <Skeleton
            active
            avatar={{ shape: "square", size: "large" }}
            paragraph={{ rows: 2 }}
          />
        </div>
      ))}
    </div>
  );
};
