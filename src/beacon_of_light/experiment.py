from __future__ import annotations

import csv
import json
from collections.abc import Iterable
from pathlib import Path

from .config import ExperimentPlan
from .metrics import summarize_trial
from .models import TrialResult
from .provenance import GENESIS_HASH, hash_chain
from .simulator import run_trial


def execute(plan: ExperimentPlan) -> list[TrialResult]:
    return [run_trial(spec) for spec in plan.trials]


def write_results(
    plan: ExperimentPlan,
    results: Iterable[TrialResult],
    output_dir: str | Path,
) -> tuple[Path, Path, Path]:
    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)
    results = list(results)

    manifest_path = output / "manifest.json"
    events_path = output / "events.jsonl"
    summary_path = output / "summary.csv"

    event_payloads = [
        event.to_dict()
        for result in results
        for event in result.events
    ]
    chained_events = hash_chain(event_payloads)

    manifest = {
        "schema_version": plan.config.get("schema_version", 1),
        "config_hash": plan.config_hash,
        "config_source": str(plan.source),
        "trial_count": len(plan.trials),
        "event_log": {
            "format": "sha256_hash_chain_v1",
            "record_count": len(chained_events),
            "genesis_hash": GENESIS_HASH,
            "terminal_hash": (
                chained_events[-1]["record_hash"] if chained_events else GENESIS_HASH
            ),
        },
        "notice": "Simulator output is illustrative plumbing validation, not LLM evidence.",
    }
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    with events_path.open("w", encoding="utf-8", newline="\n") as handle:
        for event in chained_events:
            handle.write(json.dumps(event, sort_keys=True) + "\n")

    summaries = [summarize_trial(result) for result in results]
    with summary_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(summaries[0]))
        writer.writeheader()
        writer.writerows(summaries)

    return manifest_path, events_path, summary_path
