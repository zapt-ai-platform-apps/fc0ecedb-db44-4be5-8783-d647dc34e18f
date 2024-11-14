import { createSignal, onMount, createEffect, Show } from 'solid-js';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from './supabaseClient';
import Preferences from './components/Preferences';
import Exams from './components/Exams';
import Timetable from './components/Timetable';

function App() {
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const [showPreferencesModal, setShowPreferencesModal] = createSignal(false);
  const [preferencesSet, setPreferencesSet] = createSignal(false);

  const checkUserSignedIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setCurrentPage('homePage');
      await checkPreferences();
    }
  };

  const checkPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/getPreferences', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPreferencesSet(!!data);
      } else {
        setPreferencesSet(false);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setPreferencesSet(false);
    }
  };

  onMount(checkUserSignedIn);

  createEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        setUser(session.user);
        setCurrentPage('homePage');
        await checkPreferences();
      } else {
        setUser(null);
        setCurrentPage('login');
      }
    });

    return () => {
      authListener.unsubscribe();
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
  };

  return (
    <div class="min-h-screen bg-black text-white p-4">
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          <div class="flex items-center justify-center min-h-screen">
            <div class="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-lg">
              <h2 class="text-3xl font-bold mb-6 text-center">Sign in with ZAPT</h2>
              <a
                href="https://www.zapt.ai"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline mb-6 block text-center"
              >
                Learn more about ZAPT
              </a>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook', 'apple']}
                magicLink={true}
                view="magic_link"
                showLinks={false}
                authView="magic_link"
              />
            </div>
          </div>
        }
      >
        <div class="h-full max-w-6xl mx-auto">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-4xl font-bold">UpGrade</h1>
            <button
              class="cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>

          <Show when={!preferencesSet()}>
            <Preferences user={user()} setPreferencesSet={setPreferencesSet} />
          </Show>

          <Show when={preferencesSet()}>
            <div class="mb-8">
              <button
                class="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 ease-in-out transform hover:scale-105"
                onClick={() => setShowPreferencesModal(true)}
              >
                Edit Preferences
              </button>
              <Exams user={user()} />
              <Timetable user={user()} />
            </div>
            <Show when={showPreferencesModal()}>
              <Preferences
                user={user()}
                setPreferencesSet={setPreferencesSet}
                onClose={() => setShowPreferencesModal(false)}
              />
            </Show>
          </Show>
        </div>
      </Show>
    </div>
  );
}

export default App;