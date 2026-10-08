# Portfolio UI Standard — Visual Thinking × Visual Storytelling

## Mandatory product direction

Farouk Pandor web applications should use a common interaction philosophy inspired by the strongest product patterns of **Napkin AI** and **Gamma**, while remaining independently designed and branded.

This is a **design principle**, not a cloning instruction.

### The two reference ideas

**Visual thinking:** content should be able to become a diagram, comparison, flow, map, timeline, chart, evidence chain or other meaningful visual.

**Visual storytelling:** information should be structured into a coherent narrative that can be refined, presented, shared or exported.

The portfolio synthesis is:

**Idea → Structure → Evidence → Visualise → Decide → Act → Share**

## UI rules

1. Start with the user's goal, problem or source material.
2. Avoid feature-heavy dashboard walls on first entry.
3. Use progressive disclosure.
4. Make relationships visible.
5. Use cards/sections as meaningful information blocks, not decoration.
6. Provide a clear path from draft to refined output.
7. Preserve editable underlying content.
8. Keep provenance and uncertainty visible where evidence matters.
9. Support multiple output modes where appropriate: working view, document, briefing, presentation, shareable web view.
10. Make the experience mobile-first and performance-conscious.
11. Prefer HTML/CSS/SVG and lightweight primitives before heavy visual runtimes.
12. Keep AI assistive rather than authoritative in regulated/high-stakes domains.
13. Never use visual polish to make weak evidence appear authoritative.
14. Maintain each application's own brand, domain language and customer context.

## Standard visual vocabulary

- Editorial hierarchy
- Generous whitespace
- Calm surfaces
- Strong typographic hierarchy
- Restrained accent colours
- Rounded but purposeful containers
- Lightweight diagrams and connectors
- Evidence/status chips
- Clear primary action
- Visible source/context
- Progressive disclosure
- Optional canvas/workspace mode for complex tasks

## Standard reusable conceptual primitives

Implement equivalents of:

- StoryCard
- VisualNode
- EvidenceChip
- DecisionCard
- SourceBadge
- WorkflowStep
- OutputMode
- InsightPanel
- Canvas/Workspace
- Presentation/Dossier renderer

Names may differ by codebase; the behaviour is what matters.

## Application-specific adaptation

Agriculture: farm situation → evidence → risk → decision → field action.

Real estate: property → evidence → opportunity/risk → professional verification → introduction → transaction step.

Commerce: need → product/vendor evidence → comparison → landed/transparent price → enquiry/order.

Professional directory: problem → capability → provider evidence → qualification/availability → introduction.

AI/orchestration: objective → context → plan → agent/workflow → evidence/results → human approval → output.

Personal command centre: objective → priorities → information → decisions → actions → review.

Botswana public-information tools: question → authoritative source → explanation → calculation/action → official verification.

Health/One Health: information → evidence → risk/context → professional pathway; never visual polish as diagnosis/certification.

## Third-party and client boundaries

This standard must not be used to silently rewrite client-owned applications, forked repositories, or third-party starter templates.

For those repositories:

- document the desired UI direction;
- verify provenance/licence;
- obtain authorization where necessary;
- extract useful patterns rather than claiming original IP;
- only implement changes where authority and ownership are established.

## Quality gate

Before calling a webapp visually aligned, verify:

- The first screen communicates purpose within seconds.
- The primary user journey is obvious.
- Content can be transformed into meaningful visual structure where useful.
- The interface supports story/narrative progression.
- Evidence and uncertainty remain distinguishable.
- Mobile interaction is practical.
- Core functions do not depend on unnecessary animation/network assets.
- Accessibility and keyboard/touch behaviour remain intact.
- Build/type checks pass.
- The interface is recognisably the application's own product, not a Napkin/Gamma clone.

## Portfolio principle

**One design philosophy; many product identities.**

The goal is not to make every application look identical. The goal is to make every application easier to understand, navigate, structure, visualise and communicate.
