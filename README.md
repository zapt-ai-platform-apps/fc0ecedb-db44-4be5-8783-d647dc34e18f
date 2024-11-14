# UpGrade

UpGrade is an app designed to help students prepare for their school examinations by creating personalized revision timetables presented in a detailed calendar format. The app schedules revision sessions for each of the student's subjects based on available hourly slots and preferences, ensuring efficient use of study time leading up to exams.

## Features

- **User Authentication**: Secure login using your school email or social providers like Google, Facebook, and Apple.
- **Initial Setup**: Upon first login, set your preferred revision schedule, session duration, and start date for your revision.
- **Exam Management**:
  - **Add Exams**: Enter details like subject, date, examination board, and teacher's name.
  - **Edit Exams**: Modify existing exams to update any details.
  - **Delete Exams**: Remove exams that are no longer relevant.
- **Preference Management**: Edit your revision schedule preferences, session durations, and start date at any time.
- **Personalized Revision Timetable**: Automatically generates a detailed calendar with scheduled revision sessions starting from your selected start date. The app distributes revision sessions among all subjects, considering the period from the start date up to each exam.
  - **Hourly Schedule**: Each day in the calendar displays hourly slots from **8 AM to 8 PM**.
    - **Available Times**: Indicates which hours you are available for revision based on your preferences.
    - **Session Allocation**: Revision sessions are allocated to specific hours within your available times.
  - **Custom Start Date**: Begin your revision timetable from a date of your choosing, allowing flexibility in planning.
  - **Scheduling Logic**:
    - **Exam Days**: No revision sessions are scheduled on exam dates, allowing you to focus on your exams.
    - **Day Before Exam**: The day before an exam will have at least one revision session for each upcoming exam subject, ensuring dedicated preparation time.
    - **Even Distribution**: Revision sessions are distributed among all subjects, ensuring continuous preparation across all subjects.
    - **Exclusion of Past Exams**: The timetable only displays upcoming exams and associated revision sessions. Exams that have already occurred are not shown.
    - **No Sessions After Exam Dates**: Revision sessions are **not scheduled on or after** the exam date for a subject.
- **Responsive Design**: Accessible on all devices with a user-friendly interface.
- **Accurate Session Scheduling**: Ensures that revision sessions are scheduled without duplication, providing a clear and organized timetable.
- **Dark Theme**: The app features a black background with white text for a comfortable viewing experience, especially in low-light environments.

## User Journeys

### 1. Account Creation and Login

1. **Open the App**
   - Navigate to the UpGrade app.
   - See the title "Sign in with ZAPT" above the authentication form.
2. **Learn About ZAPT**
   - Click on the "Learn more about ZAPT" link to visit the ZAPT marketing site in a new tab.
3. **Sign Up or Login**
   - Choose to sign up with your email or use a social provider (Google, Facebook, Apple).
   - If signing up with email:
     - Enter your school email address.
     - Receive a magic link in your email to complete the sign-up process.
   - If logging in:
     - Enter your credentials to access your account.
4. **Authentication Handling**
   - The app automatically updates the UI upon successful login without requiring a page refresh.

### 2. Initial Setup - Setting Revision Preferences

1. **Set Revision Schedule**
   - Upon first login, you're prompted to select your preferred revision times for each day of the week.
   - For each day (Monday to Sunday), select the hours you are available for revision between **8 AM and 8 PM**.
     - **Hourly Selection**: You can select specific hours by checking the boxes next to each hour.
2. **Set Session Duration**
   - Select how long each revision session should last.
   - Choose a duration between a minimum of **30 minutes** and a maximum of **2 hours**, in 15-minute increments.
3. **Select Start Date**
   - Choose the date from which you want to begin your revision timetable.
   - This allows you to plan ahead and start revision on a future date if desired.
4. **Save Preferences**
   - Click on "Save Preferences" to save your settings.
   - A loading state indicates the saving process.
   - Upon success, you're directed to the home page.

### 3. Adding Exams

1. **Access Exam Management**
   - On the home page, click on "Add New Exam" to open the exam form.
2. **Fill Exam Details**
   - **Subject**: Enter the subject of the exam.
   - **Exam Date**: Select the date of the exam from a date picker.
   - **Examination Board**: Enter the examination board (e.g., AQA, Edexcel).
   - **Teacher's Name**: Enter the name of your teacher for the subject.
3. **Save Exam**
   - Click on "Save Exam" to save the exam details.
   - A loading state indicates the saving process.
   - Upon success, the exam list updates automatically.

### 4. Viewing and Managing Exams

1. **View Exams**
   - See a list of all your upcoming exams on the home page.
   - Exams display subject, date, exam board, and teacher's name.
   - **Note**: Exams that have already passed are not displayed.
2. **Edit Exams**
   - Click the "Edit" button next to an exam.
   - Modify the exam details in the form that appears.
   - Click "Update Exam" to save changes.
   - The exam list updates with the new details.
3. **Delete Exams**
   - Click the "Delete" button next to an exam.
   - Confirm the deletion in the prompt that appears.
   - The exam is removed from your list.

### 5. Editing Preferences

1. **Access Preferences**
   - On the home page, click on the "Edit Preferences" button.
2. **Modify Preferences**
   - Change your revision schedule for each day, the session duration, and the start date.
3. **Save Preferences**
   - Click on "Save Preferences" to update your settings.
   - A loading state indicates the saving process.
   - Upon success, your timetable will update to reflect the new preferences.

### 6. Viewing Revision Timetable

1. **Access Timetable**
   - Scroll down to the "Revision Timetable" section.
2. **Understand the Schedule**
   - The app generates a personalized revision timetable starting from your selected start date.
   - Each day displays hourly slots from **8 AM to 8 PM**.
   - **Available Hours**:
     - Hours you are available for revision are displayed based on your preferences.
   - **Scheduled Sessions**:
     - Revision sessions are allocated to specific hours within your available times.
     - The timetable considers your availability preferences and schedules sessions from the start date up to each exam.
   - **Special Scheduling Before Exams**:
     - If a day has one or more exams scheduled, the **day before will have at least one revision session for each exam**, ensuring you have dedicated time to prepare for each subject.
     - The app prioritizes assigning available revision sessions on the day before to the subjects of the upcoming exams.
   - **Consistent Scheduling**: Regular revision sessions for all upcoming exams are scheduled, ensuring continuous preparation across all subjects.
   - **No sessions are scheduled for a subject on or after its exam date.**
   - **No revision sessions are scheduled on exam dates, allowing you to focus on your exams.**
   - **Exam Dates**: Exam days are highlighted with a red border.
   - **Only upcoming exams and revision sessions are displayed; past exams are excluded.**
   - Duplicate sessions are eliminated, ensuring a clear timetable.
3. **Detailed View**
   - Click on a session to view detailed revision tasks (Future Functionality).

### 7. Logging Out

1. **Sign Out**
   - Click on the "Sign Out" button at the top right corner.
   - The app returns to the login page, and the UI updates automatically.

## External APIs and Services

- **Supabase Authentication**: Used for secure user authentication and account management.
- **Neon Postgres Database**: Stores exam information, user data, and preferences.
- **Drizzle ORM**: Used for interacting with the Neon Postgres database.
- **Date-fns**: Handles date formatting and manipulation.
- **Progressier**: Adds Progressive Web App (PWA) support to the app.
- **Sentry**: Used for error logging and monitoring.
