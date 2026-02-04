import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VideocamIcon from "@mui/icons-material/Videocam";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HistoryIcon from "@mui/icons-material/History";

import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from "@mui/material";

import { NavLink } from "react-router-dom"; 

    const menu = [
        { label: "Users", icon: <PeopleIcon />, path: "/users" }, 
        { label: "Departments", icon: <BusinessIcon />, path: "/departments" }, 
        { label: "Site Hierarchy", icon: <AccountTreeIcon />, path: "/site_hierarchy" }, 
        { label: "Site Location", icon: <LocationOnIcon />, path: "/site_location" }, 
        { label: "Cameras", icon: <VideocamIcon />, path: "/cameras" }, 
        { label: "Access Group", icon: <GroupWorkIcon />, path: "/access_groups" }, 
        { label: "Members", icon: <PersonIcon />, path: "/members" }, 
        {
            label: "Site Location Access",
            icon: <SecurityIcon />,
            path: "/site_location_access",
        },

        {
            label: "Member Access",
            icon: <VerifiedUserIcon />,
            path: "/member_access",
        },

        { label: "Notifications", icon: <NotificationsIcon />, path: "/notification" }, 
        { label: "Activity Logs", icon: <HistoryIcon />, path: "/activity_log" },
    ];


    export default function Sidebar({ collapsed }: any) {
        const sidebarWidth = collapsed ? 72 : 240; 
        return (
            <Box
                    sx={{
                        width: sidebarWidth,
                        minWidth: sidebarWidth,
                        flexShrink: 0, 
                        bgcolor: "background.paper",
                        borderRight: "1px solid rgba(255,255,255,0.08)",
                        overflowX: "hidden",
                    }}
            >
            <List>
                {menu.map((item) => (
                    <ListItemButton
                        key={item.label}
                        component={NavLink}
                        to={item.path}
                        end
                        sx={{
                            justifyContent: collapsed ? "center" : "flex-start",
                            "&:hover": {
                                bgcolor: "rgba(0,229,255,0.08)",
                            },
                            "&.active": {
                                bgcolor: "rgba(0,229,255,0.16)",
                                borderLeft: "3px solid #00E5FF",
                            },
                        }}
                    >
                        <Tooltip
                        title={collapsed ? item.label : ""}
                        placement="right"
                        disableHoverListener={!collapsed}
                        >
                            <ListItemIcon
                                sx={{
                                minWidth: 0,
                                mr: collapsed ? 0 : 2,
                                color: "primary.main",
                                transition: "margin 200ms ease, transform 200ms ease",
                                transform: collapsed ? "scale(1.1)" : "scale(1)",
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                        </Tooltip>

                        {!collapsed && (
                        <ListItemText
                            primary={item.label}
                            sx={{
                            whiteSpace: "nowrap",
                            }}
                        />
                        )}
                    </ListItemButton>
                ))}
            </List> 
        </Box>
        );
    }
