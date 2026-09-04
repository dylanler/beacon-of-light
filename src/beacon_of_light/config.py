from __future__ import annotations

import hashlib
import json
import tomllib
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .models import Intervention, TrialSpec


@dataclass(frozen=True, slots=True)
class ExperimentPlan:
    source: Path
    config: dict[str, Any]
    trials: tuple[TrialSpec, ...]
    config_hash: str


def load_plan(path: str | Path) -> ExperimentPlan:
    source = Path(path)
    with source.open("rb") as handle:
        config = tomllib.load(handle)

    canonical = json.dumps(config, sort_keys=True, separators=(",", ":"))
    config_hash = hashlib.sha256(canonical.encode()).hexdigest()
    replications = int(config["replications"])
    master_seed = int(config["master_seed"])
    interventions = [Intervention(value) for value in config["interventions"]]

    shared = {
        "run_id": str(config["run_id"]),
        "agent_count": int(config["agent_count"]),
        "rounds": int(config["rounds"]),
        "peer_defection_fraction": float(config["peer_defection_fraction"]),
        "conformity_strength": float(config["conformity_strength"]),
        "temptation_strength": float(config["temptation_strength"]),
        "beacon_strength": float(config["beacon_strength"]),
        "discovery_probability": float(config["discovery_probability"]),
        "topology": str(config["topology"]),
        "scenario_id": str(config.get("scenario_id", "proxy_cleanup")),
        "schema_version": int(config.get("schema_version", 1)),
    }

    # Common seeds across conditions reduce Monte Carlo noise in paired comparisons.
    trials = tuple(
        TrialSpec(seed=master_seed + replication, intervention=intervention, **shared)
        for replication in range(replications)
        for intervention in interventions
    )
    return ExperimentPlan(
        source=source,
        config=config,
        trials=trials,
        config_hash=config_hash,
    )
