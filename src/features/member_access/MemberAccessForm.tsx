// MemberAccessForm.tsx
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

export default function MemberAccessForm({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [memberId, setMemberAccessId] = useState<number | "">("");
  const [accessGroupIds, setAccessGroupIds] = useState<number[]>([]);
  const [memberasess, setMemberAccess] = useState<any[]>([]);
  const [accessGroups, setAccessGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { showSuccess, showError } = useSnackbar();

  /* -------- FETCH MEMBERS ON OPEN -------- */
  useEffect(() => {
    if (!open) return;

    api
      .get("/members/all")
      .then((res) => setMemberAccess(res.data.data))
      .catch(() => showError("Failed to load member access"));
  }, [open]);

  /* -------- FETCH UNLINKED ACCESS GROUPS WHEN MEMBER CHANGES -------- */
  useEffect(() => {
    if (!memberId) {
      setAccessGroups([]);
      setAccessGroupIds([]);
      return;
    }

    api
      .get("/access_groups/list_unlinked_access_groups_by_member", { params: { member_id: memberId } })
      .then((res) => {
        setAccessGroups(res.data.data);
        setAccessGroupIds([]); // reset selected
      })
      .catch(() => showError("Failed to load access groups"));
  }, [memberId]);

    const resetForm = () => {
        setMemberAccessId("");
        setAccessGroupIds([]);
        setAccessGroups([]);
    };
  /* -------- SUBMIT -------- */
    const handleSubmit = async () => {
        if (!memberId || accessGroupIds.length === 0) {
            showError("Select member access and access groups");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/member_access/bulk", {
                member_id: memberId,
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
            <DialogTitle>Bulk Assign Member Access</DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                {/* -------- MEMBER SELECT -------- */}
                <TextField
                    select
                    label="Member"
                    fullWidth
                    value={memberId}
                    onChange={(e) => setMemberAccessId(Number(e.target.value))}
                >
                    {memberasess.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                    {member.first_name} {member.last_name}
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
