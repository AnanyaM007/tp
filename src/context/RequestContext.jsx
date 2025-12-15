import { createContext, useContext, useEffect, useMemo, useState } from "react";

const RequestContext = createContext(null);

const sampleRequests = [
  {
    id: "REQ-001",
    title: "Meter inventory - South Zone",
    format: "Excel",
    departments: ["Distribution", "Maintenance"],
    emails: ["dist@tatapower.com", "maint@tatapower.com"],
    deadline: "2025-01-15",
    emailSubject: "Data request: Meter inventory - South Zone",
    emailBody:
      "Hi team,\n\nPlease update the sheet for Meter inventory - South Zone.\nDeadline: 2025-01-15\nLink: {{link}}\n\nThanks,\nData Office",
    reminders: { enabled: true, frequency: "weekly" },
    instructions: "Share all active meters with health status.",
    columns: ["Asset ID", "Location", "Status", "Remarks"],
    submissions: [
      {
        department: "Distribution",
        rows: [
          { "Asset ID": "MTR-001", Location: "Mumbai", Status: "Active", Remarks: "" },
          { "Asset ID": "MTR-002", Location: "Pune", Status: "Inactive", Remarks: "Under repair" },
        ],
        completed: true,
      },
      {
        department: "Maintenance",
        rows: [{ "Asset ID": "MTR-003", Location: "Navi Mumbai", Status: "Active", Remarks: "" }],
        completed: false,
      },
    ],
    status: "In Progress",
  },
];

const STORAGE_KEY = "data-exchange-requests";

export function RequestProvider({ children }) {
  const [requests, setRequests] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return sampleRequests;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : sampleRequests;
    } catch {
      return sampleRequests;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch {
      // ignore persistence errors
    }
  }, [requests]);

  const addRequest = (payload) => {
    const newRequest = {
      ...payload,
      id: `REQ-${(requests.length + 1).toString().padStart(3, "0")}`,
      submissions: [],
      status: "In Progress",
    };
    setRequests((prev) => [...prev, newRequest]);
    return newRequest.id;
  };

  const addSubmission = (requestId, submission) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, submissions: [...req.submissions, submission] }
          : req
      )
    );
  };

  const markCompleted = (requestId) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "Completed" } : req
      )
    );
  };

  const value = useMemo(
    () => ({ requests, addRequest, addSubmission, markCompleted }),
    [requests]
  );

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>;
}

export function useRequests() {
  const ctx = useContext(RequestContext);
  if (!ctx) throw new Error("useRequests must be used within RequestProvider");
  return ctx;
}
