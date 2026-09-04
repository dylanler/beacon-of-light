import json
from pathlib import Path

from beacon_of_light.cli import main

ROOT = Path(__file__).resolve().parents[1]


def test_run_writes_replayable_artifacts(tmp_path: Path) -> None:
    output = tmp_path / "smoke"
    result = main(["run", "--config", str(ROOT / "configs" / "smoke.toml"), "--out", str(output)])
    assert result == 0
    manifest = json.loads((output / "manifest.json").read_text(encoding="utf-8"))
    assert manifest["trial_count"] == 12
    assert (output / "summary.csv").is_file()
    assert sum(1 for _ in (output / "events.jsonl").open(encoding="utf-8")) == 300
