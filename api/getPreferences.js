import { preferences } from '../drizzle/schema.js';
import { authenticateUser } from "./_apiUtils.js";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as Sentry from "@sentry/node";
import { format } from 'date-fns';

Sentry.init({
  dsn: process.env.VITE_PUBLIC_SENTRY_DSN,
  environment: process.env.VITE_PUBLIC_APP_ENV,
});

Sentry.configureScope(scope => {
  scope.setTag('type', 'backend');
  scope.setTag('projectId', process.env.PROJECT_ID);
});

export default async function handler(req, res) {
  try {
    const user = await authenticateUser(req);

    const sql = neon(process.env.NEON_DB_URL);
    const db = drizzle(sql);

    const result = await db.select()
      .from(preferences)
      .where(eq(preferences.userId, user.id))
      .limit(1);

    if (result.length > 0) {
      const preferencesData = result[0];
      // Format start_date to 'YYYY-MM-DD' string
      preferencesData.start_date = format(preferencesData.startDate, 'yyyy-MM-dd');
      res.status(200).json(preferencesData);
    } else {
      res.status(200).json({});
    }
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}