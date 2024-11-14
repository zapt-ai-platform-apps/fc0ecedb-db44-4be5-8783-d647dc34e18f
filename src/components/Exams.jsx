import { createSignal, onMount, Show, For } from 'solid-js';
import { supabase } from '../supabaseClient';
import { parseISO, format } from 'date-fns';

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
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/getExams', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      } else {
        console.error('Error fetching exams:', response.statusText);
      }
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
      const { data: { session } } = await supabase.auth.getSession();
      const payload = {
        ...newExam(),
        id: editingExam()
      };
      let response;
      if (editingExam()) {
        response = await fetch('/api/saveExam', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('/api/saveExam', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        setNewExam({
          subject: '',
          exam_date: '',
          exam_board: '',
          teacher_name: ''
        });
        setEditingExam(null);
        fetchExams();
      } else {
        console.error('Error saving exam:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const editExam = (exam) => {
    setNewExam({
      subject: exam.subject,
      exam_date: exam.examDate,
      exam_board: exam.examBoard,
      teacher_name: exam.teacherName
    });
    setEditingExam(exam.id);
  };

  const deleteExam = async (id) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/deleteExam', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });
      if (response.ok) {
        fetchExams();
      } else {
        console.error('Error deleting exam:', response.statusText);
      }
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
                <p class="text-gray-300">Date: {format(parseISO(exam.examDate), 'dd/MM/yyyy')}</p>
                <p class="text-gray-300">Board: {exam.examBoard}</p>
                <p class="text-gray-300">Teacher: {exam.teacherName}</p>
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