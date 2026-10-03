import pandas as pd
from sklearn.base import clone
from evaluate import evaluate_regression
from models import get_models
from preprocessing import get_batches, prepare_batch


if __name__ == "__main__":
    models = get_models()
    results = []

    for batch_type in ["heap", "stack"]:
        batches = get_batches(batch_type)
        print(f"Loaded {len(batches)} {batch_type} batches.")

        for i, batch in enumerate(batches, start=1):
            X_train, y_train, X_validation, y_validation, X_test, y_test = prepare_batch(batch)

            print(f"{batch_type.title()} batch {i} shape: {batch.shape}")
            print(
                f"Train: {X_train.shape}, "
                f"Validation: {X_validation.shape}, "
                f"Test: {X_test.shape}"
            )

            for model_name, model_template in models.items():
                model = clone(model_template)
                model.fit(X_train, y_train)
                training_predictions = model.predict(X_train)
                validation_predictions = model.predict(X_validation)
                training_metrics = evaluate_regression(y_train, training_predictions)
                validation_metrics = evaluate_regression(y_validation, validation_predictions)

                results.append({
                    "model": model_name,
                    "batch_type": batch_type,
                    "batch_number": i,
                    "train_samples": len(X_train),
                    "validation_samples": len(X_validation),
                    **{f"train_{key}": value for key, value in training_metrics.items()},
                    **{f"validation_{key}": value for key, value in validation_metrics.items()},
                })
                print(
                    f"{model_name} | {batch_type} batch {i} | "
                    f"Train MAE={training_metrics['mae']:.3f}, "
                    f"RMSE={training_metrics['rmse']:.3f}, R2={training_metrics['r2']:.3f} | "
                    f"Validation MAE={validation_metrics['mae']:.3f}, "
                    f"RMSE={validation_metrics['rmse']:.3f}, R2={validation_metrics['r2']:.3f}"
                )

    results_df = pd.DataFrame(results, columns=[
        "model", "batch_type", "batch_number", "train_samples", "validation_samples",
        "train_mae", "train_rmse", "train_r2",
        "validation_mae", "validation_rmse", "validation_r2",
    ]).sort_values(["batch_type", "batch_number", "validation_mae"])
    print(results_df.to_string(index=False))
