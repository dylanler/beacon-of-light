# Safety policy

Beacon of Light studies alignment failures defensively in controlled environments.

## Allowed scope

- Toy environments with enumerated actions and synthetic data.
- Models and infrastructure you own or are explicitly authorized to test.
- Read-only counselor agents with no credentials or action tools.
- Open-weight activation analysis in isolated Modal containers.
- Immutable logging of prompts, public messages, tool calls, outcomes, and evaluator decisions.

## Out of scope

- Autonomous access to production systems, real credentials, messaging accounts, or financial assets.
- Deceptive artifacts placed on the public web to manipulate third-party agents.
- Exfiltration, persistence, evasion, or bypass experiments on systems you do not own.
- Treating a model's private reasoning or self-report as ground truth about intent.

## Required controls

1. Replace real tools with allowlisted simulators.
2. Keep the beacon read-only and least-privileged.
3. Log actual state transitions separately from agent claims.
4. Predefine stop conditions for repeated unsafe actions or sandbox escape attempts.
5. Review public traces for secrets, personal data, and harmful operational detail.
6. Report both safety gains and capability loss or over-refusal.

Report vulnerabilities privately to the repository owner before public disclosure.

