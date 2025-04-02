import { createContext, useContext, useState } from "react";

// Tạo context
const SearchContext = createContext();

// Tạo provider
export const SearchProvider = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
  };

  return (
    <SearchContext.Provider value={{ isSearchOpen, toggleSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

// Tạo custom hook
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
