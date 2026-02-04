import {
  Box,
  Button,
  Paper,
  Typography,
  TextField
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useState, useEffect, useRef } from "react";  
import DataTable from "../../components/common/DataTable";
import UserForm from "./UserForm";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { api } from "../../api/axios";
import { useSnackbar } from "../../components/snackbar/useSnackbar";

export default function UserList() {
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
  const isFirstRender = useRef(true);

  /* -------------------- FETCH USERS -------------------- */
  const fetchUsers = async (
    page = paginationModel.page,
    pageSize = paginationModel.pageSize
  ) => {
    setLoading(true);
    try {
      const res = await api.get("/users", {
        params: {
          search,
          page,
          page_size: pageSize,
        },
      });

      const users = res.data.data.map((u: any) => ({
        ...u,
        name: `${u.first_name} ${u.last_name}`,
        last_login_display: u.last_login_ts
          ? new Date(u.last_login_ts).toLocaleString()
          : "Never",
      }));

      setRows(users);
      setRowCount(res.data.total);
    } catch (err: any) {
      showError(err.response?.data?.detail || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- EFFECTS -------------------- */

  // Initial load + pagination
  useEffect(() => {
    fetchUsers();
  }, [paginationModel.page, paginationModel.pageSize]);

    // Search (debounced)
    useEffect(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      const timer = setTimeout(() => {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
        fetchUsers(0, paginationModel.pageSize);
      }, 400);

      return () => clearTimeout(timer);
    }, [search]);
  /* -------------------- HANDLERS -------------------- */
  const confirmDeleteUser = async () => {
    if (!deleteId) return;

    try {
      await api.delete(`/users/${deleteId}`);
      showSuccess("User deleted successfully");
      fetchUsers();
    } catch (err: any) {
      showError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete user"
      );
    } finally {
      setDeleteId(null);
    }
  };

  /* -------------------- COLUMNS -------------------- */
  const columns = [
    { field: "name", headerName: "Name", flex: 1.5 },
    { field: "email", headerName: "Email", flex: 2 },
    { field: "role", headerName: "Role", width: 120 },
    {
      field: "last_login_display",
      headerName: "Last Login",
      width: 180,
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
                        User Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Create, update and manage system users
                    </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1.5}>
                    <TextField
                        size="small"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ width: 260 }}
                    />  
                    {/* Add User Button */}
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setSelected(null);
                            setOpen(true);
                        }}
                    >
                        Add User
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

            {/* Create / Update */}
            <UserForm
              open={open}
              onClose={() => setOpen(false)}
              data={selected}
              onSuccess={() => {
                  setSearch(""); // 🔹 reset search
                  setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  fetchUsers(0, paginationModel.pageSize);
              }}
            /> 
            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteId !== null}
                title="Delete User"
                description="This action cannot be undone. Are you sure you want to delete this user?"
                confirmText="Delete"
                onConfirm={confirmDeleteUser}
                onClose={() => setDeleteId(null)}
            />
        </Box> 
    );
}
