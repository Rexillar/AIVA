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

const TeamStats = ({ members }) => {
  if (!members) return null;

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.isActive).length;
  const admins = members.filter((m) => m.role === "admin").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Total Members
        </h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
          {totalMembers}
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Active Members
        </h3>
        <p className="mt-2 text-3xl font-semibold text-green-600 dark:text-green-400">
          {activeMembers}
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Admins
        </h3>
        <p className="mt-2 text-3xl font-semibold text-blue-600 dark:text-blue-400">
          {admins}
        </p>
      </div>
    </div>
  );
};

export default TeamStats;