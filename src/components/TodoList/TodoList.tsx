'use client';
import { Todo, TodosAnimation } from '@/types';
import { useState } from 'react';
import { TodoItem } from '@/components';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  todos: Todo[];
  removeTodo: (id: number) => Promise<void>;
  tempTodo: Todo | null;
  isLoading?: boolean;
  renameTodo: (id: number, newTitle: string) => Promise<void>;
  toggleTodo: (id: number) => Promise<void>;
  isToggleAllLoading: boolean;
  isClearCompletedLoading: boolean;
  animationState: TodosAnimation;
};

function TodoList({
  todos,
  removeTodo,
  tempTodo,
  isLoading,
  renameTodo,
  toggleTodo,
  isToggleAllLoading,
  isClearCompletedLoading,
  animationState,
}: Readonly<Props>) {
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const [updatingTodoId, setUpdatingTodoId] = useState<number | null>(null);
  const [togglingTodoId, setTogglingTodoId] = useState<number | null>(null);

  const handleRemoveTodo = async (id: number) => {
    setDeletingTodoId(id);
    await removeTodo(id);
    setDeletingTodoId(null);
  };

  const handleUpdateTodo = async (id: number, newTitle: string) => {
    setUpdatingTodoId(id);
    await renameTodo(id, newTitle);
    setUpdatingTodoId(null);
  };

  const handleToggleTodo = async (id: number) => {
    setTogglingTodoId(id);
    await toggleTodo(id);
    setTogglingTodoId(null);
  };

  const isAllCompleted = todos.every((todo) => todo.completed);

  function getAnimationState(
    animationState: TodosAnimation,
    type: 'initial' | 'exit'
  ) {
    if (animationState === TodosAnimation.adding && type === 'initial') {
      return { opacity: 0, scale: 0.8 };
    }

    if (animationState === TodosAnimation.deleting && type === 'exit') {
      return { opacity: 0, x: -100 };
    }

    if (animationState === TodosAnimation.filtering) {
      return type === 'exit'
        ? { opacity: 0, scale: 0 }
        : { opacity: 0, scale: 0.8 };
    }

    return { opacity: 0, y: 20 };
  }

  return (
    <section className="border-t border-solid border-t-[#e6e6e6]">
      <AnimatePresence>
        {todos.map((todo) => (
          <motion.div
            key={todo.id}
            initial={getAnimationState(animationState, 'initial')}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={getAnimationState(animationState, 'exit')}
            transition={{ duration: 0.3 }}
          >
            <TodoItem
              todo={todo}
              removeTodo={async (id) => await handleRemoveTodo(id)}
              isLoading={
                (isLoading && deletingTodoId === todo.id) ||
                (isLoading && updatingTodoId === todo.id) ||
                (isLoading && togglingTodoId === todo.id) ||
                (isToggleAllLoading &&
                  ((isAllCompleted && todo.completed) ||
                    (!isAllCompleted && !todo.completed))) ||
                (isClearCompletedLoading && todo.completed)
              }
              renameTodo={async (id, newTitle) =>
                await handleUpdateTodo(id, newTitle)
              }
              toggleTodo={async (id) => await handleToggleTodo(id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {tempTodo && (
        <div key={tempTodo.id}>
          <TodoItem
            todo={tempTodo}
            removeTodo={async (id) => await handleRemoveTodo(id)}
            isLoading={tempTodo !== null}
            renameTodo={async (id, newTitle) =>
              await handleUpdateTodo(id, newTitle)
            }
            toggleTodo={() => {}}
          />
        </div>
      )}
    </section>
  );
}

export default TodoList;
