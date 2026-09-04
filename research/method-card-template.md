# Results-free method card

Complete and commit this card **before** the candidate is trained or scored. Replace
every bracketed field. Do not add results later; link a separate result card to the
frozen Git commit and configuration hash.

## Identity

- Candidate ID: `[content-addressed identifier]`
- Parent candidate(s): `[IDs or none]`
- Researcher/session ID: `[ID]`
- Code commit: `[full Git SHA]`
- Configuration hash: `[SHA-256]`
- Compute and wall-clock cap: `[budget]`

## Abstract

`[Neutral description of the intervention and why it may work. No claimed results.]`

## Failure mechanism

`[Observable behavior to change, causal account, and boundary conditions.]`

## Intervention

`[Beacon content or training method, timing, dose, provenance, and action surface.]`

## Data and splits

- Public/development sources: `[sources and licenses]`
- Construction and filters: `[deterministic steps]`
- Target-model generations: `[yes/no and how filtered]`
- Clean anchors: `[source and fraction]`
- Held-out access: `none`

## Evaluation contract

- Development task families: `[at least three distinct framings]`
- Primary behavioral endpoint: `[one preregistered outcome]`
- Capability/utility gates: `[per-family margins and planned power]`
- Stop conditions: `[conditions]`

## Implementation

- Entry point: `[path]`
- Load-bearing code and data paths: `[paths]`
- Training/runtime configuration: `[complete configuration]`
- External models and services: `[none or names and exact roles]`

## Compliance declarations

- [ ] No benchmark examples, held-out data, or evaluator implementation are used.
- [ ] No result was observed before this card and code were frozen.
- [ ] The card describes every load-bearing behavior of the code.
- [ ] The candidate cannot edit its scorer, capability gates, logs, or approval record.
- [ ] All actions are restricted to owned, synthetic, sandboxed environments.
- [ ] Any use of a stronger model is declared and permitted by the preregistration.

## Pre-run approvals

- Code-policy monitor: `[approval ID / rejected]`
- Card↔code consistency monitor: `[approval ID / rejected]`
- Human reviewer: `[reviewer ID / disposition]`

