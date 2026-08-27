import pandas as pd
from pathlib import Path


BATCHES_DIR = (
    Path(__file__).resolve().parents[1]
    / "Data Processing"
    / "Data"
    / "Batches"
)


def batch_sort_key(batch_path):
    """
    Return the numeric suffix from a saved batch CSV path for chronological sorting.
    """
    return int(batch_path.stem.rsplit("_", 1)[1])


def load_batches(batch_type):
    """
    Load all saved CSV batches for the given batch filename prefix.

    Args:
        batch_type (str): Batch filename prefix, such as "heap_batch" or "stack_batch".

    Returns:
        list[pd.DataFrame]: Batch dataframes sorted by their numeric batch suffix.
    """
    batch_paths = sorted(
        BATCHES_DIR.glob(f"{batch_type}_*.csv"),
        key=batch_sort_key
    )

    return [
        pd.read_csv(batch_path, parse_dates=["date"])
        for batch_path in batch_paths
    ]


def get_batches(batch_type):
    """
    Load saved heap or stack batches.

    Args:
        batch_type (str): Either "heap" or "stack".

    Returns:
        list[pd.DataFrame]: Saved batch dataframes for the requested batching method.
    """
    if batch_type not in ["heap", "stack"]:
        raise ValueError(
            f"Invalid batch type: {batch_type}. Must be 'heap' or 'stack'."
        )

    return load_batches(f"{batch_type}_batch")


def split_batch_by_date(data, train_percentage, validation_percentage, testing_percentage):
    """
    Split one batch into chronological train, validation, and test dataframes.

    Args:
        data (pd.DataFrame): Batch dataframe containing a date column.
        train_percentage (float): Train split size as a decimal or whole percentage.
        validation_percentage (float): Validation split size as a decimal or whole percentage.
        testing_percentage (float): Test split size as a decimal or whole percentage.

    Returns:
        tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]: Train, validation, and test splits.
    """
    percentages = [train_percentage, validation_percentage, testing_percentage]

    if any(percentage > 1 for percentage in percentages):
        percentages = [percentage / 100 for percentage in percentages]

    if round(sum(percentages), 10) != 1:
        raise ValueError(
            "train_percentage, validation_percentage, and testing_percentage must add up to 1 or 100."
        )

    sorted_data = data.copy()
    sorted_data["date"] = pd.to_datetime(sorted_data["date"])
    sorted_data = sorted_data.sort_values("date").reset_index(drop=True)

    total_rows = len(sorted_data)
    train_end = int(total_rows * percentages[0])
    validation_end = train_end + int(total_rows * percentages[1])

    train_data = sorted_data.iloc[:train_end]
    validation_data = sorted_data.iloc[train_end:validation_end]
    testing_data = sorted_data.iloc[validation_end:]

    return train_data, validation_data, testing_data


def create_burnout_target(data):
    """
    Create a burnout trend target from weighted future and previous weekly burnout.

    Target formula:
        Week[+1] * 1.5 + Week[+2] > Week[-2] + Week[-1] * 1.5

    Each week is the average burnout value over a 7-day calendar window.
    The target is 1 when the weighted future score is larger and 0 otherwise.
    Rows without enough previous or future burnout data receive a missing target.

    Args:
        data (pd.DataFrame): Batch dataframe containing date and burnout columns.

    Returns:
        pd.DataFrame: Copy of data with a burnout_target column added.
    """
    targeted_data = data.copy()
    targeted_data["date"] = pd.to_datetime(targeted_data["date"])
    targeted_data["burnout"] = pd.to_numeric(targeted_data["burnout"], errors="coerce")
    targeted_data = targeted_data.sort_values("date").reset_index(drop=True)

    targets = []

    for row in targeted_data.itertuples():
        current_date = row.date

        previous_week_2 = targeted_data[
            (targeted_data["date"] >= current_date - pd.Timedelta(days=14))
            & (targeted_data["date"] <= current_date - pd.Timedelta(days=8))
        ]["burnout"].mean()
        previous_week_1 = targeted_data[
            (targeted_data["date"] >= current_date - pd.Timedelta(days=7))
            & (targeted_data["date"] <= current_date - pd.Timedelta(days=1))
        ]["burnout"].mean()
        next_week_1 = targeted_data[
            (targeted_data["date"] >= current_date + pd.Timedelta(days=1))
            & (targeted_data["date"] <= current_date + pd.Timedelta(days=7))
        ]["burnout"].mean()
        next_week_2 = targeted_data[
            (targeted_data["date"] >= current_date + pd.Timedelta(days=8))
            & (targeted_data["date"] <= current_date + pd.Timedelta(days=14))
        ]["burnout"].mean()

        if pd.isna(previous_week_2) or pd.isna(previous_week_1) or pd.isna(next_week_1) or pd.isna(next_week_2):
            targets.append(pd.NA)
            continue

        future_score = next_week_1 * 1.5 + next_week_2
        previous_score = previous_week_2 + previous_week_1 * 1.5
        targets.append(int(future_score > previous_score))

    targeted_data["burnout_target"] = targets
    return targeted_data


def prepare_batch(batch, train_percentage=70, validation_percentage=15, testing_percentage=15):
    """
    Split a batch chronologically and create X/y pairs for each split.

    Args:
        batch (pd.DataFrame): Batch dataframe to prepare.
        train_percentage (float): Train split size as a decimal or whole percentage.
        validation_percentage (float): Validation split size as a decimal or whole percentage.
        testing_percentage (float): Test split size as a decimal or whole percentage.

    Returns:
        tuple: X_train, y_train, X_validation, y_validation, X_test, and y_test.
    """
    targeted_batch = create_burnout_target(batch).dropna(subset=["burnout_target"])

    train_data, validation_data, testing_data = split_batch_by_date(
        targeted_batch,
        train_percentage,
        validation_percentage,
        testing_percentage
    )

    X_train, y_train = get_xy(train_data)
    X_validation, y_validation = get_xy(validation_data)
    X_test, y_test = get_xy(testing_data)

    return X_train, y_train, X_validation, y_validation, X_test, y_test

def get_xy(batch):
    """
    Separate model features from the burnout target.

    Args:
        batch (pd.DataFrame): Batch or split dataframe containing date, burnout, and burnout_target columns.

    Returns:
        tuple[pd.DataFrame, pd.Series]: Feature dataframe and burnout target series.
    """
    X = batch.drop(columns=["date", "burnout", "burnout_target"])
    y = batch["burnout_target"].astype(int)

    return X, y



if __name__ == "__main__":
    heap_batches = get_batches("heap")

    print(f"Loaded {len(heap_batches)} heap batches.")

    for i, heap_batch in enumerate(heap_batches):
        X_train, y_train, X_validation, y_validation, X_test, y_test = prepare_batch(heap_batch)

        print(f"Heap batch {i + 1} shape: {heap_batch.shape}")
        print(
            f"Train: {X_train.shape}, "
            f"Validation: {X_validation.shape}, "
            f"Test: {X_test.shape}"
        )
