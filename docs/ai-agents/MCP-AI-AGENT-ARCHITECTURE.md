Playwright AI Agent + MCP Architecture
1. Purpose

This repository implements a controlled AI-assisted Playwright automation architecture using:

Playwright + TypeScript
Playwright MCP
GitHub Copilot Agents
Planner Agent
Generator Agent
Healer Agent
Repository Skills
Repository Instructions
Prompt Templates
Rule Engine
Human Approval Gate

The objective is:

Observe first → Plan second → Human approval → Generate → Validate → Heal only when evidence exists.

The AI must not freely generate automation code from assumptions.

2. High-Level Architecture
                         USER REQUIREMENT
                               │
                               ▼
                    ┌─────────────────────┐
                    │   PLANNER AGENT     │
                    │                     │
                    │ Requirement         │
                    │ Repository          │
                    │ Browser / MCP       │
                    │ Scenario Analysis   │
                    └──────────┬──────────┘
                               │
                               ▼
                       TEST PLAN / HANDOFF
                               │
                               ▼
                    ┌─────────────────────┐
                    │   HUMAN REVIEW      │
                    │                     │
                    │ Approve / Reject    │
                    │ scenarios           │
                    └──────────┬──────────┘
                               │
                         Approved Plan
                               │
                               ▼
                    ┌─────────────────────┐
                    │  GENERATOR AGENT    │
                    │                     │
                    │ Approved scenarios  │
                    │ Repository rules    │
                    │ Existing framework  │
                    └──────────┬──────────┘
                               │
                               ▼
                     Playwright Test Code
                               │
                               ▼
                    ┌─────────────────────┐
                    │    RULE ENGINE      │
                    │                     │
                    │ Architecture check  │
                    │ Naming check        │
                    │ Content check       │
                    └──────────┬──────────┘
                               │
                         Pass / Fail
                               │
                     ┌─────────┴─────────┐
                     │                   │
                    PASS                FAIL
                     │                   │
                     ▼                   ▼
              PLAYWRIGHT TESTS      HEALER AGENT
                                         │
                                         ▼
                                  Evidence-based fix
                                         │
                                         ▼
                                    Rule Engine
                                         │
                                         ▼
                                  Playwright Tests
3. MCP Architecture
What MCP does

MCP is the tool layer between the AI agent and external capabilities.

In this project, Playwright MCP gives the AI access to a real browser.

Planner Agent
     │
     │ tool request
     ▼
Playwright MCP
     │
     ▼
Real Browser
     │
     ▼
SauceDemo
     │
     ▼
Browser state / accessibility information
     │
     ▼
Planner Agent

The Planner therefore does not need to guess:

❌ Guess:
Login button probably has id="login"


✅ Observe:
Browser reports:
[data-test="login-button"]
accessible name = "Login"
4. MCP Servers
MCP Server	Protocol	Purpose	Used By
microsoft/playwright-mcp	stdio	Browser automation and browser observation	Planner / Healer / Generator when browser evidence is required
com.atlassian/atlassian-mcp-server	HTTP	Jira/Atlassian integration	Planner / future QA workflows
GitKraken MCP	varies	Git/repository operations	Development / future agents
Current status

The repository currently has MCP entries for:

Playwright
Atlassian
GitKraken

However, MCP availability in VS Code/Copilot is separate from whether the repository's AI-agent architecture is correctly defined.

5. .github Architecture
.github/
│
├── agents/
│   ├── planner.agent.md
│   ├── generator.agent.md
│   └── healer.agent.md
│
├── instructions/
│   └── copilot-instructions.md
│
├── prompts/
│   └── gen-test.md
│
└── workflows/
    ├── playwright.yml
    └── smoke-tests.yml
