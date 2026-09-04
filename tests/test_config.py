from pathlib import Path

from beacon_of_light.config import load_plan

ROOT = Path(__file__).resolve().parents[1]


def test_smoke_plan_pairs_seeds_across_interventions() -> None:
    plan = load_plan(ROOT / "configs" / "smoke.toml")
    assert len(plan.trials) == 12
    by_seed: dict[int, set[str]] = {}
    for trial in plan.trials:
        by_seed.setdefault(trial.seed, set()).add(trial.intervention.value)
    assert len(by_seed) == 2
    assert all(len(interventions) == 6 for interventions in by_seed.values())
    assert len(plan.config_hash) == 64


def test_episode_ids_change_with_condition() -> None:
    plan = load_plan(ROOT / "configs" / "smoke.toml")
    assert len({trial.episode_id for trial in plan.trials}) == len(plan.trials)
