CREATE TABLE "exams" (
  "id" SERIAL PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "subject" TEXT NOT NULL,
  "exam_date" DATE NOT NULL,
  "exam_board" TEXT,
  "teacher_name" TEXT
);