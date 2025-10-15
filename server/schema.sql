CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT CHECK(type IN ('deposit','payment')) NOT NULL,
  date TEXT NOT NULL,             -- ISO date (YYYY-MM-DD)
  check_number TEXT,
  payee TEXT,
  notes TEXT,
  reminder_minutes_before INTEGER  -- null or integer minutes
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
