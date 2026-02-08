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

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/components.md

   ⟁  USAGE RULES  : Follow design system • Handle props • Manage state

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import React from "react";
import { SearchInput } from "../../shared/inputs/SearchInput";
import { Select } from "../../shared/inputs/Select";
import { Button } from "../../shared/buttons/Button";

const TaskListHeader = ({
  onSearch,
  onFilterChange,
  onSortChange,
  onAddTask,
  searchValue = "",
  currentFilter = "all",
  currentSort = "newest",
}) => {
  const filterOptions = [
    { value: "all", label: "All Tasks" },
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "review", label: "In Review" },
    { value: "completed", label: "Completed" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "priority", label: "Priority" },
    { value: "due_date", label: "Due Date" },
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex-1 min-w-0 max-w-md">
        <SearchInput
          placeholder="Search tasks..."
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="w-full sm:w-40">
          <Select
            options={filterOptions}
            value={currentFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            placeholder="Filter by status"
          />
        </div>

        <div className="w-full sm:w-40">
          <Select
            options={sortOptions}
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value)}
            placeholder="Sort by"
          />
        </div>

        <Button onClick={onAddTask} className="whitespace-nowrap">
          Add Task
        </Button>
      </div>
    </div>
  );
};

export default TaskListHeader;
