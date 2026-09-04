"""Modal fan-out for deterministic trial shards.

Run with:
    modal run -m beacon_of_light.modal_app --config configs/smoke.toml
"""

from __future__ import annotations

import json
import os
from pathlib import Path

import modal

from .config import load_plan
from .metrics import summarize_trial
from .models import TrialSpec
from .simulator import run_trial

image = (
    modal.Image.debian_slim(python_version="3.12")
    .uv_pip_install("openai==3.8.0")
    .add_local_python_source("beacon_of_light")
)
results_volume = modal.Volume.from_name(
    "beacon-results-v2",
    create_if_missing=True,
    version=2,
)
app = modal.App("beacon-of-light", image=image)


@app.function(
    volumes={"/results": results_volume},
    timeout=1_200,
    retries=2,
    max_containers=20,
)
def run_episode(payload: dict[str, object]) -> dict[str, object]:
    spec = TrialSpec.from_dict(payload)
    destination = Path("/results") / "episodes" / f"{spec.episode_id}.json"
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        return json.loads(destination.read_text(encoding="utf-8"))["summary"]

    result = run_trial(spec)
    artifact = {"result": result.to_dict(), "summary": summarize_trial(result)}
    temporary = destination.with_suffix(f".{os.getpid()}.tmp")
    temporary.write_text(json.dumps(artifact, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(destination)
    results_volume.commit()
    return artifact["summary"]


@app.local_entrypoint()
def main(config: str = "configs/smoke.toml") -> None:
    plan = load_plan(config)
    summaries = list(run_episode.map([spec.to_dict() for spec in plan.trials]))
    print(
        json.dumps(
            {
                "run_id": plan.config["run_id"],
                "config_hash": plan.config_hash,
                "completed": len(summaries),
                "volume": "beacon-results-v2",
            },
            indent=2,
        )
    )