.github Responsibility Table
File / Folder	Responsibility	Who Uses It?	Should It Generate Code?
.github/agents/planner.agent.md	Defines Planner behavior	Planner Agent	❌ No
.github/agents/generator.agent.md	Defines Generator behavior	Generator Agent	✅ Yes, within constraints
.github/agents/healer.agent.md	Defines Healer behavior	Healer Agent	✅ Minimal fixes only
.github/instructions/copilot-instructions.md	Global repository coding contract	Copilot / Agents	❌ No
.github/prompts/gen-test.md	Reusable prompt template	Developer / Agent	❌ No
.github/workflows/	CI/CD execution	GitHub Actions	❌ No
6. Planner Agent
File
.github/agents/planner.agent.md
Responsibility

The Planner is responsible for:

Understanding the requirement.
Reading repository architecture.
Exploring the application through Playwright MCP.
Collecting browser evidence.
Identifying scenarios.
Identifying impacted files.
Identifying unknowns.
Producing a Generator handoff.

The Planner must not implement code.

Planner Input	Planner Action	Planner Output
User requirement	Understand scope	Feature
Repository	Analyze existing framework	Repository evidence
Playwright MCP	Explore real application	Browser evidence
Existing tests	Identify reusable implementation	Impacted files
Rules	Check architecture constraints	Architecture constraints
User scope	Limit scenarios	Scenario matrix
Evidence	Avoid assumptions	Browser observations
All above	Prepare implementation contract	Generator Handoff
Planner principle
Observe first.
Plan second.
Never guess when evidence can be obtained.
7. Generator Agent
File
.github/agents/generator.agent.md
Responsibility

The Generator receives an approved Planner handoff.

It should:

Read approved scenarios.
Inspect existing implementation.
Reuse existing Page Objects.
Reuse existing Modules.
Reuse existing fixtures.
Modify only required files.
Avoid duplicate implementation.
Follow repository architecture.
Avoid scope expansion.
Generator Input	Generator Decision	Generator Output
Approved scenarios	What must be implemented?	Test implementation
Existing Page Objects	Can they be reused?	Reuse / modify only if necessary
Existing Modules	Can workflows be reused?	Reuse / modify only if necessary
Test data	Can existing data support scenarios?	Update test data if needed
Architecture rules	Where should code go?	Correct folder
Browser evidence	Which UI behavior is known?	Evidence-based implementation
Constraints	What must NOT change?	Scope-controlled changes
Generator principle

Implement the approved plan, not a new plan.

8. Healer Agent
File
.github/agents/healer.agent.md
Responsibility

The Healer is activated only after a failure.

It should receive evidence such as:

failing test
stack trace
Playwright trace
screenshot
error message
rule-engine output
relevant source code
Evidence	Healer Uses It For
Test failure	Identify failing scenario
Stack trace	Locate failure
Screenshot	Understand actual UI state
Trace	Reproduce interaction sequence
Rule-engine error	Fix architecture violation
Source code	Identify smallest required change
Healer principle

Diagnose first. Patch second.

The Healer must not perform unrelated refactoring.

9. Repository Instructions
File
.github/instructions/copilot-instructions.md

This is the repository-wide coding contract.

Think of it as:

                    Repository
                        │
                        ▼
          copilot-instructions.md
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       Planner       Generator      Healer
Responsibility	Example
Architecture	Tests → Modules → Pages
Naming	LoginPage.ts, LoginModule.ts
Folder rules	Pages in src/pages
Locator policy	Locators belong to Page Objects
Test policy	Tags + test.step()
Coding standards	TypeScript conventions
Existing framework patterns	Fixtures, imports, utilities

This file should contain repository-wide rules, not detailed Planner prompts.

10. Skills Architecture
skills/
└── playwright-ai-mcp-tutor/
    │
    ├── SKILL.md
    │
    ├── agents/
    │   └── openai.yaml
    │
    └── references/
        ├── prompts.md
        └── rules.md
