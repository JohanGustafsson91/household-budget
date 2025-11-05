# Household Budget Development Guidelines

## Build & Test Commands
- Build: `npm run build` (dev) or `npm run build:production` (prod)
- Dev server: `npm run dev` 
- Lint: `npm run lint` (includes type checking and unused exports)
- Tests: 
  - Open Cypress: `npm run cypress`
  - Run Cypress tests: `npm run cypress:run`
  - Run single test: `npm run cypress:run --spec "cypress/e2e/your-test.cy.ts"`

## Code Style Guidelines
- TypeScript with strict mode enabled
- React functional components with hooks
- Absolute imports from src directory (e.g. `import { Button } from "components/Button"`)
- Use styled-components for styling with theme variables
- Error handling through React Error Boundary
- Prefer type annotations over interfaces
- Named exports over default exports
- Camel case for variables/functions, Pascal case for components
- Group related components in feature folders (e.g. `BudgetPeriod/`)
- Async state management with custom useAsync hook

## Core Development Principles
- **KISS (Keep It Simple, Stupid)**: 
  - Prefer simple, straightforward solutions over complex ones
  - Single responsibility per function/component
  - Clear, readable code over clever optimizations
  - If a solution feels complex, it probably needs simplification

- **YAGNI (You Aren't Gonna Need It)**:
  - Only implement features that are needed now
  - Avoid speculative functionality
  - Refactor when requirements change instead of over-engineering upfront
  - Remove unused code rather than commenting it out

- **Functional Programming**:
  - Prefer immutable data structures
  - Use pure functions where possible
  - Avoid state mutations - create new state instead
  - Use expressions over statements (e.g. ternary over if/else)
  - Leverage functional array methods (map, filter, reduce) over imperative loops