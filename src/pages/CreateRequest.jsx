import { Box, Card, CardContent, Typography } from "@mui/material";
import RequestForm from "../components/RequestForm";

export default function CreateRequest() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 2, sm: 4, md: 6 },
        py: { xs: 4, md: 6 },
      }}
    >
      <Card className="shadow-sm" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <CardContent
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            display: "grid",
            gap: { xs: 2.5, md: 3 },
            overflow: "visible",
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            Create a new data request
          </Typography>
          <Typography color="text.secondary">
            Choose the format, define the template, set deadlines and reminders, and send it to relevant divisions.
          </Typography>
          <RequestForm />
        </CardContent>
      </Card>
    </Box>
  );
}
