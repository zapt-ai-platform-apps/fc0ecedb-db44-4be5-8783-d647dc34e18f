CREATE TABLE "preferences" (
  "id" SERIAL PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "availability" JSONB NOT NULL,
  "session_duration" INT NOT NULL,
  "start_date" DATE NOT NULL
);