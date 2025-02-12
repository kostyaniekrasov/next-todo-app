'use client';

import { Todo } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { TodoLoader } from '@/components';
import classNames from 'classnames';
import { CheckIcon, XMarkIcon } from '@heroicons/react/16/solid';

type Props = {
  todo: Todo;
  removeTodo: (id: number) => Promise<void>;
  isLoading: boolean;
  renameTodo: (id: number, title: string) => Promise<void>;
  toggleTodo: (id: number) => void;
};

function TodoItem({
  todo,
  removeTodo,
  isLoading,
  renameTodo,
  toggleTodo,
}: Readonly<Props>) {
  const [editing, setEditing] = useState(false);
  const [editingText, setEditingText] = useState(todo.title);

  const titleField = useRef<HTMLInputElement>(null);

  const handleRename = async () => {
    try {
      if (!editingText.trim()) {
        await removeTodo(todo.id);
        setEditing(true);
      }

      await renameTodo(todo.id, editingText);
      setEditingText(editingText.trim());
      setEditing(false);
    } catch (error) {
      setEditing(true);
      if (titleField.current) {
        titleField.current.focus();
      }

      throw error;
    }
  };

  const handleDoubleClick = () => {
    setEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditing(false);
      setEditingText(todo.title);
    }
  };

  const handleBlur = () => {
    handleRename();

    if (!editingText.trim().length) {
      if (titleField.current) {
        titleField.current.focus();
      }
    }
  };

  const handleRemoving = () => {
    removeTodo(todo.id);
  };

  useEffect(() => {
    if (editing && titleField.current) {
      titleField.current.focus();
    }
  }, [editing]);

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

      {editing ? (
        <input
          ref={titleField}
          type="text"
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="py-3; w-full break-all px-[15px] shadow-[inset_0_-1px_5px_0_rgba(0,0,0,0.2)] outline-none focus:ring-0"
        />
      ) : (
        <>
          <p
            className="py-3; break-all px-[15px] transition-[color] duration-[0.4s]"
            onDoubleClick={handleDoubleClick}
          >
            {editingText}
          </p>

          <button
            type="button"
            onClick={handleRemoving}
            className="absolute inset-y-0 right-3 float-right -translate-y-0.5 cursor-pointer border-0 font-[inherit] text-[120%] leading-none text-[#cc9a9a] opacity-0 transition-opacity duration-300 ease-out hover:text-[#af5b5e] group-hover:opacity-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </>
      )}

      <TodoLoader isActive={isLoading} />
    </div>
  );
}

export default TodoItem;
