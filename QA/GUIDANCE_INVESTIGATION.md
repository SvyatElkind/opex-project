# Guidance Module — Investigation & Redesign Plan

**Date:** 2026-03-26

---

## Current System Overview

The guidance system has 3 layers:

### 1. useWorkflowState.js — "Where are you?"
Calculates a linear progress score (0-100%) based on completed steps:
```
Project Created (10) → Report Uploaded (15) → Signers Done (10) →
Inventories Created (15) → Items Created (15) → Records Created (15) →
Files Uploaded (10) → Validated (10) = 100%
```

**Problem:** This is a **binary checklist** — it checks "does at least ONE inventory have items?" not "do ALL inventories have the RIGHT NUMBER of items." It can't tell you "you need 3 more items in US #2."

### 2. useNextActions.js — "What should you do next?"
Generates a priority-sorted list of actions:
- Fix critical errors (validation)
- Add signers
- Add items to empty inventories
- Add records to items without records
- Upload files to records without files
- Review warnings

**Problems:**
1. **Actions have empty handlers** — The `action: () => {}` functions don't actually navigate. They set `targetInventoryId`/`targetItemId` props but SmartGuideCard doesn't use them for navigation.
2. **No granularity** — "Add items to 5 inventories" doesn't tell you WHICH inventory, or how many items each needs.
3. **No awareness of Roadmap goals** — If the user set a goal of 50 items and has 49, useNextActions doesn't know.
4. **Threshold limits** — `itemsWithoutRecords.length <= 5` caps suggestions at 5. Projects with 100 items get no guidance.
5. **Never imported** — useNextActions is defined but NEVER imported by any component. It's dead code.

### 3. SmartGuideCard.jsx — "The UI"
A bottom-right floating card showing:
- Route progress bars (items/records/files vs targets)
- Per-inventory validation issues (errors + warnings)
- Item-grouped error messages

**Problems:**
1. **Shows validation results, not actionable guidance** — Lists errors but doesn't suggest specific next steps.
2. **No "do this now" button** — Shows what's wrong but doesn't offer to open the right form.
3. **No awareness of what was just completed** — After creating an item, it doesn't say "now create a record for that item."
4. **Route-centric** — Only works if user created a Roadmap route. No guidance without a route.

### 4. VerificationModal.jsx Ceļvedis tab — "Route progress"
Shows the same route progress + issues in a table format inside the modal.

---

## What's Missing — The User's Real Workflow

Let me trace what a user actually does and what they'd want:

### Scenario: User wants 50 textual electronic items, each with 1 record + 1 file

**Current experience:**
1. User creates project → ✅ Guided (workflow state says "upload report")
2. User uploads report → ✅ Guided ("add signers")
3. User adds signers → ✅ Guided ("create inventories")
4. User creates inventory → ... now what?
5. User creates item #1 → SmartGuideCard shows "49/50 GV" progress bar. That's it. No button to create item #2.
6. User creates item #50 → SmartGuideCard shows "50/50 GV ✓". But now user needs records.
7. User creates record in item #1 → Where's item #2? User has to manually navigate to each item.
8. User creates record in item #50 → Now files. Same manual process for 50 files.

**Ideal experience:**
1-3: Same (works fine)
4. After creating inventory → **"Izveidot GV šajā US"** button → opens Item Create form pre-targeted
5. After creating item #1 → **"Izveidot dokumentu šajā GV"** button → opens Record Create for that item
6. After creating record → **"Augšupielādēt datni"** button → opens file upload for that record
7. After uploading file → **"Nākamā GV bez dokumenta: GV #2"** → navigates to item #2 and opens Record Create
8. Repeat until all items have records+files
9. **"Visi ieraksti aizpildīti! Pārbaudīt projektu →"** button → opens Verification

---

## What a Smart Guidance System Would Do

### Principle: Always show ONE clear next action

Instead of a list of issues, the guidance should show:
1. **What to do NOW** — Single primary action with a button
2. **Context** — Why this action matters (e.g., "3/50 GV izveidotas")
3. **After this** — What comes next (preview of next 2-3 steps)

### The Smart Queue

The system should maintain a **work queue** — an ordered list of specific tasks:

```
Queue for US #1 (Tekstuāls, elektronisks):
  [✓] Create US #1
  [✓] Create GV #1 in US #1
  [ ] Create Dok. in GV #1          ← CURRENT (show button: "Izveidot dokumentu")
  [ ] Upload datne to Dok. in GV #1
  [ ] Create GV #2 in US #1
  [ ] Create Dok. in GV #2
  [ ] Upload datne to Dok. in GV #2
  ... (repeat for all 50 items)
```

### What the button would do

Each action in the queue maps to a specific navigation + form open:

| Action | Navigation | Form Opened |
|--------|-----------|-------------|
| Create GV | Navigate to inventory | Open CreateItemNavigable |
| Create Dok. (textual) | Navigate to item | Open CreateDocumentRecord |
| Create Dok. (media) | Navigate to item | Open CreateMediaRecord |
| Upload datne | Navigate to record → files tab | Focus on dropzone |
| Add metadata | Navigate to record → metadata tab | Focus on add button |
| Fix error | Navigate to entity with error | Highlight error field |

### How it would determine the next action

