// SiteLocationAccessForm.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";

import { api } from "../../api/axios";
import { useSnackbar } from "../../components/snackbar/useSnackbar";

export default function SiteLocationAccessForm({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [siteLocationId, setSiteLocationId] = useState<number | "">("");
  const [accessGroupIds, setAccessGroupIds] = useState<number[]>([]);
  const [siteLocations, setSiteLocations] = useState<any[]>([]);
  const [accessGroups, setAccessGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { showSuccess, showError } = useSnackbar();

  /* -------- FETCH SITE LOCATIONS ON OPEN -------- */
  useEffect(() => {
    if (!open) return;

    api
      .get("/site_locations/all")
      .then((res) => setSiteLocations(res.data.data))
      .catch(() => showError("Failed to load site locations"));
  }, [open]);

  /* -------- FETCH UNLINKED ACCESS GROUPS WHEN SITE LOCATION CHANGES -------- */
  useEffect(() => {
    if (!siteLocationId) {
      setAccessGroups([]);
      setAccessGroupIds([]);
      return;
    }

    api
      .get("/access_groups/list_unlinked_access_groups_by_site_location", { params: { site_location_id: siteLocationId } })
      .then((res) => {
        setAccessGroups(res.data.data);
        setAccessGroupIds([]); // reset selected
      })
      .catch(() => showError("Failed to load access groups"));
  }, [siteLocationId]);

    const resetForm = () => {
        setSiteLocationId("");
        setAccessGroupIds([]);
        setAccessGroups([]);
    };
  /* -------- SUBMIT -------- */
    const handleSubmit = async () => {
        if (!siteLocationId || accessGroupIds.length === 0) {
            showError("Select site location and access groups");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/site_location_access/bulk", {
                site_location_id: siteLocationId,
                access_group_ids: accessGroupIds,
            });

            showSuccess(res.data.message);
            onSuccess();
            resetForm(); 
            onClose();
        } catch (err: any) {
            showError(err.response?.data?.detail || "Bulk assignment failed");
        } finally {
            setLoading(false);
        }
    };

    return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Bulk Assign Site Location Access</DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                {/* -------- SITE LOCATION SELECT -------- */}
                <TextField
                    select
                    label="Site Location"
                    fullWidth
                    value={siteLocationId}
                    onChange={(e) => setSiteLocationId(Number(e.target.value))}
                >
                    {siteLocations.map((loc) => (
                    <MenuItem key={loc.id} value={loc.id}>
                        {loc.name}
                    </MenuItem>
                    ))}
                </TextField>

                {/* -------- ACCESS GROUP MULTI SELECT -------- */}
                <TextField
                    select
                    label="Access Groups"
                    fullWidth
                    SelectProps={{
                    multiple: true,
                    renderValue: (value) => {
                        const selectedIds = Array.isArray(value)
                        ? value.map(Number)
                        : typeof value === "string"
                        ? value.split(",").map(Number)
                        : [];

                        return (
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {selectedIds.map((id) => {
                            const g = accessGroups.find((x) => x.id === id);
                            return <Chip key={id} label={g?.name} />;
                            })}
                        </Stack>
                        );
                    },
                    }}
                    value={accessGroupIds}
                    onChange={(e) => {
                    const value = e.target.value;
                    setAccessGroupIds(
                        Array.isArray(value)
                        ? value.map(Number)
                        : typeof value === "string"
                        ? value.split(",").map(Number)
                        : []
                    );
                    }}
                >
                    {accessGroups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                        {group.name}
                    </MenuItem>
                    ))}
                </TextField>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="inherit">
                Cancel
                </Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                {loading ? "Assigning..." : "Assign"}
                </Button>
            </DialogActions>
            </Dialog>
    );
}
