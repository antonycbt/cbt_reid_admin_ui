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
import BodyBiometricIcon from "../../components/icons/BodyBiometricIcon"; 
import UploadFile from "@mui/icons-material/UploadFile";
import { useState, useEffect, useRef } from "react";

import DataTable from "../../components/common/DataTable";
import MemberForm from "./MemberForm";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import MemberEmbeddingModal from "./MemberEmbeddingModal";

import { api } from "../../api/axios";
import { useSnackbar } from "../../components/snackbar/useSnackbar";

export default function MemberList() {
  /* -------------------- UI STATE -------------------- */
  const [open, setOpen] = useState(false);
  const [embeddingOpen, setEmbeddingOpen] = useState(false);
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

  /* -------------------- FETCH MEMBERS -------------------- */
  const fetchMembers = async (
    page = paginationModel.page,
    pageSize = paginationModel.pageSize
  ) => {
    setLoading(true);
    try {
      const res = await api.get("/members", {
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
        err.response?.data?.detail || "Failed to fetch members"
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- EFFECTS -------------------- */
  useEffect(() => {
    fetchMembers();
  }, [paginationModel.page, paginationModel.pageSize]);

  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      fetchMembers(0, paginationModel.pageSize);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* -------------------- DELETE -------------------- */
  const confirmDeleteMember = async () => {
    if (!deleteId) return;

    try {
      await api.delete(`/members/${deleteId}`);
      showSuccess("Member deleted successfully");
      fetchMembers();
    } catch (err: any) {
      showError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete member"
      );
    } finally {
      setDeleteId(null);
    }
  };

  /* -------------------- COLUMNS -------------------- */
  const columns = [
    { field: "member_number", headerName: "Member No", flex: 1.5 },
    { field: "first_name", headerName: "First Name", flex: 2 },
    { field: "last_name", headerName: "Last Name", flex: 2 },
    {
      field: "department",
      headerName: "Department",
      flex: 2,
      valueGetter: (_: any, row: any) =>
        row?.department?.name ?? "-",
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
            Member Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create, update and manage members
          </Typography>
        </Box>

        <Box display="flex" gap={1.5}>
          <TextField
            size="small"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 260 }}
          />

          <Button
            variant="outlined"
            startIcon={<UploadFile />}
            onClick={() => console.log("Excel Upload")}
          >
            Upload Excel
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelected(null);
              setOpen(true);
            }}
          >
            Add Member
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
          onEmbedding={(row: any) => {
            setSelected(row);
            setEmbeddingOpen(true);
          }}
          actionIcons={{
            edit: <EditIcon />,
            delete: <DeleteIcon />,
            embedding: <BodyBiometricIcon sx={{ color: "#00e5ff" }} />
          }}
        />
      </Paper>

      {/* Create / Update */}
      <MemberForm
        open={open}
        onClose={() => setOpen(false)}
        data={selected}
        onSuccess={fetchMembers}
      />

      {/* Embedding Modal */}
      <MemberEmbeddingModal
        open={embeddingOpen}
        onClose={() => {
          setEmbeddingOpen(false);
          setSelected(null);
        }}
        member={selected}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Member"
        description="This action will permanently delete the member. Are you sure?"
        confirmText="Delete"
        onConfirm={confirmDeleteMember}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
}
