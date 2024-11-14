import { createSignal, onMount, For, Show } from 'solid-js';
import { supabase } from '../supabaseClient';
import { format, addDays, isBefore, isSameDay, parseISO } from 'date-fns';
import * as Sentry from "@sentry/browser";

function Timetable(props) {
  const [timetable, setTimetable] = createSignal([]);
  const [loading, setLoading] = createSignal(false);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      // Fetch preferences and exams via API
      const { data: { session } } = await supabase.auth.getSession();
      const [preferencesResponse, examsResponse] = await Promise.all([
        fetch('/api/getPreferences', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }),
        fetch('/api/getExams', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
      ]);

      if (!preferencesResponse.ok || !examsResponse.ok) {
        console.error('Error fetching data');
        setLoading(false);
        return;
      }

      const preferences = await preferencesResponse.json();
      const exams = await examsResponse.json();

      if (!preferences.start_date) {
        console.error('Start date is missing in preferences');
        setLoading(false);
        return;
      }

      if (exams.length === 0) {
        console.error('No exams found for timetable');
        setTimetable([]);
        setLoading(false);
        return;
      }

      const availability = preferences.availability;
      const sessionDuration = preferences.session_duration;
      const startDate = parseISO(preferences.start_date);

      exams.sort((a, b) => parseISO(a.examDate) - parseISO(b.examDate));

      const endDate = parseISO(exams[exams.length - 1].examDate);

      const subjects = exams.map(exam => exam.subject);
      let subjectIndex = 0;

      const timetableData = [];
      let currentDate = startDate;

      while (isBefore(currentDate, addDays(endDate, 1))) {
        const dayName = format(currentDate, 'EEEE');
        const dayAvailability = availability[dayName] || [];
        const sessions = [];

        // No sessions on exam dates
        const examsOnThisDay = exams.filter(exam => isSameDay(parseISO(exam.examDate), currentDate));

        if (examsOnThisDay.length === 0 && dayAvailability.length > 0) {
          // Allocate sessions
          for (let hour of dayAvailability) {
            sessions.push({
              time: `${hour}:00`,
              subject: subjects[subjectIndex % subjects.length]
            });
            subjectIndex++;
          }
        } else if (dayAvailability.length > 0) {
          // Day before exams
          const nextDay = addDays(currentDate, 1);
          const examsTomorrow = exams.filter(exam => isSameDay(parseISO(exam.examDate), nextDay));

          if (examsTomorrow.length > 0) {
            for (let exam of examsTomorrow) {
              sessions.push({
                time: `${dayAvailability[0]}:00`,
                subject: exam.subject
              });
            }
          }
        }

        timetableData.push({
          date: new Date(currentDate),
          sessions,
          exams: examsOnThisDay
        });

        currentDate = addDays(currentDate, 1);
      }

      setTimetable(timetableData);

    } catch (error) {
      console.error('Error fetching timetable:', error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  onMount(fetchTimetable);

  return (
    <div class="mt-8">
      <h2 class="text-2xl font-bold mb-4">Revision Timetable</h2>
      <Show when={loading()}>
        <p>Loading Timetable...</p>
      </Show>
      <Show when={!loading() && timetable().length > 0}>
        <div class="space-y-8">
          <For each={timetable()}>
            {(day) => (
              <div class="bg-gray-800 p-6 rounded-lg shadow-md">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-xl font-bold">{format(day.date, 'EEEE, MMMM do')}</h3>
                  <Show when={day.exams.length > 0}>
                    <span class="cursor-pointer px-3 py-1 bg-red-500 text-white rounded-full">Exam Day</span>
                  </Show>
                </div>
                <div class="grid grid-cols-4 gap-4">
                  <For each={day.sessions}>
                    {(session) => (
                      <div class="bg-gray-700 p-4 rounded-lg">
                        <p class="font-semibold">{session.time}</p>
                        <p>{session.subject || 'Revision Session'}</p>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
      <Show when={!loading() && timetable().length === 0}>
        <p>No revision sessions scheduled.</p>
      </Show>
    </div>
  );
}

export default Timetable;