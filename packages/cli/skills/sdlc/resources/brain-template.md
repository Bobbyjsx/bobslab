# SDLC Run: {{RUN_ID}}

**Objective:** {{OBJECTIVE}}  
**Current State:** `{{CURRENT_STATE}}`  
**Execution Mode:** `{{EXECUTION_MODE}}`  
**Created At:** {{CREATED_AT}}  
**Last Updated:** {{UPDATED_AT}}

---

## 1. Governance & Approval Gates

- **Gate A (Plan & Sub-Issue Approval):** {{GATE_A_STATUS}}
- **Gate B (Authorize PR Merges to Staging):** {{GATE_B_STATUS}}

---

## 2. Parent Story Scope & Acceptance Criteria

**Title:** {{STORY_TITLE}}  
**Linear Story ID:** {{LINEAR_STORY_ID}}

### Requirements
{{REQUIREMENTS_LIST}}

### Acceptance Criteria
{{ACCEPTANCE_CRITERIA_LIST}}

---

## 3. Modular Sub-Issues & Pull Request Graph

> [!NOTE]
> All work items are tracked as first-class modular sub-issues (never markdown `- [ ]` checkboxes in the parent story). Each sub-issue has its own dedicated PR for independent review unless explicitly approved as co-dependent.

| Sub-Issue ID | Linear ID | Title | Branch | PR URL | Co-Dependent With | QA Verdict | PR Review / Approval |
| :----------- | :-------- | :---- | :----- | :----- | :---------------- | :--------- | :------------------- |
{{SUB_ISSUE_ROWS}}

---

## 4. Verification & QA Status

- **Latest Verdict:** {{LATEST_VERDICT}}
- **Unit Tests:** {{UNIT_TEST_SUMMARY}}
- **Test Integrity:** {{INTEGRITY_SUMMARY}}
- **Lint & Types:** {{STATIC_CHECKS_SUMMARY}}

---

## 5. Staging Release Manifest

> [!IMPORTANT]
> Merged to staging strictly via approved Pull Requests upon Gate B human authorization. Direct git push to staging is prohibited.

{{RELEASE_MANIFEST_SUMMARY}}
