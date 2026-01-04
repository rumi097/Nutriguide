# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

The NutriGuide team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them by:

1. **Creating a private security advisory** on GitHub:
   - Go to the repository's Security tab
   - Click "Report a vulnerability"
   - Fill in the details

2. **Or email us directly** (if you prefer):
   - Create a new GitHub issue with the title "Security Concern - Need Contact Info"
   - We'll provide a secure communication channel

### What to Include

To help us triage and fix the issue quickly, please include:

- **Type of issue** (e.g., SQL injection, XSS, authentication bypass)
- **Full paths** of source file(s) related to the issue
- **Location** of the affected source code (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact** of the issue, including how an attacker might exploit it

### What to Expect

- **Acknowledgment**: We'll acknowledge your report within 48 hours
- **Updates**: We'll send you regular updates about our progress
- **Timeline**: We aim to fix critical issues within 7 days
- **Credit**: With your permission, we'll credit you in the release notes

## Security Best Practices for Contributors

### Authentication & Authorization

- Never commit credentials, API keys, or secrets
- Use environment variables for sensitive data
- Implement proper JWT validation
- Use bcrypt with sufficient rounds (10+) for password hashing
- Validate user permissions on every protected route

### Input Validation

- Validate and sanitize ALL user inputs
- Use parameterized queries to prevent SQL injection
- Implement rate limiting on API endpoints
- Validate file uploads (type, size, content)
- Use express-validator for request validation

### Data Protection

- Use HTTPS in production
- Set secure HTTP headers (Helmet.js)
- Implement CORS properly
- Don't expose stack traces to users
- Encrypt sensitive data at rest

### Dependencies

- Keep dependencies up to date
- Run `npm audit` regularly
- Review security advisories
- Use `npm audit fix` to auto-fix issues
- Consider using Dependabot

### Code Review

- Review all PRs for security issues
- Look for common vulnerabilities (OWASP Top 10)
- Check for exposed sensitive data
- Verify authentication/authorization
- Test edge cases and error handling

## Known Security Considerations

### Current Implementation

- **JWT Secrets**: Ensure JWT_SECRET is strong and unique
- **MongoDB**: Use connection string with authentication
- **CORS**: Configure allowed origins properly
- **Rate Limiting**: Implement on authentication endpoints
- **Password Reset**: Tokens should expire and be single-use

### Recommendations for Deployment

1. **Environment Variables**: Never commit `.env` files
2. **HTTPS**: Always use HTTPS in production
3. **Database**: Enable MongoDB authentication
4. **Monitoring**: Set up security monitoring and logging
5. **Updates**: Keep all dependencies and runtime up to date

## Security Checklist for Deployment

- [ ] All secrets in environment variables
- [ ] HTTPS enabled with valid SSL certificate
- [ ] MongoDB authentication enabled
- [ ] JWT secret is strong (32+ characters)
- [ ] CORS configured with specific origins
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers configured
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose internals
- [ ] Dependencies are up to date
- [ ] Security monitoring enabled
- [ ] Backups configured
- [ ] Logging configured (without sensitive data)

## Vulnerability Disclosure Policy

- We will acknowledge your report within 48 hours
- We will provide an estimated timeline for a fix
- We will notify you when the vulnerability is fixed
- We may ask for your input on the fix
- We will credit you (if desired) when we publicly disclose

## Bug Bounty Program

Currently, we do not have a paid bug bounty program. However:

- We deeply appreciate security research
- We will publicly acknowledge your contribution
- We may feature you in our Hall of Fame
- You'll have our sincere gratitude!

## Security Updates

Security updates will be released as:

- **Critical**: Immediate patch release
- **High**: Patch within 7 days
- **Medium**: Included in next minor release
- **Low**: Included in next release

## Contact

For security concerns, please:

1. Use GitHub Security Advisories (preferred)
2. Create a private issue requesting contact
3. Do not disclose publicly until we've had a chance to address it

## Past Security Issues

We maintain transparency about past issues:

- None reported yet

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

Thank you for helping keep NutriGuide and our users safe! 🔒
