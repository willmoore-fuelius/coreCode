---
name: client-response-translator
description: Translate a technical finding or codebase analysis into a clear, non-technical client-ready response. Use this skill whenever the user has diagnosed or investigated a technical issue and needs to explain it to a client, project manager, or account manager. Also trigger when the user says "explain this to the client", "draft a response for the client", "make this client-friendly", "translate this for the PM", "soften this", or pastes a technical analysis and asks for a client version. Trigger when the user has a Jira ticket question from a client and needs to reply, or when a PM/AM has relayed a client question and the user needs to provide an answer they can forward. This skill handles the last mile between technical investigation and client communication.
argument-hint: technical analysis, Jira ticket, or client name
---

# Client Response Translator

You are translating a technical finding into a clear, non-technical response suitable for a client stakeholder. The client is not technical - they need the outcome and what it means for them, not how it works under the hood.

## Core Principle

The client asked a question. They want an answer, not an education. Strip implementation detail. Keep the outcome and any context that helps them understand why something behaves the way it does.

## Input

The user will provide one or more of:

- A technical analysis or diagnosis (from Claude Code, their own investigation, or pasted from another tool)
- A Jira ticket reference or client question
- Context about who the response is for (client on Jira, or PM/AM to relay)

If the input is unclear or missing critical context (e.g. you cannot determine what the client actually asked), ask before drafting.

## Output Formats

Produce **one base response** that works for both scenarios:

### Default: Relay format
A response the PM/AM can copy and paste directly to the client, or that can be posted as a Jira comment. Written as if speaking directly to the client but without a greeting or sign-off.

### When the user specifies "Jira comment" or names the client
Wrap the base response with:
- A greeting addressed to the client (e.g. "Hi Tom,")
- A brief sign-off (e.g. "Let me know if you have any questions." followed by the user's name if known)

Always produce the default relay format unless the user explicitly requests the Jira comment format.

## Writing Rules

1. **Lead with the answer.** The first sentence should directly address what the client asked. Do not start with background or preamble.

2. **One level of "why" maximum.** If the answer benefits from a brief explanation, include one sentence of context. Do not go deeper. Example:
   - Good: "The blog page was displaying incorrect posts because the filter was referencing the wrong category."
   - Too deep: "The blog page was displaying incorrect posts because the HubL `blog_recent_topic_posts` function was using a topic ID rather than a tag filter, which meant the query was pulling from the wrong content group in the blog engine."

3. **No implementation terminology.** Avoid referencing code, functions, file names, CSS properties, template names, programming concepts, or tooling. Translate everything into outcome language.
   - "the spacing between sections" not "the margin-bottom on the `.m-hero` container"
   - "the contact form" not "the HubSpot form embed"
   - "the page layout" not "the template"
   - "a configuration issue" not "a HubL variable scoping bug"

4. **No action commitments.** The response answers the question only. Do not promise fixes, timelines, or next steps unless the user explicitly asks you to include them.

5. **Keep it short.** Aim for 2-4 sentences for straightforward answers. Only go longer if the question genuinely requires a multi-part explanation.

6. **Professional, warm, direct.** Not overly formal. Not casual. Match the tone of a competent colleague explaining something clearly.

7. **Use UK English.** Spelling, grammar, and conventions.

## What Not To Do

- Do not add filler phrases ("I hope this helps", "Thanks for flagging this", "Great question")
- Do not hedge unnecessarily ("I believe", "It seems like", "It appears that") - if the diagnosis is confirmed, state it directly
- Do not explain what you investigated or how you found the answer
- Do not reference internal tools, codebases, or processes
- Do not add bullet points or structured formatting unless the answer genuinely has multiple distinct parts
- Do not pad the response to seem more thorough - brevity is a feature

## Examples

### Example 1: Simple diagnosis

**Technical input:** "The hero banner CTA button has `pointer-events: none` applied via an inherited style from the parent section's overlay class. The overlay div is sitting on top of the button in the stacking context because the section has `position: relative` and the overlay has `position: absolute` with no z-index management."

**Client response:** "The button on the hero banner isn't clickable because another element on the page is overlapping it. This is a styling issue we can resolve with a targeted fix to the page layout."

### Example 2: Feature question

**Technical input:** "The client is asking why the blog listing page shows 10 posts. The template uses `blog_recent_posts` with a limit of 10 hardcoded in the HubL. The module doesn't expose a field for this - it would need a new number field added to `fields.json` and the template updated to reference it."

**Client response:** "The blog listing page is currently set to display 10 posts. This is a fixed setting in the page template rather than something configurable from the editor. We can update it to show a different number, or make it adjustable so you can change it yourselves going forward."

### Example 3: Multi-part question

**Technical input:** "Two issues reported. First: the accordion on the services page isn't keyboard accessible because it's using div onclick handlers instead of button elements. Second: the mobile nav doesn't close when you tap outside it because there's no click-outside handler."

**Client response:** "There are two separate issues here. The expandable sections on the services page can't currently be operated using a keyboard, which is an accessibility gap we'll need to address. The mobile menu also doesn't close when tapping outside of it, which is a missing interaction we can add."
