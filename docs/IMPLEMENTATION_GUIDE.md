# AIVA 4-Hour Implementation Guide
## Research Copilot & Knowledge Hub Features

**Target Completion:** 4 hours  
**Difficulty:** Low-Medium  
**Prerequisites:** Node.js, MongoDB, basic Express knowledge

---

## ✅ Quick Start Checklist

- [ ] **Setup (5 min):** Copy new files into your project
- [ ] **Database (10 min):** Create indexes
- [ ] **Integration (20 min):** Wire endpoints into server
- [ ] **Testing (15 min):** Test with Postman
- [ ] **UI (30 min):** Create React components (optional)
- [ ] **Documentation (10 min):** Update API docs

---

## 📂 Files Created

```
server/
├── models/
│   └── source.js              ← NEW: Citation/source model
├── controllers/
│   └── sourceController.js    ← NEW: Source CRUD operations
├── routes/
│   └── sourceRoutes.js        ← NEW: Source API endpoints
└── services/
    └── knowledgeIndexService.js  ← NEW: Knowledge indexing

docs/
└── PRIVACY_ARCHITECTURE.md    ← NEW: Privacy documentation
```

---

## 🚀 STEP-BY-STEP INTEGRATION

### **STEP 1: Import Routes in Server (5 min)**

**File:** `server/index.js` (or `server/server.js`)

Find the section where routes are imported:
```javascript
import noteRoutes from './routes/noteRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
// ... other imports
```

**Add this line:**
```javascript
import sourceRoutes from './routes/sourceRoutes.js';
```

Then find where routes are registered:
```javascript
app.use('/api/notes', noteRoutes);
app.use('/api/tasks', taskRoutes);
// ... other routes
```

**Add this line:**
```javascript
app.use('/api/sources', sourceRoutes);
```

---

### **STEP 2: Update Note Model (10 min)**

**File:** `server/models/note.js`

Find the `noteSchema` definition and locate the closing `}` of field definitions.

**Before the closing brace, add:**
```javascript
sources: [{
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Source",
  },
  context: String, // Quote or context where source is cited
  pageNum: Number, // Page number if applicable
  addedAt: {
    type: Date,
    default: Date.now,
  },
}],
```

**Result example:**
```javascript
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  // ... other fields ...
  sources: [{
    sourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Source" },
    context: String,
    pageNum: Number,
    addedAt: { type: Date, default: Date.now },
  }],
  // ... more fields ...
}, { timestamps: true });
```

---

### **STEP 3: Create Workspace Knowledge Endpoint (15 min)**

**File:** `server/controllers/workspaceController.js`

Find the end of the file (before `export` statements).

**Add this new function:**
```javascript
// @desc    Get workspace knowledge index
// @route   GET /api/workspace/:id/knowledge-index
// @access  Private
export const getWorkspaceKnowledgeIndex = asyncHandler(async (req, res) => {
  const { id: workspaceId } = req.params;

  const { buildKnowledgeIndex } = await import('../services/knowledgeIndexService.js');

  const knowledgeIndex = await buildKnowledgeIndex(workspaceId);

  res.json({
    success: true,
    data: knowledgeIndex,
  });
});
```

---

### **STEP 4: Add Knowledge Endpoint to Routes (10 min)**

**File:** `server/routes/workspaceRoutes.js`

Find where other workspace routes are defined:
```javascript
router.get('/:id', getWorkspace);
router.patch('/:id', updateWorkspace);
```

**Add this line:**
```javascript
router.get('/:id/knowledge-index', checkWorkspaceAccess, getWorkspaceKnowledgeIndex);
```

---

### **STEP 5: Create Database Indexes (5 min)**

**Run in MongoDB (via shell or MongoDB Compass):**

```javascript
// Create indexes for sources
db.sources.createIndex({ workspace: 1, addedBy: 1 });
db.sources.createIndex({ workspace: 1, type: 1 });
db.sources.createIndex({ workspace: 1, tags: 1 });
db.sources.createIndex({ url: 1 }, { sparse: true });
db.sources.createIndex({ doi: 1 }, { sparse: true });
db.sources.createIndex({ title: "text", authors: "text", tags: "text" });

// Update note indexes
db.notes.createIndex({ "sources.sourceId": 1 });
```

**Or add to your database initialization script:**

```javascript
// server/config/db.js - add this in connection callback
const createIndexes = async () => {
  const db = mongoose.connection.db;
  
  // Sources indexes
  await db.collection('sources').createIndex({ workspace: 1, addedBy: 1 });
  await db.collection('sources').createIndex({ title: "text", authors: "text" });
  
  console.log('✅ Indexes created');
};

// Call after connection
mongoose.connection.on('connected', createIndexes);
```

---

### **STEP 6: Test with Postman (15 min)**

**Create a new Postman test collection:**

