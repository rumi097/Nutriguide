# Contributing to NutriGuide AI

First off, thank you for considering contributing to NutriGuide AI! 🎉

It's people like you that make NutriGuide AI such a great tool. We welcome contributions from everyone, whether you're fixing a typo, adding a feature, or improving documentation.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Issue Guidelines](#issue-guidelines)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior by creating an issue.

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, screenshots)
- **Describe the behavior you observed** and **what you expected**
- **Include your environment details** (OS, Node version, Python version, browser)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **Include mockups or examples** if applicable

### Your First Code Contribution

Unsure where to begin? You can start by looking through these issues:

- **Good First Issue** - issues that should only require a few lines of code
- **Help Wanted** - issues that may be more involved but need assistance

### Pull Requests

We actively welcome your pull requests! Here's how to contribute:

1. Fork the repo and create your branch from `main`
2. Make your changes and test thoroughly
3. Update documentation if needed
4. Write or update tests if applicable
5. Follow our coding standards
6. Submit a pull request!

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- MongoDB 6+
- Git

### Setting Up Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/rumi097/NutriGuide.git
   cd NutriGuide
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your local settings
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **ML Service Setup**
   ```bash
   cd ml-service
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```

5. **Database Setup**
   ```bash
   # Start MongoDB
   brew services start mongodb-community  # macOS
   # OR
   sudo systemctl start mongod  # Linux
   
   # Seed the database
   cd backend
   npm run seed
   ```

## 💻 Development Workflow

### Branch Naming Convention

- **Feature**: `feature/short-description` (e.g., `feature/meal-search`)
- **Bug Fix**: `fix/issue-description` (e.g., `fix/login-validation`)
- **Documentation**: `docs/what-changed` (e.g., `docs/api-endpoints`)
- **Refactor**: `refactor/component-name` (e.g., `refactor/auth-service`)

### Making Changes

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation

3. **Test your changes**
   ```bash
   # Frontend tests
   cd frontend && npm test
   
   # Backend tests
   cd backend && npm test
   
   # ML service tests
   cd ml-service && python -m pytest
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add meal search functionality"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📥 Pull Request Process

1. **Update Documentation**
   - Update README.md if you changed functionality
   - Add JSDoc comments for new functions
   - Update API documentation if endpoints changed

2. **Ensure Tests Pass**
   - All existing tests should pass
   - Add new tests for new features
   - Aim for good code coverage

3. **Follow Code Style**
   - Run linters before committing
   - Format code consistently
   - Remove console.logs and debug code

4. **Create Pull Request**
   - Use our PR template
   - Link related issues
   - Provide clear description of changes
   - Add screenshots for UI changes

5. **Code Review**
   - Address review comments promptly
   - Be open to feedback
   - Make requested changes
   - Keep the conversation professional

6. **Merge**
   - Once approved, a maintainer will merge your PR
   - Your contribution will be credited!

## 🎨 Coding Standards

### JavaScript/React

- Use ES6+ features
- Use functional components with hooks
- Follow Airbnb style guide
- Use meaningful variable names
- Keep functions small and focused
- Avoid deep nesting
- Use async/await over promises

**Example:**
```javascript
// Good ✅
const fetchUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};

// Bad ❌
function fetchUserProfile(userId) {
  return api.get('/users/' + userId).then(response => {
    return response.data;
  }).catch(error => {
    console.error(error);
  });
}
```

### Python

- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions
- Use snake_case for variables/functions
- Keep functions focused

**Example:**
```python
# Good ✅
def calculate_bmi(weight: float, height: float) -> float:
    """
    Calculate Body Mass Index.
    
    Args:
        weight: Weight in kilograms
        height: Height in meters
        
    Returns:
        BMI value rounded to 2 decimal places
    """
    bmi = weight / (height ** 2)
    return round(bmi, 2)

# Bad ❌
def calc(w, h):
    return w / h / h
```

### CSS/Tailwind

- Use Tailwind utility classes
- Keep custom CSS minimal
- Use consistent spacing
- Mobile-first approach
- Use CSS variables for theming

### File Structure

- Keep components small (< 200 lines)
- One component per file
- Organize by feature, not type
- Use index.js for exports

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no code change)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependencies

### Examples

```bash
feat(auth): add password reset functionality

- Add forgot password endpoint
- Create reset password email template
- Add reset token validation

Closes #123
```

```bash
fix(meals): correct calorie calculation

The calculation was off by 10% due to incorrect
conversion factor. Fixed to use proper multiplier.

Fixes #456
```

```bash
docs(readme): update installation instructions

- Add MongoDB setup steps
- Clarify Python version requirements
- Add troubleshooting section
```

## 🐛 Issue Guidelines

### Creating Issues

1. **Search first** - Check if the issue already exists
2. **Use templates** - Fill out bug report or feature request template
3. **Be specific** - Include reproduction steps, environment details
4. **One issue per report** - Don't combine multiple issues

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested
- `wontfix` - Won't be worked on

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test                # Run tests
npm test -- --coverage  # With coverage
```

### Backend Tests
```bash
cd backend
npm test
npm run test:watch      # Watch mode
```

### ML Service Tests
```bash
cd ml-service
pytest
pytest --cov           # With coverage
```

### Integration Tests
```bash
# Run all services first, then:
npm run test:e2e
```

## 📚 Documentation

- Update README.md for user-facing changes
- Add JSDoc/docstrings for new functions
- Update API documentation
- Add inline comments for complex logic
- Update CHANGELOG.md

## 🎯 Areas We Need Help With

- 🐛 Bug fixes
- ✨ New features from roadmap
- 📝 Documentation improvements
- 🧪 Writing tests
- 🌍 Internationalization (i18n)
- ♿ Accessibility improvements
- 🎨 UI/UX enhancements
- 🚀 Performance optimizations

## 💬 Community

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Report bugs and request features
- **Pull Requests**: Contribute code
- **Code Review**: Help review others' PRs

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Your contributions, whether big or small, make a huge difference. Thank you for being part of the NutriGuide AI community!

---

**Questions?** Feel free to create an issue or start a discussion. We're here to help! 🚀
