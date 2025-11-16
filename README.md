# AutomationExercise API Test Framework

This repository contains a small API automation framework using Playwright Test (JavaScript) to test the APIs listed at https://automationexercise.com/api_list.

Quick start

1. Install dependencies:

```powershell
npm install
npx playwright install
```

2. Run tests:

```powershell
npm test
```

Notes

- Endpoints are configurable in `config/endpoints.json`. Update the paths if they differ from the live site.
- The framework provides `src/api/apiClient.js` (a wrapper around Playwright `request`) and example tests under `tests/api`.
- If you want, I can run the tests here (requires network) and adjust mappings if endpoints differ.
