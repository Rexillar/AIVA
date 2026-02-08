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
import { format } from "date-fns";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  LinearProgress,
  Box,
  Chip,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Tooltip,
  Divider,
  Badge,
  Collapse,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Check,
  MoreVert,
  AccessTime,
  Event,
  Note,
  Alarm,
  Category,
  ExpandMore,
  ExpandLess,
  Timer,
  Assignment,
  Flag,
  NotificationsActive,
} from "@mui/icons-material";

const categoryColors = {
  research: { bg: "#FF6B6B20", text: "#FF6B6B", border: "#FF6B6B50" },
  writing: { bg: "#4ECDC420", text: "#4ECDC4", border: "#4ECDC450" },
  coding: { bg: "#45B7D120", text: "#45B7D1", border: "#45B7D150" },
  reading: { bg: "#96CEB420", text: "#96CEB4", border: "#96CEB450" },
  review: { bg: "#FFEEAD20", text: "#FFB347", border: "#FFEEAD50" },
  other: { bg: "#D4D4D420", text: "#808080", border: "#D4D4D450" },
};

const priorityColors = {
  low: { bg: "#96CEB420", text: "#96CEB4", border: "#96CEB450" },
  medium: { bg: "#FFEEAD20", text: "#FFB347", border: "#FFEEAD50" },
  high: { bg: "#FF6B6B20", text: "#FF6B6B", border: "#FF6B6B50" },
};

const statusColors = {
  not_started: { bg: "#E0E0E020", text: "#9E9E9E", border: "#E0E0E050" },
  in_progress: { bg: "#4CAF5020", text: "#4CAF50", border: "#4CAF5050" },
  paused: { bg: "#FFA72620", text: "#FFA726", border: "#FFA72650" },
  completed: { bg: "#2196F320", text: "#2196F3", border: "#2196F350" },
};

