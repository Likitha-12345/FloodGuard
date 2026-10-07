import os
import joblib
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    ConfusionMatrixDisplay
)
from xgboost import XGBClassifier


# ============================================================
# 1. LOAD DATASET
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "flood_training.csv")

df = pd.read_csv(DATA_PATH)

print("Dataset Shape:", df.shape)

print("\nFirst 5 rows:")
print(df.head())

print("\nMissing Values:")
print(df.isnull().sum())

print("\nTarget Distribution:")
print(df["flood_occurred"].value_counts())


# ============================================================
# 2. PREPARE FEATURES AND TARGET
# ============================================================

X = df.drop("flood_occurred", axis=1)
y = df["flood_occurred"]


# ============================================================
# 3. TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# ============================================================
# 4. RANDOM FOREST
# ============================================================

print("\n========== RANDOM FOREST ==========")

rf_model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    class_weight="balanced"
)

rf_model.fit(X_train, y_train)

rf_pred = rf_model.predict(X_test)

rf_accuracy = accuracy_score(y_test, rf_pred)
rf_precision = precision_score(y_test, rf_pred)
rf_recall = recall_score(y_test, rf_pred)
rf_f1 = f1_score(y_test, rf_pred)

print("Accuracy :", round(rf_accuracy, 4))
print("Precision:", round(rf_precision, 4))
print("Recall   :", round(rf_recall, 4))
print("F1 Score :", round(rf_f1, 4))


# ============================================================
# 5. RANDOM FOREST CONFUSION MATRIX
# ============================================================

ConfusionMatrixDisplay.from_predictions(
    y_test,
    rf_pred
)

plt.title("FloodGuard Random Forest Confusion Matrix")
plt.tight_layout()
plt.show()


# ============================================================
# 6. XGBOOST
# ============================================================

print("\n========== XGBOOST ==========")

xgb_model = XGBClassifier(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric="logloss"
)

xgb_model.fit(X_train, y_train)

xgb_pred = xgb_model.predict(X_test)

xgb_accuracy = accuracy_score(y_test, xgb_pred)
xgb_precision = precision_score(y_test, xgb_pred)
xgb_recall = recall_score(y_test, xgb_pred)
xgb_f1 = f1_score(y_test, xgb_pred)

print("Accuracy :", round(xgb_accuracy, 4))
print("Precision:", round(xgb_precision, 4))
print("Recall   :", round(xgb_recall, 4))
print("F1 Score :", round(xgb_f1, 4))


# ============================================================
# 7. LOGISTIC REGRESSION
# ============================================================

print("\n========== LOGISTIC REGRESSION ==========")

scaler = StandardScaler()

X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

lr_model = LogisticRegression(
    max_iter=1000,
    random_state=42
)

lr_model.fit(
    X_train_scaled,
    y_train
)

lr_pred = lr_model.predict(X_test_scaled)

lr_accuracy = accuracy_score(y_test, lr_pred)
lr_precision = precision_score(y_test, lr_pred)
lr_recall = recall_score(y_test, lr_pred)
lr_f1 = f1_score(y_test, lr_pred)

print("Accuracy :", round(lr_accuracy, 4))
print("Precision:", round(lr_precision, 4))
print("Recall   :", round(lr_recall, 4))
print("F1 Score :", round(lr_f1, 4))


# ============================================================
# 8. MODEL COMPARISON
# ============================================================

comparison = pd.DataFrame({
    "Model": [
        "Random Forest",
        "XGBoost",
        "Logistic Regression"
    ],
    "Accuracy": [
        rf_accuracy,
        xgb_accuracy,
        lr_accuracy
    ],
    "Precision": [
        rf_precision,
        xgb_precision,
        lr_precision
    ],
    "Recall": [
        rf_recall,
        xgb_recall,
        lr_recall
    ],
    "F1 Score": [
        rf_f1,
        xgb_f1,
        lr_f1
    ]
})

comparison = comparison.round(4)

print("\n========== MODEL COMPARISON ==========")
print(comparison.to_string(index=False))


# ============================================================
# 9. SELECT BEST MODEL
# ============================================================

best_model = comparison.loc[
    comparison["F1 Score"].idxmax()
]

print("\n========== BEST MODEL ==========")
print("Model:", best_model["Model"])
print("F1 Score:", best_model["F1 Score"])
print("Accuracy:", best_model["Accuracy"])


# ============================================================
# 10. MODEL COMPARISON GRAPH
# ============================================================

comparison.set_index("Model")[
    ["Accuracy", "Precision", "Recall", "F1 Score"]
].plot(
    kind="bar",
    figsize=(10, 6)
)

plt.title("FloodGuard ML Model Comparison")
plt.ylabel("Score")
plt.ylim(0, 1)
plt.xticks(rotation=0)
plt.legend(loc="lower right")
plt.grid(axis="y", alpha=0.3)

plt.tight_layout()
plt.show()


# ============================================================
# 11. RANDOM FOREST FEATURE IMPORTANCE
# ============================================================

feature_importance = pd.Series(
    rf_model.feature_importances_,
    index=X.columns
).sort_values(ascending=True)

plt.figure(figsize=(10, 7))

feature_importance.plot(kind="barh")

plt.title("FloodGuard Random Forest Feature Importance")
plt.xlabel("Importance")
plt.tight_layout()
plt.show()


# ============================================================
# 12. SAVE TRAINED MODELS
# ============================================================

joblib.dump(
    rf_model,
    os.path.join(BASE_DIR, "random_forest_flood_model.pkl")
)

joblib.dump(
    xgb_model,
    os.path.join(BASE_DIR, "xgboost_flood_model.pkl")
)

joblib.dump(
    lr_model,
    os.path.join(BASE_DIR, "logistic_regression_flood_model.pkl")
)

joblib.dump(
    scaler,
    os.path.join(BASE_DIR, "logistic_regression_scaler.pkl")
)

print("\n========================================")
print("All 3 models saved successfully!")
print("========================================")