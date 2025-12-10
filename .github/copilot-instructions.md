# GitHub Pages Deploy Action - Copilot Instructions

## Project Overview

This is a GitHub Action that automates the deployment of projects to GitHub Pages. It's written in TypeScript and runs on Node.js v22.11.0. The action supports various deployment methods including token-based and SSH-based deployments, can deploy to different branches, and handles both same-repository and cross-repository deployments.

## Architecture

- **Language**: TypeScript (targeting ES6)
- **Runtime**: Node.js v22.11.0
- **Package Manager**: Yarn
- **Testing Framework**: Jest
- **Code Quality**: ESLint + Prettier

### Key Source Files

- `src/main.ts` - Entry point for the action
- `src/git.ts` - Git operations and deployment logic
- `src/worktree.ts` - Git worktree management
- `src/execute.ts` - Command execution utilities
- `src/ssh.ts` - SSH key configuration
- `src/constants.ts` - Type definitions and constants
- `src/util.ts` - Utility functions

## Development Guidelines

### Code Style

1. **TypeScript**: Use strict typing where possible. The project has `noImplicitAny: false` but strive for explicit types
2. **Imports**: Use ES6 import syntax
3. **String Interpolation**: Use template literals for string concatenation
4. **Error Handling**: Use try-catch blocks and return Error objects when needed
5. **Comments**: Use JSDoc-style comments for functions and important code blocks
6. **Naming Conventions**:
   - Use camelCase for variables and functions
   - Use PascalCase for types and interfaces
   - Use descriptive names that clearly indicate purpose

### Git Operations

- Always use `git --no-pager` to avoid pagination issues in automated contexts
- Use temporary deployment branches with pattern: `github-pages-deploy-action-{randomString}` (NOT with forward slashes to avoid Git ref conflicts)
- Always clean up temporary branches and directories after deployment
- Suppress sensitive information in git output (tokens, SSH keys)

### Testing

- **Test Location**: `__tests__/` directory
- **Test Files**: Match source files with `.test.ts` suffix (e.g., `git.test.ts` for `src/git.ts`)
- **Test Framework**: Jest with ts-jest
- **Coverage**: Maintain high test coverage (currently comprehensive)
- **Run Tests**: `yarn test`
- **Test Patterns**:
  - Mock external dependencies (especially `@actions/core`, `@actions/exec`, `@actions/io`)
  - Test both success and failure scenarios
  - Test edge cases and error conditions
  - Use descriptive test names with "should" statements

### Building and Linting

- **Build**: `yarn build` - Compiles TypeScript to `lib/` directory
- **Lint**: `yarn lint` - Runs ESLint with auto-fix
- **Lint Check**: `yarn lint:check` - Runs ESLint without auto-fix
- **Format**: `yarn lint:format` - Runs Prettier with auto-fix
- **Format Check**: `yarn lint:format:check` - Runs Prettier without auto-fix

**Important**: The `node_modules/` and `lib/` directories should NOT be committed to the `dev` branch but are required for distribution branches.

### Pull Request Guidelines

1. Test changes by deploying to a real repository using your fork
2. Ensure all integration tests pass
3. Update README.md if changes require documentation
4. Run linting and formatting: `yarn lint && yarn lint:format`
5. Run test suite: `yarn test`
6. Build successfully: `yarn build`
7. Highlight any breaking changes
8. Keep `node_modules/` and `lib/` out of PRs (only needed for distribution)

### Security Considerations

- Never log or expose tokens, SSH keys, or other sensitive data
- Use `suppressSensitiveInformation()` utility for sanitizing output
- Validate all user inputs
- Use the principle of least privilege for permissions

### Common Patterns

1. **Action Configuration**: ActionInterface from constants.ts contains all configuration
2. **Status Returns**: Use Status enum (SUCCESS, FAILED, SKIPPED, RUNNING_CHECKS)
3. **Info Logging**: Use `info()` from @actions/core for user feedback
4. **Error Handling**: Catch errors, extract messages with `extractErrorMessage()`, return Error objects
5. **File Operations**: Use @actions/io functions (mkdirP, rmRF, etc.)
6. **Command Execution**: Use the `execute()` wrapper function, not direct exec

### Deployment Flow

1. Initialize git configuration (`init()`)
2. Generate or use worktree for deployment (`generateWorktree()`)
3. Prepare deployment files
4. Create temporary deployment branch
5. Commit and push changes
6. Clean up temporary resources
7. Return deployment status

## Key Features to Preserve

- Support for gh-pages and docs branches
- Cross-repository deployment capability
- GitHub Enterprise compatibility
- SSH and token-based authentication
- Dry-run mode for testing
- Silent mode for reduced output
- Tag support
- Force push capability
- Clean deployment option
- Custom commit messages
- Git configuration options (user.name, user.email, etc.)

## Known Issues and Gotchas

- Temporary branch names must not use forward slashes to avoid Git ref conflicts with existing branches
- Some tools auto-generate `.gitignore` files that can affect deployments
- Multiple rapid deployments require concurrency controls in workflow configuration
- Permissions must be set correctly (Read and Write for GITHUB_TOKEN)

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Jest Documentation](https://jestjs.io/)
- [Action Repository](https://github.com/JamesIves/github-pages-deploy-action)
