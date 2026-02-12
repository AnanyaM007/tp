import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Link } from "react-router-dom";

const STATUS_COLORS = {
    Pending: { bg: "#fef3c7", color: "#d97706", label: "Pending" },
    Completed: { bg: "#d1fae5", color: "#059669", label: "Completed" },
    Overdue: { bg: "#fee2e2", color: "#dc2626", label: "Overdue" },
    "In Progress": { bg: "#dbeafe", color: "#2563eb", label: "In Progress" },
};

export default function RequestTable({ requests }) {
    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
            <Table sx={{ minWidth: 650 }} aria-label="request table">
                <TableHead sx={{ bgcolor: "#f9fafb" }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>Request Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>Columns</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>Entries</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>Due Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#4b5563" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {requests.map((row) => {
                        const statusStyle = STATUS_COLORS[row.status] || STATUS_COLORS["Pending"];
                        const entryCount = (row.initialRows?.length || 0) +
                            (row.submissions?.reduce((acc, s) => acc + (s.rows?.length || 0), 0) || 0);

                        return (
                            <TableRow
                                key={row.id}
                                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    <Typography variant="body2" fontWeight={500}>
                                        {row.title}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {row.columns && row.columns.length > 0
                                            ? row.columns.join(", ")
                                            : "-"}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" align="center" color="text.secondary">
                                        {entryCount}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={statusStyle.label}
                                        size="small"
                                        sx={{
                                            bgcolor: statusStyle.bg,
                                            color: statusStyle.color,
                                            fontWeight: 600,
                                            borderRadius: 1,
                                            height: 24,
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {row.deadline ? new Date(row.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton size="small" component={Link} to={`/request/${row.id}`} sx={{ color: "#4b5563" }}>
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" sx={{ color: "#4b5563" }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" sx={{ color: "#4b5563" }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" sx={{ color: "#4b5563" }}>
                                            <FilterListIcon fontSize="small" sx={{ transform: 'rotate(90deg)' }} />
                                        </IconButton>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {requests.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                <Typography color="text.secondary">No requests found</Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
