import styled from "styled-components";

const TypeProductsList = ({ types, selectedTypes, setSelectedTypes }) => {
  const handleTypeClick = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
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
  );
};

// Styled components
const TypeListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;
  justify-content: center;
  background-color: #f8f8f8;
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

export default TypeProductsList;
