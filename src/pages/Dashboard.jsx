import {
  Box,
  Button,
  Stack,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider
} from "@mui/material";
import { Link } from "react-router-dom";
import { useRequests } from "../context/RequestContext";
import RequestTable from "../components/RequestTable";
import AddIcon from '@mui/icons-material/Add';

export default function Dashboard() {
  const { requests } = useRequests();

  return (
    <Box
      sx={{
        maxWidth: 1400,
        mx: "auto",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, md: 4 },
        bgcolor: "#f8f9fa", // Light grey background
        minHeight: "100vh"
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} color="#1e293b">
            Data Request Portal
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Request and manage data submissions with ease.
          </Typography>
          {/* New Request Button - Moved here to match reference image */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/request/new"
            sx={{
              mt: 2,
              bgcolor: "#003366", // Dark blue
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 1
            }}
          >
            New Request
          </Button>
        </Box>
      </Stack>

      {/* Main Grid: Left (Table) and Right (Side Panel) */}
      <Grid container spacing={3}>
        {/* Left Column: Requests Table */}
        <Grid item xs={12} lg={8}>
          <RequestTable requests={requests} />
        </Grid>

        {/* Right Column: Side Panel */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Live Data Overview Card */}
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>
                    Live Data Overview
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 2, borderColor: '#e2e8f0' }} />

                {/* Table Header */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 1, bgcolor: '#64748b', color: 'white', p: 1, borderRadius: '4px 4px 0 0' }}>
                  <Typography variant="caption" fontWeight={600}>Name</Typography>
                  <Typography variant="caption" fontWeight={600} align="center">Entries</Typography>
                  <Typography variant="caption" fontWeight={600}>Status</Typography>
                </Box>
                {/* Table Rows */}
                <Box sx={{ border: '1px solid #e2e8f0', borderTop: 0 }}>
                  {requests.length > 0 ? (
                    requests.slice(0, 5).map((req) => {
                      const rowCount = (req.initialRows?.length || 0) +
                        (req.submissions?.reduce((acc, s) => acc + (s.rows?.length || 0), 0) || 0);

                      return (
                        <Box key={req.id} sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 1, p: 1, borderBottom: '1px solid #f1f5f9' }}>
                          <Typography variant="caption" fontWeight={500} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {req.title}
                          </Typography>
                          <Typography variant="caption" align="center">{rowCount}</Typography>
                          <Typography variant="caption"
                            color={req.status === "Completed" ? "success.main" : "warning.main"}
                            fontWeight={500}
                          >
                            {req.status}
                          </Typography>
                        </Box>
                      );
                    })
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">No data available</Typography>
                    </Box>
                  )}
                </Box>

              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
