import { preferences } from '../drizzle/schema.js';
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

    const { availability, session_duration, start_date } = req.body;

    const sql = neon(process.env.NEON_DB_URL);
    const db = drizzle(sql);

    const existingPreference = await db.select()
      .from(preferences)
      .where(eq(preferences.userId, user.id))
      .limit(1);

    let result;
    if (existingPreference.length > 0) {
      result = await db.update(preferences).set({
        availability,
        sessionDuration: session_duration,
        startDate: start_date
      }).where(eq(preferences.userId, user.id)).returning();
    } else {
      result = await db.insert(preferences).values({
        userId: user.id,
        availability,
        sessionDuration: session_duration,
        startDate: start_date
      }).returning();
    }

    res.status(200).json(result[0]);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}