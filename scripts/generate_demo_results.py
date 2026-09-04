from pathlib import Path

from beacon_of_light.config import load_plan
from beacon_of_light.experiment import execute, write_results
from beacon_of_light.plotting import plot_summary


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    plan = load_plan(root / "configs" / "pilot.toml")
    _, _, summary = write_results(plan, execute(plan), root / "runs" / "demo")
    for path in plot_summary(summary, root / "docs" / "assets"):
        print(path)


if __name__ == "__main__":
    main()
