const MemberRole = ({ role }) => {
  const roleStyles = {
    owner: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    member: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };

  const memberRole = role || "member";

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleStyles[memberRole]}`}
    >
      {memberRole.charAt(0).toUpperCase() + memberRole.slice(1)}
    </span>
  );
};

export default MemberRole;