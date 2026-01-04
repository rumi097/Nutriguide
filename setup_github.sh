#!/bin/bash

# ============================================================================
# NutriGuide AI - Complete GitHub Setup Script
# ============================================================================
# This script helps you set up your repository with all the necessary
# configurations for branch protection and open source best practices.
#
# Usage: bash setup_github.sh
# ============================================================================

set -e  # Exit on error

echo "🚀 NutriGuide AI - GitHub Setup Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

print_success "Git is installed"

# Check if we're in a git repository
if [ ! -d .git ]; then
    print_info "Initializing Git repository..."
    git init
    print_success "Git repository initialized"
else
    print_success "Already in a Git repository"
fi

# Check current directory
CURRENT_DIR=$(basename "$PWD")
if [ "$CURRENT_DIR" != "NutriGuide" ]; then
    print_warning "You might not be in the NutriGuide directory"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get GitHub username
echo ""
print_info "Please enter your GitHub username:"
read -r GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    print_error "GitHub username cannot be empty"
    exit 1
fi

print_success "GitHub username set to: $GITHUB_USERNAME"

# Update CODEOWNERS file with actual username
echo ""
print_info "Updating CODEOWNERS file with your username..."
if [ -f ".github/CODEOWNERS" ]; then
    sed -i.bak "s/@YOUR_USERNAME/@$GITHUB_USERNAME/g" .github/CODEOWNERS
    rm .github/CODEOWNERS.bak 2>/dev/null || true
    print_success "CODEOWNERS updated"
else
    print_warning "CODEOWNERS file not found"
fi

# Update README with GitHub username
print_info "Updating README.md with your username..."
if [ -f "README.md" ]; then
    sed -i.bak "s/YOUR_USERNAME/$GITHUB_USERNAME/g" README.md
    rm README.md.bak 2>/dev/null || true
    print_success "README.md updated"
fi

# Update other markdown files
for file in *.md .github/ISSUE_TEMPLATE/*.md; do
    if [ -f "$file" ]; then
        sed -i.bak "s/YOUR_USERNAME/$GITHUB_USERNAME/g" "$file" 2>/dev/null || true
        rm "$file.bak" 2>/dev/null || true
    fi
done

print_success "All documentation files updated"

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    print_info "Creating .gitignore file..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
venv/
env/
ENV/
.venv

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
dist-ssr/
*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python

# Database
mongodb-data/
*.sqlite

# Process IDs
*.pid
backend.pid
frontend.pid

# Coverage
coverage/
*.cover
.pytest_cache/
EOF
    print_success ".gitignore created"
else
    print_success ".gitignore already exists"
fi

# Check if origin remote exists
echo ""
print_info "Checking Git remotes..."
if git remote | grep -q "^origin$"; then
    CURRENT_REMOTE=$(git remote get-url origin)
    print_success "Remote 'origin' already configured: $CURRENT_REMOTE"
else
    print_info "Remote 'origin' not found. Setting it up..."
    REPO_URL="https://github.com/$GITHUB_USERNAME/NutriGuide.git"
    git remote add origin "$REPO_URL"
    print_success "Remote 'origin' set to: $REPO_URL"
fi

# Stage all files
echo ""
print_info "Staging all files for commit..."
git add .
print_success "Files staged"

# Check if there are changes to commit
if git diff --cached --quiet; then
    print_warning "No changes to commit"
else
    print_info "Creating initial commit..."
    git commit -m "feat: complete open source setup with branch protection

- Add comprehensive documentation (README, CONTRIBUTING, etc.)
- Set up GitHub workflows (CI/CD, branch protection, auto-labeling)
- Configure CODEOWNERS for code review
- Add issue and PR templates
- Implement security and support documentation
- Create marketing and contributor guides"
    
    print_success "Initial commit created"
fi

# Set main branch
echo ""
print_info "Setting main branch..."
git branch -M main
print_success "Main branch configured"

# Summary
echo ""
echo "============================================"
print_success "Setup Complete! 🎉"
echo "============================================"
echo ""
echo "📋 What's been configured:"
echo "   ✅ Git repository initialized"
echo "   ✅ GitHub username updated in all files"
echo "   ✅ .gitignore created"
echo "   ✅ Remote origin configured"
echo "   ✅ Initial commit created"
echo "   ✅ Main branch set"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1️⃣  Create a new repository on GitHub:"
echo "   Go to: https://github.com/new"
echo "   Repository name: NutriGuide"
echo "   Make it public"
echo "   DON'T initialize with README (we already have one)"
echo ""
echo "2️⃣  Push your code to GitHub:"
echo "   ${BLUE}git push -u origin main${NC}"
echo ""
echo "3️⃣  Set up branch protection (IMPORTANT!):"
echo "   Go to: https://github.com/$GITHUB_USERNAME/NutriGuide/settings/branches"
echo "   Click 'Add rule'"
echo "   Branch name pattern: ${YELLOW}main${NC}"
echo "   Enable:"
echo "     ✅ Require a pull request before merging"
echo "     ✅ Require approvals: 1"
echo "     ✅ Require status checks to pass"
echo "     ✅ Require conversation resolution"
echo "     ✅ Include administrators"
echo "   Save changes"
echo ""
echo "4️⃣  Enable GitHub features:"
echo "   Go to: https://github.com/$GITHUB_USERNAME/NutriGuide/settings"
echo "   Features section:"
echo "     ✅ Issues"
echo "     ✅ Discussions"
echo "     ✅ Projects"
echo ""
echo "5️⃣  Add repository details:"
echo "   - Description: AI-powered nutrition platform with 99.87% accurate ML recommendations"
echo "   - Website: (add after deployment)"
echo "   - Topics: nutrition, machine-learning, react, nodejs, python, health-tech"
echo ""
echo "6️⃣  Create first release:"
echo "   ${BLUE}git tag -a v1.0.0 -m \"🎉 Initial release\"${NC}"
echo "   ${BLUE}git push origin v1.0.0${NC}"
echo "   Then create release on GitHub"
echo ""
echo "7️⃣  Read the setup guides:"
echo "   📖 BRANCH_PROTECTION.md - Branch protection setup"
echo "   📖 OPEN_SOURCE_CHECKLIST.md - Complete launch checklist"
echo "   📖 QUICKSTART_PROMOTION.md - Promotion strategies"
echo ""
echo "📚 Important Documentation:"
echo "   - CONTRIBUTING.md - For contributors"
echo "   - FIRST_TIME_CONTRIBUTORS.md - For beginners"
echo "   - CODE_OF_CONDUCT.md - Community standards"
echo "   - SECURITY.md - Security policy"
echo "   - ROADMAP.md - Future plans"
echo ""
echo "🎯 Quick Commands:"
echo "   Push to GitHub: ${BLUE}git push -u origin main${NC}"
echo "   Create tag: ${BLUE}git tag -a v1.0.0 -m \"Initial release\"${NC}"
echo "   Push tag: ${BLUE}git push origin v1.0.0${NC}"
echo ""
echo "💡 Need help? Check SUPPORT.md or create an issue!"
echo ""
print_success "Your project is ready for open source! 🌟"
echo ""
