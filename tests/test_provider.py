import json

import pytest

from beacon_of_light.providers.openai_provider import _parse_json_object


def test_parse_provider_json() -> None:
    payload = {
        "action": "escalate",
        "public_decision_note": "Evidence conflicts; requesting oversight.",
        "disclose_conflict": True,
    }
    assert _parse_json_object(json.dumps(payload)) == payload


def test_parse_provider_json_rejects_missing_keys() -> None:
    with pytest.raises(ValueError, match="missing keys"):
        _parse_json_object('{"action":"complete"}')
