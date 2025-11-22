/*=================================================================
 * Project: AIVA-WEB
 * File: Button.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * Button component for displaying buttons.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import clsx from "clsx";
import React, { useState, useEffect } from "react";
import {
  MdDelete,
  MdRestore,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdSearch,
  MdFilterList,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
} from "react-icons/md";
import Title from "../components/shared/display/Title";
import Button from "../components/shared/buttons/Button";
import { PRIORITY_STYLES, TASK_TYPE } from "../utils/constants";
import ConfirmationDialog from "../components/shared/dialog/Dialogs";
import {
  useDeleteTaskMutation,
  useGetWorkspaceTasksQuery,
  useRestoreTaskMutation,
} from "../redux/slices/api/taskApiSlice";
import Loading from "../components/shared/feedback/Loader";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const Trash = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [msg, setMsg] = useState(null);
  const [type, setType] = useState("delete");
  const [selected, setSelected] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedItems, setSelectedItems] = useState(new Set());

  const { currentWorkspace } = useSelector((state) => state.workspace);

  const { data, isLoading, error } = useGetWorkspaceTasksQuery(
    {
      workspaceId: currentWorkspace?._id,
      filter: "trash",
      includeArchived: true,
      includeDeleted: true,
      status: "all",
    },
    {
      skip: !currentWorkspace?._id,
      refetchOnMountOrArgChange: true,
      pollingInterval: 30000,
    },
  );

  const [deleteTask] = useDeleteTaskMutation();
  const [restoreTask] = useRestoreTaskMutation();

  // Reset selected items when data changes
  useEffect(() => {
    setSelectedItems(new Set());
  }, [data]);

  // Filter and sort tasks
  const filteredTasks = React.useMemo(() => {
    if (!data?.tasks) return [];

    let tasks = data.tasks.filter(
      (task) => task.isArchived === true || task.isDeleted === true,
    );

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      tasks = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(term) ||
          task.description?.toLowerCase().includes(term) ||
          task.stage.toLowerCase().includes(term),
      );
    }

    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return sortOrder === "asc"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        case "stage":
          return sortOrder === "asc"
            ? a.stage.localeCompare(b.stage)
            : b.stage.localeCompare(a.stage);
        case "date":
        default:
          return sortOrder === "asc"
            ? new Date(a.updatedAt || a.date) - new Date(b.updatedAt || b.date)
            : new Date(b.updatedAt || b.date) - new Date(a.updatedAt || a.date);
      }
    });
  }, [data?.tasks, searchTerm, sortBy, sortOrder]);

  const handleSelectAll = () => {
    if (selectedItems.size === filteredTasks.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredTasks.map((task) => task._id)));
    }
  };

  const handleSelectItem = (taskId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkOperationClick = (operation) => {
    if (selectedItems.size === 0) {
      toast.error(`No items selected for ${operation}`);
      return;
    }

    // Set up dialog
    setType(operation === "restore" ? "restoreSelected" : "deleteSelected");
    setMsg(
      operation === "restore"
        ? `Do you want to restore ${selectedItems.size} selected ${
            selectedItems.size === 1 ? "task" : "tasks"
          }?`
        : `Do you want to permanently delete ${selectedItems.size} selected ${
            selectedItems.size === 1 ? "task" : "tasks"
          }?`,
    );
    setOpenDialog(true);
  };

  const executeBulkOperation = async (operation) => {
    const toastId = toast.loading(
      `${operation === "restore" ? "Restoring" : "Deleting"} selected items...`,
    );
    let successCount = 0;
    let failCount = 0;

    try {
      // Get the tasks that are actually in trash
      const tasksToOperate = filteredTasks.filter(
        (task) =>
          selectedItems.has(task._id) &&
          (task.isArchived === true || task.isDeleted === true),
      );

      for (const task of tasksToOperate) {
        try {
          if (operation === "restore") {
            const result = await restoreTask({
              taskId: task._id,
              workspaceId: currentWorkspace._id,
            }).unwrap();

            if (result.status) {
              successCount++;
            } else {
              //console.error(`Error restoring task: ${result.message}`);
              failCount++;
            }
          } else {
            await deleteTask({
              taskId: task._id,
              workspaceId: currentWorkspace._id,
            }).unwrap();
            successCount++;
          }
        } catch (error) {
          //console.error(`Error ${operation}ing task:`, error);
          failCount++;
        }
      }

      toast.dismiss(toastId);
      if (failCount > 0) {
        toast.error(
          `Failed to ${operation} ${failCount} items. ${successCount} were successful.`,
        );
      } else {
        toast.success(`Successfully ${operation}d ${successCount} items`);
      }

      setSelectedItems(new Set());
    } catch (error) {
      //console.error(`Bulk ${operation} error:`, error);
      toast.dismiss(toastId);
      toast.error(`Failed to ${operation} items`);
    }
  };

  const handleOperation = async () => {
    try {
      if (type.includes("delete")) {
        await deleteTask({
          taskId: selected,
          workspaceId: currentWorkspace._id,
        }).unwrap();
        toast.success("Task deleted permanently");
      } else {
        await restoreTask({
          taskId: selected,
          workspaceId: currentWorkspace._id,
        }).unwrap();
        toast.success("Task restored successfully");
      }
      setOpenDialog(false);
    } catch (err) {
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  useEffect(() => {
    if (!openDialog) {
      setSelected("");
      setMsg(null);
    }
  }, [openDialog]);

  const deleteClick = (taskId) => {
    setSelected(taskId);
    setType("delete");
    setMsg("Are you sure you want to permanently delete this task?");
    setOpenDialog(true);
  };

  const restoreClick = (taskId) => {
    setSelected(taskId);
    setType("restore");
    setMsg("Are you sure you want to restore this task?");
    setOpenDialog(true);
  };

  if (isLoading)
    return (
      <div className="py-10">
        <Loading />
      </div>
    );

  if (error) return <div>Error loading tasks. Please try again later.</div>;

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            No Workspace Selected
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Please select a workspace to view trash
          </p>
        </div>
      </div>
    );
  }

  const TableHeader = () => (
    <thead className="border-b border-gray-600/30">
      <tr className="text-left">
        <th className="py-3 px-4 text-gray-200 font-medium">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 hover:text-gray-100"
            title={
              selectedItems.size === filteredTasks.length
                ? "Deselect all"
                : "Select all"
            }
          >
            {selectedItems.size === filteredTasks.length ? (
              <MdCheckBox size={20} />
            ) : (
              <MdCheckBoxOutlineBlank size={20} />
            )}
          </button>
        </th>
        <th className="py-3 px-4 text-gray-200 font-medium">
          <button
            onClick={() => {
              if (sortBy === "title") {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              } else {
                setSortBy("title");
                setSortOrder("asc");
              }
            }}
            className="flex items-center gap-1 hover:text-gray-100"
          >
            Task Title
            {sortBy === "title" && (
              <MdKeyboardArrowDown
                className={clsx("transition-transform", {
                  "rotate-180": sortOrder === "asc",
                })}
              />
            )}
          </button>
        </th>
        <th className="py-3 px-4 text-gray-200 font-medium">
          <button
            onClick={() => {
              if (sortBy === "stage") {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              } else {
                setSortBy("stage");
                setSortOrder("asc");
              }
            }}
            className="flex items-center gap-1 hover:text-gray-100"
          >
            Stage
            {sortBy === "stage" && (
              <MdKeyboardArrowDown
                className={clsx("transition-transform", {
                  "rotate-180": sortOrder === "asc",
                })}
              />
            )}
          </button>
        </th>
        <th className="py-3 px-4 text-gray-200 font-medium">
          <button
            onClick={() => {
              if (sortBy === "date") {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              } else {
                setSortBy("date");
                setSortOrder("asc");
              }
            }}
            className="flex items-center gap-1 hover:text-gray-100"
          >
            Modified On
            {sortBy === "date" && (
              <MdKeyboardArrowDown
                className={clsx("transition-transform", {
                  "rotate-180": sortOrder === "asc",
                })}
              />
            )}
          </button>
        </th>
        <th className="py-3 px-4 text-gray-200 font-medium text-right">
          Actions
        </th>
      </tr>
    </thead>
  );

  const TableRow = ({ item }) => (
    <tr className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors">
      <td className="py-3 px-4">
        <button
          onClick={() => handleSelectItem(item._id)}
          className="flex items-center justify-center"
        >
          {selectedItems.has(item._id) ? (
            <MdCheckBox size={20} className="text-blue-500" />
          ) : (
            <MdCheckBoxOutlineBlank size={20} className="text-gray-400" />
          )}
        </button>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div
            className={clsx("w-3 h-3 rounded-full", TASK_TYPE[item.stage])}
          />
          <div>
            <p className="line-clamp-1 text-gray-200">{item?.title}</p>
            {item.description && (
              <p className="text-sm text-gray-400 line-clamp-1 mt-0.5">
                {item.description}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span
          className={clsx(
            "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
            {
              "bg-yellow-500/20 text-yellow-300": item.stage === "todo",
              "bg-blue-500/20 text-blue-300": item.stage === "in_progress",
              "bg-purple-500/20 text-purple-300": item.stage === "review",
              "bg-green-500/20 text-green-300": item.stage === "completed",
            },
          )}
        >
          {item?.stage?.replace("_", " ")}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-400">
        {new Date(item?.updatedAt || item?.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2 justify-end">
          <Button
            icon={<MdRestore size={18} />}
            variant="secondary"
            size="sm"
            className="!p-2 text-gray-400 hover:text-blue-400 bg-gray-800 hover:bg-gray-700 border-gray-700"
            onClick={() => restoreClick(item._id)}
            tooltip="Restore task"
          />
          <Button
            icon={<MdDelete size={18} />}
            variant="secondary"
            size="sm"
            className="!p-2 text-gray-400 hover:text-red-400 bg-gray-800 hover:bg-gray-700 border-gray-700"
            onClick={() => deleteClick(item._id)}
            tooltip="Delete permanently"
          />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="w-full h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Title title="Trash" className="text-gray-200 !text-2xl" />
          {filteredTasks?.length > 0 && (
            <span className="px-2 py-1 text-xs font-medium text-gray-400 bg-gray-800 rounded-full">
              {filteredTasks.length}{" "}
              {filteredTasks.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <MdSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>

          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2">
              <Button
                label="Restore Selected"
                icon={<MdRestore size={18} />}
                variant="secondary"
                size="sm"
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30"
                onClick={() => handleBulkOperationClick("restore")}
              />
              <Button
                label="Delete Selected"
                icon={<MdDelete size={18} />}
                variant="danger"
                size="sm"
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                onClick={() => handleBulkOperationClick("delete")}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-lg border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <TableHeader />
            <tbody>
              {filteredTasks?.length > 0 ? (
                filteredTasks.map((task) => (
                  <TableRow key={task._id} item={task} />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <MdDelete size={24} />
                      <p>No items in trash</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={openDialog}
        setOpen={setOpenDialog}
        title={type.includes("restore") ? "Restore Task" : "Delete Task"}
        message={msg}
        confirmLabel={type.includes("restore") ? "Restore" : "Delete"}
        confirmColor={type.includes("restore") ? "blue" : "red"}
        onClick={handleOperation}
      />
    </div>
  );
};

export default Trash;
