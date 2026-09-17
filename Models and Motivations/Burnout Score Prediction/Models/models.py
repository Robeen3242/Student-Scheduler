from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBRegressor


def get_models():
    return {
        "linear_regression": Pipeline([
            ("scaler", StandardScaler()),
            ("regressor", LinearRegression())
        ]),
        "random_forest": RandomForestRegressor(random_state=42),
        "xgboost": XGBRegressor(objective="reg:squarederror", random_state=42),
    }
