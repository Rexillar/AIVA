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

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaPaperPlane, FaUserCircle } from "react-icons/fa";
import { useGetTaskCommentsQuery, useAddTaskCommentMutation } from "../../redux/slices/api/taskApiSlice";
import { toast } from "sonner";

const TaskChat = ({ taskId }) => {
  const { user } = useSelector((state) => state.auth);
  const [comment, setComment] = useState("");
  const [addComment, { isLoading }] = useAddTaskCommentMutation();

  const {
    data: comments = [],
    isLoading: commentsLoading,
    refetch: refetchComments
  } = useGetTaskCommentsQuery(taskId, {
    skip: !taskId,
    refetchOnMountOrArgChange: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await addComment({
        taskId,
        comment: comment.trim(),
      }).unwrap();

      setComment("");
      refetchComments();
      toast.success("Comment added successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add comment");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!taskId) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Select a task to view discussions
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {commentsLoading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex space-x-3">
              <div className="flex-shrink-0">
                {comment.author?.avatar ? (
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <FaUserCircle className="text-white w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {comment.author?.name || "Unknown User"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mt-1">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !comment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPaperPlane className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskChat;
