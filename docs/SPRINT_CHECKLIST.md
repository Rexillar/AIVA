# AIVA 4-Hour Sprint Checklist
## Ready-to-Execute Implementation Plan

**Target:** March 1-2, 2026  
**Duration:** 4 hours  
**Team Size:** 1-2 developers

---

## 🎯 Pre-Sprint (15 min)

- [ ] Clone/pull latest AIVA code
- [ ] Review `ANALYSIS_Future_of_Work.md` (5 min)
- [ ] Review `EXECUTIVE_SUMMARY_4Hour_Plan.md` (5 min)
- [ ] Open `IMPLEMENTATION_GUIDE.md` as reference
- [ ] Open MongoDB Compass or terminal
- [ ] Test server startup: `npm run dev`
- [ ] Have Postman ready or curl terminal

**Estimated Time:** 15 minutes  
**Go/No-Go Check:** ✅ Ready

---

## 📂 HOUR 1: Backend Foundation

### Task 1.1: Copy New Files (5 min)
Files created already exist in your workspace:
- [ ] `server/models/source.js` ✅ Created
- [ ] `server/controllers/sourceController.js` ✅ Created
- [ ] `server/routes/sourceRoutes.js` ✅ Created
- [ ] `server/services/knowledgeIndexService.js` ✅ Created

**Status:** ✅ No action needed - files ready

---

### Task 1.2: Register Routes in Server (10 min)

**File:** `server/index.js` or `server/server.js`

```diff
+ import sourceRoutes from './routes/sourceRoutes.js';

// Later in file where routes are registered:
+ app.use('/api/sources', sourceRoutes);
```

- [ ] Add import statement
- [ ] Add route registration
- [ ] Verify no syntax errors
- [ ] Test: `http://localhost:5000/api/sources` → 401 (Unauthorized)

**Expected:** 401 response means route exists, auth is working

---

### Task 1.3: Update Note Model (10 min)

**File:** `server/models/note.js`

Add before closing brace of schema:
```javascript
sources: [{
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Source",
  },
  context: String,
  pageNum: Number,
  addedAt: {
    type: Date,
    default: Date.now,
  },
}],
```

- [ ] Add sources field to Note schema
- [ ] Verify syntax is correct
- [ ] Restart server: `npm run dev`
- [ ] Check: No server startup errors

---

### Task 1.4: Create Database Indexes (10 min)

**In MongoDB terminal or Compass:**

```javascript
// Create indexes for performance
db.sources.createIndex({ workspace: 1, addedBy: 1 });
db.sources.createIndex({ workspace: 1, type: 1 });
db.sources.createIndex({ title: "text", authors: "text" });
db.notes.createIndex({ "sources.sourceId": 1 });
```

- [ ] Connect to MongoDB
- [ ] Run index creation commands
- [ ] Verify: `db.sources.getIndexes()` shows new indexes
- [ ] Note: Indexes can take 1-2 min for large collections

---

### Task 1.5: Test Source API (10 min)

**Using Postman or curl:**

