import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Stack,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from "@mui/material"; 
import { useState, useEffect } from "react";
import type { SelectChangeEvent } from "@mui/material/Select";

import { api } from "../../api/axios";
import { useSnackbar } from "../../components/snackbar/useSnackbar";

type SiteHierarchy = {
  name?: string;
};

type SiteLocation = {
  id?: number;
  name?: string;
  code?: string;
  address?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  parent_site_location_id?: number | null;
  parent_site_location?: SiteLocation | null;
  site_hierarchy?: SiteHierarchy | null;
  children?: SiteLocation[];
};

export default function CameraForm({
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
  const [ipAddress, setIpAddress] = useState("");
  const [locationType, setLocationType] = useState<number | null>(null);
  const [siteLocationId, setSiteLocationId] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const [locationTypes, setLocationTypes] = useState<Record<number, string>>({});
  const [siteLocations, setSiteLocations] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [siteInfo, setSiteInfo] = useState<SiteLocation | null>(null);
  const [siteInfoLoading, setSiteInfoLoading] = useState(false);
  const [siteInfoError, setSiteInfoError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { showSuccess, showError } = useSnackbar();

  /* -------------------- FETCH CONSTANTS -------------------- */

  useEffect(() => {
    const fetchLocationTypes = async () => {
      try {
        const res = await api.get("/cameras/location-types");
        setLocationTypes(res.data.data || {});
      } catch {
        showError("Failed to fetch location types");
      }
    };

    const fetchSiteLocations = async () => {
      try {
        const res = await api.get("/cameras/load_site_locations");
        const locations: Record<number, string> = {};
        res.data.data.forEach((loc: any) => {
          locations[loc.id] = loc.name;
        });
        setSiteLocations(locations);
      } catch {
        showError("Failed to fetch site locations");
      }
    };

    fetchLocationTypes();
    fetchSiteLocations();
  }, []);

  /* -------------------- PREFILL -------------------- */

  useEffect(() => {
    if (!open) return;

    if (isEdit && data) {
      setName(data.name ?? "");
      setIpAddress(data.ip_address ?? "");
      setLocationType(data.location_type ?? null);
      setSiteLocationId(data.site_location?.id ?? null); // ✅ use data.site_location.id
      setIsActive(data.is_active ?? true);
    } else {
      setName("");
      setIpAddress("");
      setLocationType(null);
      setSiteLocationId(null);
      setIsActive(true);
      setErrors({});
      setSiteInfo(null);
      setSiteInfoError(null);
    }
  }, [open, isEdit, data]);

  /* -------------------- FETCH SITE DETAILS -------------------- */

  useEffect(() => {
    if (siteLocationId == null) {
      setSiteInfo(null);
      return;
    }

    const fetchSiteInfo = async () => {
      setSiteInfoLoading(true);
      setSiteInfoError(null);

      try {
        const res = await api.get(`/site_locations/full_tree/${siteLocationId}`);
        const tree: SiteLocation[] = res.data.data;

        if (!tree || tree.length === 0) throw new Error("No site data");

        setSiteInfo(tree[0]);
      } catch {
        setSiteInfo(null);
        setSiteInfoError("Failed to load site details");
      } finally {
        setSiteInfoLoading(false);
      }
    };

    fetchSiteInfo();
  }, [siteLocationId]);

  /* -------------------- SUBMIT -------------------- */

  const handleSubmit = async () => {
    if (!siteLocationId) {
      showError("Please select a site location");
      return;
    }

    if (!locationType) {
      showError("Please select a location type");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const payload: any = {
        name,
        ip_address: ipAddress,
        location_type: locationType,
        site_location_id: siteLocationId,
        is_active: isActive,
      };

      const res = isEdit
        ? await api.put(`/cameras/${data.id}`, payload)
        : await api.post("/cameras", payload);

      showSuccess(
        res.data.message ||
          (isEdit ? "Camera updated successfully" : "Camera created successfully")
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

      showError(err.response?.data?.detail || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- SITE INFO UI -------------------- */

  const renderSiteInfo = (info: SiteLocation) => {
    const entries: [string, any][] = [];

    if (info.name) entries.push(["Name", info.name]);
    if (info.code) entries.push(["Code", info.code]);
    if (info.address) entries.push(["Address", info.address]);
    if (info.description) entries.push(["Description", info.description]);
    if (info.site_hierarchy?.name)
      entries.push(["Hierarchy", info.site_hierarchy.name]);

    if (info.latitude || info.longitude) {
      entries.push([
        "Coordinates",
        `${info.latitude ?? ""}${info.latitude && info.longitude ? ", " : ""}${info.longitude ?? ""}`,
      ]);
    }

    return (
      <List dense>
        {entries.map(([k, v]) => (
          <ListItem key={k}>
            <ListItemText primary={k} secondary={String(v)} />
          </ListItem>
        ))}

        {info.children?.length ? (
          <>
            <Divider />
            {info.children.map((child) => (
              <ListItem key={child.id}>
                <ListItemText primary={`Child: ${child.name}`} />
              </ListItem>
            ))}
          </>
        ) : null}
      </List>
    );
  };

  /* -------------------- RENDER -------------------- */

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? "Update Camera" : "Add Camera"}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={1.5}>
            <TextField
              label="Camera Name"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />

            <TextField
              label="IP Address"
              fullWidth
              required
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              error={!!errors.ip_address}
              helperText={errors.ip_address}
            />

            <FormControl fullWidth required>
              <InputLabel id="site-location-label">Site Location</InputLabel>
              <Select
                labelId="site-location-label"
                label="Site Location"
                value={siteLocationId?.toString() ?? ""}
                onChange={(e: SelectChangeEvent<string>) =>
                  setSiteLocationId(Number(e.target.value))
                }
              >
                {Object.entries(siteLocations).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Location Type</InputLabel>
              <Select
                value={locationType?.toString() ?? ""}
                onChange={(e: SelectChangeEvent<string>) =>
                  setLocationType(Number(e.target.value))
                }
              >
                {Object.entries(locationTypes).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {isEdit && (
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                }
                label="Active Camera"
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {isEdit ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DETAILS MODAL */}

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Site Details</DialogTitle>

        <DialogContent dividers>
          {siteInfoLoading ? (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={18} />
              <Typography>Loading...</Typography>
            </Box>
          ) : siteInfoError ? (
            <Typography color="error">{siteInfoError}</Typography>
          ) : siteInfo ? (
            renderSiteInfo(siteInfo)
          ) : (
            <Typography color="text.secondary">No site selected.</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
