import { createContext, useState } from "react";
import type { ReactNode } from "react";
import { Snackbar, Alert } from "@mui/material";

type SnackbarSeverity = "success" | "error";

interface SnackbarContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

/* ✅ EXPORT CONTEXT */
export const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSuccess = (message: string) => {
    setSnackbar({ open: true, message, severity: "success" });
  };

  const showError = (message: string) => {
    setSnackbar({ open: true, message, severity: "error" });
  };

  return (
    <SnackbarContext.Provider value={{ showSuccess, showError }}>
      {children}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
