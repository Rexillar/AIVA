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

   ⟁  SYSTEM LAYER : BACKEND CORE
   ⟁  DOMAIN       : BUSINESS LOGIC

   ⟁  PURPOSE      : Index and surface team knowledge

   ⟁  WHY          : Enable team knowledge hubs

   ⟁  WHAT         : Knowledge discovery and indexing service

   ⟁  TECH STACK   : Node.js • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH

   ⟁  USAGE RULES  : Optimize queries • Cache results • Handle large datasets

        "Knowledge indexed. Insights surfaced. Wisdom shared."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import Note from '../models/note.js';
import Source from '../models/source.js';
import Task from '../models/task.js';
import User from '../models/user.js';
import DecisionLog from '../models/decisionLog.js';
import { subDays } from 'date-fns';

/**
 * Build comprehensive knowledge index for a workspace
 * Returns insights about team knowledge base
 */
export const buildKnowledgeIndex = async (workspaceId) => {
  try {
    const thirtyDaysAgo = subDays(new Date(), 30);

    // Parallel queries for performance
    const [
      allNotes,
      recentNotes,
      allSources,
      contributors,
      documentedTasks,
      totalTasks,
      totalDecisions,
    ] = await Promise.all([
      Note.find({ workspace: workspaceId, isDeleted: false })
        .select('title tags creator createdAt aiMetadata'),
      Note.find({ 
        workspace: workspaceId, 
        isDeleted: false,
        createdAt: { $gte: thirtyDaysAgo }
      })
        .select('title creator createdAt')
        .sort({ createdAt: -1 }),
      Source.find({ workspace: workspaceId })
        .select('title type authors doi'),
      Note.find({ workspace: workspaceId, isDeleted: false })
        .distinct('creator'),
      Task.countDocuments({ 
        workspace: workspaceId,
        description: { $regex: /documentation|guide|wiki|process/ }
      }),
      Task.countDocuments({ workspace: workspaceId, isDeleted: false, isTrash: false }),
      DecisionLog.countDocuments({ workspace: workspaceId, isArchived: false }),
    ]);

    // Get contributor details
    const contributorDetails = await User.find({ _id: { $in: contributors } })
      .select('_id name email')
      .lean();

    // Analyze tags to find knowledge clusters
    const tagFrequency = {};
    allNotes.forEach(note => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach(tag => {
          tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
        });
      }
    });

    // Find top topics/tags
    const topTopics = Object.entries(tagFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));

    // Analyze keywords from AI metadata
    const keywordFrequency = {};
    allNotes.forEach(note => {
      if (note.aiMetadata?.keywords && Array.isArray(note.aiMetadata.keywords)) {
        note.aiMetadata.keywords.forEach(keyword => {
          keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + 1;
        });
      }
    });

    const topKeywords = Object.entries(keywordFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    // Source analysis
    const sourcesByType = {};
    allSources.forEach(source => {
      sourcesByType[source.type] = (sourcesByType[source.type] || 0) + 1;
    });

    // Contributor contribution analysis
    const contributionStats = {};
    for (const contributor of contributorDetails) {
      const noteCount = allNotes.filter(n => n.creator.toString() === contributor._id.toString()).length;
      if (noteCount > 0) {
        contributionStats[contributor._id] = {
          name: contributor.name,
          email: contributor.email,
          notes: noteCount,
          recentActivity: recentNotes.some(n => n.creator.toString() === contributor._id.toString()),
        };
      }
    }

    // Sort contributors by contribution
    const topContributors = Object.entries(contributionStats)
      .sort(([, a], [, b]) => b.notes - a.notes)
      .slice(0, 5)
      .map(([id, stats]) => ({ userId: id, ...stats }));

    // Identify knowledge gaps (common topics without documentation)
    const commonQuestions = ['how to', 'setup', 'installation', 'configuration', 'troubleshooting'];
    const knowledgeGaps = commonQuestions.filter(q => 
      !topKeywords.some(kw => kw.keyword.toLowerCase().includes(q))
    );

    // Build knowledge categories (inferred from tags and keywords)
    const knowledgeCategories = {};
    topTopics.forEach(({ topic }) => {
      knowledgeCategories[topic] = allNotes.filter(n => 
        n.tags && n.tags.includes(topic)
      ).length;
    });

    // Calculate knowledge health score (0-100)
    const healthFactors = {
      documentationCoverage: (allNotes.length / Math.max(1, documentedTasks)) * 10,
      recentContributions: recentNotes.length > 0 ? 20 : 0,
      activeContributors: topContributors.length * 5,
      sourceQuality: allSources.length > 0 ? 15 : 0,
      topicDiversity: Math.min(topTopics.length * 2, 20),
    };

    const knowledgeHealthScore = Math.min(
      100,
      Object.values(healthFactors).reduce((a, b) => a + b, 0)
    );

    return {
      summary: {
        totalNotes: allNotes.length,
        totalSources: allSources.length,
        totalTasks,
        totalDecisions,
        uniqueContributors: contributorDetails.length,
        documentationTasks: documentedTasks,
        healthScore: Math.round(knowledgeHealthScore),
      },
      activity: {
        notesLastMonth: recentNotes.length,
        lastUpdated: recentNotes[0]?.createdAt || null,
      },
      topContributors,
      topTopics,
      topKeywords,
      sourcesByType,
      knowledgeGaps,
      knowledgeCategories,
      recommendations: generateRecommendations(
        allNotes.length,
        recentNotes.length,
        topContributors.length,
        knowledgeGaps
      ),
    };
  } catch (error) {
    console.error('Error building knowledge index:', error);
    throw error;
  }
};

