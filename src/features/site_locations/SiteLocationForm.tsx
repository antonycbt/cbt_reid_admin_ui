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
import { useEffect, useState } from "react";

import { api } from "../../api/axios";
import { useSnackbar } from "../../components/snackbar/useSnackbar";

export default function SiteLocationForm({
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

  /* -------------------- STATE -------------------- */
  const [name, setName] = useState("");
  const [siteHierarchyId, setSiteHierarchyId] = useState<number | "">("");
  const [parentId, setParentId] = useState<number | "">("");
  const [isPublic, setIsPublic] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [siteHierarchies, setSiteHierarchies] = useState<any[]>([]);
  const [parentLocations, setParentLocations] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { showSuccess, showError } = useSnackbar();

  /* -------------------- LOAD SITE HIERARCHIES -------------------- */
  useEffect(() => {
    if (!open) return;

    api
      .get("/site_hierarchy", { params: { page_size: 1000 } })
      .then((res) => setSiteHierarchies(res.data.data || []))
      .catch(() => showError("Failed to load site hierarchies"));
  }, [open]);

  /* -------------------- LOAD PARENT LOCATIONS -------------------- */
  useEffect(() => {
    if (!open || !siteHierarchyId) {
      setParentLocations([]);
      setParentId("");
      return;
    }

    // Fetch all locations under selected hierarchy
    api
      .get("/site_locations", {
        params: {
          site_hierarchy_id: siteHierarchyId,
          page_size: 1000,
        },
      })
      .then((res) => {
        let locations = res.data.data || [];

        // Exclude self in edit mode
        if (isEdit && data?.id) {
          locations = locations.filter((l: any) => l.id !== data.id);
        }

        setParentLocations(locations);
      })
      .catch(() => showError("Failed to load parent locations"));
  }, [open, siteHierarchyId, isEdit, data]);

  /* -------------------- PREFILL -------------------- */
  useEffect(() => {
    if (!open) return;

    if (isEdit && data) {
      setName(data.name ?? "");
      setSiteHierarchyId(data.site_hierarchy_id ?? "");
      setParentId(data.parent_site_location_id ?? "");
      setIsPublic(data.is_public ?? false);
      setIsActive(data.is_active ?? true);
    } else {
      setName("");
      setSiteHierarchyId("");
      setParentId("");
      setIsPublic(false);
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
        site_hierarchy_id: siteHierarchyId, // <-- store the user-selected value
        parent_site_location_id: parentId || null,
        is_public: isPublic,
      };

      if (isEdit) {
        payload.is_active = isActive;
      }

      const res = isEdit
        ? await api.put(`/site_locations/${data.id}`, payload)
        : await api.post("/site_locations", payload);

      showSuccess(
        res.data.message ||
          (isEdit
            ? "Site location updated successfully"
            : "Site location created successfully")
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
        {isEdit ? "Update Site Location" : "Add Site Location"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1.5}>
          {/* LOCATION NAME */}
          <TextField
            label="Location Name"
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

          {/* SITE HIERARCHY */}
          <TextField
            select
            label="Site Hierarchy"
            fullWidth
            required
            value={siteHierarchyId}
            onChange={(e) => {
              setSiteHierarchyId(Number(e.target.value));
              setParentId(""); // reset parent
            }}
            error={!!errors.site_hierarchy_id}
            helperText={errors.site_hierarchy_id}
          >
            <MenuItem value={0}>Select Site Hierarchy</MenuItem>
            {siteHierarchies.map((site) => (
              <MenuItem key={site.id} value={site.id}>
                {site.name}
              </MenuItem>
            ))}
          </TextField>

          {/* PARENT LOCATION */}
          <TextField
            select
            label="Parent Location"
            fullWidth
            value={parentId}
            onChange={(e) =>
              setParentId(Number(e.target.value) || "")
            }
            disabled={!siteHierarchyId}
          >
            <MenuItem value="">Root</MenuItem>
            {parentLocations.map((loc) => (
              <MenuItem key={loc.id} value={loc.id}>
                {loc.name}
              </MenuItem>
            ))}
          </TextField>

          {/* PUBLIC */}
          <FormControlLabel
            control={
              <Switch
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
            }
            label="Public Location"
          />

          {/* ACTIVE (EDIT ONLY) */}
          {isEdit && (
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                }
                label="Active Location"
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
