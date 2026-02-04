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
} from "@mui/material";
import { useState, useEffect } from "react";

import { api } from "../../api/axios";
import { useSnackbar } from "../../components/snackbar/useSnackbar";

export default function DepartmentForm({
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
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { showSuccess, showError } = useSnackbar();

    /* -------------------- PREFILL (EDIT MODE) -------------------- */
        useEffect(() => {
            if (!open) return;

            if (isEdit && data) { 
                setName(data.name ?? "");
                setIsActive(data.is_active ?? true);
            } else { 
                setName("");
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
            };

            if (isEdit) {
                payload.is_active = isActive;
            }

            const res = isEdit
                ? await api.put(`/departments/${data.id}`, payload)
                : await api.post("/departments", payload);

            showSuccess(
                res.data.message ||
                (isEdit
                    ? "Department updated successfully"
                    : "Department created successfully")
            );

            onSuccess();
            onClose();
        } catch (err: any) {
            /* Validation errors (FastAPI 422) */
            if (err.response?.status === 422) {
                const validationErrors: Record<string, string> = {};

                err.response.data.detail.forEach((e: any) => {
                const field = e.loc?.[e.loc.length - 1];
                if (field) validationErrors[field] = e.msg;
                });

                setErrors(validationErrors);
                return;
            }

            /* Conflict (duplicate name) */
            if (err.response?.status === 409) {
                setErrors({ name: err.response.data.detail });
                return;
            }

            showError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                (isEdit
                    ? "Department update failed"
                    : "Department creation failed")
            );
        } finally {
            setLoading(false);
        }
    };

    /* -------------------- RENDER -------------------- */
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
            {isEdit ? "Update Department" : "Add Department"}
        </DialogTitle>

        <DialogContent dividers>
            <Stack spacing={1.5}>
            <TextField
                label="Department Name"
                fullWidth
                required
                value={name}
                onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: "" }));
                }}
                error={!!errors.name}
                helperText={errors.name}
            />

            {isEdit && (
                <Box display="flex" alignItems="center">
                <FormControlLabel
                    control={
                    <Switch
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                    />
                    }
                    label="Active Department"
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
