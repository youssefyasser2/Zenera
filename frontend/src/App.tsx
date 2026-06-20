import { ChakraProvider } from "@chakra-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Providers } from "@/providers";
import AppRoutes from "./routes/AppRoutes";
import queryClient from "./config/queryClient";
import theme from "./styles/theme";
import { Suspense } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function App() {
  return (
    <Providers>
      <ChakraProvider value={theme}>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<div>Loading...</div>}>
            <AppRoutes />
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        </QueryClientProvider>
      </ChakraProvider>
    </Providers>
  );
}

export default App;