# 🛡️ Branch Protection Flow Diagram

## How Your Protected Repository Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTRIBUTOR WORKFLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. Fork Repository
   │
   ├─► Clone to Local
   │   $ git clone https://github.com/contributor/NutriGuide.git
   │
2. Create Feature Branch
   │   $ git checkout -b feature/new-feature
   │
3. Make Changes
   │   - Edit files
   │   - Test locally
   │   - Commit changes
   │   $ git commit -m "feat: add new feature"
   │
4. Push to Fork
   │   $ git push origin feature/new-feature
   │
5. Create Pull Request on GitHub
   │
   ├─► AUTOMATED CHECKS START ✓
   │   │
   │   ├─► Branch Protection Checks
   │   │   ├─ Valid branch name?
   │   │   ├─ PR description exists?
   │   │   ├─ No merge conflicts?
   │   │   ├─ No sensitive files?
   │   │   └─ Commit messages valid?
   │   │
   │   ├─► Auto-Labeling
   │   │   ├─ Label by branch type
   │   │   ├─ Label by files changed
   │   │   └─ Label by PR size
   │   │
   │   ├─► CI/CD Tests
   │   │   ├─ Backend tests
   │   │   ├─ Frontend tests
   │   │   ├─ ML service tests
   │   │   └─ Code quality checks
   │   │
   │   └─► CODEOWNERS Assignment
   │       └─ You (maintainer) auto-assigned
   │
6. YOU GET NOTIFIED 📧
   │
   ├─► Review Code
   │   │
   │   ├─► Option 1: REQUEST CHANGES
   │   │   │
   │   │   ├─► Contributor makes changes
   │   │   │   $ git add .
   │   │   │   $ git commit -m "fix: address review"
   │   │   │   $ git push origin feature/new-feature
   │   │   │
   │   │   └─► Tests run again → Back to Review
   │   │
   │   └─► Option 2: APPROVE ✅
   │       │
   │       ├─► Check if all requirements met:
   │       │   ├─ ✓ At least 1 approval (yours)
   │       │   ├─ ✓ All tests passing
   │       │   ├─ ✓ No merge conflicts
   │       │   ├─ ✓ All conversations resolved
   │       │   └─ ✓ Branch up to date
   │       │
   │       └─► CAN MERGE! ✓
   │
7. Merge Pull Request
   │   - Squash and merge (recommended)
   │   - Rebase and merge
   │   - Merge commit
   │
8. Main Branch Updated ✅
   │
   └─► MAIN BRANCH STAYS SAFE! 🛡️


┌─────────────────────────────────────────────────────────────────┐
│                  WHAT'S BLOCKED (PROTECTION)                    │
└─────────────────────────────────────────────────────────────────┘

❌ Direct Push to Main
   $ git push origin main
   ERROR: Protected branch update failed
   
   Why: Everyone must use Pull Requests

❌ Force Push
   $ git push --force origin main
   ERROR: Protected branch update failed
   
   Why: Preserves history, prevents accidents

❌ Delete Branch
   $ git push origin --delete main
   ERROR: Protected branch update failed
   
   Why: Main branch is permanent

❌ Merge Without Approval
   ERROR: Review required
   
   Why: Code must be reviewed before merging

❌ Merge With Failing Tests
   ERROR: Required status checks must pass
   
   Why: Quality assurance before merge

❌ Merge With Conflicts
   ERROR: Resolve merge conflicts first
   
   Why: Ensures clean merges


┌─────────────────────────────────────────────────────────────────┐
│                    PROTECTION LAYERS                            │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Branch Rules (GitHub Settings)
├─ Require Pull Request
├─ Require Approvals (1+)
├─ Require Status Checks
├─ Require Conversation Resolution
├─ No Force Pushes
└─ No Deletions

Layer 2: Automated Workflows
├─ branch-protection.yml (validation)
├─ ci.yml (tests)
├─ label-pr.yml (organization)
└─ review-required.yml (enforcement)

Layer 3: CODEOWNERS
├─ Auto-assigns reviewers
├─ Requires owner approval
└─ Organized by area

Layer 4: Status Checks
├─ Backend tests must pass
├─ Frontend tests must pass
├─ ML tests must pass
└─ Code quality checks must pass


┌─────────────────────────────────────────────────────────────────┐
│                     WORKFLOW EXAMPLE                            │
└─────────────────────────────────────────────────────────────────┘

Real-world scenario:

