import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Stack,
  Box,
} from "@mui/material";
import { useState, useEffect } from "react";

import { api } from "../../api/axios";
import { useSnackbar } from "../../components/snackbar/useSnackbar";

export default function SiteHierarchyForm({
  open,
  onClose,
  data,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  data: any;
  onSuccess: () => void;
}) {
  const isEdit = Boolean(data);

  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);

  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { showSuccess, showError } = useSnackbar();

  /* -------------------- LOAD PARENT OPTIONS -------------------- */
  useEffect(() => {
    if (!open) return;

    api
      .get("/site_hierarchy", {
        params: { page_size: 1000 }, // load all for dropdown
      })
      .then((res) => {
        const allSites = res.data.data || [];

        // ❗ exclude self in edit mode
        const filtered = isEdit
          ? allSites.filter((s: any) => s.id !== data?.id)
          : allSites;

        setSites(filtered);
      })
      .catch(() => {
        showError("Failed to load parent sites");
      });
  }, [open, isEdit, data]);

  /* -------------------- PREFILL -------------------- */
  useEffect(() => {
    if (!open) return;

    if (isEdit && data) {
      setName(data.name ?? "");
      setParentId(data.parent_site_hierarchy_id ?? "");
      setIsActive(data.is_active ?? true);
    } else {
      setName("");
      setParentId("");
      setIsActive(true);
      setErrors({});
    }
  }, [open, isEdit, data]);

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    try {
      const payload: any = {
        name,
        parent_site_hierarchy_id: parentId || null,
      };

      if (isEdit) {
        payload.is_active = isActive;
      }

      const res = isEdit
        ? await api.put(`/site_hierarchy/${data.id}`, payload)
        : await api.post("/site_hierarchy", payload);

      showSuccess(
        res.data.message ||
          (isEdit
            ? "Site updated successfully"
            : "Site created successfully")
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 422) {
        const validationErrors: Record<string, string> = {};
        err.response.data.detail.forEach((e: any) => {
          const field = e.loc?.[e.loc.length - 1];
          if (field) validationErrors[field] = e.msg;
        });
        setErrors(validationErrors);
        return;
      }

      if (err.response?.status === 409) {
        setErrors({ name: err.response.data.detail });
        return;
      }

      showError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Operation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- RENDER -------------------- */
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? "Update Site" : "Add Site"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1.5}>
          <TextField
            label="Site Name"
            fullWidth
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((p) => ({ ...p, name: "" }));
            }}
            error={!!errors.name}
            helperText={errors.name}
          />

          {/* ✅ PARENT SITE SELECT */}
          <TextField
            select
            label="Parent Site"
            fullWidth
            value={parentId}
            onChange={(e) =>
              setParentId(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
          >
            <MenuItem value="">Root</MenuItem>

            {sites.map((site) => (
              <MenuItem key={site.id} value={site.id}>
                {site.name}
              </MenuItem>
            ))}
          </TextField>

          {isEdit && (
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                }
                label="Active Site"
              />
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {isEdit ? "Update" : loading ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
