import "@mui/x-data-grid/themeAugmentation";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
  },

  palette: {
    mode: "dark",
    primary: {
      main: "#00E5FF",
    },
    secondary: {
      main: "#7C4DFF",
    },
    background: {
      default: "#0E1117",
      paper: "#161B22",
    },
    text: {
      primary: "#E6EDF3",
      secondary: "#9BA3AF",
    },
    success: {
      main: "#2ECC71",
    },
    warning: {
      main: "#FBC02D",
    },
    error: {
      main: "#E53935",
    },
  },

  spacing: 8,

  components: {
    /* =====================================================
       GLOBAL SEAMLESS SCROLL (INVISIBLE BUT WORKING)
    ===================================================== */
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          height: "100%",
          overflow: "hidden",
        },

        body: {
          height: "100%",
          overflow: "hidden",

          /* Firefox */
          scrollbarWidth: "none",

          /* IE / Edge */
          msOverflowStyle: "none",

          /* Chrome / Safari */
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },

        "#root": {
          height: "100%",
          overflow: "hidden",
        },
      },
    },

    /* =====================================================
       TEXT INPUTS
    ===================================================== */
    MuiTextField: {
      defaultProps: {
        size: "small",
        variant: "outlined",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: 14,
          borderRadius: 6,
        },
        input: {
          padding: "8.5px 12px",
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: 13,
        },
      },
    },

    /* =====================================================
       SELECT / MENU
    ===================================================== */
    MuiSelect: {
      defaultProps: {
        size: "small",
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: 14,
          minHeight: 32,
        },
      },
    },

    /* =====================================================
       BUTTONS
    ===================================================== */
    MuiButton: {
      defaultProps: {
        size: "small",
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          padding: "6px 14px",
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },

    /* =====================================================
       SWITCH / CHECKBOX
    ===================================================== */
    MuiSwitch: {
      defaultProps: {
        size: "small",
      },
    },

    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          marginLeft: 0,
        },
        label: {
          fontSize: 14,
        },
      },
    },

    /* =====================================================
       DIALOGS
    ===================================================== */
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: 16,
          fontWeight: 600,
          paddingBottom: 8,
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          paddingTop: 12,
        },
      },
    },

    /* =====================================================
       DATA GRID (SEAMLESS SCROLL, NO SCROLLBAR)
    ===================================================== */
    MuiDataGrid: {
  styleOverrides: {
    root: {
      border: "none",
      fontSize: 14,
      "& .MuiDataGrid-scrollbar": {
        display: "none !important", // hide internal scrollbars
      },
      "& .MuiTablePagination-root": {
        overflow: "hidden", // hide footer scrollbar
      },
    },
    virtualScroller: {
      scrollbarWidth: "none", // Firefox
      msOverflowStyle: "none", // IE/Edge
      "&::-webkit-scrollbar": { display: "none" }, // Chrome/Safari
    },
  },
}, 
  }, 
});

export default theme;
