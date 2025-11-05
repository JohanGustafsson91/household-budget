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