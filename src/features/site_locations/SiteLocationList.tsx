import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState, useEffect, useRef } from "react";

import SiteLocationTree from "./SiteLocationTree";
import SiteLocationForm from "./SiteLocationForm";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { api } from "../../api/axios";
import { useSnackbar } from "../../components/snackbar/useSnackbar";

export default function SiteLocationList() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const { showError, showSuccess } = useSnackbar();
  const isFirstSearch = useRef(true);

  // ✅ Fetch tree
  const fetchTree = async () => {
    setLoading(true);
    try {
      const res = await api.get("/site_locations/tree", {
        params: { search },
      });
      setRows(res.data.data);
    } catch (err: any) {
      showError(err.response?.data?.detail || "Failed to fetch site locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }

    const timer = setTimeout(fetchTree, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const confirmDeleteSiteLocation = async () => {
    if (!deleteId) return;

    try {
      await api.delete(`/site_locations/${deleteId}`);
      showSuccess("Site location deleted successfully");
      fetchTree();
    } catch (err: any) {
      showError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete site location"
      );
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Site Location Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tree view of site locations
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1.5}>
          <TextField
            size="small"
            placeholder="Search locations..."
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
            Add Location
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Typography>Loading tree...</Typography>
        ) : (
            <SiteLocationTree
              rows={rows}
              onEdit={async (node: any) => {
                setLoading(true);
                try {
                  const res = await api.get(`/site_locations/${node.id}`);
                  setSelected(res.data.data); // pass full data to form
                  setOpen(true);
                } catch (err: any) {
                  showError(err.response?.data?.detail || "Failed to fetch site location details");
                } finally {
                  setLoading(false);
                }
              }}
              onDelete={(id: number) => setDeleteId(id)}
            /> 
        )}
      </Paper>

      <SiteLocationForm
        open={open}
        onClose={() => setOpen(false)}
        data={selected}
        onSuccess={fetchTree}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Site Location"
        description="This action will delete the site location. Are you sure?"
        confirmText="Delete"
        onConfirm={confirmDeleteSiteLocation}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
}
