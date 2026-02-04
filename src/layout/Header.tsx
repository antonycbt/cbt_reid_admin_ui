import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export default function Header({ onToggle, collapsed }: any) {
    const sidebarWidth = collapsed ? 72 : 240;
    return (
        <AppBar
        position="fixed"
        elevation={0}
        sx={{
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            ml: `${sidebarWidth}px`,
            width: `calc(100% - ${sidebarWidth}px)`, 
        }}

        >
            <Toolbar sx={{ justifyContent: "space-between" }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <IconButton onClick={onToggle} color="inherit">
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6">ReID Admin</Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">Admin</Typography>
                    <Avatar sx={{ width: 32, height: 32 }}>A</Avatar>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
