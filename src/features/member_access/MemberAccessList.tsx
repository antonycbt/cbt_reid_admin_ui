// MemberAccessFormList.tsx
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  IconButton,
  Collapse,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useState, useEffect, useRef } from "react";
import  MemberAccessForm from "./MemberAccessForm";
import { api } from "../../api/axios";
import { useSnackbar } from "../../components/snackbar/useSnackbar";

export default function MemberAccessFormList() {
  const [openBulk, setOpenBulk] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [rowCount, setRowCount] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const isFirstSearch = useRef(true);
  const { showError, showSuccess } = useSnackbar();

  // -------------------- FETCH --------------------
  const fetchMemberAccessForm = async (page = paginationModel.page, pageSize = paginationModel.pageSize) => {
    setLoading(true);
    try {
      const res = await api.get("/member_access", {
        params: { search, page, page_size: pageSize },
      });

      const data = Array.isArray(res.data.data) ? res.data.data : [];
      const total = Number(res.data.total) || 0;

      setRows(data); // Keep access_groups intact
      setRowCount(total);
    } catch (err: any) {
      showError(err.response?.data?.detail || "Failed to fetch member access access");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberAccessForm();
  }, [paginationModel.page, paginationModel.pageSize]);

  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      fetchMemberAccessForm(0, paginationModel.pageSize);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // -------------------- DELETE --------------------
  const handleDeleteAccess = async (member_id: number, access_group_id: number) => {
    try {
      await api.delete("/member_access/single", {
        params: { member_id, access_group_id },
      });
      showSuccess("Access removed successfully");
      fetchMemberAccessForm();
    } catch (err: any) {
      showError(err.response?.data?.detail || "Failed to remove access");
    }
  };

  // -------------------- TOGGLE --------------------
  const toggleRow = (id: number) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // -------------------- RENDER --------------------
  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
      <Box>
        <Typography variant="h5" fontWeight={600}>
          Member Access
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage access groups assigned to member accesss
        </Typography>
      </Box>

      <Box display="flex" gap={1.5} alignItems="center">
        <TextField
          size="small"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 260 }}
        />
        <Button
          variant="contained"
          size="small" // ✅ make button same height as TextField
          startIcon={<AddIcon />}
          onClick={() => setOpenBulk(true)}
        >
          Bulk Assign
        </Button>
      </Box>
    </Box> 
      {/* Table */}
      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          rows.map((row) => {
            const isExpanded = !!expandedRows[row.member_id];
            return (
              <Box key={row.member_id} sx={{ mb: 1, borderBottom: "1px solid #eee", p: 1 }}>
                {/* Row header */}
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconButton size="small" onClick={() => toggleRow(row.member_id)}>
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <Typography fontWeight={600}>{row.member_access_name}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {row.access_groups.length} access group(s)
                  </Typography>
                </Box>

                {/* Expanded access groups */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box mt={1} display="flex" flexDirection="column" gap={0.5}>
                    {row.access_groups.length > 0 ? (
                      row.access_groups.map((ag: any) => (
                        <Box key={ag.id} display="flex" justifyContent="space-between" alignItems="center">
                          <span>{ag.name}</span>
                          <IconButton size="small" color="error" onClick={() => handleDeleteAccess(row.member_id, ag.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No Access Groups
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </Box>
            );
          })
        )}
      </Paper>

      {/* Bulk Assign */}
      <MemberAccessForm
        open={openBulk}
        onClose={() => setOpenBulk(false)}
        onSuccess={fetchMemberAccessForm}
      />
    </Box>
  );
}
