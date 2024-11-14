import { exams } from '../drizzle/schema.js';
import { authenticateUser } from "./_apiUtils.js";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.VITE_PUBLIC_SENTRY_DSN,
  environment: process.env.VITE_PUBLIC_APP_ENV,
  initialScope: {
    tags: {
      type: 'backend',
      projectId: process.env.PROJECT_ID
    }
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    res.setHeader('Allow', ['POST', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const user = await authenticateUser(req);

    const { id, subject, exam_date, exam_board, teacher_name } = req.body;

    const sql = neon(process.env.NEON_DB_URL);
    const db = drizzle(sql);

    let result;
    if (req.method === 'PUT') {
      result = await db.update(exams).set({
        subject,
        examDate: exam_date,
        examBoard: exam_board,
        teacherName: teacher_name,
      }).where(
        and(
          eq(exams.id, id),
          eq(exams.userId, user.id)
        )
      ).returning();
    } else {
      result = await db.insert(exams).values({
        userId: user.id,
        subject,
        examDate: exam_date,
        examBoard: exam_board,
        teacherName: teacher_name,
      }).returning();
    }

    res.status(200).json(result[0]);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}