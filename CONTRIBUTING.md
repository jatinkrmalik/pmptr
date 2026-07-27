# Contributing to pmptr

Thanks for your interest in contributing! pmptr is in beta, and community
feedback and contributions are what will make it better.

## How to contribute

### Report a bug

If you find a bug, please [open an issue](https://github.com/jatinkrmalik/pmptr/issues/new?template=bug_report.yml)
and include:

- Your OS and version
- pmptr version (check the release you downloaded, or `git rev-parse HEAD` if running from source)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or screen recordings if relevant

### Suggest a feature

Feature requests are welcome! [Open an issue](https://github.com/jatinkrmalik/pmptr/issues/new?template=feature_request.yml)
and describe what you'd like to see. Include use cases and any mockups if you have them.

### Submit a pull request

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Make your changes
4. Run `npm run lint` and make sure it passes
5. Commit with a clear message
6. Push and open a PR against `main`

For significant changes, it's best to open an issue first to discuss the approach
before writing code.

## Development setup

```bash
git clone https://github.com/jatinkrmalik/pmptr.git
cd pmptr
npm install
npm start
```

The app launches two windows:
- **Control window** — settings panel
- **Prompter window** — click "Open floating prompter" in the control window

## Code style

- JavaScript (ES modules)
- ESLint config in `.eslintrc.json` — run `npm run lint` before committing
- No unused variables (the one exception is variables prefixed with `_`)
- Keep it simple — this is a minimal tool

## Project structure

See the [README](README.md#project-layout) for an overview of the codebase.

## CI/CD

The repo uses GitHub Actions:
- **Build** — runs on every push/PR to `main`
- **Nightly** — daily scheduled builds with auto-release
- **Release** — triggered by pushing a `v*` tag; builds installers, creates a
  GitHub Release, and publishes the matching version to npm
- **PR Build** — comment `/build <platform>` on a PR to get test artifacts

### Cutting a release

1. Bump `"version"` in `package.json` and update `CHANGELOG.md`
2. Commit on `main` (e.g. `chore: release v0.2.0`)
3. Tag and push:
   ```bash
   git tag v0.2.0
   git push origin main
   git push origin v0.2.0
   ```
4. The **Release** workflow builds platform installers, opens the GitHub Release,
   and runs `npm publish` for the same version

The git tag (without the leading `v`) must match `package.json`'s `"version"`,
or the npm job fails. Tags that contain a hyphen (e.g. `v0.2.0-beta.1`) are
marked as GitHub prereleases and published to npm under the `next` dist-tag.

### Required secret

npm publishing needs a repository secret named **`NPM_TOKEN`**:

1. On [npmjs.com](https://www.npmjs.com/) → Access Tokens → generate an
   **Automation** token with publish access for the `pmptr` package
2. In this GitHub repo → Settings → Secrets and variables → Actions →
   New repository secret → name `NPM_TOKEN`, paste the token

Without `NPM_TOKEN`, installer builds and the GitHub Release still succeed, but
the **Publish to npm** job will fail authentication.
## License

By contributing, you agree that your contributions will be licensed under the
MIT License.
