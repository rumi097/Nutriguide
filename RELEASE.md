# 📦 Release Process

This document describes the release process for NutriGuide AI.

## Version Numbers

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

## Release Checklist

### 1. Pre-Release

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No critical bugs
- [ ] Security audit completed
- [ ] Dependencies updated

### 2. Version Bump

```bash
# Update version in package.json files
cd backend
npm version [major|minor|patch]

cd ../frontend
npm version [major|minor|patch]

# Commit version changes
git add .
git commit -m "chore: bump version to x.y.z"
```

### 3. Create Release Branch

```bash
git checkout -b release/x.y.z
git push origin release/x.y.z
```

### 4. Update CHANGELOG

Add release notes to [CHANGELOG.md](CHANGELOG.md):

```markdown
## [x.y.z] - YYYY-MM-DD

### Added
- New feature A
- New feature B

### Fixed
- Bug fix A
- Bug fix B

### Changed
- Change A
```

### 5. Create GitHub Release

1. Go to [Releases](../../releases)
2. Click "Draft a new release"
3. Tag version: `vx.y.z`
4. Release title: `vx.y.z - Release Name`
5. Description: Copy from CHANGELOG
6. Attach binaries if applicable
7. Click "Publish release"

### 6. Deploy

Follow [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for deployment instructions.

### 7. Announce

- [ ] GitHub Discussions post
- [ ] Social media announcement
- [ ] Update README if needed
- [ ] Email notification list (if exists)

## Hotfix Process

For critical bugs in production:

```bash
# Create hotfix branch from main
git checkout main
git checkout -b hotfix/x.y.z

# Make fixes
# ... commit changes ...

# Merge to main
git checkout main
git merge hotfix/x.y.z

# Tag the release
git tag -a vx.y.z -m "Hotfix: description"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge main
```

## Release Schedule

- **Major releases**: When ready (breaking changes)
- **Minor releases**: Monthly (new features)
- **Patch releases**: As needed (bug fixes)

## Maintainer Notes

### Publishing npm Packages (Future)

If/when we publish npm packages:

```bash
# Build and test
npm run build
npm test

# Publish to npm
npm publish
```

### Docker Images (Future)

```bash
# Build images
docker build -t nutriguide/backend:x.y.z ./backend
docker build -t nutriguide/frontend:x.y.z ./frontend
docker build -t nutriguide/ml-service:x.y.z ./ml-service

# Push to registry
docker push nutriguide/backend:x.y.z
docker push nutriguide/frontend:x.y.z
docker push nutriguide/ml-service:x.y.z

# Tag as latest
docker tag nutriguide/backend:x.y.z nutriguide/backend:latest
docker push nutriguide/backend:latest
```

## Release Types

### 🎉 Major Release (x.0.0)

Breaking changes, significant new features, or architectural changes.

**Checklist:**
- [ ] Migration guide written
- [ ] Breaking changes documented
- [ ] Deprecation warnings added
- [ ] Major version communication plan

### ✨ Minor Release (1.x.0)

New features, enhancements, non-breaking changes.

**Checklist:**
- [ ] New features documented
- [ ] Feature flags ready (if needed)
- [ ] Performance tested
- [ ] Backwards compatibility verified

### 🐛 Patch Release (1.0.x)

Bug fixes, security patches, minor improvements.

**Checklist:**
- [ ] Bug fixes tested
- [ ] Regression tests passed
- [ ] Security patches applied
- [ ] No new features added

## Communication

### Release Notes Template

```markdown
## NutriGuide AI vx.y.z

**Release Date**: YYYY-MM-DD

### 🎉 Highlights

Brief description of major improvements.

### ✨ New Features

- Feature A (#123)
- Feature B (#124)

### 🐛 Bug Fixes

- Fixed issue A (#125)
- Fixed issue B (#126)

### 📚 Documentation

- Updated X documentation
- Added Y guide

### ⚠️ Breaking Changes

(If any)

### 🙏 Contributors

Thanks to @user1, @user2, @user3 for their contributions!

### 📥 Installation

\`\`\`bash
git clone https://github.com/rumi097/NutriGuide.git
cd NutriGuide
# Follow setup instructions
\`\`\`

**Full Changelog**: https://github.com/rumi097/NutriGuide/compare/vx.y.z-1...vx.y.z
```

## Rollback Process

If a release has critical issues:

```bash
# Revert to previous version
git revert <release-commit-hash>

# Create hotfix
git checkout -b hotfix/x.y.z+1

# Fix issues and release new version
```

---

**Note**: This process may evolve as the project grows. Maintainers can modify this document as needed.
