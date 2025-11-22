const MemberStatus = ({ member, workspaceOwner }) => {
  const getMemberStatus = (member) => {
    if (!member) return "inactive";
    if (member.status === "archived") return "archived";
    return member.isActive ? "active" : "inactive";
  };

  const status = getMemberStatus(member);
  const isOwner = member?.user?._id === workspaceOwner;

  const statusConfig = {
    active: {
      color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      label: "Active",
    },
    inactive: {
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      label: "Inactive",
    },
    archived: {
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
      label: "Archived",
    },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}
    >
      {isOwner ? "Owner" : config.label}
    </span>
  );
};

export default MemberStatus;