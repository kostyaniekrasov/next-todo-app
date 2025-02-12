'use client';

import { FilterStatus, TodosAnimation } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { TodosFilter, TodoList } from '@/components';
import useTodos from '@/hooks/useTodos';

const TodoApp = () => {
  const [title, setTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(
    FilterStatus.all
  );
  const [animationState, setAnimationState] = useState<TodosAnimation>(
    TodosAnimation.adding
  );

  const { todos, isLoading, addTodo, toggleTodo, deleteTodo } =
    useTodos(filterStatus);

  const activeTodos = todos.filter((todo) => !todo.completed);

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
    <main className="mx-5 my-10 text-2xl font-normal text-black">
      <h1 className="h-9xl mb-2 text-center text-9xl font-semibold text-red-700">
        todos
      </h1>

      <section className="mb-5 bg-white shadow-sm">
        <header className="relative flex w-full flex-col gap-4 bg-[rgba(0,0,0,0.01)] shadow-sm">
          <nav className="flex h-5 w-full items-center justify-between border-t border-gray-300 p-5 text-center text-sm text-gray-500 shadow-md">
            <span className="font-semibold">
              {activeTodos.length} todos left
            </span>

            <TodosFilter
              filterStatus={filterStatus}
              onFilterChange={handleFilterChange}
            />
          </nav>

          <form onSubmit={handleSubmit} className="px-8 pb-8">
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
          todos={todos}
          removeTodo={async (id) => {
            setAnimationState(TodosAnimation.deleting);
            await deleteTodo.mutateAsync(id);
          }}
          tempTodo={null}
          isLoading={isLoading}
          toggleTodo={async (id) => {
            await toggleTodo.mutateAsync(id);
          }}
          animationState={animationState}
        />
      </section>
    </main>
  );
};

export default TodoApp;
