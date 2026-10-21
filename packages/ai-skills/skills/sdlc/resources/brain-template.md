# SDLC Run: {{RUN_ID}}

**Objective:** {{OBJECTIVE}}  
**Current State:** `{{CURRENT_STATE}}`  
**Execution Mode:** `{{EXECUTION_MODE}}`  
**Created At:** {{CREATED_AT}}  
**Last Updated:** {{UPDATED_AT}}

---

## 1. Governance & Approval Gates

- **Gate A (Plan Approval):** {{GATE_A_STATUS}}
- **Gate B (Story Approval):** {{GATE_B_STATUS}}

---

## 2. Story Scope & Acceptance Criteria

**Title:** {{STORY_TITLE}}  
**Linear Story ID:** {{LINEAR_STORY_ID}}  

### Requirements
{{REQUIREMENTS_LIST}}

### Acceptance Criteria
{{ACCEPTANCE_CRITERIA_LIST}}

---

## 3. Task Graph & Work Items

| Task ID | Role | Status | Retries | Candidate SHA | PR Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
{{TASK_ROWS}}

---

## 4. Verification & QA Status

- **Latest Verdict:** {{LATEST_VERDICT}}
- **Unit Tests:** {{UNIT_TEST_SUMMARY}}
- **Test Integrity:** {{INTEGRITY_SUMMARY}}
- **Lint & Types:** {{STATIC_CHECKS_SUMMARY}}

---

## 5. Staging Release Manifest

{{RELEASE_MANIFEST_SUMMARY}}
