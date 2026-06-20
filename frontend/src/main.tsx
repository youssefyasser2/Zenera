import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.tsx";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./store";
import { Provider as ChakraProvider } from "./components/ui/provider.tsx"; 

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <Router>
        <ChakraProvider>
          <App />
        </ChakraProvider>
      </Router>
    </ReduxProvider>
  </StrictMode>
);
