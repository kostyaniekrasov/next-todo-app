import { Todo } from '@/types';
import { TodoLoader } from '@/components';
import classNames from 'classnames';
import { CheckIcon, XMarkIcon } from '@heroicons/react/16/solid';

type Props = {
  todo: Todo;
  removeTodo: (id: number) => Promise<void>;
  isLoading?: boolean;
  toggleTodo: (id: number) => void;
};

const TodoItem = ({
  todo,
  removeTodo,
  isLoading,
  toggleTodo,
}: Readonly<Props>) => {
  const handleRemoving = () => {
    removeTodo(todo.id);
  };

  return (
    <div
      className={classNames(
        'group relative grid grid-cols-[45px_1fr] justify-items-stretch border-b border-solid border-b-[#ededed] p-4 text-2xl leading-[1.4em] hover:bg-slate-50',
        {
          'text-[#d9d9d9] line-through': todo.completed,
        }
      )}
    >
      <div className="flex cursor-pointer items-center justify-center">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => toggleTodo(todo.id)}
          className="peer hidden"
          id={`checkbox-${todo.id}`}
        />
        <label
          htmlFor={`checkbox-${todo.id}`}
          className="mr-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-gray-400 transition-all peer-checked:border-blue-500 peer-checked:bg-blue-500"
        >
          {todo.completed && <CheckIcon className="h-4 w-4 text-white" />}
        </label>
      </div>

      <p className="py-3; break-all px-[15px] transition-[color] duration-[0.4s]">
        {todo.title}
      </p>

      <button
        type="button"
        onClick={handleRemoving}
        className="absolute inset-y-0 right-3 float-right -translate-y-0.5 cursor-pointer border-0 font-[inherit] text-[120%] leading-none text-[#cc9a9a] opacity-0 transition-opacity duration-300 ease-out hover:text-[#af5b5e] group-hover:opacity-100"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>

      <TodoLoader isActive={isLoading} />
    </div>
  );
};

export default TodoItem;
