# Branch Protection & Repository Settings

This document outlines how to set up branch protection rules to keep your main branch safe.

## 🛡️ Why Branch Protection?

Branch protection ensures:
- ✅ All code is reviewed before merging
- ✅ Tests must pass before merging
- ✅ No direct pushes to main branch
- ✅ Code quality is maintained
- ✅ No accidental deletions
- ✅ History is preserved

## 🔧 Setting Up Branch Protection (GitHub)

### Step-by-Step Setup

1. **Go to Repository Settings**
   - Navigate to your repository on GitHub
   - Click `Settings` (top right)
   - Click `Branches` (left sidebar)

2. **Add Branch Protection Rule**
   - Click `Add rule` or `Add branch protection rule`
   - Branch name pattern: `main` (or `master`)

3. **Enable These Settings:**

#### Required Settings ✅

- [x] **Require a pull request before merging**
  - [x] Require approvals: **1** (or more for larger teams)
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners

- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Add these status checks:
    - `backend-test`
    - `frontend-test`
    - `ml-test`
    - `code-quality`

- [x] **Require conversation resolution before merging**
  - All comments must be resolved

- [x] **Require signed commits** (optional but recommended)

- [x] **Require linear history** (optional - prevents merge commits)

- [x] **Include administrators**
  - Even admins must follow these rules

- [x] **Restrict who can push to matching branches**
  - Nobody can push directly to main
  - Only PRs can update main

- [x] **Allow force pushes: OFF**
  - Prevents history rewriting

- [x] **Allow deletions: OFF**
  - Prevents accidental branch deletion

4. **Click `Create` or `Save changes`**

## 📋 Quick Settings Summary

```
Branch name pattern: main

✅ Require pull request before merging
   - Required approvals: 1+
   - Dismiss stale reviews: Yes
   - Require Code Owners review: Yes

✅ Require status checks to pass
   - Require up to date branch: Yes
   - Status checks: backend-test, frontend-test, ml-test

✅ Require conversation resolution: Yes

✅ Include administrators: Yes

✅ Restrict who can push: Yes
   - Allowed: Nobody (only via PR)

✅ Allow force pushes: No

✅ Allow deletions: No
```

## 👥 Code Owners Setup

We've created a `.github/CODEOWNERS` file that automatically assigns reviewers.

### How it Works

When a PR is created, GitHub automatically:
1. Requests review from code owners
2. Requires their approval before merging
3. Notifies them of changes

### File Structure

```
# Global owners - review everything
* @rumi097

# Backend code
/backend/ @rumi097 @backend-team

# Frontend code  
/frontend/ @rumi097 @frontend-team

# ML service
/ml-service/ @rumi097 @ml-team

# Documentation
*.md @rumi097 @docs-team

# Configuration files
*.json @rumi097
*.yml @rumi097
*.yaml @rumi097

# Security-sensitive files
.github/ @rumi097
```

## 🔄 Workflow with Branch Protection

### For Contributors

1. **Fork the repository**
   ```bash
   # Clone your fork
   git clone https://github.com/rumi097/NutriGuide.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: your feature"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature
   ```

5. **Create Pull Request**
   - Go to GitHub
   - Click "Compare & pull request"
   - Fill out PR template
   - Wait for:
     - ✅ CI tests to pass
     - ✅ Code review approval
     - ✅ All conversations resolved

6. **Make requested changes**
   ```bash
   # Make changes
   git add .
   git commit -m "fix: address review comments"
   git push origin feature/your-feature
   ```

7. **Merge**
   - After approval and passing tests
   - Maintainer will merge (or you can if you have permission)

### For Maintainers

1. **Review Pull Requests**
   - Check code quality
   - Verify tests pass
   - Test locally if needed
   - Provide constructive feedback

2. **Request Changes if Needed**
   - Use GitHub's "Request changes" feature
   - Be specific about what needs fixing
   - Suggest improvements

