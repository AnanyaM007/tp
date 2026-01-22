import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const RequestContext = createContext(null);

export function RequestProvider({ children }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch requests from backend on mount
  useEffect(() => {
    async function loadRequests() {
      try {
        setLoading(true);
        const data = await api.getAllRequests();
        setRequests(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load requests:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  const addRequest = async (payload) => {
    try {
      // The ID generation here is client-side, but the backend should ideally assign the final ID.
      // For this example, we'll keep the client-side ID generation for consistency with the original structure
      // before sending to the API, assuming the API might return a more robust ID.
      // If the backend assigns the ID, this `id` property might be removed from the payload sent to `createRequest`.
      const newRequest = {
        ...payload,
        id: `REQ-${(requests.length + 1).toString().padStart(3, "0")}`,
        submissions: [], // Assuming these are initialized by the backend or default
        status: "In Progress", // Assuming this is initialized by the backend or default
      };
      const created = await api.createRequest(newRequest);
      setRequests((prev) => [...prev, created]);
      return created.id;
    } catch (err) {
      console.error('Failed to create request:', err);
      throw err;
    }
  };

  const addSubmission = async (requestId, submission) => {
    try {
      const updated = await api.addSubmission(requestId, submission);
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? updated : req))
      );
    } catch (err) {
      console.error('Failed to add submission:', err);
      throw err;
    }
  };

  const markCompleted = async (requestId) => {
    try {
      const updated = await api.updateRequestStatus(requestId, "Completed");
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? updated : req))
      );
    } catch (err) {
      console.error('Failed to mark as completed:', err);
      throw err;
    }
  };

  const updateRequest = async (requestId, updates) => {
    try {
      const updated = await api.updateRequest(requestId, updates);
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? updated : req))
      );
    } catch (err) {
      console.error('Failed to update request:', err);
      throw err;
    }
  };

  const value = {
    requests,
    addRequest,
    addSubmission,
    markCompleted,
    updateRequest,
    loading,
    error,
  };

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>;
}

export function useRequests() {
  const ctx = useContext(RequestContext);
  if (!ctx) throw new Error("useRequests must be used within RequestProvider");
  return ctx;
}
