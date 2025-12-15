# Development Process

## Frontend-Driven Development Workflow

1. **Design Analysis**: Read Figma design from `figma-design/` directory for the page to implement
2. **Implementation**: Build page using React + TypeScript + Ant Design components
3. **Mock APIs**: Create MSW handlers for all required API endpoints
4. **API Documentation**: Document all API contracts in `backend-debt/` folder as OpenAPI YAML specs
5. **Testing**: Test implementation with Playwright MCP at Figma resolution (1440x900)
6. **Comparison**: Compare Playwright screenshots in `.playwright-mcp/` with Figma designs pixel-by-pixel
7. **Refinement**: Fix any visual or layout discrepancies
8. **User Validation**: User reviews and approves before moving to next page
9. **Backend Implementation Guide**: Create `backend-debt/<FEATURE>-IMPLEMENTATION.md` with TDD scenarios, following the format of `LOGIN-IMPLEMENTATION.md` and `AGENTS-IMPLEMENTATION.md`
10. **Iterate**: Repeat for each page in the application

## Key Principles

- Frontend implements first with mock data
- Backend team implements APIs exactly per contract specs in `backend-debt/` 
- Backend team uses Test Driven Development workflow
- All functionality must work with MSW before backend integration
- Visual fidelity to Figma designs is critical
- Test every page with Playwright before user review

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Ant Design
- **Routing**: React Router DOM
- **API Client**: Axios with interceptors
- **State**: Context API
- **Mocking**: MSW (Mock Service Worker)
- **Testing**: Playwright MCP
- **API Specs**: OpenAPI 3.0 (Swagger YAML)
