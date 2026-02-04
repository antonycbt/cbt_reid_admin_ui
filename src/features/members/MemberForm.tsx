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

export default function MemberForm({
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

  const [memberNumber, setMemberNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);

  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { showSuccess, showError } = useSnackbar();

  /* -------------------- LOAD DEPARTMENTS -------------------- */
    useEffect(() => {
    if (!open) return;

    api
        .get("/departments/all")
        .then((res) => {
        console.log("Departments:", res.data);
        setDepartments(res.data ?? []);
        })
        .catch(() => {
        showError("Failed to load departments");
        });
    }, [open]); 
  /* -------------------- PREFILL -------------------- */
  useEffect(() => {
    if (!open) return;

    if (isEdit && data) {
      setMemberNumber(data.member_number ?? "");
      setFirstName(data.first_name ?? "");
      setLastName(data.last_name ?? "");
      setDepartmentId(data.department_id ?? "");
      setIsActive(data.is_active ?? true);
    } else {
      setMemberNumber("");
      setFirstName("");
      setLastName("");
      setDepartmentId("");
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
        member_number: memberNumber,
        first_name: firstName,
        last_name: lastName,
        department_id: departmentId || null,
      };

      if (isEdit) {
        payload.is_active = isActive;
      }

      const res = isEdit
        ? await api.put(`/members/${data.id}`, payload)
        : await api.post("/members", payload);

      showSuccess(
        res.data.message ||
          (isEdit
            ? "Member updated successfully"
            : "Member created successfully")
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
        setErrors({ member_number: err.response.data.detail });
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
        {isEdit ? "Update Member" : "Add Member"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1.5}>
          <TextField
            label="Member Number"
            fullWidth
            required
            value={memberNumber}
            onChange={(e) => {
              setMemberNumber(e.target.value);
              setErrors((p) => ({ ...p, member_number: "" }));
            }}
            error={!!errors.member_number}
            helperText={errors.member_number}
          />

          <TextField
            label="First Name"
            fullWidth
            required
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setErrors((p) => ({ ...p, first_name: "" }));
            }}
            error={!!errors.first_name}
            helperText={errors.first_name}
          />

          <TextField
            label="Last Name"
            fullWidth
            required
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setErrors((p) => ({ ...p, last_name: "" }));
            }}
            error={!!errors.last_name}
            helperText={errors.last_name}
          />

          {/* ✅ DEPARTMENT SELECT */}
          <TextField
            select
            label="Department"
            fullWidth
            value={departmentId}
            onChange={(e) =>
              setDepartmentId(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
          >
            <MenuItem value="">None</MenuItem>

            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
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
                label="Active Member"
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
