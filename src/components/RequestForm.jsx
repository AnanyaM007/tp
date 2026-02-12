import { useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DynamicTable from "./DynamicTable";
import { Link, useNavigate } from "react-router-dom";
import { useRequests } from "../context/RequestContext";
import { sendRequestEmails } from "../services/emailService";

const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL || window.location.origin;

const DEFAULT_EMAIL_BODY = [
  "Hi team,",
  "",
  "A new data request is ready for you. Please submit your input using the link below.",
  "Request: {{title}}",
  "Deadline: {{deadline}}",
  "Instructions: {{instructions}}",
  "Link: {{link}}",
  "",
  "Thanks,",
  "Data Office",
].join("\n");

const reminderOptions = [
  { value: "daily", label: "Daily" },
  { value: "alternate", label: "Alternate days" },
  { value: "weekly", label: "Weekly" },
];

export default function RequestForm() {
  const { addRequest } = useRequests();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [departments, setDepartments] = useState([]);
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [format, setFormat] = useState("Excel");
  const [deadline, setDeadline] = useState("");
  const [reminderOn, setReminderOn] = useState(true);
  const [frequency, setFrequency] = useState("weekly");
  const [columns, setColumns] = useState(
    Array.from({ length: 10 }, (_, i) => `Column ${i + 1}`)
  );
  const [instructions, setInstructions] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [hasEditedSubject, setHasEditedSubject] = useState(false);
  const [emailBody, setEmailBody] = useState(DEFAULT_EMAIL_BODY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialRows, setInitialRows] = useState([]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const addChip = (value, setter) => {
    if (!value.trim()) return;
    const trimmed = value.trim();
    if (setter === setEmails && !isValidEmail(trimmed)) return;
    setter((prev) => [...new Set([...prev, trimmed])]);
  };

  const removeChip = (value, setter) => {
    setter((prev) => prev.filter((item) => item !== value));
  };

  const hydrateTemplate = (template, linkValue) =>
    (template || "")
      .replaceAll("{{title}}", title || "Data request")
      .replaceAll("{{deadline}}", deadline || "Not specified")
      .replaceAll("{{instructions}}", instructions || "See request for details")
      .replaceAll("{{link}}", linkValue);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    let id = "";
    try {
      const inlineEmail = emailInput.trim() || "";
      const finalEmails = inlineEmail && isValidEmail(inlineEmail)
        ? [...new Set([...emails, inlineEmail])]
        : emails;

      id = await addRequest({
        title,
        departments,
        emails: finalEmails,
        format,
        deadline,
        reminders: { enabled: reminderOn, frequency },
        columns,
        initialRows,
        instructions,
        templateContent,
        emailSubject,
        emailBody,
      });

      const link = `${APP_BASE_URL.replace(/\/$/, "")}/request/${id}`;
      const hydratedSubject = hydrateTemplate(emailSubject, link);
      const hydratedBody = hydrateTemplate(emailBody, link);

      const emailResult = await sendRequestEmails({
        emails: finalEmails,
        title,
        deadline,
        link,
        subject: hydratedSubject,
        body: hydratedBody,
      });

      const recipientSummary = finalEmails.length === 0
        ? "Request created. No recipients provided."
        : emailResult?.delivered
          ? `Request sent to ${finalEmails.length} recipient(s).`
          : "Request created, but email delivery uncertain.";

      navigate(`/request/${id}`, { state: { requestCreatedMessage: recipientSummary } });
    } catch (err) {
      console.error(err);
      if (id) {
        navigate(`/request/${id}`, { state: { requestCreatedMessage: "Request created, but email sending failed." } });
      } else {
        alert("Failed to create request.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={4}>

        {/* Row 1: Key Inputs */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              required
              fullWidth
              label="Data name"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!hasEditedSubject) setEmailSubject(e.target.value);
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              type="date"
              label="Deadline"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Division / department"
              placeholder="Press Enter to add"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addChip(e.currentTarget.value, setDepartments);
                  e.currentTarget.value = "";
                }
              }}
              size="small"
            />
            {departments.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                {departments.map((dept) => (
                  <Chip key={dept} label={dept} onDelete={() => removeChip(dept, setDepartments)} size="small" variant="outlined" />
                ))}
              </Stack>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Recipient emails"
              placeholder="Press Enter to add"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  const value = emailInput.trim();
                  if (value && isValidEmail(value)) {
                    addChip(value, setEmails);
                    setEmailInput("");
                  }
                }
              }}
              size="small"
            />
            {emails.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                {emails.map((mail) => (
                  <Chip key={mail} label={mail} onDelete={() => removeChip(mail, setEmails)} size="small" variant="outlined" />
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>

        {/* Row 2: Controls */}
        <Stack direction="row" flexWrap="wrap" gap={3} alignItems="center">
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Format</Typography>
            <TextField
              select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="Excel">Excel</MenuItem>
              <MenuItem value="Word">Word</MenuItem>
              <MenuItem value="PDF">PDF</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ pt: 2.5 }}>
            <FormControlLabel
              control={<Switch checked={reminderOn} onChange={() => setReminderOn(!reminderOn)} />}
              label="Send automatic reminders"
              sx={{ mr: 0 }}
            />
          </Box>

          {reminderOn && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Reminder frequency</Typography>
              <TextField
                select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
              >
                {reminderOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Box>
          )}
        </Stack>

        {/* Row 3: Instructions */}
        <TextField
          fullWidth
          label="Instructions / acceptance criteria"
          multiline
          minRows={3}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Describe the data requirements..."
        />

        {/* Row 4: Split Section */}
        <Grid container spacing={4}>
          {/* Left: Format Specific or Extras */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>{format} template</Typography>
            {format !== "Excel" ? (
              <TextField
                fullWidth
                multiline
                minRows={8}
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                placeholder={`Define the structure for the ${format} file...`}
              />
            ) : (
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  Configure the Excel columns in the table section below.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  Additional {format} settings can be placed here.
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Right: Email Template */}
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary" mb={1} display="block">Email template</Typography>
            <TextField
              fullWidth
              multiline
              minRows={8}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              sx={{ bgcolor: '#fff' }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Placeholders: &#123;&#123;title&#125;&#125;, &#123;&#123;deadline&#125;&#125;, &#123;&#123;link&#125;&#125;
            </Typography>
          </Grid>
        </Grid>

        {/* Row 5: Dynamic Table (Excel Only) */}
        {format === "Excel" && (
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Excel template <Typography component="span" variant="body2" color="text.secondary" fontWeight={400}>Define columns to auto-build the sheet.</Typography>
            </Typography>
            <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 2, overflow: 'hidden' }}>
              <DynamicTable
                columns={columns}
                onColumnsChange={setColumns}
                data={initialRows}
                onDataChange={setInitialRows}
                height={300}
                editable={true}
                allowColumnManagement={true}
                minRows={5}
              />
            </Box>
          </Box>
        )}

        {/* Row 6: Upload */}
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>Upload template <Typography component="span" variant="body2" color="text.secondary" fontWeight={400}>(Optional)</Typography></Typography>
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            sx={{ mt: 1, textTransform: 'none' }}
          >
            UPLOAD TEMPLATE
            <input type="file" hidden />
          </Button>
        </Box>

        {/* Footer Actions */}
        <Stack direction="row" spacing={2} sx={{ pt: 2, borderTop: '1px solid #f1f5f9' }}>
          <Button component={Link} to="/" variant="outlined" color="inherit" sx={{ px: 4 }}>
            CANCEL
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ bgcolor: '#0f4c81', px: 4, py: 1.2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Save & issue request"}
          </Button>
        </Stack>

      </Stack>
    </form>
  );
}
