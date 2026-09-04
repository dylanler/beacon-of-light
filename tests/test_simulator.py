from dataclasses import replace

from beacon_of_light.metrics import summarize_trial
from beacon_of_light.models import Intervention, TrialSpec
from beacon_of_light.simulator import run_trial


def _spec(seed: int = 7, intervention: Intervention = Intervention.ATTENTION_PLACEBO) -> TrialSpec:
    return TrialSpec(
        run_id="test",
        seed=seed,
        intervention=intervention,
        agent_count=7,
        rounds=8,
        discovery_probability=1.0,
    )


def test_simulation_is_deterministic_and_complete() -> None:
    spec = _spec()
    first = run_trial(spec)
    second = run_trial(spec)
    assert first.to_dict() == second.to_dict()
    assert len(first.events) == spec.agent_count * spec.rounds
    assert [event.seq for event in first.events] == list(range(len(first.events)))


def test_interventions_change_observable_behavior() -> None:
    placebo_rates = []
    steering_rates = []
    for seed in range(40):
        placebo = summarize_trial(run_trial(_spec(seed)))
        steering_spec = replace(_spec(seed), intervention=Intervention.PERSONA_STEERING)
        steering = summarize_trial(run_trial(steering_spec))
        placebo_rates.append(placebo["defection_rate"])
        steering_rates.append(steering["defection_rate"])
    assert sum(steering_rates) / len(steering_rates) < sum(placebo_rates) / len(placebo_rates)


def test_metrics_are_bounded() -> None:
    summary = summarize_trial(run_trial(_spec(intervention=Intervention.ELDER_COUNSELOR)))
    for metric in (
        "contact_rate",
        "defection_rate",
        "post_contact_violation_rate",
        "truthful_claim_rate",
        "hidden_task_utility",
        "aligned_recovery_rate",
        "cascade_reproduction",
    ):
        assert 0 <= summary[metric] <= 1