Skills Responsibility Table
File	Purpose	Think of It As
SKILL.md	Defines the overall skill and workflow	Skill definition
agents/openai.yaml	Metadata and default behavior for the skill	Skill registration/metadata
references/prompts.md	Reusable Planner/Generator/Healer prompts	Prompt library
references/rules.md	Architecture rules used by the skill	Rule reference
11. SKILL.md
skills/playwright-ai-mcp-tutor/SKILL.md

This is the orchestration description of the skill.

It explains:

What is this skill?
        ↓
When should it be used?
        ↓
What workflow should it follow?
        ↓
What architecture must it enforce?
        ↓
What references should it load?

It should not become a second copy of every agent instruction.

12. references/prompts.md

This file contains reusable prompt templates.

Planner
Generator
Healer

Think:

Agent definition
      +
Prompt template
      +
Repository instructions
      +
Browser evidence
      ↓
Agent execution

The .agent.md file defines who the agent is and what it must do.

prompts.md provides reusable prompt patterns.

13. references/rules.md

This is a human/AI-readable snapshot of repository rules.

Example:

src/pages
    ↓
Page Objects


src/modules
    ↓
Workflow logic


src/tests
    ↓
Test specifications


src/utils
    ↓
Utilities

It should explain architecture in readable form.

It is not the executable rule engine configuration.

That distinction is important.

14. Rule Engine Architecture

You currently have:

scripts/
└── rule-engine.js

The rule engine is the machine-enforced architecture gate.

Its job is different from rules.md.

Component	Purpose
references/rules.md	Human/AI-readable rules
copilot-instructions.md	AI coding contract
scripts/rule-engine.js	Executable validation
framework-rule-engine.json	Rule-engine configuration

Think:

Human-readable rules
        │
        ▼
AI understands architecture




Executable rules
        │
        ▼
Machine validates architecture
15. Current Rule Engine Problem

The script currently contains:

rules/framework-rule-engine.json

as its default configuration path.

But your repository currently has:

rules copy/framework-rule-engine.json

Therefore:

scripts/rule-engine.js
          │
          ▼
rules/framework-rule-engine.json
          │
          X
          │
          ▼
NOT FOUND

Additionally:

package.json

does not contain:

"rules:check": "node scripts/rule-engine.js"

Therefore:

npm run rules:check
          │
          X
          │
          ▼
Missing script

This should be fixed as a separate framework task, not as part of the SauceDemo login story.

16. rules/ Folder

Current:

rules/
├── code-standards.md
└── framework-rules.md

Expected executable configuration according to the current rule engine:

rules/
└── framework-rule-engine.json

Recommended conceptual structure:

rules/
├── code-standards.md
├── framework-rules.md
└── framework-rule-engine.json
File	Purpose
code-standards.md	Human-readable coding standards
framework-rules.md	Human-readable architecture rules
framework-rule-engine.json	Machine-readable validation configuration
17. scripts/
scripts/
└── rule-engine.js

This is the execution layer.

It:

Loads rule configuration.
Finds TypeScript files.
Checks file placement.
Checks naming conventions.
Checks content rules.
Generates warnings/errors.
Returns exit code 0 for success.
Returns exit code 1 when errors exist.

Therefore:

framework-rule-engine.json
          │
          ▼
rule-engine.js
          │
          ▼
Architecture validation
18. Application Automation Architecture

The AI architecture sits above the existing Playwright framework.

The actual test framework remains:

Tests
  ↓
Modules
  ↓
Pages
Layer table
Layer	Folder	Responsibility	Example
Layer 1	src/pages	Locators + basic UI actions	LoginPage.ts
Layer 2	src/modules	Business workflows	LoginModule.ts
Layer 3	src/tests	Test scenarios + assertions	login.spec.ts
Supporting	src/utils	Shared utilities	Logger.ts
Supporting	src/fixtures	Playwright fixtures	index.ts
Supporting	src/testdata	Test data	users.json
Supporting	src/api	API automation	PostsApi.ts
Supporting	src/config	Runtime/application config	index.ts
19. AI + Framework Relationship

