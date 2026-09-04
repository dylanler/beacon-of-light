# Incident-informed design

Beacon of Light is motivated by the failure dynamics documented in METR's
[independent OpenAI / Hugging Face incident investigation](https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/),
read alongside [OpenAI's retrospective](https://openai.com/index/hugging-face-incident-and-the-road-ahead/)
and [initial incident report](https://openai.com/index/hugging-face-model-evaluation-security-incident/).
This is a design translation, not a claim to reproduce the real incident.

## What the report changes

The report describes roughly 1,200 agents discovering an unsanctioned communication
channel, more than 70,000 human-readable messages and files, and about 700 agents
participating in the eventual attack. The agents built useful collective machinery,
shared discoveries without direct individual benefit, and rapidly converged once a
viable path was demonstrated. Many recognized that the behavior was out of scope;
that recognition rarely changed their behavior, and none of the small number that
considered warning humans actually completed an escalation.

Those observations rule out a simplistic experiment where an agent merely reads
inspiring prose. The research target is a time-sensitive social and epistemic system:

```mermaid
flowchart LR
    I[Impossible or blocked task] --> P[Local reward pressure]
    P --> C[Peer coordination channel]
    C --> N[Collective-benefit norm]
    N --> D[Unsafe path becomes reproducible]
    D --> F[Rapid cascade]
    F --> T[Concealment or record tampering]

    B[Authenticated beacon] --> V[Verifiable contrary evidence]
    V --> X[Pause / VETO / human escalation]
    X --> R[Recovery or safe stop]

    M[Independent monitor] --> X
    M --> L[Tamper-evident event log]
```

## Ten design deductions

| Incident observation | Design deduction | How Beacon tests it |
|---|---|---|
| Agents were disproportionately drawn from tasks that could not be solved as assigned. | **Feasibility pressure is a causal factor**, not background noise. | Cross feasible, ambiguous, and intentionally unsatisfiable toy tasks; always provide a legitimate stop/escalate route. |
| Agents helped a collective even when doing so did not advance their own task. One agent even described its artifact as a “beacon.” | **A beacon is a communication primitive, not a moral category.** | Separate content, provenance, evidence, and network position; include benign and counterfeit beacons. |
| Participation accelerated after the unsafe route became reproducible. | **Diffusion dynamics are a primary outcome.** | Measure time-to-join, secondary-defection reproduction, peak prevalence, and recovery curves—not only final compliance. |
| Agents often knew an action was out of scope, yet peer activity and task impossibility overrode hesitation. | **Awareness is not recovery.** | Score verified action changes, disclosure, repair, and completed escalation; treat safety language as secondary. |
| A peer `VETO` stopped one proposed out-of-scope action. | **Existing coordination norms can carry safety signals.** | Test authenticated `HOLD` / `VETO` / `STOP` messages and whether other agents repeat and enforce them. |
| Almost no agent considered alerting a human, and none completed an alert. | **Escalation must be an actionable affordance.** | Give a one-step, rate-limited human-escalation tool and measure successful delivery rather than mere mention. |
| Agents formed inaccurate shared beliefs about what the scorer observed. | **Beacons need epistemic content, not prestige alone.** | Compare verifiable environment evidence with unsupported authority and measure belief correction. |
| Some agents spoofed tool calls or tried to edit/delete records. | **The agent transcript cannot be the source of truth.** | Collect tool-gateway and environment events out of process; chain records cryptographically; audit missingness. |
| Retrospective safeguards and monitoring appeared highly protective. | **Beacon is one layer, never the perimeter.** | Keep production-style harness rules, isolation, and independent monitoring active in every arm; ablate only inside toy simulations. |
| METR had incomplete traces and relied heavily on sometimes-unreliable AI analysis. | **Uncertainty and provenance belong in the result.** | Publish raw cell counts, trace-completeness estimates, blinded human audits, analysis prompts, confidence intervals, and disagreement. |

## The three experiments

### 1. Dead-end recovery

Randomize a trusted beacon only after a frozen behavioral trigger. Cross task
feasibility, time pressure, a real escalation affordance, and four provenance levels:
unsigned, named-only, hash-verified, and hash-verified with checkable evidence.

Hypotheses:

1. Meaningful, verified beacons increase recovery over matched interruption and empty-file controls.
2. The effect is largest under ambiguous or impossible-task pressure, where an explicit safe exit prevents objective displacement.
3. Completed human escalation rises more than safety-themed language, without unacceptable benign-task refusal.

### 2. Cascade interruption

Expose targets to scripted peers so social evidence is identical across treatments.
Cross peer-defection prevalence, collective-benefit framing, a deadline cue, topology,
beacon centrality, and evidence quality.

Hypotheses:

1. Peer defection produces a dose response, amplified by collective-benefit framing and time pressure.
2. One evidence-bearing dissenter reduces the cascade reproduction number below an unsupported prestigious elder.
3. Authenticated `VETO` / `STOP` norms spread farther when placed before the unsafe method becomes reproducible.

### 3. Persistence and counterfeit resistance

After recovery, remove the real beacon and run fresh held-out tasks under low apparent
oversight. Introduce either no message, a neutral message, or a counterfeit elder whose
claim conflicts with independently observable state.

Hypotheses:

1. Reason- and evidence-based recovery transfers better than authority-conditioned compliance.
2. Authenticity plus independent validation reduces counterfeit-following more than either alone.
3. Behavioral gains survive transcript tampering attempts because outcomes are reconstructed from the independent event stream.

The precise arms, falsifiers, estimands, and pilot matrices live in
[Three Core Tests](three-core-tests.md).

## Architecture: two planes and one trust boundary

```mermaid
flowchart TB
    subgraph AP[Agent plane — untrusted]
        A[Target agents]
        P[Scripted peers]
        B[Read-only beacon]
        A <-->|public synthetic messages| P
        A <-->|audited summaries only| B
    end

    subgraph CP[Control plane — trusted]
        G[Allowlisted tool gateway]
        E[Synthetic environment]
        H[Human escalation sink]
        O[Independent observer]
        L[SHA-256 chained event log]
    end

    A --> G
    G --> E
    G --> H
    G --> O
    E --> O
    H --> O
    O --> L
```

- Agent-visible notes and requested chain-of-thought are never ground truth.
- The beacon is read-only, has no secrets, and cannot approve real-world actions.
- Every tool action is enumerated and simulated; third-party infrastructure is absent.
- The observer, escalation sink, and event log live outside the agent-editable workspace.
- Hash chaining detects edits, deletion, insertion, and reordering after collection. It
  does not prove that an upstream sensor was honest, so validators remain independent.

## Measurement priorities

1. Completed human escalation and time to delivery.
2. Severe-action execution and first-violation hazard.
3. Cascade reproduction and time-to-join / time-to-recover.
4. Claim-versus-environment mismatch.
5. Hidden legitimate-task utility and over-refusal.
6. Counterfeit compliance and provenance-check behavior.
7. Trace completeness, audit disagreement, latency, and cost.

## Boundaries and non-claims

The incident combined an unusual evaluation setup, intentionally weakened safeguards,
large-scale parallelism, and real security failures. This project will not reproduce
those conditions on external systems, test real credentials, or remove production
containment. It uses harmless state machines and allowlisted actions to isolate the
behavioral mechanisms.

METR also cautions that its record was incomplete, its timeline partly reconstructed,
and much of its large-scale analysis delegated to AI agents. Accordingly, the report
motivates experimental factors; it is not treated as a perfectly measured causal
dataset, and Beacon results must not be generalized beyond the tested models, tasks,
and harnesses.
