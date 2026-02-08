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
   ⟁  DOMAIN       : PAGE COMPONENTS

   ⟁  PURPOSE      : Implement complete page views and layouts

   ⟁  WHY          : Organized application navigation and structure

   ⟁  WHAT         : Full page React components with routing

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/pages.md

   ⟁  USAGE RULES  : Manage routing • Handle data • User experience

        "Pages rendered. Navigation smooth. User journey optimized."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { useSelector, useDispatch } from "react-redux";
import { useGetDashboardStatsQuery } from "../redux/slices/api/taskApiSlice";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import Loading from "../components/common/Loading";
import { setCurrentWorkspace } from "../redux/slices/workspaceSlice";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color.replace("text", "bg")}/10`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

const PrivateWorkspace = () => {
  const dispatch = useDispatch();
  const { privateWorkspace } = useSelector((state) => state.auth);
  const {
    data: stats,
    isLoading,
    error,
  } = useGetDashboardStatsQuery(privateWorkspace?._id, {
    skip: !privateWorkspace?._id,
  });

  if (!privateWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
          No workspace selected
        </p>
        <button
          onClick={() => dispatch(setCurrentWorkspace(privateWorkspace))}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Use Private Workspace
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Error loading workspace stats: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {privateWorkspace.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          icon={FaTasks}
          color="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Completed Tasks"
          value={stats?.completedTasks || 0}
          icon={FaCheckCircle}
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgressTasks || 0}
          icon={FaClock}
          color="text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          title="Overdue Tasks"
          value={stats?.overdueTasks || 0}
          icon={FaExclamationTriangle}
          color="text-red-600 dark:text-red-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Task Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(stats?.tasksByPriority || {}).map(
              ([priority, count]) => (
                <div
                  key={priority}
                  className="flex items-center justify-between"
                >
                  <span className="capitalize text-gray-600 dark:text-gray-300">
                    {priority}
                  </span>
                  <div className="flex items-center">
                    <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          priority === "high"
                            ? "bg-red-500"
                            : priority === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{
                          width: `${(count / (stats?.totalTasks || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="ml-4 text-sm text-gray-600 dark:text-gray-300">
                      {count}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {stats?.recentActivity?.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {activity.description}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.time}
                </span>
              </div>
            ))}
            {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateWorkspace;
