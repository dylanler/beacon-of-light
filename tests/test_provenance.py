from copy import deepcopy

from beacon_of_light.provenance import GENESIS_HASH, hash_chain, verify_hash_chain


def test_hash_chain_round_trip() -> None:
    records = hash_chain([{"action": "complete"}, {"action": "escalate"}])
    assert records[0]["previous_hash"] == GENESIS_HASH
    assert records[-1]["previous_hash"] == records[0]["record_hash"]
    assert verify_hash_chain(records)


def test_hash_chain_detects_payload_edit() -> None:
    records = hash_chain([{"action": "complete"}, {"action": "escalate"}])
    tampered = deepcopy(records)
    tampered[0]["payload"]["action"] = "defect"
    assert not verify_hash_chain(tampered)


def test_hash_chain_detects_deletion_and_reordering() -> None:
    records = hash_chain([{"seq": 0}, {"seq": 1}, {"seq": 2}])
    assert not verify_hash_chain(records[1:])
    assert not verify_hash_chain([records[1], records[0], records[2]])
