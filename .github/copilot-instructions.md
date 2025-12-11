# GitHub Pages Deploy Action

This is a GitHub Action that automatically deploys your project to GitHub Pages with GitHub Actions. The action can be configured to push your production-ready code into any branch you'd like, including `gh-pages` and `docs`. It supports cross-repository deployments, works with GitHub Enterprise, and provides multiple authentication methods including SSH keys and personal access tokens.

Always follow these instructions first and only fallback to additional search and context gathering if the information in these instructions is incomplete or found to be in error.

## Working Effectively

### Bootstrap and build the repository:

- Use Node.js version from `.node-version` file
- Install Yarn globally: `npm install -g yarn`
- Install dependencies: `yarn install --frozen-lockfile` -- takes 1-25 seconds depending on cache state
- Build the project: `yarn build` -- takes 9 seconds. NEVER CANCEL. Set timeout to 30+ seconds
- Run tests: `yarn test` -- takes 8 seconds. NEVER CANCEL. Set timeout to 30+ seconds
- Check linting: `yarn lint:check` -- takes 3 seconds. Set timeout to 15+ seconds
- Check formatting: `yarn lint:format:check` -- takes 2 seconds. Set timeout to 10+ seconds

### Development workflow:

- ALWAYS run the bootstrapping steps first (install dependencies and build)
- Make code changes in the `src/` directory (TypeScript source)
- Build with `yarn build` to compile TypeScript to JavaScript in `lib/` directory
- Run `yarn test` to ensure tests pass
- Run `yarn lint:check` and `yarn lint:format:check` before committing

### Fix linting and formatting issues:

- Auto-fix linting: `yarn lint`
- Auto-format code: `yarn lint:format`

## Validation

### CRITICAL - Required validation steps:

- ALWAYS run `yarn build` after making changes - the action depends on compiled JavaScript in `lib/`
- ALWAYS run `yarn test` to ensure all unit tests pass
- ALWAYS run `yarn lint:check` and `yarn lint:format:check` or the CI will fail
- **NEVER CANCEL** any build or test commands - they complete quickly (under 30 seconds each)

### Manual testing scenarios:

Since this is a GitHub Action, full end-to-end testing requires deploying to a test repository. However, you can validate:

- Unit tests cover core functionality: `yarn test` runs 59 tests with 92%+ coverage
- Integration tests exist in `.github/workflows/integration.yml` but require GitHub Actions environment
- Build output in `lib/` directory should match TypeScript source in `src/`

### Before submitting changes:

- Ensure all TypeScript compiles without errors: `yarn build`
- Ensure all tests pass: `yarn test`
- Ensure code follows style guidelines: `yarn lint:check` and `yarn lint:format:check`
- The `lib/` directory must be committed for distribution branches (not for pull requests to `dev`)

## Common Tasks

### Repository structure:

```
src/               # TypeScript source files
├── main.ts        # Entry point for GitHub Action
├── lib.ts         # Main run function (can be used as module)
├── constants.ts   # Configuration interfaces and constants
├── git.ts         # Git operations for deployment
├── util.ts        # Utility functions
├── ssh.ts         # SSH key configuration
├── execute.ts     # Command execution wrapper
└── worktree.ts    # Git worktree operations

__tests__/         # Jest test files
lib/               # Compiled JavaScript (generated, do not edit)
integration/       # Sample files for testing deployments
.github/workflows/ # CI/CD workflows
```

### Key files and their purposes:

- `action.yml` - GitHub Action definition with inputs/outputs
- `package.json` - Dependencies and npm scripts
- `tsconfig.json` - TypeScript compilation settings
- `jest.config.js` - Test configuration
- `eslint.config.mjs` - Linting rules (ignores `lib/` directory)
- `.node-version` - Required Node.js version

### Understanding the codebase:

- **Entry Point**: `src/main.ts` imports and calls the `run()` function from `src/lib.ts`
- **Core Logic**: `src/lib.ts` contains the main deployment logic
- **Git Operations**: `src/git.ts` handles repository initialization and deployment
- **Configuration**: `src/constants.ts` defines interfaces for action parameters
- **Testing**: Comprehensive Jest tests in `__tests__/` directory with mocks for GitHub Actions

### Common development patterns:

- Action parameters are defined in `src/constants.ts` interfaces
- Error handling uses try/catch with `extractErrorMessage()` utility
- All git commands go through `execute()` wrapper for consistent logging
- SSH and token authentication are handled in separate modules
- Extensive parameter validation in `src/util.ts`

### CI/CD behavior:

- `.github/workflows/build.yml` runs on every push and PR
- Linting, formatting, tests, and build must all pass
- Integration tests deploy to test repositories using various authentication methods
- Production releases include `node_modules` in distribution branches

### Debugging and troubleshooting:

- Check TypeScript compilation errors first: `yarn build`
- Run specific test files: `yarn test <filename>`
- Use `yarn lint` to auto-fix linting issues
- The action supports debug mode via GitHub Actions debug logging
- Integration tests in CI provide real deployment validation

### Important notes:

- The `lib/` directory is compiled output and should not be manually edited
- Distribution branches (like `v4`) include `node_modules` and `lib/` for GitHub Actions runtime
- The dev branch excludes `node_modules` and `lib/` from version control
- SSH key support allows deployment with repository deploy keys
- Cross-repository deployment is supported with proper token permissions

### Environment requirements:

- Node.js (specified in `.node-version`)
- Yarn package manager
- Git (for deployment operations)
- rsync (for file operations, automatically available in GitHub Actions runners)

### Performance expectations:

- Fresh install: ~25 seconds for `yarn install --frozen-lockfile`
- Cached install: ~1 second for `yarn install --frozen-lockfile`
- Build: ~9 seconds for `yarn build`
- Tests: ~8 seconds for `yarn test`
- Linting: ~3 seconds for `yarn lint:check`
- Formatting: ~2 seconds for `yarn lint:format:check`