/**
 * Get related knowledge items (notes, sources) for a given topic
 */
export const getRelatedKnowledge = async (workspaceId, topic, limit = 10) => {
  try {
    const [notes, sources] = await Promise.all([
      Note.find({
        workspace: workspaceId,
        isDeleted: false,
        $or: [
          { tags: topic },
          { 'aiMetadata.keywords': topic },
          { title: { $regex: topic, $options: 'i' } }
        ]
      })
        .select('title creator createdAt tags')
        .limit(limit)
        .lean(),
      Source.find({
        workspace: workspaceId,
        $or: [
          { tags: topic },
          { title: { $regex: topic, $options: 'i' } }
        ]
      })
        .select('title authors publicationDate type')
        .limit(limit / 2)
        .lean(),
    ]);

    return {
      topic,
      notes,
      sources,
      totalCount: notes.length + sources.length,
    };
  } catch (error) {
    console.error('Error fetching related knowledge:', error);
    throw error;
  }
};

/**
 * Search knowledge base using full-text search
 */
export const searchKnowledge = async (workspaceId, query, limit = 20) => {
  try {
    const searchRegex = { $regex: query, $options: 'i' };

    const [notes, sources] = await Promise.all([
      Note.find({
        workspace: workspaceId,
        isDeleted: false,
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { tags: searchRegex }
        ]
      })
        .select('title content creator createdAt tags')
        .limit(limit)
        .lean(),
      Source.find({
        workspace: workspaceId,
        $or: [
          { title: searchRegex },
          { authors: searchRegex },
          { tags: searchRegex }
        ]
      })
        .select('title authors type doi')
        .limit(limit / 2)
        .lean(),
    ]);

    return {
      query,
      results: {
        notes,
        sources,
      },
      totalResults: notes.length + sources.length,
    };
  } catch (error) {
    console.error('Error searching knowledge:', error);
    throw error;
  }
};

/**
 * Generate recommendations based on knowledge base analysis
 */
const generateRecommendations = (
  totalNotes,
  recentNotes,
  activeContributors,
  knowledgeGaps
) => {
  const recommendations = [];

  // Check for low documentation
  if (totalNotes < 10) {
    recommendations.push({
      priority: 'high',
      message: 'Your workspace has limited documentation. Start creating guides and best practices.',
      action: 'create_notes',
    });
  }

  // Check for inactivity
  if (recentNotes === 0) {
    recommendations.push({
      priority: 'high',
      message: 'No recent documentation updates. Encourage team to document learnings.',
      action: 'promote_contribution',
    });
  }

  // Check for low participation
  if (activeContributors < 2) {
    recommendations.push({
      priority: 'medium',
      message: 'Documentation is concentrated with one contributor. Spread ownership.',
      action: 'distribute_knowledge',
    });
  }

  // Surface knowledge gaps
  if (knowledgeGaps.length > 0) {
    recommendations.push({
      priority: 'medium',
      message: `Missing documentation on: ${knowledgeGaps.join(', ')}`,
      topics: knowledgeGaps,
      action: 'document_gaps',
    });
  }

  return recommendations;
};

/**
 * Export knowledge base as JSON or Markdown
 */
export const exportKnowledge = async (workspaceId, format = 'json') => {
  try {
    const notes = await Note.find({ workspace: workspaceId, isDeleted: false })
      .populate('creator', 'name email')
      .lean();

    const sources = await Source.find({ workspace: workspaceId })
      .populate('addedBy', 'name email')
      .lean();

    if (format === 'markdown') {
      return generateMarkdownExport(notes, sources);
    }

    return {
      exportDate: new Date(),
      workspace: workspaceId,
      notes,
      sources,
    };
  } catch (error) {
    console.error('Error exporting knowledge:', error);
    throw error;
  }
};

/**
 * Generate Markdown version of knowledge base
 */
const generateMarkdownExport = (notes, sources) => {
  let markdown = '# Knowledge Base Export\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;

  // Sources section
  if (sources.length > 0) {
    markdown += '## References\n\n';
    sources.forEach(source => {
      markdown += `- **${source.title}** (${source.type})\n`;
      markdown += `  Authors: ${source.authors?.join(', ') || 'Unknown'}\n`;
      markdown += `  URL: ${source.url || 'N/A'}\n\n`;
    });
  }

  // Notes section
  if (notes.length > 0) {
    markdown += '## Documentation\n\n';
    const notesByTag = {};

    notes.forEach(note => {
      const tags = note.tags || ['Uncategorized'];
      tags.forEach(tag => {
        if (!notesByTag[tag]) notesByTag[tag] = [];
        notesByTag[tag].push(note);
      });
    });

    Object.entries(notesByTag).forEach(([tag, tagNotes]) => {
      markdown += `### ${tag}\n\n`;
      tagNotes.forEach(note => {
        markdown += `#### ${note.title}\n`;
        markdown += `*By ${note.creator?.name || 'Unknown'} on ${new Date(note.createdAt).toLocaleDateString()}*\n\n`;
        markdown += `${note.content.substring(0, 500)}...\n\n`;
      });
    });
  }

  return markdown;
};
