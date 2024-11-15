import { createSignal, onMount, Show, For } from 'solid-js';
import { supabase } from '../supabaseClient';

function Exams(props) {
  const [exams, setExams] = createSignal([]);
  const [newExam, setNewExam] = createSignal({
    subject: '',
    exam_date: '',
    exam_board: '',
    teacher_name: ''
  });
  const [loading, setLoading] = createSignal(false);
  const [editingExam, setEditingExam] = createSignal(null);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('user_id', props.user.id)
        .gte('exam_date', new Date().toISOString());

      if (error) throw error;

      setExams(data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  onMount(fetchExams);

  const saveExam = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...newExam(),
        user_id: props.user.id
      };
      let data, error;
      if (editingExam()) {
        ({ data, error } = await supabase
          .from('exams')
          .update(payload)
          .eq('id', editingExam()));
      } else {
        ({ data, error } = await supabase
          .from('exams')
          .insert(payload));
      }

      if (error) throw error;

      setNewExam({
        subject: '',
        exam_date: '',
        exam_board: '',
        teacher_name: ''
      });
      setEditingExam(null);
      fetchExams();
    } catch (error) {
      console.error('Error saving exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const editExam = (exam) => {
    setNewExam(exam);
    setEditingExam(exam.id);
  };

  const deleteExam = async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="mt-8">
      <h2 class="text-2xl font-bold mb-4">Manage Exams</h2>
      <form onSubmit={saveExam} class="space-y-4">
        <input
          type="text"
          placeholder="Subject"
          value={newExam().subject}
          onInput={(e) => setNewExam({ ...newExam(), subject: e.target.value })}
          class="box-border w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-gray-700"
          required
        />
        <input
          type="date"
          placeholder="Exam Date"
          value={newExam().exam_date}
          onInput={(e) => setNewExam({ ...newExam(), exam_date: e.target.value })}
          class="box-border w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-gray-700"
          required
        />
        <input
          type="text"
          placeholder="Examination Board"
          value={newExam().exam_board}
          onInput={(e) => setNewExam({ ...newExam(), exam_board: e.target.value })}
          class="box-border w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-gray-700"
        />
        <input
          type="text"
          placeholder="Teacher's Name"
          value={newExam().teacher_name}
          onInput={(e) => setNewExam({ ...newExam(), teacher_name: e.target.value })}
          class="box-border w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-gray-700"
        />
        <button
          type="submit"
          class={`cursor-pointer px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 ${loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading()}
        >
          {editingExam() ? 'Update Exam' : 'Save Exam'}
        </button>
        <Show when={editingExam()}>
          <button
            type="button"
            class="cursor-pointer px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => {
              setEditingExam(null);
              setNewExam({
                subject: '',
                exam_date: '',
                exam_board: '',
                teacher_name: ''
              });
            }}
          >
            Cancel
          </button>
        </Show>
      </form>

      <div class="mt-8">
        <h3 class="text-xl font-bold mb-4">Upcoming Exams</h3>
        <div class="space-y-4">
          <For each={exams()}>
            {(exam) => (
              <div class="bg-gray-800 p-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                <p class="font-semibold text-lg mb-2">{exam.subject}</p>
                <p class="text-gray-300">Date: {new Date(exam.exam_date).toLocaleDateString()}</p>
                <p class="text-gray-300">Board: {exam.exam_board}</p>
                <p class="text-gray-300">Teacher: {exam.teacher_name}</p>
                <div class="mt-4 flex space-x-4">
                  <button
                    class="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
                    onClick={() => editExam(exam)}
                  >
                    Edit
                  </button>
                  <button
                    class="cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg"
                    onClick={() => deleteExam(exam.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}

export default Exams;