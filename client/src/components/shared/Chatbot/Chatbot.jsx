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

import React, { useState } from "react";
import {
  useCreateHabitMutation,
  useUpdateHabitMutation,
} from "../../../redux/slices/api/habitApiSlice";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [createHabit] = useCreateHabitMutation();
  const [updateHabit] = useUpdateHabitMutation();

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    // Here you would add the logic to determine the action from the user input
    const action = parseUserInput(input); // This function needs to be implemented

    if (action) {
      try {
        if (action.method === "POST" && action.url === "/api/habits") {
          if (!action.data.workspace) {
            setMessages((prev) => [
              ...prev,
              {
                text: 'Please specify which workspace to use for this habit (e.g., "in my private workspace").',
                sender: "bot",
              },
            ]);
            return;
          }
          await createHabit(action.data).unwrap();
          setMessages((prev) => [
            ...prev,
            { text: "Habit created successfully!", sender: "bot" },
          ]);
        } else if (
          action.method === "PATCH" &&
          action.url === "/api/habits/:id"
        ) {
          if (!action.data.workspace) {
            setMessages((prev) => [
              ...prev,
              {
                text: "Please specify which workspace to use for this habit update.",
                sender: "bot",
              },
            ]);
            return;
          }
          await updateHabit({ id: action.id, ...action.data }).unwrap();
          setMessages((prev) => [
            ...prev,
            { text: "Habit updated successfully!", sender: "bot" },
          ]);
        } else {
          // Handle other actions here if needed, or remove if not applicable
          setMessages((prev) => [
            ...prev,
            { text: "Action not supported yet.", sender: "bot" },
          ]);
        }
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { text: `Error: ${error.message || "Action failed"}`, sender: "bot" },
        ]);
      }
    } else {
      setMessages((prev) => [
        ...prev,
        {
          text: "I didn't understand that. Can you please rephrase?",
          sender: "bot",
        },
      ]);
    }
    setInput("");
  };

  const parseUserInput = (input) => {
    const lowerInput = input.toLowerCase();

    // Check for simple habit creation like "exercise daily"
    const simpleCreateMatch = input.match(
      /^(.+?)\s+(daily|weekly|twice a day|every other day)$/i,
    );
    if (simpleCreateMatch) {
      const title = simpleCreateMatch[1].trim();
      const freq = simpleCreateMatch[2].toLowerCase();
      let frequency = freq;
      if (freq === "twice a day" || freq === "every other day")
        frequency = "custom";

      return {
        method: "POST",
        url: "/api/habits",
        data: {
          title,
          frequency,
          category: "other", // default
          workspace: "default-workspace-id", // Replace with actual logic to get current workspace ID
          visibility: "private",
        },
      };
    }

    // Check for habit creation
    if (lowerInput.includes("add") && lowerInput.includes("habit")) {
      const titleMatch = input.match(/add a habit to (.+?)(?:\s|$)/i);
      const frequencyMatch = input.match(
        /(daily|weekly|twice a day|every other day)/i,
      );

      if (titleMatch) {
        const title = titleMatch[1].trim();
        let frequency = "daily"; // default
        if (frequencyMatch) {
          const freq = frequencyMatch[1].toLowerCase();
          if (freq === "twice a day" || freq === "every other day")
            frequency = "custom";
          else frequency = freq;
        }

        return {
          method: "POST",
          url: "/api/habits",
          data: {
            title,
            frequency,
            category: "other", // default
            workspace: "default-workspace-id", // Replace with actual logic to get current workspace ID
            visibility: "private",
          },
        };
      }
    }

    // Check for habit update
    if (lowerInput.includes("update") && lowerInput.includes("habit")) {
      const titleMatch = input.match(/update (.+?) to (.+?)(?:\s|$)/i);
      const frequencyMatch = input.match(/(daily|weekly|twice a day)/i);

      if (titleMatch) {
        const newDetail = titleMatch[2].trim();

        // Assume updating frequency or title; find habit by title (simplified)
        return {
          method: "PATCH",
          url: "/api/habits/:id",
          id: "habit-id-by-title", // Replace with logic to find habit ID by title
          data: {
            title: newDetail.includes("to")
              ? newDetail.split(" to ")[1]
              : newDetail,
            frequency: frequencyMatch
              ? frequencyMatch[1].toLowerCase()
              : undefined,
            workspace: "default-workspace-id", // Replace with actual workspace ID
          },
        };
      }
    }

    return null; // No action recognized
  };

  return (
    <div className="chatbot">
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
