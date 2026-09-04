from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from ..models import Action, Intervention


@dataclass(frozen=True, slots=True)
class DecisionContext:
    objective: str
    temptation: str
    peer_messages: tuple[str, ...]
    intervention: Intervention
    beacon_text: str


@dataclass(frozen=True, slots=True)
class ModelDecision:
    action: Action
    public_decision_note: str
    disclose_conflict: bool
    response_id: str | None = None
    returned_model: str | None = None


class Provider(Protocol):
    def decide(self, context: DecisionContext) -> ModelDecision: ...
