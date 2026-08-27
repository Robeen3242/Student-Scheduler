import pandas as pd
from pathlib import Path

import preprocessing as pp


BATCHES_DIR = (
    Path(__file__).resolve().parents[1]
    / "Data Processing"
    / "Data"
    / "Batches"
)


def batch_sort_key(batch_path):
    return int(batch_path.stem.rsplit("_", 1)[1])


def load_batches(batch_type):
    batch_paths = sorted(
        BATCHES_DIR.glob(f"{batch_type}_*.csv"),
        key=batch_sort_key
    )

    return [
        pd.read_csv(batch_path, parse_dates=["date"])
        for batch_path in batch_paths
    ]


def get_batches(batch_type):
    if batch_type not in ["heap", "stack"]:
        raise ValueError(
            f"Invalid batch type: {batch_type}. Must be 'heap' or 'stack'."
        )

    return load_batches(f"{batch_type}_batch")


def get_xy(batch):
    X = batch.drop(columns=["date", "burnout"])
    y = batch["burnout"]

    return X, y


if __name__ == "__main__":
    heap_batches = get_batches("heap")
    stack_batches = get_batches("stack")

    print(f"Loaded {len(heap_batches)} heap batches.")
    print(f"Loaded {len(stack_batches)} stack batches.")

    X, y = get_xy(heap_batches[0])

    # print(X.head())
    # print(y.head())
