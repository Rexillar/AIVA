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

import React, { useEffect } from "react";
import { useGetDashboardStatsQuery } from "../../redux/slices/api/taskApiSlice";
import { useWorkspace } from "../workspace/provider/WorkspaceProvider";
import { Chart } from "./charts/Chart";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Loading } from "../shared/feedback/Loading";
import { useGetDashboardDataQuery } from "../../redux/slices/api/workspaceApiSlice";

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

const Dashboard = () => {
  const { currentWorkspace } = useWorkspace();

  const {
    data: stats,
    isLoading,
    error,
    refetch: refetchStats,
  } = useGetDashboardStatsQuery(currentWorkspace?._id, {
    skip: !currentWorkspace?._id,
    refetchOnMountOrArgChange: true,
  });

  const { data: dashboardData } = useGetDashboardDataQuery();

  useEffect(() => {
    if (currentWorkspace?._id) {
      //('Fetching dashboard stats for workspace:', currentWorkspace._id);
      refetchStats();
    }
  }, [currentWorkspace?._id, refetchStats]);

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
          Please select a workspace to view the dashboard.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading dashboard: {error.message || "Something went wrong"}
        <button
          onClick={() => {
            refetchStats();
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const chartData = [
    { name: "Todo", value: stats?.data?.todo || 0 },
    { name: "In Progress", value: stats?.data?.in_progress || 0 },
    { name: "Review", value: stats?.data?.review || 0 },
    { name: "Completed", value: stats?.data?.completed || 0 },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {currentWorkspace.name} Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={stats?.data?.total || 0}
          icon={FaTasks}
          color="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Completed Tasks"
          value={stats?.data?.completed || 0}
          icon={FaCheckCircle}
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          title="In Progress"
          value={stats?.data?.in_progress || 0}
          icon={FaClock}
          color="text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          title="Overdue Tasks"
          value={stats?.data?.overdue || 0}
          icon={FaExclamationTriangle}
          color="text-red-600 dark:text-red-400"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Task Distribution
        </h2>
        {chartData.length > 0 ? (
          <div className="h-80">
            <Chart
              data={chartData}
              keys={["value"]}
              indexBy="name"
              colors={["#3B82F6", "#10B981", "#F59E0B", "#EF4444"]}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No tasks available in this workspace
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        {stats?.recentActivity?.length > 0 ? (
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No recent activity in this workspace
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Dashboard Data
        </h2>
        {dashboardData &&
          dashboardData.map((item) => <div key={item.id}>{item.name}</div>)}
      </div>
    </div>
  );
};

export default Dashboard;
