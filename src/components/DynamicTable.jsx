import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import CloseIcon from '@mui/icons-material/Close';

export default function DynamicTable({
  columns = ["Column 1", "Column 2"],
  data = [],
  onDataChange,
  onColumnsChange,
  height = 400,
  editable = true,
  allowColumnManagement = false,
  minRows = 1,
}) {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);

  // Initialize rows from props
  useEffect(() => {
    if (data && data.length > 0) {
      setRows(data);
    } else {
      // If no data, create empty rows
      if (editable) {
        const initialRows = Array.from({ length: Math.max(minRows, 1) }, () => {
          const emptyRow = {};
          columns.forEach((col) => {
            emptyRow[col] = "";
          });
          return emptyRow;
        });
        setRows(initialRows);
      } else {
        setRows([]);
      }
    }
  }, [data, columns, editable, minRows]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(rows.map((_, index) => index));
    } else {
      setSelected([]);
    }
  };

  const handleSelectRow = (index) => {
    const selectedIndex = selected.indexOf(index);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, index);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleCellChange = (rowIndex, column, value) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [column]: value };
    setRows(newRows);
    if (onDataChange) {
      onDataChange(newRows);
    }
  };

  const handleAddRow = () => {
    const newRow = {};
    columns.forEach((col) => {
      newRow[col] = "";
    });
    const newRows = [...rows, newRow];
    setRows(newRows);
    if (onDataChange) {
      onDataChange(newRows);
    }
  };

  const handleDeleteSelected = () => {
    const newRows = rows.filter((_, index) => !selected.includes(index));
    setRows(newRows);
    setSelected([]);
    if (onDataChange) {
      onDataChange(newRows);
    }
  };

  const handleAddColumn = () => {
    const name = window.prompt("Enter new column name:");
    if (name && !columns.includes(name)) {
      if (onColumnsChange) {
        onColumnsChange([...columns, name]);
      }
    }
  };

  const handleDeleteColumn = (colToDelete) => {
    if (window.confirm(`Delete column "${colToDelete}"?`)) {
      if (onColumnsChange) {
        onColumnsChange(columns.filter(c => c !== colToDelete));
      }
    }
  };

  // If column management is allowed, we assume the table is in an "editing structure" mode
  // The user asked for "options to add and delete rows and columns"
  const showColumnActions = editable || allowColumnManagement;

  return (
    <Box sx={{ width: "100%" }}>
      {showColumnActions && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddRow}
          >
            Add Row
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteSelected}
            disabled={selected.length === 0}
          >
            Delete Selected
          </Button>

          <Box sx={{ flex: 1 }} />

          <Button
            variant="outlined"
            size="small"
            startIcon={<ViewWeekIcon />}
            onClick={handleAddColumn}
          >
            Add Column
          </Button>
        </Stack>
      )}

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          maxHeight: height,
          boxShadow: 'none',
          borderColor: '#e2e8f0',
          '& .MuiTableCell-head': {
            bgcolor: '#f8f9fa',
            fontWeight: 700
          }
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {editable && (
                <TableCell padding="checkbox" sx={{ width: 48 }}>
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < rows.length}
                    checked={rows.length > 0 && selected.length === rows.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col}
                  sx={{
                    minWidth: 150,
                    color: '#1e293b',
                    position: 'relative'
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    {col}
                    {showColumnActions && columns.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteColumn(col)}
                        sx={{ ml: 1, opacity: 0.6, ':hover': { opacity: 1, color: 'error.main' } }}
                      >
                        <CloseIcon fontSize="small" sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => {
              const isSelected = selected.indexOf(rowIndex) !== -1;
              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={-1}
                  key={rowIndex}
                  selected={isSelected}
                  sx={{ '&.Mui-selected': { bgcolor: '#f0f9ff' } }}
                >
                  {editable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowIndex)}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={`${rowIndex}-${col}`} sx={{ p: 1 }}>
                      {editable ? (
                        <TextField
                          fullWidth
                          size="small"
                          variant="outlined"
                          value={row[col] || ""}
                          onChange={(e) => handleCellChange(rowIndex, col, e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: '0.875rem',
                              bgcolor: 'white',
                              '& fieldset': { borderColor: 'transparent' },
                              '&:hover fieldset': { borderColor: '#cbd5e1' },
                              '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                            }
                          }}
                        />
                      ) : (
                        <Typography variant="body2">{row[col]}</Typography>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + (editable ? 1 : 0)} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No data available. Add a row to start.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
