from functools import reduce
from finnhub_metric_keys import basic_financial_metrics, annual_metrics
import finnhub
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns


finnhub_client = finnhub.Client(api_key="")


sns.set_style("whitegrid")
plt.rcParams["figure.figsize"] = (10, 6)

symbol = "INFY"

response = finnhub_client.company_profile2(symbol=symbol)

company_data = response.keys()

print("company data")

for key in company_data:
    print(f"{key}: {response[key]}")

response = finnhub_client.company_basic_financials(symbol=symbol, metric="all")
# Check the top-level keys
# print("Response keys:", response.keys())
# Typically: dict_keys(['metric', 'series'])

metrics_data = response.get("metric", {})
# print("Available metric keys:", list(metrics_data.keys()))

for key in basic_financial_metrics:
    print(f"{key}: {metrics_data.get(key, 'N/A')}")

series_data = response.get("series", {})
# print("Series data keys:", series_data.keys())

# Typically: dict_keys(['annual', 'quarterly']) if available
annual_data = series_data.get("annual", {})
# print("Annual data metrics:", annual_data.keys())


all_metric_dfs = []

for metric_name in annual_metrics:
    if metric_name in annual_data:
        # Each metric has a structure like {"data": [{"period": "YYYY-MM-DD", "v": ...}, ...]}
        metric_entries = annual_data[metric_name]

        metric_df = pd.DataFrame(metric_entries)
        # If there are no rows, skip
        if metric_df.empty:
            # print(f"Skipping metric '{metric_name}' because no data is returned.")
            continue
        # If 'period' doesn't exist in the columns, skip or handle differently
        if "period" not in metric_df.columns:
            # print(
            #    f"Skipping metric '{metric_name}' because 'period' is not in the columns."
            # )
            continue
        # Rename columns from 'period' to 'Date' and 'v' to the metric_name
        metric_df.rename(columns={"period": "Date", "v": metric_name}, inplace=True)
        # Now we can safely do the datetime conversion and sorting by 'Date'
        metric_df["Date"] = pd.to_datetime(metric_df["Date"])
        metric_df.sort_values("Date", inplace=True)

        all_metric_dfs.append(metric_df)
    else:
        print(f"Metric '{metric_name}' not found in annual data.")

# print(all_metric_dfs)

# Merge all metrics into a single DataFrame based on 'Date'
if all_metric_dfs:
    df_merged = reduce(
        lambda left, right: pd.merge(left, right, on="Date", how="outer"),
        all_metric_dfs,
    )
    df_merged.sort_values("Date", inplace=True)
    print("\nMerged DataFrame with Annual Metrics:")
    print(df_merged)
else:
    print("No metrics were found or available for merging.")

if "df_merged" in locals():
    print("\nShape:", df_merged.shape)
    print("\nInfo:")
    print(df_merged.info())

    print("\nDescriptive Statistics:")
    print(df_merged.describe())

if "df_merged" in locals():
    # Filter out rows with missing data
    subset = df_merged.dropna(subset=["Date", "eps", "bookValue"], how="any")

    plt.plot(subset["Date"], subset["eps"], marker="o", label="EPS")
    plt.plot(subset["Date"], subset["bookValue"], marker="s", label="Book Value")
    plt.xlabel("Fiscal Year End")
    plt.ylabel("Value (USD)")
    plt.title(f"{symbol} EPS & Book Value Over Time (Annual)")
    plt.xticks(rotation=45)
    plt.legend()
    plt.tight_layout()
    plt.show()

if "df_merged" in locals():
    # Only numeric columns for correlation
    numeric_cols = df_merged.select_dtypes(include="number").columns
    corr_matrix = df_merged[numeric_cols].corr()

    # Display or visualize
    print("\nCorrelation Matrix for Annual Metrics:")
    print(corr_matrix)

    plt.figure(figsize=(12, 10))
    sns.heatmap(corr_matrix, annot=True, cmap="coolwarm", linewidths=0.5)
    plt.title(f"{symbol} Annual Metrics Correlation Matrix")
    plt.show()

# ---------------------------
# Create multiple figure windows
# ---------------------------

# if df_merged is not None:
# print("\nShape:", df_merged.shape)
# print("\nInfo:")
# print(df_merged.info())
# print("\nDescriptive Statistics:")
# print(df_merged.describe())

