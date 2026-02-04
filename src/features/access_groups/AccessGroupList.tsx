import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useState, useEffect, useRef } from "react";

import DataTable from "../../components/common/DataTable";
import AccessGroupForm from "./AccessGroupForm";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { api } from "../../api/axios";
import { useSnackbar } from "../../components/snackbar/useSnackbar";

export default function AccessGroupList() {
  /* -------------------- UI STATE -------------------- */
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  /* -------------------- DATA STATE -------------------- */
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);

  const { showError, showSuccess } = useSnackbar();
  const isFirstSearch = useRef(true);

  /* -------------------- FETCH ACCESS GROUPS -------------------- */
  const fetchAccessGroups = async (
    page = paginationModel.page,
    pageSize = paginationModel.pageSize
  ) => {
    setLoading(true);
    try {
      const res = await api.get("/access_groups", {
        params: {
          search,
          page,
          page_size: pageSize,
        },
      });

      setRows(res.data.data ?? []);
      setRowCount(res.data.total ?? 0);
    } catch (err: any) {
      showError(
        err.response?.data?.detail || "Failed to fetch access groups"
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- EFFECTS -------------------- */

  // Initial load + pagination
  useEffect(() => {
    fetchAccessGroups();
  }, [paginationModel.page, paginationModel.pageSize]);

  // Search (debounced)
  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      fetchAccessGroups(0, paginationModel.pageSize);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* -------------------- DELETE -------------------- */
  const confirmDeleteGroup = async () => {
    if (!deleteId) return;

    try {
      await api.delete(`/access_groups/${deleteId}`);
      showSuccess("Access group deleted successfully");
      fetchAccessGroups();
    } catch (err: any) {
      showError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete access group"
      );
    } finally {
      setDeleteId(null);
    }
  };

  /* -------------------- COLUMNS -------------------- */
  const columns = [
    {
      field: "name",
      headerName: "Access Group Name",
      flex: 2,
    },
    {
      field: "parent_name",
      headerName: "Parent Group",
      flex: 2,
      valueGetter: (_value: any, row: any) =>
        row?.parent?.name ?? "Root",
    },
    {
      field: "is_active",
      headerName: "Status",
      width: 140,
      renderCell: (params: any) =>
        params.value ? "Active" : "Inactive",
    },
  ];

  /* -------------------- RENDER -------------------- */
  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Access Group Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create, update and manage access groups
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1.5}>
          <TextField
            size="small"
            placeholder="Search access groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 260 }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelected(null);
              setOpen(true);
            }}
          >
            Add Group
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <Paper sx={{ p: 2 }}>
        <DataTable
          rows={rows}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onEdit={(row: any) => {
            setSelected(row);
            setOpen(true);
          }}
          onDelete={(id: number) => setDeleteId(id)}
          actionIcons={{
            edit: <EditIcon />,
            delete: <DeleteIcon />,
          }}
        />
      </Paper>

      {/* Create / Update Form */}
      <AccessGroupForm
        open={open}
        onClose={() => setOpen(false)}
        data={selected}
        onSuccess={fetchAccessGroups}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Access Group"
        description="This action will permanently delete the access group. Are you sure?"
        confirmText="Delete"
        onConfirm={confirmDeleteGroup}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
}