```bash
# Get JWT token first (already have from setup)
TOKEN="your-jwt-token-here"

# Create a source
curl -X POST http://localhost:5000/api/sources \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Source",
    "url": "https://example.com",
    "type": "article",
    "authors": ["John Doe"],
    "workspace": "YOUR_WORKSPACE_ID"
  }'

# Get sources
curl http://localhost:5000/api/sources?workspace=YOUR_WORKSPACE_ID \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] Create test source
- [ ] Verify source has `_id` in response
- [ ] Verify citations generated (apa, mla, chicago)
- [ ] Get all sources and verify count
- [ ] Delete test source

**Success Criteria:**
- ✅ POST returns 201 with source data
- ✅ Citations include all 4 formats
- ✅ GET returns array of sources
- ✅ DELETE removes source

---

## ⏱️ HOUR 2: Integration & Knowledge Hub

### Task 2.1: Add Knowledge Index Endpoint (15 min)

**File:** `server/controllers/workspaceController.js`

Add this function at the end (before exports):
```javascript
export const getWorkspaceKnowledgeIndex = asyncHandler(async (req, res) => {
  const { id: workspaceId } = req.params;
  const { buildKnowledgeIndex } = await import('../services/knowledgeIndexService.js');
  const knowledgeIndex = await buildKnowledgeIndex(workspaceId);
  res.json({ success: true, data: knowledgeIndex });
});
```

- [ ] Add function to workspaceController.js
- [ ] Export the function (verify at bottom of file)
- [ ] No syntax errors

---

### Task 2.2: Register Knowledge Index Route (10 min)

**File:** `server/routes/workspaceRoutes.js`

Add this line with other routes:
```javascript
router.get('/:id/knowledge-index', checkWorkspaceAccess, getWorkspaceKnowledgeIndex);
```

- [ ] Import `getWorkspaceKnowledgeIndex` at top
- [ ] Add route in correct location
- [ ] Restart server
- [ ] No startup errors

---

### Task 2.3: Test Knowledge Index (15 min)

```bash
curl http://localhost:5000/api/workspace/YOUR_WORKSPACE_ID/knowledge-index \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalNotes": 0,
      "totalSources": 1,
      "healthScore": 15
    },
    "topContributors": [],
    "topTopics": [],
    "recommendations": [...]
  }
}
```

- [ ] Get knowledge index response
- [ ] Verify health score calculated
- [ ] Verify recommendations generated
- [ ] Verify contributors listed
- [ ] Try with populated workspace (more data = better test)

---

### Task 2.4: Test Source ↔ Note Linking (15 min)

```bash
# Get a note ID first
WORKSPACE_ID="your-workspace-id"
NOTE_ID="your-note-id"
SOURCE_ID="source-id-from-earlier"

# Link source to note
curl -X POST http://localhost:5000/api/sources/$SOURCE_ID/link/note/$NOTE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"context": "Cited in introduction", "pageNum": 5}'

# Verify note now has source
curl http://localhost:5000/api/notes/$NOTE_ID \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] Link source to note
- [ ] Verify 200 response
- [ ] Get note and verify sources array populated
- [ ] Unlink and verify sources array cleared
- [ ] Link again and verify in knowledge index

---

## 🎨 HOUR 3: Frontend Components

### Task 3.1: Create Source Panel Component (20 min)

**File:** `client/src/components/notes/SourcePanel.jsx`

Component already created in earlier file. Just verify:
- [ ] Create SourcePanel.jsx file
- [ ] Copy code from earlier (provided in IMPLEMENTATION_GUIDE.md)
- [ ] Check imports are correct
- [ ] No TypeScript errors (if using TS)

---

### Task 3.2: Integrate Source Panel into Note Editor (15 min)

**File:** `client/src/components/notes/NoteEditor.jsx`

Add to your note editor (assuming Tiptap):
```jsx
import SourcePanel from './SourcePanel';

export function NoteEditor({ noteId }) {
  return (
    <div className="flex">
      <div className="flex-1">
        {/* Your existing editor */}
      </div>
      <SourcePanel noteId={noteId} sources={note?.sources} />
    </div>
  );
}
```

- [ ] Import SourcePanel component
- [ ] Add to note editor layout
- [ ] Pass noteId prop
- [ ] Pass sources prop from note data
- [ ] Test: Panel appears without errors

---

### Task 3.3: Create Knowledge Hub Dashboard (20 min)

**File:** `client/src/components/workspace/KnowledgeHub.jsx`

Component already provided. Just:
- [ ] Create KnowledgeHub.jsx file
- [ ] Copy code from IMPLEMENTATION_GUIDE.md
- [ ] Install recharts if not already: `npm install recharts`
- [ ] Verify imports resolve

---

### Task 3.4: Add Knowledge Hub Route (10 min)

**File:** `client/src/App.jsx` or your routing file

```jsx
import KnowledgeHub from './components/workspace/KnowledgeHub';

// In routes:
<Route path="/workspace/:id/knowledge" element={<KnowledgeHub />} />
```