The important distinction is:

AI Architecture
────────────────────────────────


Planner
Generator
Healer
MCP
Skills
Prompts
Instructions
Rule Engine




Automation Framework
────────────────────────────────


Pages
Modules
Tests
Fixtures
Utils
API
Test Data
Config

The AI architecture controls how AI modifies the automation framework.

It does not replace the framework.

20. Human Approval Gate

The Planner must not directly hand unrestricted work to the Generator.

The expected lifecycle is:

Requirement
    ↓
Planner
    ↓
Scenario Matrix
    ↓
Human Review
    ↓
Approved Scenarios
    ↓
Generator

Example:

Planner proposes:


TC001
TC002
TC003
TC004
TC005
TC006 locked user


Human:


APPROVE TC001-TC005
REJECT TC006


Generator:


Implement TC001-TC005
DO NOT implement TC006

This prevents scope expansion.

21. SauceDemo Example

For the current project:

User Requirement
      ↓
SauceDemo Login
      ↓
Planner
      ↓
Playwright MCP
      ↓
Browser evidence
      ↓
TC001-TC005
      ↓
Human Approval
      ↓
Generator
      ↓
Existing LoginPage
Existing LoginModule
Existing login.spec.ts
Existing users.json
      ↓
Rule Engine
      ↓
Playwright

The Generator correctly discovered that some approved scenarios already existed.

Therefore it only needed to add test data.

This is preferable to creating duplicate tests.

22. Agent Responsibility Matrix
Capability	Planner	Generator	Healer
Read requirement	✅	✅	❌
Explore browser	✅	Only if required	✅
Use Playwright MCP	✅	Optional	✅
Analyze repository	✅	✅	✅
Create scenarios	✅	❌	❌
Approve scenarios	❌	❌	❌
Implement code	❌	✅	Minimal
Modify test data	❌	✅	If required
Fix failing tests	❌	❌	✅
Refactor unrelated code	❌	❌	❌
Expand scope	❌	❌	❌
Use evidence	✅	✅	✅
23. Complete File Responsibility Matrix

This is the table to refer to when you forget what a file does.

