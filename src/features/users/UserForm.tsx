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
import { useState,useEffect } from "react";
import { api } from "../../api/axios";
import { useSnackbar } from "../../components/snackbar/useSnackbar";


export default function UserForm({
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
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState<number>(1);
	const [isActive, setIsActive] = useState(true);
	const [loading, setLoading] = useState(false); 
	const { showSuccess, showError } = useSnackbar(); 
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
	const [rolesLoading, setRolesLoading] = useState(false);
	
	useEffect(() => {
		if (!open) return; 
		if (isEdit && data) { 
			setFirstName(data.first_name ?? "");
			setLastName(data.last_name ?? "");
			setEmail(data.email ?? "");
			setRole(data.role ?? 1);
			setIsActive(data.is_active ?? true);
		} else { 
			setFirstName("");
			setLastName("");
			setEmail("");
			setPassword("");
			setRole(1);
			setIsActive(true);
			setErrors({});
		}
	}, [open, isEdit, data]); 

	useEffect(() => {
		const fetchRoles = async () => {
			setRolesLoading(true);
			try {
				const res = await api.get("/users/roles"); 
				setRoles(res.data.data); 
			} catch (err) {
				console.error("Failed to fetch roles", err);
				showError("Failed to load roles");
			} finally {
				setRolesLoading(false);
			}
		}; 
		fetchRoles();
	}, []); 

	const handleSubmit = async () => {
		setLoading(true);
		setErrors({});

		try {
			const payload: any = {
				first_name: firstName,
				last_name: lastName,
				email,
				role,
			};

			if (!isEdit) {
				payload.password = password;
			} else {
				payload.is_active = isActive;
			}

			const res = isEdit
				? await api.put(`/users/${data.id}`, payload)
				: await api.post("/users", payload);

			showSuccess(
				res.data.message ||
				(isEdit ? "User updated successfully" : "User created successfully")
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
				setErrors({ email: err.response.data.detail });
				return;
			}

			showError(
				err.response?.data?.detail ||
				err.response?.data?.message ||
				(isEdit ? "User update failed" : "User creation failed")
			);
		} finally {
			setLoading(false);
		}
	}; 
	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>
				{isEdit ? "Update User" : "Add User"}
			</DialogTitle>

			<DialogContent dividers>
				<Stack spacing={1.5}> 
					<Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
						<Box flex={1}>
							<TextField
								label="First Name"
								fullWidth
								required
								value={firstName}
								onChange={(e) => {
									setFirstName(e.target.value);
									setErrors((prev) => ({ ...prev, first_name: "" }));
								}}
								error={!!errors.first_name}
								helperText={errors.first_name}
							/>

						</Box>
						<Box flex={1}>
							<TextField
								label="Last Name"
								fullWidth
								required
								value={lastName}
								onChange={(e) => {
									setLastName(e.target.value);
									setErrors((prev) => ({ ...prev, last_name: "" }));
								}}
								error={!!errors.last_name}
								helperText={errors.last_name}
							/> 
						</Box>
					</Stack> 
						<TextField
							label="Email"
							type="email"
							fullWidth
							required
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								setErrors((prev) => ({ ...prev, email: "" }));
							}}
							error={!!errors.email}
							helperText={errors.email}
						/> 
					{!isEdit && (
						<TextField
							label="Password"
							type="password"
							fullWidth
							required
							value={password}
							onChange={(e) => {
								setPassword(e.target.value);
								setErrors((prev) => ({ ...prev, password: "" }));
							}}
							error={!!errors.password}
							helperText={errors.password}
						/>

					)} 
					<Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
						<Box flex={1}>
							<TextField
								select
								label="Role"
								fullWidth
								value={role}
								onChange={(e) => setRole(Number(e.target.value))}
								disabled={rolesLoading}
								>
								{rolesLoading ? (
									<MenuItem disabled>Loading...</MenuItem>
								) : (
									roles.map((r) => (
										<MenuItem key={r.id} value={r.id}>
											{r.name}
										</MenuItem>
									))
								)}
							</TextField> 
						</Box> 
						{isEdit && (
						<Box
							flex={1}
							display="flex"
							alignItems="center"
						>
							<FormControlLabel
								control={
									<Switch
										checked={isActive}
										onChange={(e) => setIsActive(e.target.checked)}
									/>
								}
								label="Active User"
							/>
						</Box>
						)}
					</Stack>
				</Stack>
			</DialogContent>

			<DialogActions>
				<Button onClick={onClose} color="inherit">
					Cancel
				</Button>
				<Button variant="contained" onClick={handleSubmit} disabled={loading}>
					{isEdit ? "Update" : loading ? "Creating..." : "Create"}
				</Button>

			</DialogActions>
		</Dialog>
	);
}