- [ ] Add knowledge hub import
- [ ] Add route definition
- [ ] Test navigation to `/workspace/YOUR_ID/knowledge`
- [ ] Verify component loads without errors

---

## 🧪 HOUR 4: Testing & Polish

### Task 4.1: End-to-End Test (20 min)

**User Journey Test:**

1. **Create Source**
   - [ ] Navigate to note editor
   - [ ] In source panel, click "Add Source"
   - [ ] Fill in: Title, URL, Authors, Type
   - [ ] Click save
   - [ ] Verify source appears in panel

2. **Link Source to Note**
   - [ ] In source panel, find created source
   - [ ] Click "Link to this note"
   - [ ] Verify source now shows in note's sources

3. **Generate Citation**
   - [ ] In source panel, click "Copy APA"
   - [ ] Verify clipboard has formatted citation
   - [ ] Try other formats (MLA, Chicago, Harvard)
   - [ ] Paste in document to verify format

4. **View Knowledge Index**
   - [ ] Navigate to workspace knowledge hub
   - [ ] Verify health score displays
   - [ ] Verify contributors listed
   - [ ] Verify topics/tags shown
   - [ ] Verify recommendations generated

- [ ] All 4 flows work end-to-end
- [ ] No console errors
- [ ] No API errors (check Network tab)
- [ ] Performance acceptable (< 2 sec loads)

---

### Task 4.2: Edge Cases & Fixes (15 min)

Test error scenarios:
- [ ] Create source with missing required fields → Error message
- [ ] Get knowledge index for empty workspace → Returns empty arrays
- [ ] Delete source → Automatically unlinks from notes
- [ ] Search sources → Returns filtered results

Fix any issues found:
- [ ] Check browser console for errors
- [ ] Check server logs for errors
- [ ] Fix any broken imports
- [ ] Update error messages if needed

---

### Task 4.3: Documentation Updates (15 min)

- [ ] Update `README.md` with new features
- [ ] Update API documentation (`docs/API_ENDPOINTS.md`)
- [ ] Add example curl requests to docs
- [ ] Document React component usage
- [ ] Add troubleshooting guide

---

### Task 4.4: Final Commit & Deploy (10 min)

```bash
# Stage changes
git add -A

# Commit with descriptive message
git commit -m "feat: Add research copilot with sources, knowledge hub, and privacy docs

- Source model with citation generation (APA, MLA, Chicago, Harvard)
- Knowledge index service with team statistics
- React source panel component
- Knowledge hub dashboard
- Privacy architecture documentation
- Email automation rules model"

# Push to main/dev branch
git push

# Optional: Deploy to staging
npm run build
# Deploy artifacts...
```

- [ ] All files staged
- [ ] Commit message written
- [ ] Pushed to repository
- [ ] Verify all files in git (not ignored by .gitignore)
- [ ] Tests passing (if you have any)

---

## ✅ Post-Sprint Verification

After completing 4 hours, verify you have:

### Backend Features
- ✅ Source model with all fields
- ✅ Source CRUD API (Create, Read, Update, Delete)
- ✅ Citation generation in 4 formats
- ✅ Source ↔ Note linking
- ✅ Knowledge index service
- ✅ Workspace knowledge endpoint
- ✅ All endpoints JWT-protected

### Frontend Features
- ✅ Source panel in note editor
- ✅ Add/remove sources from UI
- ✅ Copy citations to clipboard
- ✅ Knowledge hub dashboard
- ✅ Health score displayed
- ✅ Top contributors shown
- ✅ Topics/tags listed
- ✅ Responsive design

### Documentation
- ✅ Privacy architecture documented
- ✅ API reference updated
- ✅ Implementation guide written
- ✅ Troubleshooting guide created
- ✅ Example requests provided

### Code Quality
- ✅ No console errors
- ✅ No server errors
- ✅ All imports resolve
- ✅ Proper error handling
- ✅ Comments on complex code
- ✅ Code follows project style

---

## 🎉 Sprint Success Criteria

You've succeeded if:

