import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx"; // Đảm bảo đúng tên file
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistGate } from "redux-persist/integration/react";
import { SearchProvider } from "./components/Layout/SearchContext";

console.warn = () => {};

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SearchProvider>
            <App />
          </SearchProvider>
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  </StrictMode>
);
