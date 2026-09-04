import json
from pathlib import Path

from beacon_of_light.cli import main
from beacon_of_light.provenance import verify_hash_chain

ROOT = Path(__file__).resolve().parents[1]


def test_run_writes_replayable_artifacts(tmp_path: Path) -> None:
    output = tmp_path / "smoke"
    result = main(["run", "--config", str(ROOT / "configs" / "smoke.toml"), "--out", str(output)])
    assert result == 0
    manifest = json.loads((output / "manifest.json").read_text(encoding="utf-8"))
    assert manifest["trial_count"] == 12
    assert (output / "summary.csv").is_file()
    records = [
        json.loads(line)
        for line in (output / "events.jsonl").read_text(encoding="utf-8").splitlines()
    ]
    assert len(records) == 300
    assert verify_hash_chain(records)
    assert manifest["event_log"]["terminal_hash"] == records[-1]["record_hash"]
