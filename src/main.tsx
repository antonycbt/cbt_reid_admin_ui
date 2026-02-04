import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import App from "./App";
import theme from "./theme/theme";
import { SnackbarProvider } from "./components/snackbar/SnackbarProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
    // <React.StrictMode>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<SnackbarProvider>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</SnackbarProvider>
		</ThemeProvider>
    // </React.StrictMode>
);