#### **Test 1: Create a Source**
```
POST http://localhost:5000/api/sources
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "title": "How to Build a Research Copilot",
  "url": "https://example.com/research-guide",
  "type": "article",
  "authors": ["Jane Doe", "John Smith"],
  "publicationDate": "2024-01-15",
  "workspace": "<your_workspace_id>",
  "tags": ["research", "ai", "productivity"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "How to Build a Research Copilot",
    "citations": {
      "apa": "Jane Doe, John Smith (2024). How to Build a Research Copilot...",
      "mla": "...",
      "chicago": "...",
      "harvard": "..."
    }
  }
}
```

#### **Test 2: Get All Sources**
```
GET http://localhost:5000/api/sources?workspace=<workspace_id>
Authorization: Bearer <your_jwt_token>
```

#### **Test 3: Link Source to Note**
```
POST http://localhost:5000/api/sources/<source_id>/link/note/<note_id>
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "context": "This approach aligns with findings by Doe et al.",
  "pageNum": 42
}
```

#### **Test 4: Get Knowledge Index**
```
GET http://localhost:5000/api/workspace/<workspace_id>/knowledge-index
Authorization: Bearer <your_jwt_token>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalNotes": 15,
      "totalSources": 8,
      "uniqueContributors": 3,
      "healthScore": 72
    },
    "topContributors": [
      { "name": "Alice", "notes": 8 }
    ],
    "topTopics": [
      { "topic": "research", "count": 5 }
    ],
    "recommendations": [
      { 
        "priority": "medium",
        "message": "Missing documentation on: setup, configuration"
      }
    ]
  }
}
```

---

## 🎨 OPTIONAL: Create React Components (30 min)

### **Component 1: SourcePanel.jsx**

**File:** `client/src/components/notes/SourcePanel.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { Trash2, Copy, Plus } from 'lucide-react';

export const SourcePanel = ({ noteId, sources = [] }) => {
  const [showForm, setShowForm] = useState(false);
  const [notes, setNotes] = useState(sources);

  const handleAddSource = async (sourceId) => {
    try {
      const response = await fetch(
        `/api/sources/${sourceId}/link/note/${noteId}`,
        { method: 'POST' }
      );
      const result = await response.json();
      if (result.success) {
        setNotes([...notes, result.data.source]);
      }
    } catch (error) {
      console.error('Error linking source:', error);
    }
  };

  const handleRemoveSource = async (sourceId) => {
    try {
      await fetch(`/api/sources/${sourceId}/link/note/${noteId}`, {
        method: 'DELETE',
      });
      setNotes(notes.filter(s => s._id !== sourceId));
    } catch (error) {
      console.error('Error removing source:', error);
    }
  };

  const copyCitation = (citation) => {
    navigator.clipboard.writeText(citation);
  };

  return (
    <div className="border-l border-gray-200 dark:border-gray-700 p-4 w-64 bg-gray-50 dark:bg-gray-900">
      <h3 className="font-semibold text-sm mb-4">Sources & Citations</h3>

      {notes.length === 0 ? (
        <p className="text-xs text-gray-500">No sources added yet</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((source) => (
            <li key={source._id} className="bg-white dark:bg-gray-800 p-3 rounded text-xs">
              <p className="font-medium truncate">{source.title}</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                {source.authors?.[0] || 'Unknown'} ({source.publicationDate?.split('-')[0]})
              </p>
              <button
                onClick={() => copyCitation(source.citations?.apa)}
                className="text-blue-500 hover:text-blue-700 text-xs mt-2 flex items-center"
              >
                <Copy size={12} className="mr-1" /> Copy APA
              </button>
              <button
                onClick={() => handleRemoveSource(source._id)}
                className="text-red-500 hover:text-red-700 text-xs mt-1 flex items-center"
              >
                <Trash2 size={12} className="mr-1" /> Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        className="mt-4 w-full py-2 px-3 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 flex items-center justify-center"
      >
        <Plus size={14} className="mr-1" /> Add Source
      </button>
    </div>
  );
};

export default SourcePanel;
```

### **Component 2: KnowledgeHub.jsx**

