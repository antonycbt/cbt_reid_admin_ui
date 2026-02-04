import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState, useEffect } from "react";
import { api } from "../../api/axios";
import SiteHierarchyTree from "./SiteHierarchyTree";
import SiteHierarchyForm from "./SiteHierarchyForm";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useSnackbar } from "../../components/snackbar/useSnackbar";

export default function SiteHierarchyList() {
  const [rows, setRows] = useState<any[]>([]);
  const [allRows, setAllRows] = useState<any[]>([]);
  // const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { showError, showSuccess } = useSnackbar();

  // ---------------- Fetch full tree ----------------
  const fetchSiteHierarchy = async () => {
    // setLoading(true);
    try {
      const res = await api.get("/site_hierarchy/tree");
      const data = res.data ?? [];
      setAllRows(data);
      setRows(data);
    } catch (err: any) {
      showError(err.response?.data?.detail || "Failed to fetch site hierarchy");
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteHierarchy();
  }, []);

  // ---------------- Search/filter ----------------
  useEffect(() => {
    if (!search) {
      setRows(allRows);
      return;
    }

    const filterTree = (nodes: any[], term: string): any[] => {
      const lower = term.toLowerCase();
      return nodes
        .map((node) => {
          const children = filterTree(node.children || [], term);
          if (node.name.toLowerCase().includes(lower) || children.length) {
            return { ...node, children };
          }
          return null;
        })
        .filter(Boolean);
    };

    const filtered = filterTree(allRows, search);
    setRows(filtered);
  }, [search, allRows]);

  // ---------------- Delete ----------------
  const confirmDeleteSite = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/site_hierarchy/${deleteId}`);
      showSuccess("Site hierarchy deleted successfully");
      fetchSiteHierarchy();
    } catch (err: any) {
      showError(err.response?.data?.detail || "Failed to delete site hierarchy");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Site Hierarchy Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create, update and manage site hierarchy
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1.5}>
          <TextField
            size="small"
            placeholder="Search sites..."
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
            Add Site
          </Button>
        </Box>
      </Box>

      <Paper 
        sx={{
            p: 2,
            maxWidth: 900,
            bgcolor: "#161B22",
            maxHeight: 500,       
            overflow: "auto",    
            "&::-webkit-scrollbar": {
              width: 0,        
              background: "transparent",
            },
            scrollbarWidth: "none",  
            msOverflowStyle: "none", 
          }}
      >
        <SiteHierarchyTree
          rows={rows}
          onEdit={(row: any) => {
            setSelected(row);
            setOpen(true);
          }}
          onDelete={(id: number) => setDeleteId(id)}
        />
      </Paper>

      {/* Create / Update */}
      <SiteHierarchyForm
        open={open}
        onClose={() => setOpen(false)}
        data={selected}
        onSuccess={fetchSiteHierarchy}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Site"
        description="This action will permanently delete the Site hierarchy and its children. Are you sure?"
        confirmText="Delete"
        onConfirm={confirmDeleteSite}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
}
