import { useMemo, useRef, useState } from "react";
import { Box, Button, Chip, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ExcelSheet from "./ExcelSheet";
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
  const [format, setFormat] = useState("Excel");
  const [deadline, setDeadline] = useState("");
  const [reminderOn, setReminderOn] = useState(true);
  const [frequency, setFrequency] = useState("weekly");
  const [columns] = useState(["Field 1", "Field 2"]);
  const [instructions, setInstructions] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [hasEditedSubject, setHasEditedSubject] = useState(false);
  const [emailBody, setEmailBody] = useState(DEFAULT_EMAIL_BODY);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deptInputRef = useRef(null);
  const emailInputRef = useRef(null);

  const reminderDates = useMemo(() => {
    if (!deadline || !reminderOn || !frequency) return [];
    const daysMap = { daily: 1, alternate: 2, weekly: 7 };
    const step = daysMap[frequency];
    const dates = [];
    const end = new Date(deadline);
    let current = new Date();
    while (current <= end) {
      dates.push(new Date(current));
      const next = new Date(current);
      next.setDate(next.getDate() + step);
      current = next;
    }
    return dates;
  }, [deadline, reminderOn, frequency]);

  const addChip = (value, setter) => {
    if (!value.trim()) return;
    setter((prev) => [...new Set([...prev, value.trim()])]);
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
      const inlineEmail = emailInputRef.current?.value?.trim() || "";
      const finalEmails = inlineEmail
        ? [...new Set([...emails, inlineEmail])]
        : emails;

      id = addRequest({
        title,
        departments,
        emails: finalEmails,
        format,
        deadline,
        reminders: { enabled: reminderOn, frequency },
        columns,
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

      const recipientSummary =
        emails.length === 0
          ? "Request created. No recipients were provided, so no email was sent."
          : emailResult?.delivered
          ? `Request sent and email delivered to ${emails.length} recipient${emails.length > 1 ? "s" : ""}.`
          : "Request created, but email delivery could not be confirmed (check email settings).";

      navigate(`/request/${id}`, { state: { requestCreatedMessage: recipientSummary } });
    } catch (err) {
      console.error(err);
      const fallbackMessage =
        "Request created, but sending the email failed. Please check your email settings and try again.";
      navigate(`/request/${id}`, { state: { requestCreatedMessage: fallbackMessage } });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        mx: "auto",
        width: "100%",
        maxWidth: 1100,
        px: { xs: 0, sm: 0, md: 0 },
      }}
    >
      <form onSubmit={handleSubmit} style={{ width: "95%" }}>
        <Stack spacing={{ xs: 3.25, md: 4.25 }} sx={{ pb: 14 }}>
        <Grid
          container
          rowSpacing={{ xs: 2.25, sm: 2.5, md: 3 }}
          columnSpacing={{ xs: 2, sm: 2.5, md: 3 }}
        >
        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            label="Data needed (name)"
            value={title}
            onChange={(e) => {
              const newTitle = e.target.value;
              setTitle(newTitle);
              if (!hasEditedSubject) {
                setEmailSubject(newTitle);
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            type="date"
            label="Deadline"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            inputRef={deptInputRef}
            label="Division / department"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addChip(e.currentTarget.value, setDepartments);
                e.currentTarget.value = "";
              }
            }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" mt={1.25} rowGap={1}>
            {departments.map((dept) => (
              <Chip
                key={dept}
                label={dept}
                onDelete={() => removeChip(dept, setDepartments)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          {/* <TextField
            fullWidth
            inputRef={emailInputRef}
            label="Recipient emails (press Enter to add)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addChip(e.currentTarget.value, setEmails);
                e.currentTarget.value = "";
              }
            }}
          /> */}
          <Stack direction="row" spacing={1} flexWrap="wrap" mt={1.25} rowGap={1}>
            {emails.map((mail) => (
              <Chip
                key={mail}
                label={mail}
                onDelete={() => removeChip(mail, setEmails)}
                variant="outlined"
              />
            ))}
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <MenuItem value="Excel">Excel</MenuItem>
            <MenuItem value="Word">Word</MenuItem>
            <MenuItem value="PDF">PDF</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={<Switch checked={reminderOn} onChange={() => setReminderOn((p) => !p)} />}
            label="Send automatic reminders"
          />
          {reminderOn && (
            <TextField
              select
              fullWidth
              label="Reminder frequency"
              size="small"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              sx={{ mt: 1 }}
            >
              {reminderOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Grid>
      </Grid>

      <TextField
        fullWidth
        label="Instructions / acceptance criteria"
        multiline
        minRows={3}
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        sx={{ mt: { xs: 0.5, md: 1 } }}
      />

      <Grid container spacing={{ xs: 2.25, sm: 2.5, md: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email subject"
            value={emailSubject}
            onChange={(e) => {
              setHasEditedSubject(true);
              setEmailSubject(e.target.value);
            }}
            helperText="Defaults to the data request name, but you can customise it."
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Mail recipients"
            value={emails.join(", ")}
            onChange={(e) =>
              setEmails(
                e.target.value
                  .split(",")
                  .map((m) => m.trim())
                  .filter(Boolean)
              )
            }
            helperText="Edit recipients inline or use the chip input above."
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email template"
            multiline
            minRows={6}
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            helperText="Placeholders: {{title}}, {{deadline}}, {{instructions}}, {{link}}"
          />
        </Grid>
      </Grid>

        {format === "Excel" && (
          <Box
            className="border border-dashed border-slate-400 rounded-lg space-y-3"
            sx={{
              p: { xs: 2.5, sm: 3 },
              overflowX: "auto",
              overflowY: "hidden",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography fontWeight={700}>Excel template</Typography>
              <Typography color="text.secondary">Define columns to auto-build the sheet.</Typography>
            </Stack>
            <Box sx={{ minWidth: { xs: 640, sm: 720, md: 900 } }}>
              <ExcelSheet columns={columns} />
            </Box>
          </Box>
        )}

        {format !== "Excel" && (
          <TextField
            fullWidth
            label={`${format} template content`}
            multiline
            minRows={4}
            value={templateContent}
            onChange={(e) => setTemplateContent(e.target.value)}
            placeholder={`Describe the sections that should appear in the ${format.toLowerCase()} template`}
            sx={{ mt: 1 }}
          />
        )}

        <Box className="border border-dashed border-slate-200 rounded-lg p-4 space-y-1">
          <Typography fontWeight={700}>Attach existing format (optional)</Typography>
          <Button
            startIcon={<UploadFileIcon />}
            sx={{ mt: 1 }}
            variant="outlined"
            component="label"
          >
            Upload template
            <input type="file" hidden />
          </Button>
        </Box>

        {reminderOn && deadline && (
          <Box className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <Typography variant="subtitle2" fontWeight={600}>Reminder schedule preview</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
              {reminderDates.map((date, idx) => (
                <Chip key={idx} size="small" label={date.toDateString()} />
              ))}
            </Stack>
          </Box>
        )}

        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            left: 0,
            right: 0,
            pt: 3,
            mt: 2,
            backgroundColor: "#fff",
            zIndex: 3,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Button component={Link} to="/" variant="text" fullWidth sx={{ maxWidth: { sm: 160 } }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" fullWidth sx={{ maxWidth: { sm: 200 } }}>
              {isSubmitting ? "Sending..." : "Save & issue request"}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </form>
    </Box>
  );
}