**File:** `client/src/components/workspace/KnowledgeHub.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const KnowledgeHub = ({ workspaceId }) => {
  const [knowledgeIndex, setKnowledgeIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKnowledgeIndex = async () => {
      try {
        const response = await fetch(
          `/api/workspace/${workspaceId}/knowledge-index`
        );
        const result = await response.json();
        if (result.success) {
          setKnowledgeIndex(result.data);
        }
      } catch (error) {
        console.error('Error fetching knowledge index:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledgeIndex();
  }, [workspaceId]);

  if (loading) return <div>Loading knowledge hub...</div>;

  if (!knowledgeIndex) return <div>No knowledge data available</div>;

  const { summary, topTopics, topContributors, recommendations } = knowledgeIndex;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Knowledge Hub</h1>

      {/* Health Score */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Knowledge Health Score</h2>
        <div className="text-4xl font-bold">{summary.healthScore}/100</div>
        <p className="text-sm mt-2 opacity-90">
          {summary.totalNotes} notes • {summary.uniqueContributors} contributors
        </p>
      </div>

      {/* Top Topics */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-xl font-semibold mb-4">Top Topics</h3>
        <BarChart width={600} height={300} data={topTopics}>
          <XAxis dataKey="topic" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </div>

      {/* Top Contributors */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-xl font-semibold mb-4">Top Contributors</h3>
        <ul className="space-y-2">
          {topContributors.map((contributor) => (
            <li key={contributor.userId} className="flex justify-between">
              <span>{contributor.name}</span>
              <span className="font-semibold">{contributor.notes} notes</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-yellow-900">
            Recommendations
          </h3>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="text-yellow-800">
                <strong>{rec.priority}:</strong> {rec.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default KnowledgeHub;
```

---

## 🧪 Quick Validation Script

**File:** `server/scripts/validate-features.js`

```javascript
import Source from '../models/source.js';
import Note from '../models/note.js';
import { buildKnowledgeIndex } from '../services/knowledgeIndexService.js';

async function validateFeatures() {
  console.log('🔍 Validating new features...\n');

  try {
    // Test 1: Source model
    console.log('✅ Test 1: Source model imports');
    const sourceCount = await Source.countDocuments();
    console.log(`   Found ${sourceCount} sources\n`);

    // Test 2: Note sources field
    console.log('✅ Test 2: Note sources field');
    const noteWithSources = await Note.findOne({ sources: { $exists: true } });
    console.log(`   Note model supports sources: ${!!noteWithSources}\n`);

    // Test 3: Knowledge index
    console.log('✅ Test 3: Knowledge index service');
    const workspaceId = 'test-workspace'; // Replace with actual
    const index = await buildKnowledgeIndex(workspaceId);
    console.log(`   Knowledge score: ${index.summary.healthScore}/100\n`);

    console.log('✅ All validations passed!');
  } catch (error) {
    console.error('❌ Validation failed:', error);
  }
}

validateFeatures();
```

**Run with:** `node server/scripts/validate-features.js`

---

## 📊 API Reference Summary

### **Source Endpoints**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/sources` | Create new source |
| GET | `/api/sources?workspace=:id` | List workspace sources |
| GET | `/api/sources/:id` | Get single source |
| PATCH | `/api/sources/:id` | Update source |
| DELETE | `/api/sources/:id` | Delete source |
| POST | `/api/sources/:sourceId/link/note/:noteId` | Link to note |
| DELETE | `/api/sources/:sourceId/link/note/:noteId` | Unlink from note |
| GET | `/api/sources/:id/citation?format=apa` | Get citation |
| POST | `/api/sources/batch/import` | Import multiple |

### **Knowledge Hub Endpoints**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/workspace/:id/knowledge-index` | Get knowledge index |
| GET | `/api/workspace/:id/knowledge/:topic` | Related knowledge |
| GET | `/api/workspace/:id/knowledge/search?q=:query` | Search knowledge |
| GET | `/api/workspace/:id/knowledge/export?format=json` | Export knowledge |

---

## 🎯 Success Criteria

After implementation, verify:

- [ ] Can create sources via API
- [ ] Sources link to notes
- [ ] Knowledge index returns proper statistics
- [ ] Citations generate in all 4 formats
- [ ] Notes include source references
- [ ] Workspace knowledge score calculated
- [ ] Full-text search works on sources
- [ ] React components render without errors
- [ ] All endpoints secured with JWT
- [ ] Database indexes created

---

## 🐛 Troubleshooting

### "Source model not found"
**Solution:** Verify source.js is in `server/models/` and imported correctly

### "Unknown field: sources"
**Solution:** Update note.js schema with sources array, restart server

### "Workspace not found" 
**Solution:** Verify workspaceId is valid ObjectId, user has access

### "Circular dependency"
**Solution:** Check import order in controllers, avoid circular references

### "404 on source routes"
**Solution:** Verify route is registered in server.js, check route path

---

## ✨ Next Steps (Future Enhancement)

1. **Citation Auto-Generation:** Parse DOI to fetch metadata
2. **Research Paper Integration:** Connect to Semantic Scholar API
3. **Knowledge Graph:** Visualize relationships between notes/sources
4. **AI Citation Assistant:** Auto-extract citations from text

---

## 📞 Support

- **Questions?** Check the main [ANALYSIS_Future_of_Work.md](../ANALYSIS_Future_of_Work.md)
- **Need help?** Review error messages above
- **Ready to extend?** Follow this guide for new features

---

**Estimated Total Time: 2-4 hours with testing**  
**Difficulty: Low-Medium | Reusability: High**
