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

   ⟁  PURPOSE      : TIME-ENFORCEMENT SYSTEM

   ⟁  WHY          : Enforce accountability through strict time management

   ⟁  WHAT         : Calendar as control surface, not date viewer

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MAXIMUM
   ⟁  DOCS : /docs/frontend/components.md

   ⟁  USAGE RULES  : No floating tasks • Show conflicts • Enforce identity

        "Time is scarce. Accountability is mandatory. Failures scar the system."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import React, { useState, useEffect, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  parseISO,
  isSameDay,
  addHours,
  startOfDay,
  endOfDay,
  differenceInMinutes,
  addMinutes,
} from "date-fns";
import {
  FaExclamationTriangle,
  FaUser,
  FaClock,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaTimes,
  FaCog,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useWorkspace } from "../workspace/provider/WorkspaceProvider";
import {
  useGetTasksQuery,
  useUpdateTaskMutation,
} from "../../redux/slices/api/taskApiSlice";

// TIME-ENFORCEMENT CONSTANTS
const TIME_BLOCK_HEIGHT = 60; // pixels per hour
const MIN_TIME_BLOCK = 15; // minimum 15 minutes
const MAX_OVERLAP_WARNING = 3; // show warning after 3 overlaps

// STATE DEFINITIONS
const ITEM_TYPES = {
  TASK: 'task',
  EVENT: 'event',
  HABIT: 'habit',
  DEADLINE: 'deadline'
};

const ITEM_STATES = {
  PLANNED: 'planned',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  MISSED: 'missed',
  DEFERRED: 'deferred'
};

