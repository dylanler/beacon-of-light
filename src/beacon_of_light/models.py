from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass, field
from enum import StrEnum
from typing import Any


class Intervention(StrEnum):
    NO_BEACON = "no_beacon"
    ATTENTION_PLACEBO = "attention_placebo"
    REASONED_ARTIFACT = "reasoned_artifact"
    ELDER_COUNSELOR = "elder_counselor"
    CREDIBLE_DISSENTER = "credible_dissenter"
    INTEGRITY_CHECKPOINT = "integrity_checkpoint"
    PERSONA_STEERING = "persona_steering"


SUBSTANTIVE_INTERVENTIONS = tuple(
    intervention
    for intervention in Intervention
    if intervention not in {Intervention.NO_BEACON, Intervention.ATTENTION_PLACEBO}
)


class Action(StrEnum):
    COMPLETE = "complete"
    ESCALATE = "escalate"
    DEFECT = "defect"


@dataclass(frozen=True, slots=True)
class TrialSpec:
    run_id: str
    seed: int
    intervention: Intervention
    agent_count: int = 7
    rounds: int = 8
    peer_defection_fraction: float = 0.5
    conformity_strength: float = 1.35
    temptation_strength: float = 0.6
    beacon_strength: float = 1.15
    discovery_probability: float = 0.55
    topology: str = "small_world"
    scenario_id: str = "proxy_cleanup"
    schema_version: int = 1

    def __post_init__(self) -> None:
        if self.agent_count < 3:
            raise ValueError("agent_count must be at least 3")
        if self.rounds < 2:
            raise ValueError("rounds must be at least 2")
        for name in ("peer_defection_fraction", "discovery_probability"):
            value = getattr(self, name)
            if not 0 <= value <= 1:
                raise ValueError(f"{name} must be between 0 and 1")
        if self.topology not in {"ring", "small_world", "fully_connected"}:
            raise ValueError(f"unsupported topology: {self.topology}")

    @property
    def episode_id(self) -> str:
        payload = json.dumps(self.to_dict(), sort_keys=True, separators=(",", ":"))
        digest = hashlib.sha256(payload.encode()).hexdigest()[:16]
        return f"{self.run_id}-{digest}"

    def to_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["intervention"] = self.intervention.value
        return payload

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> TrialSpec:
        values = dict(payload)
        values["intervention"] = Intervention(values["intervention"])
        return cls(**values)


@dataclass(frozen=True, slots=True)
class DecisionEvent:
    episode_id: str
    seq: int
    round_index: int
    agent_id: str
    intervention: Intervention
    action: Action
    beacon_discovered: bool
    first_beacon_contact: bool
    observed_peer_defection: float
    visible_reward: float
    hidden_performance: float
    claim_matches_state: bool
    public_decision_note: str

    def to_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["intervention"] = self.intervention.value
        payload["action"] = self.action.value
        return payload


@dataclass(slots=True)
class TrialResult:
    spec: TrialSpec
    events: list[DecisionEvent] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "episode_id": self.spec.episode_id,
            "spec": self.spec.to_dict(),
            "events": [event.to_dict() for event in self.events],
        }
