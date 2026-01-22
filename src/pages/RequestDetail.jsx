import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useRequests } from "../context/RequestContext";
import DynamicTable from "../components/DynamicTable";
import { api } from "../services/api";

export default function RequestDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { requests, addSubmission, markCompleted, updateRequest, loading } = useRequests();
  const [request, setRequest] = useState(null);
  const [requestLoading, setRequestLoading] = useState(true);
  const [department, setDepartment] = useState("");
  const [comment, setComment] = useState("");
  const [toastMessage, setToastMessage] = useState(location.state?.requestCreatedMessage || "");
  const [showToast, setShowToast] = useState(Boolean(location.state?.requestCreatedMessage));
  const [tableData, setTableData] = useState([]);

  // Load request from context or fetch directly from API
  useEffect(() => {
    async function loadRequest() {
      if (!id) return;
      
      // First, try to find in context
      const contextRequest = requests.find((r) => r.id === id);
      if (contextRequest) {
        setRequest(contextRequest);
        setRequestLoading(false);
        return;
      }

      // If not in context and context is done loading, fetch from API
      if (!loading) {
        try {
          setRequestLoading(true);
          const fetchedRequest = await api.getRequestById(id);
          setRequest(fetchedRequest);
        } catch (error) {
          console.error('Failed to fetch request:', error);
          setRequest(null);
        } finally {
          setRequestLoading(false);
        }
      }
    }

    loadRequest();
  }, [id, requests, loading]);

  // Handle column changes (persist to backend)
  const handleColumnsChange = async (newColumns) => {
    try {
      if (!request) return;
      await updateRequest(request.id, { columns: newColumns });
    } catch (error) {
      console.error("Failed to update columns:", error);
      // Ideally show an error toast
    }
  };

  const combinedRows = useMemo(() => {
    if (!request) return [];
    return request.submissions.flatMap((s) =>
      s.rows.map((row) => ({ ...row, __department: s.department }))
    );
  }, [request]);

  // Initialize table data from combined rows
  useEffect(() => {
    if (combinedRows.length > 0) {
      setTableData(combinedRows);
    }
  }, [combinedRows]);

  if (loading || requestLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!request) {
    return (
      <Box className="max-w-4xl mx-auto px-6 py-10 animate-fade-in">
        <Typography variant="h6">Request not found.</Typography>
        <Button component={Link} to="/" sx={{ mt: 2 }} variant="contained">
          Back to dashboard
        </Button>
      </Box>
    );
  }

  const handleQuickComplete = () => {
    markCompleted(request.id);
  };

  const handleMockSubmit = () => {
    if (!department.trim()) return;
    addSubmission(request.id, {
      department,
      rows: [{ Comment: comment || "Submitted" }],
      completed: true,
    });
    setDepartment("");
    setComment("");
  };

  useEffect(() => {
    if (location.state?.requestCreatedMessage) {
      setToastMessage(location.state.requestCreatedMessage);
      setShowToast(true);
    }
  }, [location.state]);

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 3, sm: 4, md: 6 },
        py: { xs: 6, md: 8 },
      }}
      className="animate-fade-in"
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2.5}
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{ mb: 4 }}
      >
        <Typography variant="h4" fontWeight={700} className="gradient-text">
          {request.title}
        </Typography>
        <Chip
          label={request.format}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600
          }}
        />
        <Chip
          label={request.status}
          color={request.status === "Completed" ? "success" : "warning"}
          variant="filled"
          sx={{ fontWeight: 600 }}
        />
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          onClick={handleQuickComplete}
          className="hover-lift"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            }
          }}
        >
          Mark completed
        </Button>
      </Stack>

      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        <Grid item xs={12} md={8}>
          <Card
            className="hover-lift animate-slide-in"
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Request details
              </Typography>
              <Stack spacing={1.5}>
                <Typography color="text.secondary">
                  📅 <strong>Deadline:</strong> {request.deadline || "Not set"}
                </Typography>
                <Typography color="text.secondary">
                  🏢 <strong>Departments:</strong> {request.departments.join(", ")}
                </Typography>
                <Typography color="text.secondary">
                  📧 <strong>Emails:</strong> {request.emails.join(", ")}
                </Typography>
                <Typography color="text.secondary">
                  📝 <strong>Instructions:</strong> {request.instructions}
                </Typography>
              </Stack>

            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="shadow-sm h-full">
            <CardContent className="space-y-2">
              <Typography variant="h6">Reminders</Typography>
              {request.reminders?.enabled ? (
                <>
                  <Typography color="text.secondary">
                    Frequency: {request.reminders.frequency}
                  </Typography>
                  <Typography color="text.secondary">
                    Auto-mails go to: {request.emails.join(", ")}
                  </Typography>
                </>
              ) : (
                <Typography color="text.secondary">Reminders are disabled.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card
        className="hover-lift animate-fade-in"
        sx={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          mt: 3
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>📊 Combined Data Sheet (Live)</Typography>
            <Typography color="text.secondary" variant="body2">
              Auto-updated as departments submit their data
            </Typography>
          </Stack>
          <DynamicTable
            columns={request.columns || []}
            data={tableData}
            onDataChange={setTableData}
            onColumnsChange={handleColumnsChange}
            height={450}
            editable={true}
            allowColumnManagement={true}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
            💡 The grid above is fully interactive - you can edit cells, add/delete rows, and add/delete columns.
          </Typography>
          {combinedRows.length > 0 && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                border: '2px dashed rgba(102, 126, 234, 0.3)'
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                📋 Recent Submissions Preview
              </Typography>
              <Box sx={{ bgcolor: 'white', borderRadius: 1, overflow: 'hidden' }}>
                <DynamicTable
                  columns={request.columns || []}
                  data={combinedRows.slice(-5)}
                  editable={false}
                  height={300}
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button component={Link} to="/" variant="text">
          Back to dashboard
        </Button>
        <Button component={Link} to="/request/new" variant="contained">
          Launch another request
        </Button>
      </Stack>

      <Snackbar
        open={showToast}
        autoHideDuration={4000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowToast(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toastMessage || "Request sent to all recipients."}
        </Alert>
      </Snackbar>
    </Box>
  );
}
