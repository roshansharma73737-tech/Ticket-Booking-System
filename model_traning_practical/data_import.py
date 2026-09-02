import pandas as pd

df = pd.read_csv("flights.csv")

print(df.head())
print(df.info())

# Flights with delay
delayed = df[df["index"] > 0]

# Flights at/after 10 AM
morning = df[df["Departure"] >= "10:00"]

# Average delay
print(df["index"].mean())

# Weather-wise analysis
print(df.groupby("Weather")["index"].mean())

# Save processed data
df.to_csv("processed_flights.csv", index=False)