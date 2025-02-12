'use client';

import { FilterStatus, TodosAnimation } from '@/types';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { TodosFilter, TodoList } from '@/components';
import useTodos from '@/hooks/useTodos';

function TodoApp() {
  const [title, setTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(
    FilterStatus.all
  );
  const [animationState, setAnimationState] = useState<TodosAnimation>(
    TodosAnimation.adding
  );

  const {
    todos,
    isLoading,
    addTodo,
    renameTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    toggleAllTodos,
    filteredTodos,
  } = useTodos(filterStatus);

  const allCompleted = filteredTodos.every((todo) => todo.completed);
  const activeTodos = filteredTodos.filter((todo) => !todo.completed);
  const completedTodos = filteredTodos.filter((todo) => todo.completed);

  const todoField = useRef<HTMLInputElement | null>(null);

  const handleFilterChange = (status: FilterStatus) => {
    setAnimationState(TodosAnimation.filtering);
    setFilterStatus(status);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAnimationState(TodosAnimation.adding);
    if (!title.trim()) return;
    await addTodo.mutateAsync(title);
    setTitle('');
  };

  useEffect(() => {
    if (addTodo.isSuccess && todoField.current) {
      todoField.current.focus();
    }
  }, [addTodo.isSuccess]);

  useEffect(() => {
    if (todoField.current) {
      todoField.current.focus();
    }
  }, []);

  return (
    <div className="mx-5 my-10 text-2xl font-normal text-black">
      <h1 className="h-9xl mb-2 text-center text-9xl font-semibold text-red-700">
        todos
      </h1>

      <div className="mb-5 bg-white shadow-sm">
        <header className="relative flex items-center gap-4 bg-[rgba(0,0,0,0.01)] p-4 shadow-sm">
          {!!todos.length && (
            <button
              type="button"
              className={classNames(
                'flex h-full w-8 rotate-90 cursor-pointer items-center justify-center border-none bg-transparent text-2xl text-gray-300',
                {
                  'text-gray-500': allCompleted,
                }
              )}
              onClick={() => toggleAllTodos.mutate()}
            >
              ❯
            </button>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="w-full border-none bg-transparent text-2xl outline-none placeholder:font-light placeholder:italic placeholder:text-gray-300 focus:ring-0"
              placeholder="What needs to be done?"
              ref={todoField}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={addTodo.isPending}
            />
          </form>
        </header>

        <TodoList
          todos={filteredTodos}
          removeTodo={async (id) => {
            setAnimationState(TodosAnimation.deleting);
            await deleteTodo.mutateAsync(id);
          }}
          tempTodo={null}
          isLoading={isLoading}
          renameTodo={async (id, newTitle) => {
            await renameTodo.mutateAsync({ id, newTitle });
          }}
          toggleTodo={async (id) => {
            await toggleTodo.mutateAsync(id);
          }}
          isClearCompletedLoading={clearCompleted.isPending}
          isToggleAllLoading={toggleAllTodos.isPending}
          animationState={animationState}
        />

        {!!todos.length && (
          <footer className="flex h-5 items-center justify-between border-t border-gray-300 p-5 text-center text-sm text-gray-500 shadow-md">
            <span className="font-semibold">
              {activeTodos.length} items left
            </span>

            <TodosFilter
              filterStatus={filterStatus}
              onFilterChange={handleFilterChange}
            />

            <button
              type="button"
              className="m-0 cursor-pointer appearance-none border-0 p-0 font-semibold no-underline transition-opacity duration-300"
              disabled={!completedTodos.length || clearCompleted.isPending}
              onClick={() => clearCompleted.mutate()}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

export default TodoApp;
