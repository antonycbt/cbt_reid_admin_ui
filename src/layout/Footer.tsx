import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        py: 1,
        textAlign: "center",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        © 2026 ReID System
      </Typography>
    </Box>
  );
}