User: John wants to add a new feature
│
├─ John forks NutriGuide
├─ Creates branch: feature/meal-favorites
├─ Adds "favorite meals" functionality
├─ Commits: "feat: add meal favorites feature"
├─ Pushes to his fork
│
└─► Creates PR on your repo
    │
    ├─► Automated checks run:
    │   ├─ ✅ Branch name valid (feature/...)
    │   ├─ ✅ PR description complete
    │   ├─ ✅ No conflicts
    │   ├─ ✅ No .env files
    │   ├─ ✅ Backend tests pass
    │   ├─ ✅ Frontend tests pass
    │   └─ 🔄 Waiting for review
    │
    ├─► You get email/notification
    │
    ├─► You review code:
    │   - Check implementation
    │   - Test locally (optional)
    │   - Leave comments
    │
    ├─► Request minor changes:
    │   "Can you add tests for this?"
    │
    ├─► John updates PR:
    │   - Adds tests
    │   - Pushes changes
    │   - Tests run again
    │
    ├─► You review again:
    │   - Tests look good!
    │   - Click "Approve"
    │
    └─► Merge!
        - Main branch updated
        - John's feature is live
        - Main branch stayed safe throughout! ✅


┌─────────────────────────────────────────────────────────────────┐
│                    EMERGENCY BYPASS                             │
└─────────────────────────────────────────────────────────────────┘

If you REALLY need to push directly (emergency only):

1. Settings → Branches → Edit rule
2. Uncheck "Include administrators"
3. Push your fix
4. IMMEDIATELY re-enable protection!

Better approach: Create hotfix PR
├─ git checkout -b hotfix/critical-bug
├─ Make fix
├─ Create PR
├─ Self-review and approve
└─ Merge quickly


┌─────────────────────────────────────────────────────────────────┐
│                       BENEFITS                                  │
└─────────────────────────────────────────────────────────────────┘

✅ Code Quality
   - Every change reviewed
   - Tests run before merge
   - Quality standards maintained

✅ Safety
   - Can't accidentally break main
   - History preserved
   - Easy to revert if needed

✅ Collaboration
   - Clear review process
   - Documented discussions
   - Team accountability

✅ Transparency
   - All changes visible
   - Review comments public
   - Contribution history clear

✅ Learning
   - Contributors learn from reviews
   - Best practices shared
   - Knowledge transfer happens


┌─────────────────────────────────────────────────────────────────┐
│                      STATUS INDICATORS                          │
└─────────────────────────────────────────────────────────────────┘

PR Status Badges You'll See:

🟢 All checks passed
   ✓ Ready to merge

🟡 Some checks pending
   ⏳ Tests running...

🔴 Some checks failed
   ✗ Fix required

⚫ Review required
   👥 Waiting for approval

💬 Conversation not resolved
   🗨️ Address comments

⬆️ Branch not up to date
   🔄 Needs rebase


┌─────────────────────────────────────────────────────────────────┐
│                    QUICK REFERENCE                              │
└─────────────────────────────────────────────────────────────────┘

Commands:
├─ Create branch: git checkout -b feature/name
├─ Commit: git commit -m "type: message"
├─ Push: git push origin feature/name
├─ Update: git fetch origin main && git rebase origin/main
└─ Can't push to main: ✓ Working as intended!

GitHub:
├─ Create PR: Compare & pull request
├─ Request review: Assign reviewers (auto-assigned)
├─ Address comments: Make changes, push again
├─ Merge: After approval + tests pass
└─ Close: If PR not needed

Protection:
├─ Who can push to main: Nobody (only via PR)
├─ Who can approve: You (CODEOWNERS)
├─ Required approvals: 1+
├─ Required checks: All must pass
└─ Override: Only in emergencies


═══════════════════════════════════════════════════════════════════
                    YOUR REPOSITORY IS PROTECTED! 🛡️
═══════════════════════════════════════════════════════════════════
```

## Visual Summary

```
┌──────────────────────────────────────────┐
│         BEFORE (Unprotected)             │
│                                          │
│  Anyone → Push → Main Branch ❌          │
│  (Accidents happen, code breaks)        │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│          AFTER (Protected) ✅             │
│                                          │
│  Contributor                             │
│      ↓                                   │
│  Create PR                               │
│      ↓                                   │
│  Automated Tests                         │
│      ↓                                   │
│  Your Review                             │
│      ↓                                   │
│  Approval                                │
│      ↓                                   │
│  Main Branch (Safe!) 🛡️                  │
└──────────────────────────────────────────┘
```
