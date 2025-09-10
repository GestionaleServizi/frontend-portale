import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: `'Segoe UI', sans-serif`,
    body: `'Segoe UI', sans-serif`,
  },
  colors: {
    brand: {
      50: "#e3f2ff",
      100: "#b3daff",
      200: "#81c2ff",
      300: "#4faaff",
      400: "#1d92ff",
      500: "#0378e6", // 👉 colore principale
      600: "#005db4",
      700: "#004182",
      800: "#002651",
      900: "#000b22",
    },
  },
  breakpoints: {
    sm: "30em",  // 480px
    md: "48em",  // 768px
    lg: "62em",  // 992px
    xl: "80em",  // 1280px
    "2xl": "96em" // 1536px
  },
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.800",
      },
      a: {
        color: "brand.500",
        _hover: {
          textDecoration: "underline",
        },
      },
    },
  },
});

export default theme;
