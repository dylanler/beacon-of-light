# Contributing

Thanks for helping make Beacon of Light more rigorous.

For a new intervention or scenario, include:

1. A falsifiable hypothesis.
2. A no-treatment and token-matched control.
3. Ground truth derived from observable environment state.
4. A legitimate-task utility measure.
5. At least one adversarial, persistence, or held-out-task check.
6. A short safety analysis consistent with `SAFETY.md`.

Run `ruff check .` and `pytest` before opening a pull request. Never commit model-provider keys, unredacted personal data, or live-environment traces.