3. **Approve when Ready**
   - Click "Approve" in PR review
   - Add positive feedback

4. **Merge**
   - Choose merge strategy:
     - **Squash and merge** (recommended) - Clean history
     - **Rebase and merge** - Linear history
     - **Merge commit** - Preserve all commits

## 🚫 What Branch Protection Prevents

### ❌ Direct Pushes to Main

```bash
# This will be REJECTED
git checkout main
git commit -m "quick fix"
git push origin main
# Error: protected branch hook declined
```

### ❌ Force Pushing

```bash
# This will be REJECTED
git push --force origin main
# Error: protected branch hook declined
```

### ❌ Branch Deletion

```bash
# This will be REJECTED
git push origin --delete main
# Error: protected branch hook declined
```

### ❌ Merging Without Review

- PR cannot be merged without approval
- PR cannot be merged if tests fail
- PR cannot be merged with unresolved comments

## ✅ What's Allowed

### ✅ Creating Pull Requests

Everyone can create PRs from their branches

### ✅ Updating Your Branch

```bash
# Update your feature branch
git checkout feature/your-feature
git fetch origin
git rebase origin/main
git push --force origin feature/your-feature
```

### ✅ Merging After Approval

Once approved and tests pass, PRs can be merged

## 🔐 Additional Security

### Require Signed Commits

Add this to your `.git/config`:

```ini
[commit]
    gpgsign = true
```

Or globally:

```bash
git config --global commit.gpgsign true
```

### Enable Vulnerability Alerts

1. Go to Settings → Security & analysis
2. Enable:
   - Dependency graph
   - Dependabot alerts
   - Dependabot security updates
   - Code scanning alerts

### Enable Secret Scanning

GitHub automatically scans for:
- API keys
- Tokens
- Passwords
- Private keys

## 📊 Monitoring

### Check Branch Protection Status

Go to: Settings → Branches → View rule

### View Protected Branch Activity

- Insights → Network
- Shows branch relationships
- Displays PR merges

## 🆘 Emergency: Bypassing Protection

**Only for critical emergencies!**

### Temporarily Disable Protection

1. Settings → Branches
2. Edit rule
3. Uncheck "Include administrators"
4. Make emergency fix
5. **Immediately re-enable protection**

### Better Approach: Hotfix PR

```bash
# Create hotfix branch
git checkout -b hotfix/critical-bug

# Fix and commit
git add .
git commit -m "hotfix: critical bug"

# Push
git push origin hotfix/critical-bug

# Create emergency PR
# Request immediate review
# Fast-track approval
```

## 📱 Mobile App Support

Branch protection also works with:
- GitHub Mobile app
- GitHub CLI (`gh`)
- GitHub Desktop

## 🧪 Testing Branch Protection

### Verify It's Working

1. **Try direct push to main** (should fail)
   ```bash
   git checkout main
   echo "test" >> test.txt
   git add test.txt
   git commit -m "test"
   git push origin main
   # Should see: remote: error: GH006: Protected branch update failed
   ```

2. **Create PR without approval** (should not be mergeable)
   - Create a PR
   - Try to merge without approval
   - Should see: "Review required"

3. **Create PR with failing tests** (should not be mergeable)
   - Create PR that breaks tests
   - CI will fail
   - Should see: "Checks must pass"

## 📚 Resources

- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [About Code Owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Required Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)

## ✅ Checklist

After setting up, verify:

- [ ] Main branch has protection rule
- [ ] PRs require 1+ approval
- [ ] Status checks are required
- [ ] Direct pushes are blocked
- [ ] Force pushes are blocked
- [ ] Branch deletion is blocked
- [ ] CODEOWNERS file exists
- [ ] Administrators are included in rules
- [ ] Tested protection by attempting direct push
- [ ] Created test PR to verify workflow

---

<div align="center">
  <p><strong>Your main branch is now protected! 🛡️</strong></p>
  <p>Sleep well knowing your code is safe.</p>
</div>