```javascript
function getNextAction(projectData, route) {
  const inventories = getRelevantInventories(projectData, route);

  for (const inventory of inventories) {
    // Does this inventory need more items?
    const itemTarget = route.goals.totalItems;
    const itemCount = inventory.items?.length || 0;

    if (itemCount < itemTarget) {
      return {
        type: 'CREATE_ITEM',
        inventoryId: inventory.id,
        message: `Izveidot GV (${itemCount}/${itemTarget})`,
        button: 'Izveidot GV'
      };
    }

    // All items exist — do any need records?
    for (const item of inventory.items) {
      const hasRecord = item.records?.length > 0 ||
                       item.photo_records?.length > 0 ||
                       item.video_records?.length > 0 ||
                       item.audio_records?.length > 0;

      if (!hasRecord) {
        return {
          type: 'CREATE_RECORD',
          inventoryId: inventory.id,
          itemId: item.id,
          message: `Izveidot dokumentu GV #${item.number}`,
          button: inventory.type === 'Tekstuāls' ? 'Izveidot Dok.' : `Augšupielādēt ${inventory.type}`
        };
      }

      // Has record — does it need files? (electronic only)
      if (inventory.electronic) {
        const records = item.records || [];
        for (const record of records) {
          if (!record.files || record.files.length === 0) {
            return {
              type: 'UPLOAD_FILE',
              inventoryId: inventory.id,
              itemId: item.id,
              recordId: record.id,
              message: `Augšupielādēt datni Dok. "${record.title || record.reg_nr}"`,
              button: 'Augšupielādēt datni'
            };
          }
        }
      }
    }
  }

  // Everything complete!
  return {
    type: 'VERIFY',
    message: 'Visi dati ievadīti! Pārbaudiet projektu.',
    button: 'Pārbaudīt'
  };
}
```

---

## Problems with InheritanceUtils Integration

The current SmartGuideCard builds its own validation by walking `validationResult.inventoryValidations`. This is **separate from** the guidance logic. The two systems don't talk to each other:

- **InheritanceUtils** knows: category, required fields, file type constraints, record limits
- **useWorkflowState** knows: linear progress through project lifecycle
- **SmartGuideCard** knows: route progress (items/records/files counts vs targets)
- **useNextActions** knows: what generic actions are missing (dead code, never used)

**Nobody knows:** "What is the SPECIFIC next thing THIS user should do right now?"

---

## Proposed Architecture

```
                    ┌─────────────────────┐
                    │   RoadmapContext     │
                    │   (goals/targets)    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  useGuidanceEngine  │ ← NEW: The smart queue
                    │  - scans project    │
                    │  - builds work queue │
                    │  - returns:         │
                    │    currentAction    │
                    │    nextActions[2-3] │
                    │    progress %       │
                    │    completedCount   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                 │
    ┌─────────▼─────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │ SmartGuideCard │  │ Verification│  │ (Future)    │
    │ (bottom-right) │  │ Modal Guide │  │ Step-by-step│
    │ Shows current  │  │ tab         │  │ wizard      │
    │ action + button│  │             │  │             │
    └───────────────┘  └─────────────┘  └─────────────┘
```

### useGuidanceEngine hook

Would replace both `useWorkflowState` and `useNextActions`:

```javascript
const {
  currentAction,    // { type, message, button, navigate() }
  nextActions,      // Next 2-3 actions preview
  progress,         // { items: 45/50, records: 40/50, files: 38/50, overall: 82% }
  queue,            // Full work queue (for debugging/display)
  skipAction,       // Skip current action (move to next)
  completedToday,   // How many actions completed this session
} = useGuidanceEngine(projectData, validationResult, route);
```

### SmartGuideCard redesign

Instead of showing a list of errors, it would show:

```
┌──────────────────────────────────────┐
│ 📋 Nākamā darbība                    │
│                                      │
│ Izveidot dokumentu GV #23            │
│ US #1 (Tekstuāls) → GV #23          │
│                                      │
│ [ Izveidot Dok. → ]                  │
│                                      │
│ Progress: ████████░░ 82%             │
│ GV: 50/50 ✓  Dok: 40/50  Datnes: 38/50 │
│                                      │
│ Nākamās: Upload datni → Create Dok. GV #24 │
└──────────────────────────────────────┘
```

The **"Izveidot Dok. →"** button would:
1. Navigate to US #1 → GV #23
2. Open the CreateDocumentRecord form
3. After record is created, auto-advance guidance to "Upload datni"

---

## What to Implement (Priority Order)

### Phase 1: Make existing actions work
- Wire `useNextActions` into SmartGuideCard (currently dead code)
- Make action buttons actually navigate + open forms
- Remove the 5-item threshold limit

### Phase 2: Build useGuidanceEngine
- Smart queue that walks the tree: inventory → item → record → file
- Compares against Roadmap targets
- Returns single current action with navigation function

### Phase 3: Redesign SmartGuideCard
- Single "next action" display with big button
- Progress bars below
- "Skip" and "Ignore" controls
- Preview of next 2-3 actions

### Phase 4: Auto-advance
- After completing an action (creating item, record, file), automatically advance to next
- Listen for React Query mutation success events
- Update guidance in real-time

---

## Summary

The current guidance system is a **passive reporter** — it tells you what's wrong but doesn't help you fix it. The proposed system is an **active assistant** — it tells you exactly what to do next and takes you there with one click. The key missing piece is the **work queue** that walks the project tree and generates specific, actionable, navigable tasks.
