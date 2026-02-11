
import React, { useState, useMemo } from "react";
import {
  MdDelete,
  MdOutlineRestore,
  MdSearch,
  MdTaskAlt,
  MdEventNote,
  MdBrush,
  MdLoop,
  MdGridView,
  MdViewList,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdFilterList,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { useGetTrashItemsQuery } from "../redux/slices/api/trashApiSlice";
import {
  useRestoreTaskMutation,
  useDeleteTaskMutation,
} from "../redux/slices/api/taskApiSlice";
import {
  useRestoreNoteMutation,
  usePermanentlyDeleteNoteMutation,
} from "../redux/slices/api/noteApiSlice";
import {
  useRestoreHabitMutation,
  usePermanentlyDeleteHabitMutation,
} from "../redux/slices/api/habitApiSlice";
import {
  restoreCanvas,
  permanentDeleteCanvas,
} from "../services/canvasService";
import { toast } from "sonner";
import clsx from "clsx";
import Loading from "../components/shared/feedback/Loader";
import Button from "../components/shared/buttons/Button";
import ConfirmationDialog from "../components/shared/dialog/Dialogs";

const Trash = () => {
  const { user } = useSelector((state) => state.auth);
  // Robust workspace selection: current workspace or first available
  const currentWorkspace = user?.workspaces?.[0];

  const {
    data,
    isLoading,
    refetch,
  } = useGetTrashItemsQuery(
    { workspaceId: currentWorkspace?._id },
    {
      skip: !currentWorkspace?._id,
      refetchOnMountOrArgChange: true,
    }
  );

  const trashItems = data?.data || [];
  const trashCount = data?.count || 0;

  const [restoreTask] = useRestoreTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [restoreNote] = useRestoreNoteMutation();
  const [deleteNote] = usePermanentlyDeleteNoteMutation();
  const [restoreHabit] = useRestoreHabitMutation();
  const [deleteHabit] = usePermanentlyDeleteHabitMutation();

  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    type: "", // 'restore' | 'delete' | 'restoreSelected' | 'deleteSelected'
    msg: "",
    itemId: null,
    itemType: null,
  });

  // Filter items based on tab and search
  const filteredItems = useMemo(() => {
    return trashItems.filter((item) => {
      const matchesTab = activeTab === "all" || item.type === activeTab;
      const matchesSearch =
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [trashItems, activeTab, searchQuery]);

  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item._id));
    }
  };

  const executeRestore = async (id, type) => {
    try {
      if (type === "task") {
        await restoreTask({
          taskId: id,
          workspaceId: currentWorkspace?._id,
        }).unwrap();
      } else if (type === "note") {
        await restoreNote(id).unwrap();
      } else if (type === "habit") {
        await restoreHabit(id).unwrap();
      } else if (type === "canvas") {
        await restoreCanvas(id);
        refetch(); // Manually refetch for canvas
      }
      return true;
    } catch (error) {
      console.error(`Failed to restore ${type}:`, error);
      return false;
    }
  };

  const executeDelete = async (id, type) => {
    try {
      if (type === "task") {
        await deleteTask({
          taskId: id,
          workspaceId: currentWorkspace?._id,
        }).unwrap();
      } else if (type === "note") {
        await deleteNote(id).unwrap();
      } else if (type === "habit") {
        await deleteHabit(id).unwrap();
      } else if (type === "canvas") {
        await permanentDeleteCanvas(id);
        refetch();
      }
      return true;
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      return false;
    }
  };

  const confirmAction = async () => {
    const { type, itemId, itemType } = dialogConfig;

    if (type === "restore") {
      const success = await executeRestore(itemId, itemType);
      if (success) {
        toast.success("Item restored successfully");
        setSelectedItems((prev) => prev.filter((i) => i !== itemId));
      } else {
        toast.error("Failed to restore item");
      }
    } else if (type === "delete") {
      const success = await executeDelete(itemId, itemType);
      if (success) {
        toast.success("Item permanently deleted");
        setSelectedItems((prev) => prev.filter((i) => i !== itemId));
      } else {
        toast.error("Failed to delete item");
      }
    } else if (type === "restoreSelected") {
      let successCount = 0;
      for (const id of selectedItems) {
        const item = trashItems.find((i) => i._id === id);
        if (item) {
          const success = await executeRestore(id, item.type);
          if (success) successCount++;
        }
      }
      toast.success(`Restored ${successCount} items`);
      setSelectedItems([]);
    } else if (type === "deleteSelected") {
      let successCount = 0;
      for (const id of selectedItems) {
        const item = trashItems.find((i) => i._id === id);
        if (item) {
          const success = await executeDelete(id, item.type);
          if (success) successCount++;
        }
      }
      toast.success(`Deleted ${successCount} items`);
      setSelectedItems([]);
    }

    setOpenDialog(false);
  };

  const openConfirmation = (actionType, id = null, itemType = null) => {
    let msg = "";
    if (actionType === "restore") msg = "Are you sure you want to restore this item?";
    else if (actionType === "delete") msg = "Are you sure you want to permanently delete this item? This action cannot be undone.";
    else if (actionType === "restoreSelected") msg = `Are you sure you want to restore ${selectedItems.length} selected items?`;
    else if (actionType === "deleteSelected") msg = `Are you sure you want to permanently delete ${selectedItems.length} selected items? This action cannot be undone.`;

    setDialogConfig({
      type: actionType,
      msg,
      itemId: id,
      itemType: itemType
    });
    setOpenDialog(true);
  };

  const getIcon = (type) => {
    switch (type) {
      case "task":
        return <MdTaskAlt className="text-blue-500" size={20} />;
      case "note":
        return <MdEventNote className="text-yellow-500" size={20} />;
      case "canvas":
        return <MdBrush className="text-purple-500" size={20} />;
      case "habit":
        return <MdLoop className="text-green-500" size={20} />;
      default:
        return <MdDelete className="text-gray-400" size={20} />;
    }
  };

  const getTypeLabel = (type) => {
    if (!type) return "Unknown";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#0F1117] overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <MdDelete className="text-red-500" /> Bin ({trashCount})
          </h1>
          <div className="flex items-center gap-2">
            {selectedItems.length > 0 && (
              <>
                <Button
                  label={`Restore (${selectedItems.length})`}
                  icon={<MdOutlineRestore />}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => openConfirmation("restoreSelected")}
                />
                <Button
                  label={`Delete (${selectedItems.length})`}
                  icon={<MdDelete />}
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => openConfirmation("deleteSelected")}
                />
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Tabs */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto max-w-full">
            {["all", "task", "note", "canvas", "habit"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all capitalize whitespace-nowrap",
                  activeTab === tab
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                )}
              >
                {tab === "all" ? "All Items" : tab + "s"}
              </button>
            ))}
          </div>

          {/* Search and View Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search trash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={clsx("p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200", viewMode === 'list' ? "bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400" : "")}
              >
                <MdViewList size={20} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={clsx("p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200", viewMode === 'grid' ? "bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400" : "")}
              >
                <MdGridView size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-[#0F1117]">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MdDelete className="text-6xl mb-4 opacity-20" />
            <p className="text-lg">Trash is empty</p>
            {activeTab !== 'all' && <p className="text-sm">No items found in {activeTab}</p>}
          </div>
        ) : (
          <div className={clsx(
            "gap-4",
            viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col"
          )}>
            {/* Header Row for List View */}
            {viewMode === 'list' && (
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 items-center">
                <div className="col-span-1 flex items-center justify-center">
                  <button onClick={handleSelectAll} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    {selectedItems.length === filteredItems.length && filteredItems.length > 0 ? (
                      <MdCheckBox size={20} className="text-blue-600" />
                    ) : (
                      <MdCheckBoxOutlineBlank size={20} />
                    )}
                  </button>
                </div>
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Deleted At</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
            )}

            {filteredItems.map((item) => (
              <div
                key={item._id}
                className={clsx(
                  "group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all",
                  viewMode === 'list' ? "grid grid-cols-12 gap-4 items-center p-4" : "p-4 flex flex-col gap-3 h-full relative"
                )}
              >
                {/* Checkbox (List: Col 1, Grid: Absolute Top Left) */}
                <div className={clsx(viewMode === 'list' ? "col-span-1 flex justify-center" : "absolute top-4 left-4 z-10")}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSelectItem(item._id); }}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {selectedItems.includes(item._id) ? (
                      <MdCheckBox size={20} className="text-blue-600" />
                    ) : (
                      <MdCheckBoxOutlineBlank size={20} />
                    )}
                  </button>
                </div>

                {/* Main Content */}
                <div className={clsx(viewMode === 'list' ? "col-span-5" : "pt-8")}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1 truncate" title={item.title}>
                        {item.title || "Untitled"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 truncate" title={item.description}>
                        {item.description || "No description"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Type & Date (List View) */}
                {viewMode === 'list' && (
                  <>
                    <div className="col-span-2">
                      <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300")}>
                        {getTypeLabel(item.type)}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.trashedAt).toLocaleDateString()}
                    </div>
                  </>
                )}

                {/* Grid View Footer */}
                {viewMode === 'grid' && (
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md self-start">{getTypeLabel(item.type)}</span>
                      <span className="text-xs opacity-70">{new Date(item.trashedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => openConfirmation("restore", item._id, item.type)}
                        className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 hover:text-blue-500 transition"
                        title="Restore"
                      >
                        <MdOutlineRestore size={18} />
                      </button>
                      <button
                        onClick={() => openConfirmation("delete", item._id, item.type)}
                        className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 hover:text-red-500 transition"
                        title="Delete Permanently"
                      >
                        <MdDelete size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions (List View) */}
                {viewMode === 'list' && (
                  <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openConfirmation("restore", item._id, item.type)}
                      className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition"
                      title="Restore"
                    >
                      <MdOutlineRestore size={20} />
                    </button>
                    <button
                      onClick={() => openConfirmation("delete", item._id, item.type)}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition"
                      title="Delete Permanently"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={openDialog}
        setOpen={setOpenDialog}
        title={dialogConfig.type.includes("restore") ? "Restore Items" : "Delete Items Forever"}
        message={dialogConfig.msg}
        confirmLabel={dialogConfig.type.includes("restore") ? "Restore" : "Delete Forever"}
        confirmColor={dialogConfig.type.includes("restore") ? "blue" : "red"}
        onClick={confirmAction}
      />
    </div>
  );
};

export default Trash;
