import { AppBar, Box, Button, Toolbar, Typography, Stack } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/request/new", label: "New Request" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  const visibleLinks = links.filter((link) => link.to !== pathname);

  return (
    <AppBar position="sticky" elevation={0} color="inherit">
      <Toolbar className="bg-white border-b border-slate-100">
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1b4d9b" }}>
          TATA Power | Data Exchange
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ alignItems: { xs: "stretch", sm: "center" } }}
        >
          {visibleLinks.map((link) => (
            <Button
              key={link.to}
              component={Link}
              to={link.to}
              variant="text"
              color="primary"
              sx={{ minWidth: 120 }}
            >
              {link.label}
            </Button>
          ))}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
