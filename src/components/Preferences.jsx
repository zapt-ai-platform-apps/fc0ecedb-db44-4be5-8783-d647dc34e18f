import { createSignal } from 'solid-js';
import { createEvent, supabase } from '../supabaseClient';

function Preferences(props) {
  const [availability, setAvailability] = createSignal({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  });
  const [sessionDuration, setSessionDuration] = createSignal(60);
  const [startDate, setStartDate] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

  const handleTimeToggle = (day, hour) => {
    const dayAvailability = availability()[day];
    if (dayAvailability.includes(hour)) {
      setAvailability({
        ...availability(),
        [day]: dayAvailability.filter((h) => h !== hour)
      });
    } else {
      setAvailability({
        ...availability(),
        [day]: [...dayAvailability, hour]
      });
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('preferences')
        .upsert({
          user_id: props.user.id,
          availability: availability(),
          session_duration: sessionDuration(),
          start_date: startDate()
        });

      if (error) throw error;

      props.setUser({ ...props.user, preferencesSet: true });
      if (props.onClose) props.onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">Set Your Preferences</h2>
      <div class="space-y-4">
        <div>
          <h3 class="text-xl font-semibold mb-2">Availability</h3>
          <div class="space-y-2">
            <For each={Object.keys(availability())}>
              {(day) => (
                <div>
                  <p class="font-semibold">{day}</p>
                  <div class="flex flex-wrap gap-2">
                    <For each={hours}>
                      {(hour) => (
                        <label class="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={availability()[day].includes(hour)}
                            onChange={() => handleTimeToggle(day, hour)}
                          />
                          <span>{hour}:00</span>
                        </label>
                      )}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
        <div>
          <h3 class="text-xl font-semibold mb-2">Session Duration</h3>
          <select
            value={sessionDuration()}
            onChange={(e) => setSessionDuration(Number(e.target.value))}
            class="box-border w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-gray-700"
          >
            <For each={[30, 45, 60, 75, 90, 105, 120]}>
              {(duration) => (
                <option value={duration}>{duration} minutes</option>
              )}
            </For>
          </select>
        </div>
        <div>
          <h3 class="text-xl font-semibold mb-2">Start Date</h3>
          <input
            type="date"
            value={startDate()}
            onChange={(e) => setStartDate(e.target.value)}
            class="box-border w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-gray-700"
          />
        </div>
        <button
          class={`cursor-pointer px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 ${loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleSavePreferences}
          disabled={loading()}
        >
          {loading() ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}

export default Preferences;