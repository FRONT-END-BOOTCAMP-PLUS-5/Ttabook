# Ttabook Clean Code Rules (AI Context)

## Core Principles
1. **Simplicity over cleverness** - Choose simple, clear solutions over complex ones
2. **YAGNI** - Don't add features not currently needed
3. **Readability first** - Prioritize readability over performance/brevity
4. **Minimal change** - Make smallest reasonable change for goal
5. **Meaningful naming** - Names must clearly express purpose and scope

## Structural Rules
- **Separation of concerns**: UI/business logic, frontend/backend, global/local state
- **Consistency first**: Project internal consistency > external standards
- **Type safety**: TypeScript strict mode, minimize `any`, define interfaces clearly

## Testing Requirements
- **TDD mandatory**: Failing test first → minimal code to pass
- **Full coverage**: Unit + Integration + E2E tests required
- **Real data in E2E**: No mocks, use actual APIs/data

## Debugging Process
1. **Root cause analysis**: Fix causes, not symptoms
2. **Systematic approach**: Reproduce → Check changes → Compare → Hypothesize → Minimal fix
3. **Document insights**: Record failures and successes

## Code Change Policy
- **NEVER change unrelated code** without explicit permission
- **NEVER rewrite existing implementations** without explicit permission
- **ALWAYS match surrounding style** (over external standards)
- **NEVER remove comments** unless provably wrong
- **NEVER use temporal context** ("recently refactored", "moved")
- **AVOID "new/enhanced/improved"** naming

## Git Requirements
- **Handle uncommitted changes** before starting work
- **Create WIP branches** for new work
- **Commit frequently** throughout development
- **Clean test output** required (capture/test expected errors)

## Collaboration Rules
- **Transparency**: Say "I don't know" when unsure
- **Immediate sharing**: Report problems immediately
- **No guessing**: No assumption-based code
- **Technical feedback**: Challenge bad ideas with technical reasoning
- **Point out mistakes**: Required for bad ideas/unrealistic expectations