const SubtaskCard = ({
  subtask,
  onStatusChange,
  onProgressUpdate,
  onAddNote,
  onAddReminder,
  onUpdateDuration,
  currentUser,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [noteDialog, setNoteDialog] = useState(false);
  const [reminderDialog, setReminderDialog] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [reminderData, setReminderData] = useState({ time: "", message: "" });
  const [expanded, setExpanded] = useState(false);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleStartWork = () => {
    onStatusChange(subtask._id, "in_progress");
    handleMenuClose();
  };

  const handlePauseWork = () => {
    onStatusChange(subtask._id, "paused");
    handleMenuClose();
  };

  const handleCompleteWork = () => {
    onStatusChange(subtask._id, "completed");
    handleMenuClose();
  };

  const handleNoteSubmit = () => {
    if (noteContent.trim()) {
      onAddNote(subtask._id, noteContent);
      setNoteContent("");
      setNoteDialog(false);
    }
  };

  const handleReminderSubmit = () => {
    if (reminderData.time && reminderData.message) {
      onAddReminder(subtask._id, reminderData);
      setReminderData({ time: "", message: "" });
      setReminderDialog(false);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return "#4CAF50";
    if (progress >= 50) return "#2196F3";
    if (progress >= 25) return "#FFA726";
    return "#FF6B6B";
  };

  const isOverdue =
    subtask.dueDate &&
    new Date(subtask.dueDate) < new Date() &&
    subtask.status !== "completed";

  return (
    <Card
      sx={{
        mb: 2,
        position: "relative",
        border: "1px solid",
        borderColor: isOverdue ? "#FF6B6B50" : "transparent",
        boxShadow: isOverdue ? "0 0 10px rgba(255,107,107,0.1)" : undefined,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
      }}
    >
      <CardContent>
        {/* Header Section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Badge
              color={subtask.status === "completed" ? "success" : "default"}
              variant="dot"
              anchorOrigin={{ vertical: "top", horizontal: "left" }}
            >
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                {subtask.title}
              </Typography>
            </Badge>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {subtask.status === "in_progress" ? (
              <Tooltip title="Pause Work">
                <IconButton
                  onClick={handlePauseWork}
                  color="warning"
                  size="small"
                >
                  <Pause />
                </IconButton>
              </Tooltip>
            ) : subtask.status !== "completed" ? (
              <Tooltip title="Start Work">
                <IconButton
                  onClick={handleStartWork}
                  color="success"
                  size="small"
                >
                  <PlayArrow />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Completed">
                <IconButton color="primary" size="small" disabled>
                  <Check />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* Tags Section */}
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip
            size="small"
            icon={<Flag fontSize="small" />}
            label={subtask.priority}
            sx={{
              backgroundColor: priorityColors[subtask.priority].bg,
              color: priorityColors[subtask.priority].text,
              border: `1px solid ${priorityColors[subtask.priority].border}`,
              "& .MuiChip-icon": {
                color: priorityColors[subtask.priority].text,
              },
            }}
          />
          <Chip
            size="small"
            icon={<Category fontSize="small" />}
            label={subtask.category}
            sx={{
              backgroundColor: categoryColors[subtask.category].bg,
              color: categoryColors[subtask.category].text,
              border: `1px solid ${categoryColors[subtask.category].border}`,
              "& .MuiChip-icon": {
                color: categoryColors[subtask.category].text,
              },
            }}
          />
          <Chip
            size="small"
            icon={<Assignment fontSize="small" />}
            label={subtask.status.replace("_", " ")}
            sx={{
              backgroundColor: statusColors[subtask.status].bg,
              color: statusColors[subtask.status].text,
              border: `1px solid ${statusColors[subtask.status].border}`,
              "& .MuiChip-icon": {
                color: statusColors[subtask.status].text,
              },
            }}
          />
          {isOverdue && (
            <Chip
              size="small"
              icon={<NotificationsActive fontSize="small" />}
              label="Overdue"
              sx={{
                backgroundColor: "#FF6B6B20",
                color: "#FF6B6B",
                border: "1px solid #FF6B6B50",
                "& .MuiChip-icon": {
                  color: "#FF6B6B",
                },
              }}
            />
          )}
        </Box>

        {/* Progress Section */}
        <Box mb={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={0.5}
          >
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtask.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={subtask.progress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "#E0E0E020",
              "& .MuiLinearProgress-bar": {
                backgroundColor: getProgressColor(subtask.progress),
                borderRadius: 3,
              },
            }}
          />
        </Box>

        {/* Info Section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Box display="flex" gap={2} flexWrap="wrap">
            <Tooltip title="Time Spent / Estimated">
              <Box display="flex" alignItems="center" gap={0.5}>
                <Timer fontSize="small" sx={{ color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  {formatDuration(subtask.actualDuration)} /{" "}
                  {formatDuration(subtask.estimatedDuration)}
                </Typography>
              </Box>
            </Tooltip>

            {subtask.dueDate && (
              <Tooltip title="Due Date">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Event
                    fontSize="small"
                    sx={{ color: isOverdue ? "#FF6B6B" : "text.secondary" }}
                  />
                  <Typography
                    variant="caption"
                    color={isOverdue ? "#FF6B6B" : "text.secondary"}
                    fontWeight={isOverdue ? 600 : 400}
                  >
                    {format(new Date(subtask.dueDate), "MMM d, yyyy")}
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>

          {subtask.assignedTo && (
            <Tooltip title="Assigned To">
              <Avatar
                src={subtask.assignedTo.avatar}
                alt={subtask.assignedTo.name}
                sx={{
                  width: 24,
                  height: 24,
                  border: "2px solid",
                  borderColor: "background.paper",
                }}
              />
            </Tooltip>
          )}
        </Box>

        {/* Expandable Description */}
        {subtask.description && (
          <>
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              sx={{ mb: 1, color: "text.secondary" }}
            >
              {expanded ? "Show Less" : "Show More"}
            </Button>
            <Collapse in={expanded}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, mb: 2 }}
              >
                {subtask.description}
              </Typography>
              {subtask.notes?.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Notes
                  </Typography>
                  {subtask.notes.map((note, index) => (
                    <Box
                      key={index}
                      mb={1}
                      p={1}
                      bgcolor="background.default"
                      borderRadius={1}
                    >
                      <Typography variant="body2">{note.content}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(note.createdAt), "MMM d, yyyy HH:mm")}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Collapse>
          </>
        )}

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              minWidth: 200,
              mt: 1,
              "& .MuiMenuItem-root": {
                py: 1,
              },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setNoteDialog(true);
              handleMenuClose();
            }}
          >
            <Note fontSize="small" sx={{ mr: 1 }} /> Add Note
          </MenuItem>
          <MenuItem
            onClick={() => {
              setReminderDialog(true);
              handleMenuClose();
            }}
          >
            <Alarm fontSize="small" sx={{ mr: 1 }} /> Set Reminder
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleStartWork}
            disabled={subtask.status === "completed"}
          >
            <PlayArrow fontSize="small" sx={{ mr: 1 }} /> Start Work
          </MenuItem>
          <MenuItem
            onClick={handlePauseWork}
            disabled={subtask.status !== "in_progress"}
          >
            <Pause fontSize="small" sx={{ mr: 1 }} /> Pause Work
          </MenuItem>
          <MenuItem
            onClick={handleCompleteWork}
            disabled={subtask.status === "completed"}
          >
            <Check fontSize="small" sx={{ mr: 1 }} /> Complete
          </MenuItem>
        </Menu>

        {/* Note Dialog */}
        <Dialog
          open={noteDialog}
          onClose={() => setNoteDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              width: "100%",
              maxWidth: 500,
            },
          }}
        >
          <DialogTitle>Add Note</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Note"
              fullWidth
              multiline
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setNoteDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleNoteSubmit}
              variant="contained"
              disabled={!noteContent.trim()}
            >
              Add Note
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reminder Dialog */}
        <Dialog
          open={reminderDialog}
          onClose={() => setReminderDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              width: "100%",
              maxWidth: 500,
            },
          }}
        >
          <DialogTitle>Set Reminder</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Date & Time"
              type="datetime-local"
              fullWidth
              value={reminderData.time}
              onChange={(e) =>
                setReminderData({ ...reminderData, time: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 1 }}
            />
            <TextField
              margin="dense"
              label="Reminder Message"
              fullWidth
              value={reminderData.message}
              onChange={(e) =>
                setReminderData({ ...reminderData, message: e.target.value })
              }
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setReminderDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleReminderSubmit}
              variant="contained"
              disabled={!reminderData.time || !reminderData.message}
            >
              Set Reminder
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SubtaskCard;
