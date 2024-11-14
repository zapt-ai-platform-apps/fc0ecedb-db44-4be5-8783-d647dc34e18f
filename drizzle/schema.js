import { pgTable, serial, text, date, integer, jsonb, uuid } from 'drizzle-orm/pg-core';

export const preferences = pgTable('preferences', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  availability: jsonb('availability').notNull(),
  sessionDuration: integer('session_duration').notNull(),
  startDate: date('start_date').notNull(),
});

export const exams = pgTable('exams', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  subject: text('subject').notNull(),
  examDate: date('exam_date').notNull(),
  examBoard: text('exam_board'),
  teacherName: text('teacher_name'),
});