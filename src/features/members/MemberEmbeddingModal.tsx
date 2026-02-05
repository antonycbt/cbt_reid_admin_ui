import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Button,
  Snackbar,
  Alert,
  LinearProgress,
  Divider,
} from "@mui/material";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";

import { api } from "../../api/axios";
import BodyBiometricIcon from "../../components/icons/BodyBiometricIcon";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";


interface Props {
  open: boolean;
  onClose: () => void;
  member: any;
}

type ProgressSingle = {
  member_id?: number;
  camera_id?: number;
  stage?: string;
  percent?: number;
  [k: string]: any;
};

export default function MemberEmbeddingModal({ open, onClose, member }: Props) {
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");

  const [loading, setLoading] = useState(false);

  // collecting = capture/collection started by "Start" button (per-camera map)
  const [collectingCameras, setCollectingCameras] = useState<{ [camId: string]: boolean }>({});

  // extractingActive = we started an extraction (poll progress until done)
  const [extractingActive, setExtractingActive] = useState(false);

  // progress is exclusively for extraction progress (polled)
  const [progress, setProgress] = useState<ProgressSingle | null>(null);

  const pollRef = useRef<number | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "info" | "warning" | "error" }>({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = (message: string, severity: "success" | "info" | "warning" | "error" = "info") =>
    setSnackbar({ open: true, message, severity });

  const hideSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  /* -------------------- FETCH CAMERAS -------------------- */

  const fetchCameras = async () => {
    try {
      const res = await api.get("/cameras/allcameras");
      const list: any[] = res.data?.data ?? [];
      setCameras(list);

      // initialize collecting map for available cams
      const initial: { [camId: string]: boolean } = {};
      list.forEach((c) => (initial[String(c.id)] = false));
      setCollectingCameras(initial);

      if (list.length > 0) setSelectedCamera(String(list[0].id));
    } catch (err) {
      console.error("fetchCameras", err);
      setCameras([]);
      setCollectingCameras({});
      setSelectedCamera("");
      showSnackbar("Failed to fetch cameras", "error");
    }
  };

  useEffect(() => {
    if (open) {
      fetchCameras();
      // reset extraction state when modal opens
      setExtractingActive(false);
      setProgress(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* -------------------- RESET ON CAMERA CHANGE -------------------- */

  useEffect(() => {
    // switching cameras clears any existing extraction progress and stops polling
    setExtractingActive(false);
    setProgress(null);
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [selectedCamera]);

  /* -------------------- COLLECTION ACTIONS (start/stop) -------------------- */

  const handleStart = async () => {
    if (!selectedCamera) return;
    setLoading(true);
    try {
      const body = {
        member_id: Number(member.id),
        camera_ids: [Number(selectedCamera)],
        // do not open server-side viewer by default in production; set true for debugging
        show_viewer: true,
        clear_existing: false,
      };
      const res = await api.post("/embeddings/start", body);
      // assume success if no exception; prefer server message
      showSnackbar(res.data?.message || "Collection started", "success");

      // mark this camera as collecting locally
      setCollectingCameras((prev) => ({ ...prev, [selectedCamera]: true }));
    } catch (err: any) {
      console.error("start error", err);
      showSnackbar(err?.response?.data?.detail || "Failed to start collection", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!selectedCamera) return;
    setLoading(true);
    try {
      // backend stop may be global — we still call it, but locally mark camera stopped
      const res = await api.post("/embeddings/stop", null, { params: { reason: "user" } });
      showSnackbar(res.data?.message || "Collection stopped", "info");

      setCollectingCameras((prev) => ({ ...prev, [selectedCamera]: false }));
    } catch (err: any) {
      console.error("stop error", err);
      showSnackbar(err?.response?.data?.detail || "Failed to stop collection", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedCamera) return;
    if (!confirm("Remove embeddings for this camera?")) return;

    setLoading(true);
    try {
      const res = await api.delete(`/embeddings/remove/${Number(member.id)}`, { params: { camera_id: Number(selectedCamera) } });
      showSnackbar(res.data?.message || "Embeddings removed", "success");

      // clear local state
      setCollectingCameras((prev) => ({ ...prev, [selectedCamera]: false }));
      setExtractingActive(false);
      setProgress(null);
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    } catch (err: any) {
      console.error("remove error", err);
      showSnackbar(err?.response?.data?.detail || "Failed to remove embeddings", "error");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- EXTRACTION (triggers polling) -------------------- */

  const startPollingProgress = () => {
    // clear existing poll if any
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }

    // immediate fetch + periodic
    fetchProgressOnce();
    pollRef.current = window.setInterval(fetchProgressOnce, 1000);
  };

  const stopPollingProgress = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const fetchProgressOnce = async () => {
    if (!member?.id || !selectedCamera) return;
    try {
      const res = await api.get(`/embeddings/progress/${Number(member.id)}`, { params: { camera_id: Number(selectedCamera) } });
      const data = res.data as ProgressSingle;
      const pct = Number(data.percent ?? 0);
      const stage = data.stage ?? "";

      // backend may return default idle 0% — show only after extraction started
      // if we're extractingActive and we see idle + 0%, keep it but don't interpret as completion
      setProgress(data);

      // if extraction finished, stop polling and flip extractingActive off
      if (pct >= 100 || stage === "done") {
        setExtractingActive(false);
        stopPollingProgress();
        showSnackbar("Extraction complete", "success");
      }
    } catch (err) {
      console.error("fetchProgressOnce", err);
      // don't surface poll errors repeatedly; optionally show a single info snackbar
    }
  };

  const handleExtract = async () => {
    if (!selectedCamera) return;
    setLoading(true);
    try {
      const body = {
        member_id: Number(member.id),
        camera_ids: [Number(selectedCamera)],
        sync: false,
      };
      const res = await api.post("/embeddings/extract", body);

      // If the backend reports that extraction started, begin polling
      const status = res.data?.status;
      if (status === "started" || status === "ok") {
        showSnackbar(res.data?.message || "Extraction started", "info");
        setExtractingActive(true);
        setProgress(null);
        startPollingProgress();
      } else {
        // if backend returned immediate progress or some message, still poll if appropriate
        showSnackbar(res.data?.message || `Extract: ${String(status)}`, "info");
        // start polling anyway to pick up progress changes
        setExtractingActive(true);
        startPollingProgress();
      }
    } catch (err: any) {
      console.error("extract error", err);
      showSnackbar(err?.response?.data?.detail || "Failed to start extraction", "error");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI helpers -------------------- */

  const isCollecting = Boolean(selectedCamera && collectingCameras[selectedCamera]);
  const isExtracting = extractingActive;

  /* -------------------- CLEANUP on modal close -------------------- */

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  /* -------------------- RENDER -------------------- */

  return (
    <>
      <Dialog open={open} onClose={() => { onClose(); }} maxWidth="sm" fullWidth>
        <Backdrop
          open={loading}
          sx={{
            position: "absolute",
            zIndex: 10,
            color: "#00e5ff",
            backgroundColor: "rgba(0,0,0,0.35)",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <CircularProgress color="inherit" />
          <Typography variant="caption">Processing… please wait</Typography>
        </Backdrop>

        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <BodyBiometricIcon />
            <Typography variant="h6">Manage Embedding – {member?.first_name || ""} {member?.last_name || ""}</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {cameras.length === 0 ? (
            <Typography>No cameras available</Typography>
          ) : (
            <Box>
              <Box display="flex" alignItems="center" gap={1} p={1}>
                <FormControl size="medium" sx={{ minWidth: 220 }}>
                  <Select value={selectedCamera} onChange={(e) => setSelectedCamera(String(e.target.value))}>
                    {cameras.map((c) => (
                      <MenuItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <IconButton
                  color="success"
                  title="Start capture"
                  onClick={handleStart}
                  disabled={isCollecting || loading}
                >
                  <PlayArrowIcon />
                </IconButton>

                <IconButton
                  color="warning"
                  title="Stop capture"
                  onClick={handleStop}
                  disabled={!isCollecting || loading}
                >
                  <StopIcon />
                </IconButton>

                <IconButton
                  color="primary"
                  title="Extract embeddings"
                  onClick={handleExtract}
                  disabled={loading}
                >
                  <DownloadIcon />
                </IconButton>

                <IconButton
                  color="error"
                  title="Remove embeddings for selected camera"
                  onClick={handleRemove}
                  disabled={loading}
                >
                  <DeleteIcon />
                </IconButton>

              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Extraction progress area — shown only when extractingActive OR when progress object exists */}
              {(isExtracting || progress) && (
                <Box mt={1} px={1}>
                  {progress ? (
                    <>
                      <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                        {progress.stage ?? "extracting"} — {progress.percent ?? 0}% 
                        {/* {progress.camera_id ? ` (camera ${progress.camera_id})` : ""} */}
                      </Typography>
                      <LinearProgress variant="determinate" value={Math.max(0, Math.min(100, Number(progress.percent ?? 0)))} />
                    </>
                  ) : (
                    // no meaningful progress yet but extractingActive is true
                    <Typography variant="caption" color="text.secondary">
                      Waiting for extraction progress...
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              // stop polling when closing
              setExtractingActive(false);
              if (pollRef.current) {
                window.clearInterval(pollRef.current);
                pollRef.current = null;
              }
              onClose();
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={hideSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={hideSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
