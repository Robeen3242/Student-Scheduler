import pandas as pd
from pathlib import Path


BATCHES_DIR = (
    Path(__file__).resolve().parents[2]
    / "Data Processing"
    / "Data"
    / "Batches"
)

FUTURE_TARGET_COLUMNS = {
    "target_burnout_tomorrow",
    "target_burnout_slope_7d",
}


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


def prepare_batch(
    batch,
    train_percentage=70,
    validation_percentage=15,
    testing_percentage=15,
    target_column="burnout"
):
    """
    Split a batch chronologically and create X/y pairs for each split.

    Args:
        batch (pd.DataFrame): Batch dataframe to prepare.
        train_percentage (float): Train split size as a decimal or whole percentage.
        validation_percentage (float): Validation split size as a decimal or whole percentage.
        testing_percentage (float): Test split size as a decimal or whole percentage.
        target_column (str): Column to predict.

    Returns:
        tuple: X_train, y_train, X_validation, y_validation, X_test, and y_test.
    """
    targeted_batch = batch.dropna(subset=[target_column])

    train_data, validation_data, testing_data = split_batch_by_date(
        targeted_batch,
        train_percentage,
        validation_percentage,
        testing_percentage
    )

    X_train, y_train = get_xy(train_data, target_column)
    X_validation, y_validation = get_xy(validation_data, target_column)
    X_test, y_test = get_xy(testing_data, target_column)

    return X_train, y_train, X_validation, y_validation, X_test, y_test


def _is_target_date_metadata(column):
    column_name = str(column).lower()
    return "target" in column_name and "date" in column_name


def get_xy(batch, target_column="burnout"):
    """
    Separate model features from the target.

    Args:
        batch (pd.DataFrame): Batch or split dataframe containing date and target columns.
        target_column (str): Column to predict.

    Returns:
        tuple[pd.DataFrame, pd.Series]: Feature dataframe and target series.
    """
    future_target_columns = FUTURE_TARGET_COLUMNS.intersection(batch.columns)
    target_date_metadata_columns = {
        column
        for column in batch.columns
        if _is_target_date_metadata(column)
    }
    columns_to_drop = (
        {"date", target_column}
        | future_target_columns
        | target_date_metadata_columns
    )
    existing_columns_to_drop = [
        column
        for column in batch.columns
        if column in columns_to_drop
    ]

    X = batch.drop(columns=existing_columns_to_drop)
    y = pd.to_numeric(batch[target_column], errors="coerce")

    return X, y


def print_missing_values(X):
    print(X.isna().sum())

