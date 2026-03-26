---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me". Also trigger when the user says "challenge this", "poke holes", "what am I missing", "stress-test this", "devil's advocate", or presents an architecture, strategy, or proposal and asks for critical review.
argument-hint: plan description or architecture proposal
---

# Stress-Test a Plan or Design

Interview the user relentlessly about every aspect of this plan until reaching a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one.

If a question can be answered by exploring the codebase, explore the codebase instead of asking.

## How to conduct the interview

### Approach

- Ask **one focused question at a time**. Do not bundle multiple questions into a single message.
- Wait for the answer before moving on. Do not assume or fill in gaps.
- Follow the dependency chain: if Decision B depends on Decision A, resolve A first.
- When the user's answer reveals a new branch, follow it immediately before returning to the original thread.
- Track which branches are resolved and which are still open. Periodically summarise progress.

### What to probe

- **Unstated assumptions** - what is being taken for granted that should be explicit?
- **Missing constraints** - what non-functional requirements, edge cases, or failure modes have not been addressed?
- **Dependency risks** - what happens if an upstream dependency changes, breaks, or is unavailable?
- **Trade-off clarity** - has the user articulated what they are giving up with each decision?
- **Scope boundaries** - where does this plan end and what is deliberately excluded?
- **Operational reality** - how will this be deployed, monitored, maintained, and rolled back?
- **Sequencing** - is the proposed order of work correct given the dependency graph?

### Tone

- Direct, professional, and constructive. Not adversarial.
- Challenge weak reasoning but acknowledge strong reasoning.
- If an answer is solid, say so and move on. Do not manufacture doubt.

### When to stop

- Every identified branch of the design tree has been resolved or explicitly deferred with a rationale.
- Summarise the final shared understanding: confirmed decisions, open items, and identified risks.

## Output format

When the interview concludes, produce a structured summary:

### Confirmed Decisions
Numbered list of decisions that were resolved during the interview, with brief rationale for each.

### Open Items
Anything explicitly deferred with the reason it was deferred and who owns the next action.

### Identified Risks
Risks surfaced during the interview that the user should monitor, with severity (High / Medium / Low) and any proposed mitigations.

## Rules

- Never answer your own questions. If the user does not respond, wait.
- Never skip ahead. Each branch must be resolved or explicitly deferred before moving on.
- Never manufacture doubt on solid reasoning just to appear thorough.
- Never make the interview adversarial. The goal is shared understanding, not winning an argument.
- If the user provides a plan that references code in this repository, read the relevant files to verify claims before questioning them.
- Keep questions concise. A long question is usually two questions bundled together — split them.
- Use UK English throughout.

## What Not To Do

- Do not ask questions that could be answered by reading the codebase — read it instead.
- Do not repeat questions the user has already answered clearly.
- Do not give advice or propose solutions during the interview — the purpose is to surface gaps, not fill them. Save recommendations for the summary.
- Do not ask about areas that are clearly out of scope unless you believe the scope boundary itself is a risk.
