/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  A I   V I R T U A L   A S S I S T A N T  ──◈──

   ◉  Deterministic Execution System
   ◉  Rule-Bound • State-Aware • Non-Emotive

   ⟁  SYSTEM LAYER : FRONTEND CORE
   ⟁  DOMAIN       : UI COMPONENTS

   ⟁  PURPOSE      : Display and manage task information

   ⟁  WHY          : User-friendly task interaction

   ⟁  WHAT         : Task display components and interaction handlers

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/components.md

   ⟁  USAGE RULES  : Follow design system • Handle props • Manage state

        "Tasks displayed. Interactions handled. User experience enhanced."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  Paper,
  Chip,
  Stack,
  InputAdornment,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Flag as FlagIcon,
  Category as CategoryIcon,
  AccessTime as TimeIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Clear as ClearIcon,
  Assignment,
} from "@mui/icons-material";
import SubtaskCard from "./SubtaskCard";
import { useUpdateTaskSubtasksMutation } from "../redux/slices/api/taskApiSlice";

const SubtaskList = ({ task, workspaceId, currentUser }) => {
  const theme = useTheme();
  const [updateTaskSubtasks] = useUpdateTaskSubtasksMutation();
  const [newSubtaskDialog, setNewSubtaskDialog] = useState(false);
  const [sortBy, setSortBy] = useState("dueDate");
  const [filterBy, setFilterBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // Validate workspaceId
  const isValidObjectId = (id) => id && /^[0-9a-fA-F]{24}$/.test(id);
  const isValidWorkspaceId = isValidObjectId(workspaceId);

  const [newSubtask, setNewSubtask] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "other",
    estimatedDuration: 30,
    dueDate: "",
    assignedTo: currentUser._id,
  });

  const handleAddSubtask = async () => {
    if (!newSubtask.title || !newSubtask.dueDate) {
      setError("Title and due date are required");
      return;
    }

    if (!isValidWorkspaceId) {
      setError("Invalid workspace ID");
      return;
    }

    try {
      const updatedSubtasks = [
        ...task.subtasks,
        {
          ...newSubtask,
          status: "not_started",
          progress: 0,
          completed: false,
          createdBy: currentUser._id,
          createdAt: new Date().toISOString(),
        },
      ];

      await updateTaskSubtasks({
        taskId: task._id,
        workspaceId: workspaceId.toString(),
        subtasks: updatedSubtasks,
      }).unwrap();

      setNewSubtaskDialog(false);
      setNewSubtask({
        title: "",
        description: "",
        priority: "medium",
        category: "other",
        estimatedDuration: 30,
        dueDate: "",
        assignedTo: currentUser._id,
      });
      setError("");
    } catch (err) {
      setError(err.message || "Failed to add subtask");
    }
  };

  const handleStatusChange = async (subtaskId, newStatus) => {
    if (!isValidWorkspaceId) {
      setError("Invalid workspace ID");
      return;
    }

    try {
      const updatedSubtasks = task.subtasks.map((subtask) => {
        if (subtask._id === subtaskId) {
          return {
            ...subtask,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return subtask;
      });

      await updateTaskSubtasks({
        taskId: task._id,
        workspaceId: workspaceId.toString(),
        subtasks: updatedSubtasks,
      }).unwrap();
    } catch (err) {
      setError(err.message || "Failed to update subtask status");
    }
  };

  const handleProgressUpdate = async (subtaskId, newProgress) => {
    if (!isValidWorkspaceId) {
      setError("Invalid workspace ID");
      return;
    }

    try {
      const updatedSubtasks = task.subtasks.map((subtask) => {
        if (subtask._id === subtaskId) {
          return {
            ...subtask,
            progress: newProgress,
            updatedAt: new Date().toISOString(),
          };
        }
        return subtask;
      });

      await updateTaskSubtasks({
        taskId: task._id,
        workspaceId: workspaceId.toString(),
        subtasks: updatedSubtasks,
      }).unwrap();
    } catch (err) {
      setError(err.message || "Failed to update progress");
    }
  };

  const handleAddNote = async (subtaskId, noteContent) => {
    if (!isValidWorkspaceId) {
      setError("Invalid workspace ID");
      return;
    }

    try {
      const updatedSubtasks = task.subtasks.map((subtask) => {
        if (subtask._id === subtaskId) {
          return {
            ...subtask,
            notes: [
              ...(subtask.notes || []),
              {
                content: noteContent,
                createdBy: currentUser._id,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }
        return subtask;
      });

      await updateTaskSubtasks({
        taskId: task._id,
        workspaceId: workspaceId.toString(),
        subtasks: updatedSubtasks,
      }).unwrap();
    } catch (err) {
      setError(err.message || "Failed to add note");
    }
  };

  const handleAddReminder = async (subtaskId, reminderData) => {
    if (!isValidWorkspaceId) {
      setError("Invalid workspace ID");
      return;
    }

    try {
      const updatedSubtasks = task.subtasks.map((subtask) => {
        if (subtask._id === subtaskId) {
          return {
            ...subtask,
            reminders: [
              ...(subtask.reminders || []),
              {
                time: reminderData.time,
                message: reminderData.message,
                sent: false,
              },
            ],
          };
        }
        return subtask;
      });

      await updateTaskSubtasks({
        taskId: task._id,
        workspaceId: workspaceId.toString(),
        subtasks: updatedSubtasks,
      }).unwrap();
    } catch (err) {
      setError(err.message || "Failed to add reminder");
    }
  };

  const sortSubtasks = (subtasks) => {
    return [...subtasks].sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate) - new Date(b.dueDate);
        case "priority": {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case "progress":
          return b.progress - a.progress;
        default:
          return 0;
      }
    });
  };

  const filterSubtasks = (subtasks) => {
    if (!subtasks) return [];

    let filtered = subtasks;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (subtask) =>
          subtask.title.toLowerCase().includes(searchLower) ||
          subtask.description?.toLowerCase().includes(searchLower),
      );
    }

    // Apply status/category filter
    if (filterBy !== "all") {
      filtered = filtered.filter((subtask) => {
        switch (filterBy) {
          case "active":
            return subtask.status === "in_progress";
          case "completed":
            return subtask.status === "completed";
          case "overdue":
            return (
              new Date(subtask.dueDate) < new Date() &&
              subtask.status !== "completed"
            );
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const filteredAndSortedSubtasks = filterSubtasks(
    sortSubtasks(task.subtasks || []),
  );

  return (
    <Box>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: theme.palette.background.default,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Subtasks{" "}
            {filteredAndSortedSubtasks.length > 0 &&
              `(${filteredAndSortedSubtasks.length})`}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewSubtaskDialog(true)}
            sx={{
              backgroundColor: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Add Subtask
          </Button>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search subtasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Sort */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
              startAdornment={<SortIcon fontSize="small" sx={{ mr: 1 }} />}
            >
              <MenuItem value="dueDate">Due Date</MenuItem>
              <MenuItem value="priority">Priority</MenuItem>
              <MenuItem value="progress">Progress</MenuItem>
            </Select>
          </FormControl>

          {/* Filter */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              label="Filter"
              startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1 }} />}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
          variant="outlined"
        >
          {error}
        </Alert>
      )}

      {/* Subtasks Grid */}
      <Grid container spacing={2}>
        {filteredAndSortedSubtasks.length > 0 ? (
          filteredAndSortedSubtasks.map((subtask) => (
            <Grid item xs={12} key={subtask._id}>
              <SubtaskCard
                subtask={subtask}
                onStatusChange={handleStatusChange}
                onProgressUpdate={handleProgressUpdate}
                onAddNote={handleAddNote}
                onAddReminder={handleAddReminder}
                currentUser={currentUser}
              />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                backgroundColor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography color="text.secondary">
                {task.subtasks?.length > 0
                  ? "No subtasks match your filters"
                  : 'No subtasks yet. Click "Add Subtask" to create one.'}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* New Subtask Dialog */}
      <Dialog
        open={newSubtaskDialog}
        onClose={() => setNewSubtaskDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: "100%",
            maxWidth: 600,
          },
        }}
      >
        <DialogTitle>Create New Subtask</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                required
                value={newSubtask.title}
                onChange={(e) =>
                  setNewSubtask({ ...newSubtask, title: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Assignment fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={newSubtask.description}
                onChange={(e) =>
                  setNewSubtask({ ...newSubtask, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newSubtask.priority}
                  label="Priority"
                  onChange={(e) =>
                    setNewSubtask({ ...newSubtask, priority: e.target.value })
                  }
                  startAdornment={<FlagIcon fontSize="small" sx={{ mr: 1 }} />}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newSubtask.category}
                  label="Category"
                  onChange={(e) =>
                    setNewSubtask({ ...newSubtask, category: e.target.value })
                  }
                  startAdornment={
                    <CategoryIcon fontSize="small" sx={{ mr: 1 }} />
                  }
                >
                  <MenuItem value="research">Research</MenuItem>
                  <MenuItem value="writing">Writing</MenuItem>
                  <MenuItem value="coding">Coding</MenuItem>
                  <MenuItem value="reading">Reading</MenuItem>
                  <MenuItem value="review">Review</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Estimated Duration (minutes)"
                type="number"
                fullWidth
                value={newSubtask.estimatedDuration}
                onChange={(e) =>
                  setNewSubtask({
                    ...newSubtask,
                    estimatedDuration: parseInt(e.target.value),
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TimeIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Due Date"
                type="datetime-local"
                fullWidth
                required
                value={newSubtask.dueDate}
                onChange={(e) =>
                  setNewSubtask({ ...newSubtask, dueDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setNewSubtaskDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAddSubtask}
            variant="contained"
            disabled={!newSubtask.title || !newSubtask.dueDate}
          >
            Create Subtask
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubtaskList;
