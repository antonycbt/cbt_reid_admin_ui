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
import CameraForm from "./CameraForm";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { api } from "../../api/axios";
import { useSnackbar } from "../../components/snackbar/useSnackbar";
import UploadFile from "@mui/icons-material/UploadFile";

export default function CameraList() {
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

  /* 🔹 LOCATION TYPES */
  const [locationTypes, setLocationTypes] = useState<Record<number, string>>(
    {}
  );

  const { showError, showSuccess } = useSnackbar();
  const isFirstSearch = useRef(true);

  const transformRows = (data: any[]) =>
    data.map((row) => ({
      ...row,
      site_location_name: row.site_location?.name ?? "-",
  }));


  /* -------------------- FETCH LOCATION TYPES -------------------- */
  useEffect(() => {
    const fetchLocationTypes = async () => {
      try {
        const res = await api.get("/cameras/location-types");
        setLocationTypes(res.data.data || {});
      } catch {
        showError("Failed to load location types");
      }
    };

    fetchLocationTypes();
  }, []);

  /* -------------------- FETCH CAMERAS -------------------- */
  const fetchCameras = async (
    page = paginationModel.page,
    pageSize = paginationModel.pageSize
  ) => {
    setLoading(true);
    try {
      const res = await api.get("/cameras", {
        params: {
          search,
          page,
          page_size: pageSize,
        },
      });

      setRows(transformRows(res.data.data));
      setRowCount(res.data.total);
    } catch (err: any) {
      showError(err.response?.data?.detail || "Failed to fetch cameras");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- EFFECTS -------------------- */

  // Initial load + pagination
  useEffect(() => {
    fetchCameras();
  }, [paginationModel.page, paginationModel.pageSize]);

  // Search (debounced)
  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      fetchCameras(0, paginationModel.pageSize);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* -------------------- HANDLERS -------------------- */
  const confirmDeleteCamera = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/cameras/${deleteId}`);
      showSuccess("Camera deleted successfully");
      fetchCameras();
    } catch (err: any) {
      showError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete camera"
      );
    } finally {
      setDeleteId(null);
    }
  };

  /* -------------------- COLUMNS -------------------- */
  const columns = [
    {
      field: "name",
      headerName: "Camera Name",
      flex: 2,
    },
    {
      field: "ip_address",
      headerName: "IP Address",
      flex: 1.5,
    }, 
    {
      field: "site_location_name",
      headerName: "Site Location",
      flex: 2,
    },
    {
      field: "location_type",
      headerName: "Location Type",
      flex: 1.5,
      renderCell: (params: any) =>
        locationTypes[params.value] ?? "-",
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
            Camera Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create, update, and manage cameras
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1.5}>
            <TextField
              size="small"
              placeholder="Search cameras..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: 260 }}
            />

            {/* Excel Upload Button */}
            <Button
              variant="outlined"
              startIcon={<UploadFile />}
              onClick={() => {
                console.log("Camera Excel Upload Clicked");
                // TODO: Add Excel upload logic here
              }}
            >
              Upload Excel
            </Button>

            {/* Add Camera Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelected(null);
                setOpen(true);
              }}
            >
              Add Camera
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
      <CameraForm
        open={open}
        onClose={() => setOpen(false)}
        data={selected}
        onSuccess={fetchCameras}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Camera"
        description="This action will permanently delete the camera. Are you sure?"
        confirmText="Delete"
        onConfirm={confirmDeleteCamera}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
}
