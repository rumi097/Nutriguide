# Support

Looking for help with NutriGuide AI? You're in the right place!

## 📚 Documentation

Before asking for help, please check our documentation:

- **[README.md](README.md)** - Project overview and quick start
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
- **[ML_MODELS_COMPLETE.md](ML_MODELS_COMPLETE.md)** - ML model documentation

## 🤔 How to Get Help

### 1. Search Existing Resources

- **[GitHub Issues](../../issues)** - Check if someone else has had the same problem
- **[GitHub Discussions](../../discussions)** - Browse community discussions
- **[Closed Issues](../../issues?q=is%3Aissue+is%3Aclosed)** - Solutions to past problems

### 2. Ask in the Right Place

#### 🐛 Found a Bug?
- Use the [Bug Report Template](../../issues/new?template=bug_report.md)
- Provide clear steps to reproduce
- Include environment details

#### ✨ Want a New Feature?
- Use the [Feature Request Template](../../issues/new?template=feature_request.md)
- Explain the use case
- Describe the expected behavior

#### ❓ Have a Question?
- Use the [Question Template](../../issues/new?template=question.md)
- Or start a [Discussion](../../discussions)
- Provide context for your question

#### 🔒 Security Concern?
- **DO NOT** open a public issue
- See [SECURITY.md](SECURITY.md) for private reporting

### 3. Provide Context

When asking for help, always include:

- **What you're trying to do**
- **What you expected to happen**
- **What actually happened**
- **Steps to reproduce**
- **Environment details** (OS, Node version, etc.)
- **Error messages** (full stack trace)
- **Screenshots** (if UI-related)

## 💬 Community Support

### GitHub Discussions
Our primary forum for community support and discussions.

**Categories:**
- **Q&A** - Ask questions, get answers
- **Ideas** - Share and discuss new ideas
- **Show and Tell** - Share what you've built
- **General** - Everything else

### Response Times

- **Issues**: We aim to respond within 48 hours
- **Pull Requests**: Initial review within 3-5 days
- **Security Issues**: Within 24 hours

> Note: We're a community-driven project. Response times may vary based on volunteer availability.

## 🆘 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check MongoDB is running
brew services list | grep mongodb

# Check if port 5000 is in use
lsof -i :5000

# Verify .env file exists
ls backend/.env
```

#### Frontend Build Fails
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### ML Service Errors
```bash
# Verify Python version
python --version  # Should be 3.8+

# Recreate virtual environment
cd ml-service
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### MongoDB Connection Issues
```bash
# Start MongoDB
brew services start mongodb-community

# Check MongoDB status
brew services list

# Test connection
mongosh
```

### Still Stuck?

1. Check our [FAQ](#faq)
2. Search [closed issues](../../issues?q=is%3Aissue+is%3Aclosed)
3. Ask in [Discussions](../../discussions)
4. Open a [new issue](../../issues/new/choose)

## 📖 Learning Resources

### For Beginners

- **[React Documentation](https://react.dev)** - Learn React basics
- **[Node.js Guides](https://nodejs.org/en/docs/guides/)** - Node.js fundamentals
- **[MongoDB University](https://university.mongodb.com/)** - Free MongoDB courses
- **[Scikit-learn Tutorials](https://scikit-learn.org/stable/tutorial/)** - ML basics

### For Contributors

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community standards
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture

## 🎯 FAQ

### General Questions

**Q: Is NutriGuide AI free?**  
A: Yes! NutriGuide is open source and free to use under the MIT License.

**Q: Can I use this for my project?**  
A: Absolutely! See [LICENSE](LICENSE) for details.

**Q: Do you offer hosted services?**  
A: Currently, no. You need to self-host. See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

### Technical Questions

**Q: What are the system requirements?**  
A: Node.js 18+, Python 3.8+, MongoDB 6+. See [README.md](README.md) for details.

**Q: Can I use a different database?**  
A: The code is written for MongoDB. Adapting to another database would require significant changes.

**Q: How accurate is the ML model?**  
A: 99.87% accuracy (R² score of 0.9987) with an average error of 5.62 calories.

**Q: Can I train my own model?**  
A: Yes! See [ml-service/README.md](ml-service/README.md) for training instructions.

### Contribution Questions

**Q: How can I contribute?**  
A: See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

**Q: I'm a beginner, can I still help?**  
A: Yes! Look for issues labeled `good first issue`.

**Q: Do you accept PRs?**  
A: We welcome PRs! Please follow our [contribution guidelines](CONTRIBUTING.md).

## 📧 Direct Contact

For matters that can't be discussed publicly:

- **Security Issues**: See [SECURITY.md](SECURITY.md)
- **General Inquiries**: Open a [discussion](../../discussions)
- **Project Maintainers**: See [CODEOWNERS](.github/CODEOWNERS) (if available)

## 🌟 Show Your Support

If NutriGuide helped you, consider:

- ⭐ **Star the repository**
- 🐛 **Report bugs** you encounter
- 💡 **Suggest features** you'd like
- 🔧 **Contribute code** or documentation
- 💬 **Help others** in discussions
- 📢 **Spread the word** on social media

## 📜 Additional Resources

- **[GitHub Guides](https://guides.github.com/)** - Learn GitHub
- **[Markdown Guide](https://www.markdownguide.org/)** - Writing documentation
- **[Conventional Commits](https://www.conventionalcommits.org/)** - Commit message format

---

<div align="center">
  <p><strong>Still need help? Don't hesitate to reach out!</strong></p>
  <p>We're here to help you succeed with NutriGuide AI 💚</p>
</div>
