import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const theme = createSystem(
  defineConfig({
    ...defaultConfig,

    globalCss: {
      "html, body, #root": {
        height: "100%",             
        width: "100%",             
        margin: 0,
        padding: 0,
        backgroundColor: "#162837", 
        fontFamily: "Inter, sans-serif",
        color: "#EEEDF0",
        lineHeight: "1.6",
        scrollBehavior: "smooth",
        overflowX: "hidden",       
      },

      "*": {
        boxSizing: "border-box",
      },

      
      "#root": {
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      },
    },
  })
);

export default theme;