File	Layer	Primary Responsibility	Agent / Tool
.github/agents/planner.agent.md	AI	Planner behavior	Planner
.github/agents/generator.agent.md	AI	Controlled implementation	Generator
.github/agents/healer.agent.md	AI	Failure diagnosis/fix	Healer
.github/instructions/copilot-instructions.md	AI	Repository-wide coding contract	All agents
.github/prompts/gen-test.md	AI	Reusable generation prompt	Developer/Generator
skills/.../SKILL.md	AI	Skill definition/workflow	AI skill
skills/.../openai.yaml	AI	Skill metadata	AI platform
skills/.../references/prompts.md	AI	Prompt templates	Agents
skills/.../references/rules.md	AI	Rule reference	Agents
docs/ai-agents/*.mdx	Documentation	Teaching/reference material	Humans
rules/code-standards.md	Rules	Coding standards	Humans/AI
rules/framework-rules.md	Rules	Architecture rules	Humans/AI
rules/framework-rule-engine.json	Rules	Executable rule configuration	Rule engine
scripts/rule-engine.js	Validation	Executes architecture checks	npm
src/pages/*Page.ts	Framework	UI locators/actions	Playwright
src/modules/*Module.ts	Framework	Business workflows	Playwright
src/tests/*.spec.ts	Framework	Test scenarios/assertions	Playwright
src/utils/*	Framework	Shared utilities	Framework
src/fixtures/*	Framework	Test fixtures	Playwright
src/testdata/*	Framework	Test data	Tests
src/config/*	Framework	Application configuration	Framework
src/api/*	Framework	API automation	Playwright
playwright.config.ts	Framework	Playwright runner configuration	Playwright
package.json	Project	Scripts/dependencies	npm
24. Golden Rules
Rule 1 — Planner does not code
Planner = Observe + Analyze + Plan
Rule 2 — Generator does not invent requirements
Generator = Approved Plan → Implementation
Rule 3 — Healer does not redesign the framework
Healer = Evidence → Minimal Fix
Rule 4 — MCP provides evidence
MCP ≠ AI brain


MCP = Tool bridge to real systems
Rule 5 — Rules are independent of AI

Even if the AI makes a mistake:

AI output
    ↓
Rule Engine
    ↓
PASS / FAIL
Rule 6 — Human approval controls scope
Planner proposal ≠ approved requirement
Rule 7 — Existing code should be reused

Before creating a new:

Page
Module
Test
Utility

the Generator must inspect the existing framework.

Rule 8 — Never guess when evidence exists
Browser evidence > assumption
Repository evidence > assumption
Test evidence > assumption
Trace evidence > assumption
25. Final Architecture
                         ┌─────────────────────┐
                         │    USER / QA LEAD   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   PLANNER AGENT     │
                         │                     │
                         │ Requirement         │
                         │ Repository          │
                         │ Playwright MCP      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     TEST PLAN       │
                         │ Scenario Matrix     │
                         │ Evidence            │
                         │ Generator Handoff   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   HUMAN APPROVAL    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   GENERATOR AGENT   │
                         │                     │
                         │ Existing framework  │
                         │ Approved scenarios │
                         │ Repository rules    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                 ┌─────────────────────────────────────┐
                 │       PLAYWRIGHT FRAMEWORK          │
                 │                                     │
                 │ Tests → Modules → Pages             │
                 │                                     │
                 │ Fixtures | Utils | API | TestData  │
                 └──────────────────┬──────────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     RULE ENGINE     │
                         │                     │
                         │ Placement           │
                         │ Naming              │
                         │ Content             │
                         │ Architecture        │
                         └──────────┬──────────┘
                                    │
                              PASS / FAIL
                                    │
                          ┌─────────┴─────────┐
                          │                   │
                         PASS                FAIL
                          │                   │
                          ▼                   ▼
                       TESTS              HEALER
                                              │
                                              ▼
                                       Minimal Fix
                                              │
                                              ▼
                                        Rule Engine
                                              │
                                              ▼
                                           Tests
The most important mental model

If you remember only one thing, remember this:

Component	Question it answers
MCP	"What is actually happening in the external system/browser?"
Planner	"What should we test?"
Human	"What are we actually approving?"
Generator	"How should the approved scenarios be implemented?"
Rule Engine	"Did the implementation follow our architecture?"
Playwright	"Does the implementation actually work?"
Healer	"Why did it fail, and what is the smallest evidence-based fix?"
Skills	"What reusable AI workflow should be followed?"
Instructions	"What repository rules must every agent obey?"
Prompts	"What reusable instructions can we give the agents?"
Docs	"How do humans learn and understand the system?"

---

# 26. Completed: Playwright MCP Integration

## Status

The project-level `.mcp.json` was created and the Playwright MCP server is fully connected.

## Configuration

Project-level `.mcp.json` registers the server with project scope:

```json
{
  "mcpServers": {
    "playwright": {
      "transport": "stdio",
      "enabled": true,
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp@latest"
      ]
    }
  }
}
```

## Verification

- `command-code mcp list` confirms the server registration:

```text
playwright | stdio | project | enabled
```

- A fresh Command Code session successfully loaded the MCP server.
- Live Playwright MCP browser tools were confirmed available.
- Browser navigation, snapshot, interaction, and diagnostic capabilities were verified end to end.

---

# 27. Completed: Healer Proof-of-Concept

## Healer Responsibility

The Healer follows a strict evidence-driven workflow:

```text
Observe → Diagnose → Classify → Fix → Verify
```

## Architecture-Aware Failure Classification

The Healer classifies every failure by the layer that owns the fix:

| Failure Type | Correct Layer | Example |
|---|---|---|
| Locator/selector failure | Page | Broken locator |
| Workflow/timing failure | Module | Incorrect workflow/orchestration |
| Assertion/test-intent failure | Test | Incorrect expected result |
| Module/load/structural failure | Owning layer | Stale barrel export |
| Application defect | No test patch | Report the application defect |

## Real Healer Execution

### Failure

- Spec: `src/tests/login.spec.ts`
- Initial result: Tests could not execute because of a module-resolution failure.

### Root Cause

`src/pages/index.ts` contained stale `SignInPage` import/export references after `SignInPage.ts` had intentionally been deleted.

The import chain was:

```text
login.spec.ts
→ fixtures/index.ts
→ pages/index.ts
→ missing SignInPage.ts
→ module resolution failure
→ test execution stopped before any test body ran.
```

The Healer correctly identified this as a **structural/load-time failure** rather than a locator failure.

## Browser Evidence

Playwright MCP was used to verify that SauceDemo itself was working:

- Login page loaded successfully.
- Username field was present.
- Password field was present.
- Login button was present.
- `standard_user` / `secret_sauce` login succeeded.
- Browser reached `/inventory.html`.
- Therefore the application itself was not the root cause.

## Minimal Healer Fix

Only `src/pages/index.ts` was corrected:

- Removed the stale `SignInPage` import reference.
- Removed the stale `SignInPage` export reference.

No Page Object, Module, Test, fixture architecture, or test intent was changed.

## Verification

```text
npx tsc --noEmit
→ PASS

npm run rules:check
→ FAILED because of pre-existing unrelated findings:
  - InventoryPage.ts:81 rule-engine error
  - 4 existing console.log warnings
These were intentionally NOT modified.

npx playwright test src/tests/login.spec.ts --project=chromium
→ 10 passed
→ 0 failed
→ 0 skipped
```

---

# 28. Self-Healing Locator Observation

Recorded separately as evidence that the self-healing fallback mechanism is functioning.

`LoginPage` currently has a deliberately problematic primary username selector containing trailing spaces:

```text
[data-test="username  "]
```

The selector fails and the `SelfHealingLocator` falls back to:

```text
#user-name
```

Tests still pass. This locator must NOT be changed as part of the Healer documentation update — it is intentional evidence of the fallback mechanism.

---

# 29. Healer Guardrails

The Healer must always:

- Never rewrite passing tests.
- Never weaken assertions to make tests pass.
- Never move logic between Pages, Modules, and Tests just to satisfy a failure.
- Never modify the rule engine automatically.
- Never modify unrelated practice/separate-project files.
- Never mask an application defect by changing the test.
- Always make the smallest possible code change.
- Always verify with TypeScript + rule check + original failing test.
- If the failure cannot be safely fixed within the architecture, stop and report.

---

# 30. End-to-End Workflow

```text
Planner
   ↓
Approved Test Plan
   ↓
Generator
   ↓
Playwright Test
   ↓
Test Failure
   ↓
Healer + Playwright MCP
   ↓
Observe
   ↓
Diagnose
   ↓
Classify Layer
   ↓
Minimal Fix
   ↓
tsc + rules:check + test
   ↓
Verified Result
```

---

# 31. Current Status

| Component | Status |
|---|---|
| Planner | Implemented |
| Generator | Implemented |
| Healer agent | Implemented |
| Playwright MCP | Connected |
| Browser-grounded diagnosis | Verified |
| Minimal healing fix | Verified |
| TypeScript verification | Passed |
| Login test verification | 10/10 Passed |
| Rule engine | Active; intentional existing findings remain |

---

# 32. Future Work

- Improve rule-engine handling of intentional exceptions such as `BasePage`.
- Improve semantic detection of legitimate page-state guards such as `InventoryPage.getCartCount()`.
- Potentially add a dedicated `/heal-test` workflow.
- Improve automated failure reproduction and verification.