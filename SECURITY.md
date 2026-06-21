# Security Policy

## Supported Versions

pmptr is in beta. Only the latest release is supported.

| Version | Supported |
|---------|-----------|
| 0.1.0-beta.x | Yes |
| < 0.1.0 | No |

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public issue.

Instead, email the maintainer directly:

- **Jatin Malik** — jatinkrmalik@gmail.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

You will receive a response within 48 hours acknowledging receipt, and
regular updates on the resolution progress.

## Security Best Practices

- The app is not code-signed. Your OS may warn on first launch — this is expected during beta.
- Settings are stored locally in your Electron user-data folder. No data is sent to any server.
- The app has no network access — it runs entirely offline.
