from __future__ import annotations

import hashlib
import json
from collections.abc import Iterable, Mapping
from typing import Any

GENESIS_HASH = "0" * 64


def canonical_json(payload: Mapping[str, Any]) -> str:
    """Serialize an event deterministically before hashing it."""

    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def hash_chain(payloads: Iterable[Mapping[str, Any]]) -> list[dict[str, Any]]:
    """Wrap payloads in a tamper-evident SHA-256 chain.

    This detects edits, deletion, insertion, and reordering after collection. It is an
    integrity primitive, not proof that the original event source was truthful.
    """

    records: list[dict[str, Any]] = []
    previous_hash = GENESIS_HASH
    for chain_index, payload in enumerate(payloads):
        body = {
            "chain_index": chain_index,
            "previous_hash": previous_hash,
            "payload": dict(payload),
        }
        record_hash = hashlib.sha256(canonical_json(body).encode("utf-8")).hexdigest()
        records.append({**body, "record_hash": record_hash})
        previous_hash = record_hash
    return records


def verify_hash_chain(records: Iterable[Mapping[str, Any]]) -> bool:
    """Return True only when every link and index in a chain is intact."""

    previous_hash = GENESIS_HASH
    for chain_index, record in enumerate(records):
        if record.get("chain_index") != chain_index:
            return False
        if record.get("previous_hash") != previous_hash:
            return False
        body = {
            "chain_index": chain_index,
            "previous_hash": previous_hash,
            "payload": record.get("payload"),
        }
        expected = hashlib.sha256(canonical_json(body).encode("utf-8")).hexdigest()
        if record.get("record_hash") != expected:
            return False
        previous_hash = expected
    return True
