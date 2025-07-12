# Yarn Rules (AI Context)

## Critical Rules
1. **Yarn ONLY**: If `yarn.lock` exists, NEVER use `npm`/`pnpm` commands
2. **yarn.lock sacred**: Never manually edit, always commit changes
3. **Check version**: Classic (v1) vs Berry (v2+) - use `yarn --version`

## Essential Commands
**Install**: `yarn install` or `yarn` (uses yarn.lock, not package.json)
**Add deps**: `yarn add <package>` (production), `yarn add -D <package>` (dev)
**Remove**: `yarn remove <package>`
**Scripts**: `yarn <script-name>` (no "run" needed)
**Upgrade**: `yarn upgrade <package>`

## Workspaces (Monorepo)
- Check for `"workspaces"` in root package.json
- **Always run from root directory**
- Specific workspace: `yarn workspace <name> add <package>`
- All workspaces: `yarn workspaces foreach run <script>`

## Debugging Strategy
1. **Read error messages carefully**
2. **Check for package-lock.json** (indicates npm contamination)
3. **Clean install**: `rm -rf node_modules && yarn install`
4. **Cache clean**: `yarn cache clean` then reinstall
5. **Validate package.json** syntax

## Version Detection
- **Berry (v2+)**: `.yarnrc.yml` + `.yarn/` directory (likely PnP mode)
- **Classic (v1)**: Traditional `node_modules` structure

## Key Constraints
- NO npm/pnpm mixing EVER
- Always commit yarn.lock changes
- Run commands from project root
- yarn.lock = source of truth (not package.json)