1. **Sources work:** Can create, read, link to notes, generate citations ✅
2. **Knowledge hub works:** Displays stats, contributors, recommendations ✅
3. **UI is intuitive:** Components integrate smoothly, no jarring UX ✅
4. **Documentation is clear:** Others can understand and extend features ✅
5. **Code is clean:** Follows AIVA patterns, properly commented ✅
6. **Performance is good:** Pages load in < 2 seconds ✅
7. **Privacy is documented:** Users understand data handling ✅
8. **Git is clean:** All changes committed with clear messages ✅

---

## 🚨 If You Get Stuck

### Problem: "Source model not found"
**Solution:** Check import path in controller, verify file exists

### Problem: "Unknown field: sources"
**Solution:** Reload your MongoDB schema, restart server, clear browser cache

### Problem: "401 Unauthorized"
**Solution:** Make sure you're including JWT token in Authorization header

### Problem: "Knowledge index returns empty"
**Solution:** Normal for new workspace! Create some notes and sources first

### Problem: "Components won't render"
**Solution:** Check React console for errors, verify imports, check Node version (need 16+)

**For detailed troubleshooting:** See IMPLEMENTATION_GUIDE.md

---

## 📊 Time Allocation Summary

```
Hour 1: Backend Foundation
├─ Routes + Files: 10 min ✅
├─ Note Model Update: 10 min
├─ Database Indexes: 10 min
├─ API Testing: 10 min
├─ Buffer: 10 min
└─ Total: 60 min

Hour 2: Integration & Knowledge
├─ Knowledge Endpoint: 15 min
├─ Route Registration: 10 min
├─ Knowledge Testing: 15 min
├─ Source↔Note Testing: 15 min
├─ Buffer: 5 min
└─ Total: 60 min

Hour 3: Frontend
├─ Source Panel: 20 min
├─ Integration: 15 min
├─ Knowledge Hub: 20 min
├─ Routing: 10 min
└─ Total: 65 min (trim to 60 min)

Hour 4: Testing & Polish
├─ E2E Testing: 20 min
├─ Bug Fixes: 15 min
├─ Documentation: 15 min
├─ Git Commit: 10 min
└─ Total: 60 min

Grand Total: 245 minutes (4h 5m)
```

---

## 🎯 Success Timeline

```
0:00 - 0:15   → Setup complete, ready to code
0:15 - 1:15   → Backend foundation done ✅
1:15 - 2:15   → Integration complete ✅
2:15 - 3:20   → Frontend done ✅
3:20 - 4:05   → Testing complete ✅
4:05 - 4:15   → Final polish & commit ✅
```

---

## 💪 You've Got This!

**Key Reminder:** All the code is provided. You're not inventing—you're integrating and testing. 

**The hardest parts:**
- Debugging import paths (very solvable)
- Styling React components (very easy)
- Testing endpoints (very straightforward)

**The easiest parts:**
- Copying code (just paste)
- Following step-by-step guide (already written)
- Running tests (provided curl commands)

**Expected Challenges:**
- Maybe 1-2 typos in imports (5 min to fix)
- Maybe schema conflicts (restart MongoDB)
- Maybe style fixes needed (10 min)

**None of these are blockers.** You'll have support via:
- IMPLEMENTATION_GUIDE.md (detailed)
- ANALYSIS_Future_of_Work.md (architectural)
- Troubleshooting section (common issues)

---

## 🚀 Ready to Launch?

1. ✅ Review this checklist
2. ✅ Open IMPLEMENTATION_GUIDE.md
3. ✅ Start Hour 1, Task 1.1
4. ✅ Follow each task in order
5. ✅ Mark items as complete ✓
6. ✅ If stuck, check troubleshooting
7. ✅ Celebrate when done! 🎉

**3... 2... 1... SPRINT START!** 🏃‍♂️

---

**Generated:** March 1, 2026  
**Status:** 🟢 READY TO EXECUTE  
**Confidence Level:** 95% (very achievable)  
**Estimated Completion:** 4-5 hours