# if df_merged is not None and not df_merged.empty:
# 1) FIGURE 1: EPS & Book Value Over Time
# subset = df_merged.dropna(subset=["Date", "eps", "bookValue"], how="any")
# plt.figure()  # Create a new figure window
# plt.plot(subset["Date"], subset["eps"], marker="o", label="EPS")
# plt.plot(subset["Date"], subset["bookValue"], marker="s", label="Book Value")
# plt.xlabel("Fiscal Year End")
# plt.ylabel("Value (USD)")
# plt.title(f"{symbol} EPS & Book Value Over Time (Annual)")
# plt.xticks(rotation=45)
# plt.legend()
# plt.tight_layout()

# 2) FIGURE 2: Correlation Heatmap of Annual Metrics
# numeric_cols = df_merged.select_dtypes(include="number").columns
# corr_matrix = df_merged[numeric_cols].corr()
# plt.figure()  # Another new figure window
# sns.heatmap(corr_matrix, annot=True, cmap="coolwarm", linewidths=0.5)
# plt.title(f"{symbol} Annual Metrics Correlation Matrix")
# plt.show()

start_date = "2024-01-01"
end_date = "2024-12-31"

# Fetch insider transactions
response = finnhub_client.stock_insider_transactions(symbol, start_date, end_date)

# The response is a dictionary with 'data' (list of transaction records) and 'symbol'
print("Symbol:", response.get("symbol"))
print("Number of transaction records:", len(response.get("data", [])))

df = pd.DataFrame(response["data"])
print(df.head())  # Inspect the first few rows

# Group by 'name' and sum the 'change' column
grouped_changes = df.groupby("name")["change"].sum().sort_values()

# Create a bar chart
plt.figure()
grouped_changes.plot(kind="bar")
plt.title(
    f"{symbol} Insider Transactions\nNet Shares Changed by Insider ({start_date} to {end_date})"
)
plt.xlabel("Insider Name")
plt.ylabel("Net Shares Changed")

# Make the plot labels more readable
plt.xticks(rotation=45, ha="right")
plt.tight_layout()
plt.show()

# grouped_changes.plot(kind='barh')
# grouped_count = df.groupby('name')['transactionDate'].count().sort_values()
# grouped_count.plot(kind='bar')
# grouped_abs = df.groupby('name')['change'].apply(lambda x: x.abs().sum())
# grouped_abs.plot(kind='bar')

response = finnhub_client.recommendation_trends(symbol)

# 'response' is typically a list of dicts, each with:
# [ 'strongBuy', 'buy', 'hold', 'sell', 'strongSell', 'period', 'symbol' ]
# print(response)

df = pd.DataFrame(response)
print("\nDataFrame:")
print(df.head())

# Sort by period to ensure chronological order
df.sort_values("period", inplace=True)

# Convert 'period' to a string or datetime if desired
# Here, we'll leave it as a string, but you could parse to datetime.
# df['period'] = pd.to_datetime(df['period'], format='%Y-%m-%d')

# Set 'period' as the index to prepare for a stacked bar plot
df.set_index("period", inplace=True)

# We'll select only the recommendation columns
recommendation_cols = ["strongBuy", "buy", "hold", "sell", "strongSell"]

# Plot a stacked bar chart
ax = df[recommendation_cols].plot(kind="bar", stacked=True, colormap="viridis")
plt.title(f"{symbol} - Recommendation Trends")
plt.xlabel("Period")
plt.ylabel("Number of Analyst Recommendations")
plt.xticks(rotation=45, ha="right")  # Rotate x labels if they overlap
plt.tight_layout()

# Show the figure
plt.show()


earnings_data = finnhub_client.company_earnings(symbol, limit=5)

df = pd.DataFrame(earnings_data)

# Convert 'period' to datetime for proper sorting
df["period"] = pd.to_datetime(df["period"])
df.sort_values("period", inplace=True, ascending=True)

print(df[["period", "actual", "estimate", "surprise", "surprisePercent"]])

plt.plot(
    df["period"],
    df["surprisePercent"],
    marker="o",
    color="purple",
    linestyle="-",
    linewidth=2,
    label="Surprise (%)",
)

plt.title(f"{symbol} Earnings Surprise (%)")
plt.xlabel("Period")
plt.ylabel("Surprise Percent")

# Rotate x-axis labels if needed
plt.xticks(rotation=45, ha="right")

plt.legend()
plt.tight_layout()
plt.show()
