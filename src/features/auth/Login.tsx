import { Button, TextField, Paper, Typography } from "@mui/material";

export default function Login() {
    return (
		<Paper
			elevation={3}
			sx={{
				width: 360,
				mx: "auto",
				mt: 12,
				p: 4,
			}}
		>
			<Typography variant="h5" mb={2}>
			Admin Login
			</Typography>

			<TextField fullWidth label="Email" margin="normal" />
			<TextField
				fullWidth
				label="Password"
				type="password"
				margin="normal"
			/>

			<Button
				fullWidth
				variant="contained"
				sx={{ mt: 2 }}
			>
				Login
			</Button>
		</Paper>
	);
}
