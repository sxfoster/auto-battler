# Unit Testing Strategy for Shared Systems

## Introduction

This document outlines the unit testing strategy for the `shared/systems` modules within this project. Unit testing is crucial for ensuring the correctness, reliability, and maintainability of the core game logic housed in these shared modules, as they are consumed by both the `client` and `game` packages.

The goal is to have a consistent and effective approach to writing and running unit tests, enabling developers to confidently modify and extend shared systems.

## Testing Tools & Environment

- **Test Runner**: Tests are orchestrated by **Jest** when running `npm test`. Individual files can still be executed directly with `node [path_to_test_file.js]` because they rely on Node's built-in `test` module.
- **Assertion Library**: Node's built-in `assert` module (`import assert from 'assert';`) is used for making assertions within test cases.
- **File Naming Convention**: Test files are named using the pattern `[module_name].test.js` (e.g., `crafting.test.js` for `crafting.js`).
- **Location**: Test files are located alongside the modules they test within the `shared/systems/` directory.
- **Module System**: Tests are written as ES modules, consistent with the `shared` package's configuration (`"type": "module"` in `shared/package.json`).

## Core Testing Principles

Our unit tests adhere to the following core principles:

1.  **Arrange-Act-Assert (AAA)**: Each test case should clearly separate these three phases:

    - **Arrange**: Set up the necessary preconditions, mock data, and inputs.
    - **Act**: Execute the specific function or unit of code being tested.
    - **Assert**: Verify that the actual outcome matches the expected outcome using `assert` methods.

2.  **Test Case Granularity**: Each test function should focus on verifying one specific aspect, behavior, or scenario of the unit under test. This makes tests easier to understand, debug, and maintain.

3.  **Descriptive Naming**:

    - Test files are named to clearly indicate the module they are testing (e.g., `enemyAI.test.js`).
    - Test functions should have descriptive names that clearly state what scenario or behavior they are testing (e.g., `testShouldExecuteCombo_False_NoRecentStarter`).

4.  **Test Isolation**: Tests should be independent of each other. The outcome of one test should not affect the outcome of another. Strategies employed include:
    - **State Reset Functions**: For modules that manage internal state (like `market.js`), a dedicated `resetModuleNameForTesting()` function is added to the module itself and called before each test or test group (e.g., via a `beforeEachTest()` helper in the test file).
    - **Fresh Mock Data**: Each test function initializes its own mock data to avoid shared state between tests.
    - **Unique Identifiers**: Using unique IDs for entities like players or items in tests where global state might otherwise be a concern (though direct state reset is preferred).

## Mocking & Test Data

- **Mocking Model Objects**: Data models (e.g., Cards, Enemies, Players, Professions) are typically mocked as simple JavaScript objects created by helper functions within the test file (e.g., `createMockEnemy()`, `createMockCard()`). These helpers allow for easy creation of consistent test data with relevant properties for the test scenario.
- **Mock Data Collections**: Arrays of these mock objects are used to simulate collections like enemy decks, player inventories, or market listings.
- **Handling Randomness**: If a system involves randomness (e.g., `Math.random()`), and specific outcomes need to be tested, techniques like temporarily overriding `Math.random` within a test's scope might be employed. (Note: This has not been explicitly required for the current test suites for `crafting.js`, `enemyAI.js`, or `market.js`).

## Writing and Running Tests

- **Primary Execution**: The `npm test` command, defined in the root `package.json`, is the standard way to run all unit tests across the project.
- **Direct Execution**: Individual test files can be run directly using `node shared/systems/[module_name].test.js`. This is useful for focused TDD or debugging. The test files include a simple console runner that executes all test functions within the file and reports:
  - A "PASSED" or "FAILED" message for each test function.
  - Detailed error messages for failed tests.
  - A summary of total, passed, and failed tests.
  - The script exits with a non-zero error code if any tests fail, making it suitable for CI environments.

## Example Test Suites

The following test files serve as concrete examples of this strategy in practice:

- **`shared/systems/crafting.test.js`**: Covers crafting logic, including recipe matching, ingredient consumption, level requirements, currency costs, profession XP gain, and recipe discovery. It demonstrates testing functions that modify player and inventory state.
- **`shared/systems/enemyAI.test.js`**: Focuses on the AI's decision-making processes, such as tracking actions for combos, evaluating card utility, choosing combo starters/finishers, and target selection logic.
- **`shared/systems/market.test.js`**: Tests market transactions (buy/sell/bid), player balance management, item listing retrieval with filtering, and market restocking. It includes a `resetMarketForTesting()` mechanism for state management.

These examples illustrate the application of the AAA pattern, mock data helpers, and isolated test cases.

## Extending the Approach

The principles and tools outlined in this document (Jest runner, Node's `assert` module, ES module syntax, AAA pattern, mock helpers, state isolation) should be applied when writing new unit tests for other existing or future modules within the `shared/systems` directory.

While this document focuses on unit testing shared JavaScript logic, similar strategies (e.g., component testing with appropriate libraries) could be adapted for testing UI components in the `client` package or specific game scene interactions in the `game` package if such needs arise in the future.

## Maintenance

Unit tests are living code and must be maintained alongside the application code. When a module's logic changes, its corresponding unit tests should be updated to reflect those changes. If a bug is found, a new test case should ideally be written to reproduce the bug before fixing it, ensuring the fix is effective and preventing regressions.

Recent additions like the Energy system for abilities include dedicated tests (such as `enemyAI.test.js`) to ensure energy costs are respected and regenerated correctly.
