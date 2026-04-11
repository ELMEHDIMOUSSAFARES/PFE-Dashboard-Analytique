import { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';

export default function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Review monthly report', done: true  },
    { id: 2, text: 'Update user database',  done: false },
    { id: 3, text: 'Fix payment bug',       done: false },
    { id: 4, text: 'Deploy new version',    done: false },
  ]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, done: false }]);
    setInput('');
  };

  const toggleTodo = (id) =>
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const deleteTodo = (id) =>
    setTodos(todos.filter(t => t.id !== id));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="font-semibold text-gray-800 mb-4">Todo List</h2>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a task..."
          className="flex-1 bg-gray-50 rounded-xl px-4 py-2 text-sm
                     outline-none text-gray-700 placeholder-gray-400"
        />
        <button
          onClick={addTodo}
          className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center
                     justify-center text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* List */}
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`w-6 h-6 rounded-full border-2 flex items-center
                         justify-center transition-colors
                         ${todo.done
                           ? 'bg-indigo-600 border-indigo-600'
                           : 'border-gray-300'
                         }`}
            >
              {todo.done && <Check size={12} className="text-white" />}
            </button>
            <span className={`flex-1 text-sm ${todo.done
              ? 'line-through text-gray-400'
              : 'text-gray-700'
            }`}>
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}