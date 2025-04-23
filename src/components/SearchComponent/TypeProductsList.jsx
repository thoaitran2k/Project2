import styled from "styled-components";

const TypeProductsList = ({ types, selectedTypes, setSelectedTypes }) => {
  const handleTypeClick = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleReset = () => {
    setSelectedTypes([]);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "20px",
        justifyContent: "center",
        marginLeft: "50px",
      }}
    >
      <TypeListContainer>
        {types.map((type) => (
          <TypeButton
            key={type}
            $isSelected={selectedTypes.includes(type)}
            onClick={() => handleTypeClick(type)}
          >
            {type}
          </TypeButton>
        ))}
      </TypeListContainer>

      <ResetButton $visible={selectedTypes.length > 0} onClick={handleReset}>
        Reset
      </ResetButton>
    </div>
  );
};

// Styled components
const TypeListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;
  justify-content: center;
  //background-color: #f8f8f8;
  border-radius: 8px;
  margin: 16px 0;
`;

const TypeButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${(props) => (props.$isSelected ? "#1890ff" : "#d9d9d9")};
  background-color: ${(props) => (props.$isSelected ? "#e6f7ff" : "white")};
  color: ${(props) => (props.$isSelected ? "#1890ff" : "inherit")};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
  }
`;

const ResetButton = styled.button`
  padding: 5px 10px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.3s ease;
  visibility: ${(props) => (props.$visible ? "visible" : "hidden")};
  opacity: ${(props) => (props.$visible ? 1 : 0)};
`;

export default TypeProductsList;
