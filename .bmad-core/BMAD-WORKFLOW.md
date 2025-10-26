# BMAD Workflow Guide

## Your Simple 4-Step Process

### 1️⃣ **Planning Phase** (with PM Agent)
```bash
/BMad:agents:pm
```

**What to do:**
- Review PRD for next story
- Let PM create detailed story specification
- Review and approve story before coding

**PM creates:**
- `docs/stories/story-X.X-name.md` (detailed spec)
- Acceptance criteria
- Technical specifications
- Testing requirements

**✅ Done when:** Story file created and you've reviewed it

---

### 2️⃣ **Development Phase** (with Dev Agent)
```bash
/BMad:agents:dev
```

**What to do:**
- Reference the story file: `@docs/stories/story-X.X-name.md`
- Let Dev implement according to story spec
- Dev runs tests and verifies acceptance criteria

**Dev creates:**
- Code files
- Tests
- Updates to existing files

**✅ Done when:** All acceptance criteria met, tests passing

---

### 3️⃣ **Git Workflow Phase** (with Git Agent)
```bash
/BMad:agents:git
```

**What to do:**
- Review changes with Git agent
- Create meaningful commit message
- Push to GitHub
- Create pull request

**Git creates:**
- Git commit with conventional commit format
- GitHub pull request with summary
- Branch management

**✅ Done when:** PR created and ready for review/merge

---

### 4️⃣ **Story Completion Phase** (with PM Agent)
```bash
/BMad:agents:pm
```

**What to do:**
- Update story status to "Complete"
- Mark PRD progress
- Identify next story

**PM updates:**
- Story file (add "Status: Complete" + completion notes)
- PRD change log (if needed)
- Next story identification

**✅ Done when:** Story marked complete, ready for next story

---

## Quick Checklist for Each Story

```markdown
- [ ] 1. PM: Create story specification
- [ ] 2. Review & approve story spec
- [ ] 3. Dev: Implement story (code + tests)
- [ ] 4. Verify all acceptance criteria met
- [ ] 5. All tests passing
- [ ] 6. Git: Commit changes
- [ ] 7. Git: Create pull request
- [ ] 8. PM: Mark story complete
- [ ] 9. PM: Identify next story
```

---

## Common Mistakes to Avoid

❌ **Don't:** Start coding without a story spec
❌ **Don't:** Skip tests ("I'll add them later")
❌ **Don't:** Mark story complete without verifying acceptance criteria
❌ **Don't:** Create multiple stories ahead (focus on one at a time)

✅ **Do:** Follow the 4-step process for every story
✅ **Do:** Let PM guide what to build next
✅ **Do:** Reference story files when working with Dev
✅ **Do:** Verify tests pass before committing

---

## Your Current Position

**Epic 1: Life Domain Architecture Migration**

**Completed Stories:**
- ✅ Story 1.1: Foundation - Domain Data Models (Backend)
- ✅ Story 1.2: GridFS Document Storage (Backend)
- ✅ Story 1.3: Domain Record Management & Validation (Backend)

**Current Story:**
- 🎯 Story 1.4: Property Domain UI (Frontend) - **READY TO CREATE**

**Next Up:**
- ⏳ Story 1.5: Vehicles Domain UI
- ⏳ Story 1.6: Finance Domain UI
- ⏳ Story 1.7+: Remaining domains + cross-domain features

---

## Agent Command Quick Reference

```bash
# Product Management (planning, stories, PRD)
/BMad:agents:pm

# Development (coding, tests, implementation)
/BMad:agents:dev

# Git Operations (commits, PRs, branches)
/BMad:agents:git

# Quality Assurance (testing, validation)
/BMad:agents:qa

# Code Review (PR reviews, feedback)
/BMad:agents:code-review
```

---

## When You Get Confused

**Ask yourself:**
1. Do I have a story spec for what I'm about to build? → If no, use `/BMad:agents:pm`
2. Am I ready to code? → Use `/BMad:agents:dev` with story reference
3. Is coding done and tested? → Use `/BMad:agents:git`
4. Is the story truly complete? → Use `/BMad:agents:pm` to verify and close

**Golden Rule:** One story at a time, following the 4-step process.

---

**Created:** 2025-10-04
**For Project:** LegacyLock Life Domain Architecture
**Epic:** Epic 1 - Life Domain Architecture Migration
