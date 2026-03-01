/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  I N T E L L I G E N C E   C O N T R O L L E R  ──◈──

   ◉  Execution Intelligence API
   ◉  Proactive Insights • Burnout Detection • Focus Analytics

   ⟁  SYSTEM LAYER : API CONTROLLERS
   ⟁  DOMAIN       : INTELLIGENCE ENGINE

   ⟁  PURPOSE      : Expose execution intelligence via REST API
   ⟁  WHY          : Frontend needs data-backed insights, not just AI text
   ⟁  WHAT         : Intelligence report, nudges, execution gaps, analytics

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS         : /docs/api/intelligence.md

   ⟁  USAGE RULES  : Validate inputs • Handle errors • Return structured data

        "Intelligence surfaced. Behavior optimized. Execution elevated."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import asyncHandler from 'express-async-handler';
import {
  generateIntelligenceReport,
  getProactiveNudge,
  detectExecutionGaps,
  analyzeCompletionPatterns,
  analyzeFocusWindows,
  detectBurnoutSignals,
  analyzeHabitExecution
} from '../services/executionIntelligenceEngine.js';

/**
 * @desc    Get full execution intelligence report
 * @route   GET /api/intelligence/report
 * @access  Private
 */
export const getIntelligenceReport = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;

  if (!workspaceId) {
    res.status(400);
    throw new Error('workspaceId is required');
  }

  const report = await generateIntelligenceReport(req.user._id, workspaceId);
  res.status(200).json(report);
});

/**
 * @desc    Get proactive nudge (single most important insight)
 * @route   GET /api/intelligence/nudge
 * @access  Private
 */
export const getNudge = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;

  if (!workspaceId) {
    res.status(400);
    throw new Error('workspaceId is required');
  }

  const nudge = await getProactiveNudge(req.user._id, workspaceId);
  res.status(200).json(nudge || { type: null, nudge: null });
});

/**
 * @desc    Get execution gaps and orchestration suggestions
 * @route   GET /api/intelligence/gaps
 * @access  Private
 */
export const getExecutionGaps = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;

  if (!workspaceId) {
    res.status(400);
    throw new Error('workspaceId is required');
  }

  const gaps = await detectExecutionGaps(req.user._id, workspaceId);
  res.status(200).json(gaps);
});

/**
 * @desc    Get focus window analytics (completion patterns + productivity windows)
 * @route   GET /api/intelligence/focus
 * @access  Private
 */
export const getFocusAnalytics = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  const lookBackDays = parseInt(req.query.days) || 30;

  if (!workspaceId) {
    res.status(400);
    throw new Error('workspaceId is required');
  }

  const [completionPatterns, focusWindows] = await Promise.all([
    analyzeCompletionPatterns(req.user._id, workspaceId, lookBackDays),
    analyzeFocusWindows(req.user._id, workspaceId, lookBackDays)
  ]);

  res.status(200).json({
    completionPatterns,
    focusWindows
  });
});

/**
 * @desc    Get burnout risk assessment
 * @route   GET /api/intelligence/burnout
 * @access  Private
 */
export const getBurnoutAssessment = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;

  if (!workspaceId) {
    res.status(400);
    throw new Error('workspaceId is required');
  }

  const burnout = await detectBurnoutSignals(req.user._id, workspaceId);
  res.status(200).json(burnout);
});

/**
 * @desc    Get habit execution health
 * @route   GET /api/intelligence/habits
 * @access  Private
 */
export const getHabitHealth = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;

  if (!workspaceId) {
    res.status(400);
    throw new Error('workspaceId is required');
  }

  const health = await analyzeHabitExecution(req.user._id, workspaceId);
  res.status(200).json(health);
});

export default {
  getIntelligenceReport,
  getNudge,
  getExecutionGaps,
  getFocusAnalytics,
  getBurnoutAssessment,
  getHabitHealth
};
