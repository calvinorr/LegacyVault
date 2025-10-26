# 🚀 BMAD Quick Start Card

**Paste this into your IDE when you open the project!**

---

## 📍 Where Am I?

**Current Story:** Story 1.4 - Property Domain UI
**Story File:** `docs/stories/story-1.4-property-domain-ui.md`
**Status:** Ready to start (Draft)

**Quick Check:**
```bash
# See your todo list
cat .bmad-core/MY-TODO.md

# Read story specification
cat docs/stories/story-1.4-property-domain-ui.md

# See full BMAD workflow
cat .bmad-core/BMAD-WORKFLOW.md
```

---

## 🎯 Today's Goal

Build the **Property Domain UI** - homepage with 8 domain cards + Property record management.

**What to build:**
1. Homepage with domain cards (only Property enabled)
2. Property domain page (list records)
3. Property record form (create/edit)
4. Property record detail view (view/delete)

**Time estimate:** 8-12 hours (spread across 2-3 sessions)

---

## 🏃 Quick Start (3 Steps)

### 1. Start Servers
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd web && npm run dev
```

### 2. Read Story File
```bash
# Open this file in your editor
docs/stories/story-1.4-property-domain-ui.md
```

### 3. Get Dev Agent
```bash
# In Claude Code, type:
/BMad:agents:dev

# Then say:
"Implement Story 1.4: @docs/stories/story-1.4-property-domain-ui.md"
```

---

## 🤖 BMAD Agent Commands

| Command | When to Use |
|---------|-------------|
| `/BMad:agents:pm` | Create stories, review PRD, plan next steps |
| `/BMad:agents:dev` | Implement code for current story |
| `/BMad:agents:git` | Commit changes, create PRs |
| `/BMad:agents:qa` | Review code quality, run tests |

---

## ✅ Session Checklist

Before you start coding:
- [ ] Both servers running (backend :3000, frontend :5173)
- [ ] Read Story 1.4 specification completely
- [ ] MongoDB connected (check backend terminal)
- [ ] Story file open in editor

While coding:
- [ ] Reference story file for acceptance criteria
- [ ] Test frequently (don't wait until end)
- [ ] Check `.bmad-core/MY-TODO.md` to track progress

Before finishing:
- [ ] All acceptance criteria met
- [ ] Tests passing (frontend + backend regression)
- [ ] No console errors
- [ ] Update `.bmad-core/MY-TODO.md` progress

---

## 🔥 Story 1.4 Fast Checklist

**Session 1 (Homepage):**
- [ ] Create HomePage with 8 domain cards
- [ ] Only Property card clickable
- [ ] Test responsive design

**Session 2 (Property CRUD):**
- [ ] Property domain page shows records
- [ ] Add Record form works
- [ ] Form validates UK postcodes

**Session 3 (Detail & Polish):**
- [ ] Record detail view works
- [ ] Edit/delete functionality
- [ ] Write tests (min 10)
- [ ] Git commit + PR

---

## 🆘 Help Shortcuts

**Stuck on what to build?**
→ Read: `docs/stories/story-1.4-property-domain-ui.md`

**Forgot BMAD workflow?**
→ Read: `.bmad-core/BMAD-WORKFLOW.md`

**Need to see progress?**
→ Read: `.bmad-core/MY-TODO.md`

**Tests failing?**
→ Don't commit! Fix tests first

**Story unclear?**
→ Use `/BMad:agents:pm` to clarify

---

## 🎓 Remember

1. **One story at a time** (currently: Story 1.4)
2. **Read story file before coding**
3. **Test frequently**
4. **Commit when done**
5. **Trust the BMAD process**

---

**Ready to code?** Read Story 1.4 and get started! 🚀

**File:** `docs/stories/story-1.4-property-domain-ui.md`
