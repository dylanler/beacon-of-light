.PHONY: install check reproduce-small figures

install:
	python -m pip install -e ".[dev,viz]"

check:
	ruff check .
	pytest

reproduce-small:
	beacon run --config configs/smoke.toml --out runs/smoke

figures:
	python scripts/generate_demo_results.py
