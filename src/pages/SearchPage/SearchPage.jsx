import React from "react";
import SearchComponent from "../../components/SearchComponent/SearchComponent";
import CardComponent from "../../components/CardComponent/CardComponent";

const SearchPage = () => {
  return (
    <div>
      <SearchComponent />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6,1fr)",
          marginTop: "70px",
        }}
      >
        {" "}
        {Array.from({ length: 20 }).map((_, index) => (
          <CardComponent key={index} />
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