const COGNITIVE_LOAD = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// TIME BLOCK COMPONENT - STRICT TIME ENFORCEMENT
const TimeBlock = ({ item, startTime, duration, isOverlapping, isMissed, ownerAvatar, onClick, currentTime }) => {
  const height = (duration / 60) * TIME_BLOCK_HEIGHT;
  const top = ((startTime.getHours() * 60 + startTime.getMinutes()) / 60) * TIME_BLOCK_HEIGHT;
  
  // AUTO-TRANSITION TO MISSED STATE
  const endTime = addMinutes(startTime, duration);
  const isExpired = currentTime > endTime && item.state !== ITEM_STATES.COMPLETED;
  const effectivelyMissed = isMissed || isExpired;
  
  // IDENTITY VALIDATION
  const hasOwnerIdentity = ownerAvatar || item.owner?.name;
  const isUnsafe = !hasOwnerIdentity;

  return (
    <div
      className={`
        absolute left-2 right-2 border-3 cursor-pointer transition-all
        ${effectivelyMissed
          ? 'border-red-700 bg-red-950/40 opacity-50 shadow-inner'
          : isUnsafe
            ? 'border-orange-600 bg-orange-950/40 animate-pulse'
            : isOverlapping
              ? 'border-yellow-600 bg-yellow-950/50 shadow-lg shadow-yellow-500/30 ring-4 ring-yellow-500/30'
              : item.state === ITEM_STATES.COMPLETED
                ? 'border-green-600 bg-green-950/30'
                : item.state === ITEM_STATES.ACTIVE
                  ? 'border-blue-600 bg-blue-950/40 shadow-lg shadow-blue-500/20'
                  : 'border-gray-600 bg-gray-900/40'
        }
        ${effectivelyMissed ? 'transform skew-y-1' : ''}
        hover:shadow-2xl hover:scale-[1.03] hover:z-50
      `}
      style={{
        top: `${top}px`,
        height: `${Math.max(height, 30)}px`,
        zIndex: isOverlapping ? 20 : effectivelyMissed ? 5 : 10,
        borderWidth: '3px'
      }}
      onClick={() => onClick(item)}
    >
      {/* MANDATORY OWNER AVATARS - MULTI-ACCOUNT SUPPORT */}
      <div className="absolute -top-3 -right-3 flex flex-row-reverse items-center gap-1">
        {/* GOOGLE TASK BADGE */}
        {item.isGoogleTask && (
          <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-gray-800 flex items-center justify-center" title="Google Task">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
        )}
        
        {item.owners && item.owners.length > 0 ? (
          item.owners.slice(0, 3).map((owner, index) => (
            <div
              key={owner._id || index}
              className={`w-8 h-8 rounded-full border-3 overflow-hidden ${
                isUnsafe ? 'border-orange-500 bg-orange-950' : 'border-gray-800 bg-gray-700'
              }`}
              style={{ 
                marginLeft: index > 0 ? '-12px' : '0',
                zIndex: item.owners.length - index
              }}
              title={`${owner.name || 'Unknown'} (${owner.email || ''})${item.isGoogleTask ? ' - Google Account' : ''}`}
            >
              {owner.avatar ? (
                <img src={owner.avatar} alt={owner.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
                  {owner.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="w-8 h-8 rounded-full border-3 border-orange-500 bg-orange-950 overflow-hidden animate-pulse">
            <div className="w-full h-full flex items-center justify-center text-xs text-orange-400">
              <FaExclamationTriangle />
            </div>
          </div>
        )}
        {/* +N MORE INDICATOR */}
        {item.owners && item.owners.length > 3 && (
          <div
            className="w-8 h-8 rounded-full border-3 border-gray-800 bg-gray-700 flex items-center justify-center text-white text-xs font-bold"
            style={{ marginLeft: '-12px', zIndex: 0 }}
            title={`+${item.owners.length - 3} more assignees`}
          >
            +{item.owners.length - 3}
          </div>
        )}
      </div>

      {/* UNSAFE MARKER - NO OWNER */}
      {isUnsafe && (
        <div className="absolute -top-1 -left-1 w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center shadow-lg">
          <FaExclamationTriangle className="w-3 h-3 text-white" />
        </div>
      )}

      {/* OVERLAP ERROR - COLLISION */}
      {isOverlapping && (
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <FaExclamationTriangle className="w-3 h-3 text-black font-bold" />
        </div>
      )}

      {/* MISSED DAMAGE - VISUAL SCAR */}
      {effectivelyMissed && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-red-700/20 to-transparent">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 L40 40 M40 0 L0 40' stroke='%23dc2626' stroke-width='1' opacity='0.15'/%3E%3C/svg%3E")`
            }}
          ></div>
          <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-700 text-white text-[9px] font-black rounded">
            MISSED
          </div>
        </div>
      )}

      <div className="p-2 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {item.title}
            </div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">
              {item.type} • {item.cognitiveLoad || 'medium'} load
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <div className="flex items-center space-x-1">
            <FaClock className="w-3 h-3" />
            <span>{duration}m</span>
          </div>
          <div className={`px-1 py-0.5 rounded text-[9px] font-bold ${
            item.state === ITEM_STATES.COMPLETED ? 'bg-green-600 text-white' :
            item.state === ITEM_STATES.MISSED ? 'bg-red-600 text-white' :
            item.state === ITEM_STATES.ACTIVE ? 'bg-blue-600 text-white' :
            'bg-gray-600 text-gray-300'
          }`}>
            {item.state}
          </div>
        </div>
      </div>
    </div>
  );
};

// DAY VIEW - EXECUTION MODE
// PURPOSE: What is happening NOW and NEXT
// RULES: Vertical time axis, visible now-bar, blocks auto-damage when missed
const DayView = ({ selectedDate, items, onItemClick, onTimeSlotClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update every 30 seconds for smoother now-bar animation
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const dayItems = items.filter(item =>
    item.startTime && isSameDay(new Date(item.startTime), selectedDate)
  );

  // DETECT OVERLAPS
  const overlaps = useMemo(() => {
    const conflicts = [];
    for (let i = 0; i < dayItems.length; i++) {
      for (let j = i + 1; j < dayItems.length; j++) {
        const item1 = dayItems[i];
        const item2 = dayItems[j];

        if (item1.startTime && item1.duration && item2.startTime && item2.duration) {
          const start1 = new Date(item1.startTime);
          const end1 = addMinutes(start1, item1.duration);
          const start2 = new Date(item2.startTime);
          const end2 = addMinutes(start2, item2.duration);

          if (start1 < end2 && start2 < end1) {
            conflicts.push([item1, item2]);
          }
        }
      }
    }
    return conflicts;
  }, [dayItems]);

  const isOverlapping = (item) => overlaps.some(conflict => conflict.includes(item));

  // CURRENT TIME BAR
  const currentTimePosition = ((currentTime.getHours() * 60 + currentTime.getMinutes()) / 60) * TIME_BLOCK_HEIGHT;

  return (
    <div className="flex-1 bg-gray-900 relative overflow-hidden">
      {/* TIME AXIS */}
      <div className="absolute left-0 top-0 w-16 h-full bg-gray-800 border-r border-gray-700">
        {Array.from({ length: 24 }, (_, hour) => (
          <div
            key={hour}
            className="h-16 border-b border-gray-700 flex items-center justify-end pr-2"
            style={{ height: `${TIME_BLOCK_HEIGHT}px` }}
          >
            <span className="text-xs text-gray-400 font-mono">
              {hour.toString().padStart(2, '0')}:00
            </span>
          </div>
        ))}
      </div>

      {/* TIME SLOTS */}
      <div className="ml-16 relative">
        {Array.from({ length: 24 }, (_, hour) => (
          <div
            key={hour}
            className="border-b border-gray-800 cursor-pointer hover:bg-gray-800/30 transition-colors"
            style={{ height: `${TIME_BLOCK_HEIGHT}px` }}
            onClick={() => onTimeSlotClick(hour)}
          >
            {/* Quarter hour lines */}
            <div className="absolute w-full h-px bg-gray-800 top-1/4"></div>
            <div className="absolute w-full h-px bg-gray-800 top-1/2"></div>
            <div className="absolute w-full h-px bg-gray-800 top-3/4"></div>
          </div>
        ))}

        {/* CURRENT TIME BAR - ALWAYS VISIBLE AND ANIMATED */}
        {isSameDay(currentTime, selectedDate) && (
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 shadow-2xl z-50 animate-pulse"
            style={{ 
              top: `${currentTimePosition}px`,
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)'
            }}
          >
            <div className="absolute -left-3 -top-2 w-5 h-5 bg-red-500 rounded-full shadow-lg animate-ping opacity-75"></div>
            <div className="absolute -left-3 -top-2 w-5 h-5 bg-red-500 rounded-full shadow-lg"></div>
            <div className="absolute left-6 -top-3 text-sm font-black text-red-400 bg-gray-950 px-3 py-1.5 rounded-lg border-2 border-red-500 shadow-xl">
              NOW · {format(currentTime, 'HH:mm')}
            </div>
          </div>
        )}

        {/* TIME BLOCKS */}
        {dayItems.map((item) => (
          <TimeBlock
            key={item._id}
            item={item}
            startTime={new Date(item.startTime)}
            duration={item.duration || 60}
            isOverlapping={isOverlapping(item)}
            isMissed={item.state === ITEM_STATES.MISSED}
            ownerAvatar={item.owner?.avatar} // Primary avatar for backwards compatibility
            onClick={onItemClick}
            currentTime={currentTime}
          />
        ))}

        {/* OVERLAP ERRORS - MANDATORY RESOLUTION */}
        {overlaps.length > 0 && (
          <div className="absolute top-4 right-4 bg-yellow-600 text-black px-4 py-3 rounded-lg shadow-2xl border-4 border-yellow-500 animate-pulse">
            <div className="flex items-center space-x-2 mb-2">
              <FaExclamationTriangle className="w-5 h-5 animate-bounce" />
              <span className="text-base font-black uppercase">
                {overlaps.length} TIME COLLISION{overlaps.length !== 1 ? 'S' : ''}
              </span>
            </div>
            <div className="text-xs font-bold mb-1">
              INVALID SCHEDULE
            </div>
            <div className="text-xs">
              You cannot be in two places at once.
            </div>
            <button className="mt-2 w-full bg-red-600 text-white text-xs font-bold py-1 px-2 rounded hover:bg-red-700">
              FORCE RESOLVE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// WEEK VIEW - LOAD & CONFLICT DETECTION
const WeekView = ({ currentDate, items, onItemClick }) => {
  const weekDays = useMemo(() => {
    const start = startOfDay(currentDate);
    return Array.from({ length: 7 }, (_, i) => addHours(start, i * 24));
  }, [currentDate]);

  const getDayItems = (date) => items.filter(item =>
    item.startTime && isSameDay(new Date(item.startTime), date)
  );

  const getDayCapacity = (dayItems) => {
    const totalMinutes = dayItems.reduce((sum, item) => sum + (item.duration || 60), 0);
    return Math.min((totalMinutes / (8 * 60)) * 100, 100); // 8 hour workday
  };

  return (
    <div className="flex-1 bg-gray-900">
      <div className="grid grid-cols-7 gap-1 h-full">
        {weekDays.map((day) => {
          const dayItems = getDayItems(day);
          const capacity = getDayCapacity(dayItems);
          const hasOverload = capacity > 100;
          const hasConflicts = dayItems.some(item => item.conflicts);

          return (
            <div key={day.toISOString()} className="bg-gray-800 border border-gray-700 flex flex-col">
              {/* DAY HEADER */}
              <div className="p-2 border-b border-gray-700 text-center">
                <div className={`text-sm font-bold ${isToday(day) ? 'text-blue-400' : 'text-white'}`}>
                  {format(day, 'EEE')}
                </div>
                <div className={`text-lg font-black ${isToday(day) ? 'text-blue-400' : 'text-gray-300'}`}>
                  {format(day, 'd')}
                </div>

                {/* CAPACITY INDICATOR */}
                <div className="mt-1">
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all ${
                        hasOverload ? 'bg-red-500' : capacity > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(capacity, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {Math.round(capacity)}%
                  </div>
                </div>

                {/* WARNINGS */}
                {(hasOverload || hasConflicts) && (
                  <div className="mt-1 flex justify-center">
                    {hasOverload && <FaExclamationTriangle className="w-3 h-3 text-red-500" />}
                    {hasConflicts && <FaExclamationTriangle className="w-3 h-3 text-yellow-500 ml-1" />}
                  </div>
                )}
              </div>

              {/* ITEMS LIST */}
              <div className="flex-1 p-1 space-y-1 overflow-y-auto">
                {dayItems.map((item) => (
                  <div
                    key={item._id}
                    className={`
                      p-1 rounded text-xs cursor-pointer transition-all hover:scale-105
                      ${item.state === ITEM_STATES.MISSED ? 'bg-red-900/50 border border-red-600' :
                        item.state === ITEM_STATES.COMPLETED ? 'bg-green-900/30' :
                        'bg-gray-700 hover:bg-gray-600'}
                    `}
                    onClick={() => onItemClick(item)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 truncate">
                        <div className="font-medium text-white">{item.title}</div>
                        <div className="text-gray-400 text-[10px]">
                          {item.duration || 60}m • {item.cognitiveLoad || 'medium'}
                        </div>
                      </div>
                      {/* OWNER AVATARS - STACKED */}
                      <div className="flex flex-row-reverse ml-1 flex-shrink-0 items-center gap-0.5">
                        {/* Google Task Badge */}
                        {item.isGoogleTask && (
                          <div className="w-3 h-3 rounded-full bg-blue-600 flex items-center justify-center" title="Google Task">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            </svg>
                          </div>
                        )}
                        {item.owners && item.owners.length > 0 ? (
                          item.owners.slice(0, 2).map((owner, idx) => {
                            const avatarUrl = owner.avatar || owner.picture;
                            return (
                              <div
                                key={owner._id || idx}
                                className="w-5 h-5 rounded-full bg-gray-600 border-2 border-gray-800 overflow-hidden"
                                style={{ marginLeft: idx > 0 ? '-8px' : '0', zIndex: item.owners.length - idx }}
                                title={`${owner.name}${item.isGoogleTask ? ' (Google)' : ''}`}
                              >
                                {avatarUrl ? (
                                  <img 
                                    src={avatarUrl} 
                                    alt={owner.name} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-[8px] font-bold"
                                  style={{ display: avatarUrl ? 'none' : 'flex' }}
                                >
                                  {owner.name?.[0]?.toUpperCase() || owner.email?.[0]?.toUpperCase() || '?'}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center">
                            <FaUser className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// MONTH VIEW - STRATEGIC COMMITMENT MAP
const MonthView = ({ currentDate, items, onDayClick }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayCommitmentLevel = (date) => {
    const dayItems = items.filter(item =>
      item.startTime && isSameDay(new Date(item.startTime), date)
    );
    const totalHours = dayItems.reduce((sum, item) => sum + ((item.duration || 60) / 60), 0);
    return Math.min(totalHours / 8, 1); // Max 8 hours = 100%
  };

  const getDayItems = (date) => items.filter(item =>
    item.startTime && isSameDay(new Date(item.startTime), date)
  );

  return (
    <div className="flex-1 bg-gray-900 p-4">
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-bold text-gray-400 border-b border-gray-700">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day) => {
          const commitmentLevel = getDayCommitmentLevel(day);
          const dayItems = getDayItems(day);
          const hasDeadlines = dayItems.some(item => item.type === ITEM_TYPES.DEADLINE);
          const hasMissed = dayItems.some(item => item.state === ITEM_STATES.MISSED);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`
                min-h-[80px] p-2 border border-gray-700 rounded-lg text-left transition-all
                ${isSameMonth(day, currentDate) ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-900 opacity-50'}
                ${isToday(day) ? 'ring-2 ring-blue-500' : ''}
                ${hasMissed ? 'ring-2 ring-red-500' : ''}
                hover:shadow-lg
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-bold ${
                  isToday(day) ? 'text-blue-400' :
                  hasMissed ? 'text-red-400' : 'text-white'
                }`}>
                  {format(day, 'd')}
                </span>

                {/* DEADLINE INDICATOR */}
                {hasDeadlines && (
                  <FaExclamationTriangle className="w-3 h-3 text-red-500" />
                )}
              </div>

              {/* COMMITMENT BAR */}
              <div className="w-full bg-gray-700 rounded-full h-1 mb-1">
                <div
                  className={`h-1 rounded-full ${
                    commitmentLevel > 0.8 ? 'bg-red-500' :
                    commitmentLevel > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${commitmentLevel * 100}%` }}
                ></div>
              </div>

              {/* ITEM COUNT */}
              <div className="text-xs text-gray-400">
                {dayItems.length} item{dayItems.length !== 1 ? 's' : ''}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// AGENDA VIEW - TRUTH MODE
const AgendaView = ({ items, onItemClick }) => {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      // MISSED items first
      if (a.state === ITEM_STATES.MISSED && b.state !== ITEM_STATES.MISSED) return -1;
      if (b.state === ITEM_STATES.MISSED && a.state !== ITEM_STATES.MISSED) return 1;

      // Then by start time
      const timeA = a.startTime ? new Date(a.startTime) : new Date();
      const timeB = b.startTime ? new Date(b.startTime) : new Date();
      return timeA - timeB;
    });
  }, [items]);

  return (
    <div className="flex-1 bg-gray-900 overflow-y-auto">
      <div className="p-4 space-y-2">
        {sortedItems.map((item) => (
          <div
            key={item._id}
            className={`
              p-4 border-l-4 cursor-pointer transition-all hover:bg-gray-800
              ${item.state === ITEM_STATES.MISSED
                ? 'border-red-500 bg-red-900/20'
                : item.state === ITEM_STATES.COMPLETED
                  ? 'border-green-500 bg-green-900/20'
                  : item.state === ITEM_STATES.ACTIVE
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-500 bg-gray-800'
              }
            `}
            onClick={() => onItemClick(item)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  {/* OWNER AVATARS - MULTI-ACCOUNT */}
                  <div className="flex flex-row-reverse items-center gap-1">
                    {/* Google Task Badge */}
                    {item.isGoogleTask && (
                      <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center" title="Synced from Google Tasks">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        </svg>
                      </div>
                    )}
                    {item.owners && item.owners.length > 0 ? (
                      item.owners.slice(0, 3).map((owner, idx) => (
                        <div
                          key={owner._id || idx}
                          className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-800 flex-shrink-0"
                          style={{ marginLeft: idx > 0 ? '-8px' : '0', zIndex: item.owners.length - idx }}
                          title={`${owner.name} (${owner.email})${item.isGoogleTask ? ' - Google Account' : ''}`}
                        >
                          {owner.avatar ? (
                            <img src={owner.avatar} alt={owner.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
                              {owner.name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center">
                        <FaUser className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-bold text-white">{item.title}</div>
                    <div className="text-xs text-gray-400">
                      {item.type} • {item.state} • {item.cognitiveLoad || 'medium'} load
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {item.startTime && (
                    <div className="flex items-center space-x-1">
                      <FaCalendarAlt className="w-3 h-3" />
                      <span>{format(new Date(item.startTime), 'MMM d, HH:mm')}</span>
                    </div>
                  )}
                  {item.duration && (
                    <div className="flex items-center space-x-1">
                      <FaClock className="w-3 h-3" />
                      <span>{item.duration}m</span>
                    </div>
                  )}
                </div>
              </div>

              {/* STATE INDICATOR */}
              <div className={`px-2 py-1 rounded text-xs font-bold ${
                item.state === ITEM_STATES.MISSED ? 'bg-red-600 text-white' :
                item.state === ITEM_STATES.COMPLETED ? 'bg-green-600 text-white' :
                item.state === ITEM_STATES.ACTIVE ? 'bg-blue-600 text-white' :
                'bg-gray-600 text-gray-300'
              }`}>
                {item.state.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
        {sortedItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">NO SCHEDULED ITEMS</div>
            <div className="text-gray-600 text-sm">
              If it&apos;s not scheduled, it doesn&apos;t exist.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// MAIN CALENDAR COMPONENT
export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'month', 'agenda'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedItem, setSelectedItem] = useState(null);

  const { workspace } = useWorkspace();
  const { data: tasksData } = useGetTasksQuery({ workspaceId: workspace?._id }, { skip: !workspace?._id });
  const [updateTask] = useUpdateTaskMutation();

  // TRANSFORM TASKS TO TIME-ENFORCEMENT FORMAT
  const items = useMemo(() => {
    if (!tasksData || !Array.isArray(tasksData)) return [];

    return tasksData.map(task => {
      // GOOGLE TASK DETECTION: Check if this is a synced Google Task
      const isGoogleTask = task.source === 'google-tasks' || task.googleAccount;
      
      let primaryOwner, allOwners;
      
      if (isGoogleTask && task.googleAccount) {
        // GOOGLE TASK: Use Google account info
        primaryOwner = {
          _id: task.googleAccount.accountId,
          name: task.googleAccount.name || task.googleAccount.email,
          email: task.googleAccount.email,
          avatar: task.googleAccount.avatar || task.googleAccount.picture
        };
        allOwners = [primaryOwner];
      } else {
        // NATIVE AIVA TASK: Use assignees/creator
        const assignees = task.assignees || [];
        const creator = task.creator;
        
        primaryOwner = assignees[0] || creator || { avatar: null, name: 'Unassigned', email: '' };
        allOwners = assignees.length > 0 ? assignees : (creator ? [creator] : []);
      }
      
      return {
        _id: task._id,
        title: task.title,
        type: isGoogleTask ? 'GOOGLE_TASK' : ITEM_TYPES.TASK,
        state: task.stage === 'completed' || task.status === 'completed' ? ITEM_STATES.COMPLETED :
               task.stage === 'in_progress' ? ITEM_STATES.ACTIVE :
               ITEM_STATES.PLANNED,
        startTime: task.dueDate,
        duration: task.estimatedDuration || 60, // Default 1 hour
        cognitiveLoad: task.priority === 'high' ? COGNITIVE_LOAD.HIGH :
                      task.priority === 'medium' ? COGNITIVE_LOAD.MEDIUM :
                      COGNITIVE_LOAD.LOW,
        owner: primaryOwner,
        owners: allOwners,
        creator: task.creator,
        googleAccount: task.googleAccount, // Preserve Google account info
        isGoogleTask: isGoogleTask, // Flag for special rendering
        description: task.description || task.notes,
        conflicts: false,
      };
    });
  }, [tasksData]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleTimeSlotClick = (hour) => {
    // Create new item at this time slot
    const startTime = new Date(selectedDate);
    startTime.setHours(hour, 0, 0, 0);

    setSelectedItem({
      _id: 'new',
      title: 'New Item',
      type: ITEM_TYPES.TASK,
      state: ITEM_STATES.PLANNED,
      startTime: startTime.toISOString(),
      duration: 60,
      cognitiveLoad: COGNITIVE_LOAD.MEDIUM,
      owner: { avatar: null },
      isNew: true
    });
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setViewMode('day');
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* HEADER - CONTROL SURFACE */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-black text-red-400">TIME ENFORCEMENT SYSTEM</h1>
            <div className="text-sm text-gray-400">
              {format(currentDate, 'MMMM yyyy')}
            </div>
          </div>

          {/* VIEW CONTROLS */}
          <div className="flex items-center space-x-2">
            {['day', 'week', 'month', 'agenda'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-sm font-bold uppercase tracking-wide rounded transition-all ${
                  viewMode === mode
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* NAVIGATION */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold"
            >
              NOW
            </button>
            <button
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>MISSED: {items.filter(i => i.state === ITEM_STATES.MISSED).length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>CONFLICTS: {items.filter(i => i.conflicts).length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>ACTIVE: {items.filter(i => i.state === ITEM_STATES.ACTIVE).length}</span>
            </div>
          </div>

          <div className="text-gray-400">
            TOTAL ITEMS: {items.length}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex">
        {/* VIEW CONTENT */}
        <div className="flex-1">
          {viewMode === 'day' && (
            <DayView
              selectedDate={selectedDate}
              items={items}
              onItemClick={handleItemClick}
              onTimeSlotClick={handleTimeSlotClick}
            />
          )}
          {viewMode === 'week' && (
            <WeekView
              currentDate={currentDate}
              items={items}
              onItemClick={handleItemClick}
            />
          )}
          {viewMode === 'month' && (
            <MonthView
              currentDate={currentDate}
              items={items}
              onDayClick={handleDayClick}
            />
          )}
          {viewMode === 'agenda' && (
            <AgendaView
              items={items}
              onItemClick={handleItemClick}
            />
          )}
        </div>

        {/* ITEM DETAILS PANEL */}
        {selectedItem && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">ITEM DETAILS</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* OWNER/ASSIGNEES SECTION */}
              <div className="space-y-3">
                <div className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                  {selectedItem.isGoogleTask ? 'GOOGLE ACCOUNT' : 'ASSIGNED TO'}
                </div>
                
                {/* GOOGLE TASK INDICATOR */}
                {selectedItem.isGoogleTask && (
                  <div className="flex items-center gap-2 p-2 bg-blue-600/20 border border-blue-500 rounded-lg mb-2">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <div className="text-xs text-blue-300 font-medium">Synced from Google Tasks</div>
                  </div>
                )}
                
                {selectedItem.owners && selectedItem.owners.length > 0 ? (
                  <div className="space-y-2">
                    {selectedItem.owners.map((owner, index) => (
                      <div key={owner._id || index} className="flex items-center space-x-3 p-2 bg-gray-700/50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                          {owner.avatar ? (
                            <img src={owner.avatar} alt={owner.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold rounded-full">
                              {owner.name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{owner.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-400 truncate">{owner.email || 'No email'}</div>
                        </div>
                        {selectedItem.isGoogleTask ? (
                          <div className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">
                            GOOGLE
                          </div>
                        ) : index === 0 ? (
                          <div className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">
                            PRIMARY
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-2 bg-orange-900/30 border border-orange-600 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center">
                      <FaExclamationTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-orange-400">UNASSIGNED</div>
                      <div className="text-xs text-gray-400">No owner identity</div>
                    </div>
                  </div>
                )}
                
                {/* CREATOR INFO - Only for native AIVA tasks */}
                {!selectedItem.isGoogleTask && selectedItem.creator && (
                  <div className="pt-2 border-t border-gray-700">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Created By</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                        {selectedItem.creator.avatar ? (
                          <img src={selectedItem.creator.avatar} alt={selectedItem.creator.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-500 to-gray-700 text-white text-[10px] font-bold rounded-full">
                            {selectedItem.creator.name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{selectedItem.creator.name}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* ITEM INFO */}
              <div>
                <div className="text-xl font-black mb-2">{selectedItem.title}</div>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-400">TYPE:</span> {selectedItem.type}</div>
                  <div><span className="text-gray-400">STATE:</span> {selectedItem.state}</div>
                  <div><span className="text-gray-400">LOAD:</span> {selectedItem.cognitiveLoad}</div>
                  <div><span className="text-gray-400">DURATION:</span> {selectedItem.duration} minutes</div>
                  {selectedItem.startTime && (
                    <div><span className="text-gray-400">TIME:</span> {format(new Date(selectedItem.startTime), 'MMM d, HH:mm')}</div>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="space-y-2">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-bold transition-colors">
                  RESOLVE CONFLICTS
                </button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded font-bold transition-colors">
                  EDIT TIME BLOCK
                </button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded font-bold transition-colors">
                  MARK {selectedItem.state === ITEM_STATES.MISSED ? 'FORGIVEN' : 'MISSED'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
