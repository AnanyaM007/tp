import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Stack,
    Select,
    MenuItem,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton
} from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'viewer' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const { isAdmin, user: currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAdmin) {
            navigate("/");
            return;
        }
        fetchUsers();
    }, [isAdmin]);

    const fetchUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (err) {
            setError("Failed to load users");
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await api.updateUserRole(id, newRole);
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
        } catch (err) {
            setError("Failed to update user role");
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        try {
            const created = await api.createUser(newUser);
            setUsers([created, ...users]);
            setOpenAddDialog(false);
            setNewUser({ name: '', username: '', password: '', role: 'viewer' });
        } catch (err) {
            setError(err.message || "Failed to create user");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        setIsSubmitting(true);
        try {
            await api.deleteUser(userToDelete.id);
            setUsers(users.filter(u => u.id !== userToDelete.id));
            setDeleteConfirmOpen(false);
            setUserToDelete(null);
        } catch (err) {
            setError(err.message || "Failed to delete user");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAdmin) return null;

    return (
        <Box
            sx={{
                maxWidth: 1200,
                mx: "auto",
                px: { xs: 2, sm: 4 },
                py: { xs: 4, md: 6 },
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700} color="#1e293b">
                        User Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage user accounts and access levels.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAddDialog(true)}
                    sx={{ bgcolor: '#0f4c81', textTransform: 'none', fontWeight: 600 }}
                >
                    Add New User
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>{error}</Alert>}

            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 0 }}>
                    <TableContainer component={Paper} elevation={0}>
                        <Table sx={{ minWidth: 650 }} aria-label="users table">
                            <TableHead sx={{ bgcolor: "#f8fafc" }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>User</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Username / ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Status / Role</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: "#475569", textAlign: 'right' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{ bgcolor: "#1b4d9b", width: 32, height: 32, fontSize: '0.875rem' }}>
                                                    {(user.name || user.username).charAt(0)}
                                                </Avatar>
                                                <Stack>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {user.name || "N/A"}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {user.username}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={user.role}
                                                size="small"
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                sx={{
                                                    minWidth: 120,
                                                    fontSize: '0.875rem',
                                                    '& .MuiSelect-select': { py: 0.5 }
                                                }}
                                            >
                                                <MenuItem value="admin">Admin</MenuItem>
                                                <MenuItem value="editor">Editor</MenuItem>
                                                <MenuItem value="viewer">Viewer</MenuItem>
                                            </Select>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                disabled={user.id === currentUser?.id}
                                                onClick={() => {
                                                    setUserToDelete(user);
                                                    setDeleteConfirmOpen(true);
                                                }}
                                                title={user.id === currentUser?.id ? "You cannot delete yourself" : "Delete User"}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Add User Dialog */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>Create New Account</Typography>
                    <IconButton onClick={() => setOpenAddDialog(false)} size="small"><CloseIcon /></IconButton>
                </DialogTitle>
                <form onSubmit={handleAddUser}>
                    <DialogContent dividers sx={{ py: 3 }}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                required
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                placeholder="Enter full name"
                            />
                            <TextField
                                fullWidth
                                label="Username (Email)"
                                type="email"
                                required
                                value={newUser.username}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                placeholder="e.g. user@tatapower.com"
                            />
                            <TextField
                                fullWidth
                                label="Initial Password"
                                type="password"
                                required
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="Set a secure password"
                            />
                            <TextField
                                select
                                fullWidth
                                label="Access Title (Role)"
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            >
                                <MenuItem value="viewer">Viewer (Read-only)</MenuItem>
                                <MenuItem value="editor">Editor (Can edit/create)</MenuItem>
                                <MenuItem value="admin">Admin (Full Control)</MenuItem>
                            </TextField>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setOpenAddDialog(false)} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{ bgcolor: '#0f4c81', px: 4, textTransform: 'none', fontWeight: 600 }}
                        >
                            {isSubmitting ? "Generating..." : "Generate ID & Password"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete user <strong>{userToDelete?.name || userToDelete?.username}</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleDeleteUser}
                        color="error"
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Deleting..." : "Delete User"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
