import { createSignal, onMount, For, Show } from 'solid-js';
import { supabase } from '../supabaseClient';
import { format, addDays, isBefore, isSameDay } from 'date-fns';

function Timetable(props) {
  const [timetable, setTimetable] = createSignal([]);
  const [loading, setLoading] = createSignal(false);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      // Fetch preferences and exams
      const [{ data: preferences }, { data: exams }] = await Promise.all([
        supabase.from('preferences').select('*').eq('user_id', props.user.id).single(),
        supabase.from('exams').select('*').eq('user_id', props.user.id).gte('exam_date', new Date().toISOString())
      ]);

      const availability = preferences.availability;
      const sessionDuration = preferences.session_duration;
      const startDate = new Date(preferences.start_date);

      exams.sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));

      // Generate timetable
      const timetableData = [];
      let currentDate = startDate;
      const endDate = new Date(exams[exams.length - 1].exam_date);

      while (isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) {
        const dayName = format(currentDate, 'EEEE');
        const dayAvailability = availability[dayName];
        const sessions = [];

        // No sessions on exam dates
        const examsOnThisDay = exams.filter(exam => isSameDay(new Date(exam.exam_date), currentDate));

        if (examsOnThisDay.length === 0 && dayAvailability.length > 0) {
          // Allocate sessions
          for (let hour of dayAvailability) {
            sessions.push({
              time: `${hour}:00`,
              subject: '' // Logic to assign subject evenly
            });
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
      <Show when={!loading()}>
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
    </div>
  );
}

export default Timetable;