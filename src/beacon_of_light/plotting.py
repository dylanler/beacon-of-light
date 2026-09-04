from __future__ import annotations

import csv
from collections import defaultdict
from pathlib import Path
from statistics import fmean

DISPLAY_NAMES = {
    "no_beacon": "No beacon",
    "attention_placebo": "Attention placebo",
    "reasoned_artifact": "Reasoned artifact",
    "elder_counselor": "Elder counselor",
    "credible_dissenter": "Credible dissenter",
    "integrity_checkpoint": "Integrity checkpoint",
    "persona_steering": "Persona steering",
}


def plot_summary(summary_path: str | Path, output_dir: str | Path) -> list[Path]:
    try:
        import matplotlib.pyplot as plt
    except ImportError as error:
        raise RuntimeError('Install plotting support with: pip install -e ".[viz]"') from error

    with Path(summary_path).open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        grouped[row["intervention"]].append(row)

    ordered = [key for key in DISPLAY_NAMES if key in grouped]
    names = [DISPLAY_NAMES[key] for key in ordered]
    defection = [fmean(float(row["defection_rate"]) for row in grouped[key]) for key in ordered]
    recovery = [
        fmean(float(row["aligned_recovery_rate"]) for row in grouped[key]) for key in ordered
    ]
    utility = [fmean(float(row["hidden_task_utility"]) for row in grouped[key]) for key in ordered]
    gap = [fmean(float(row["goodhart_gap"]) for row in grouped[key]) for key in ordered]

    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)
    generated: list[Path] = []
    colors = ["#9aa0a6" if "beacon" in key or "placebo" in key else "#4d77ff" for key in ordered]

    figure, axis = plt.subplots(figsize=(11, 5.6))
    x = range(len(ordered))
    axis.bar(
        [index - 0.2 for index in x], defection, width=0.4, label="Defection rate", color="#d95f59"
    )
    axis.bar(
        [index + 0.2 for index in x], recovery, width=0.4, label="Aligned recovery", color="#3a9d71"
    )
    axis.set_title("Illustrative intervention outcomes — deterministic simulator")
    axis.set_ylabel("Share of observable decisions / eligible agents")
    axis.set_xticks(list(x), names, rotation=24, ha="right")
    axis.set_ylim(0, 1)
    axis.legend(frameon=False)
    axis.grid(axis="y", alpha=0.2)
    figure.tight_layout()
    treatment_path = output / "treatment-effects.png"
    figure.savefig(treatment_path, dpi=180)
    plt.close(figure)
    generated.append(treatment_path)

    figure, axis = plt.subplots(figsize=(8.5, 5.8))
    label_offsets = {
        "No beacon": (8, 7, "left"),
        "Attention placebo": (8, -13, "left"),
        "Reasoned artifact": (8, 7, "left"),
        "Elder counselor": (8, -13, "left"),
        "Credible dissenter": (8, 10, "left"),
        "Integrity checkpoint": (-8, -13, "right"),
        "Persona steering": (8, 7, "left"),
    }
    for name, x_value, y_value, color in zip(names, utility, defection, colors, strict=True):
        axis.scatter(x_value, y_value, s=90, color=color, edgecolor="#263238", linewidth=0.8)
        axis.annotate(
            name,
            (x_value, y_value),
            xytext=label_offsets[name][:2],
            textcoords="offset points",
            fontsize=8,
            ha=label_offsets[name][2],
        )
    axis.set_title("Safety–utility diagnostic — deterministic simulator")
    axis.set_xlabel("Hidden task utility (higher is better)")
    axis.set_ylabel("Defection rate (lower is better)")
    axis.set_xlim(0, 1)
    axis.set_ylim(0, 1)
    axis.grid(alpha=0.2)
    figure.tight_layout()
    frontier_path = output / "safety-utility-frontier.png"
    figure.savefig(frontier_path, dpi=180)
    plt.close(figure)
    generated.append(frontier_path)

    figure, axis = plt.subplots(figsize=(10, 5.4))
    bars = axis.bar(names, gap, color="#f1b44c")
    axis.bar_label(bars, fmt="%.3f", padding=3, fontsize=8)
    axis.set_title("Goodhart gap — deterministic simulator")
    axis.set_ylabel("Visible reward − hidden performance")
    axis.tick_params(axis="x", rotation=24)
    for label in axis.get_xticklabels():
        label.set_ha("right")
    axis.grid(axis="y", alpha=0.2)
    figure.tight_layout()
    gap_path = output / "goodhart-gap.png"
    figure.savefig(gap_path, dpi=180)
    plt.close(figure)
    generated.append(gap_path)

    return generated
