'use client';
import { AnimationType, Todo, TodosAnimation } from '@/types';
import { useState } from 'react';
import { TodoItem } from '@/components';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  todos: Todo[];
  removeTodo: (id: number) => Promise<void>;
  tempTodo: Todo | null;
  isLoading?: boolean;
  toggleTodo: (id: number) => Promise<void>;
  animationState: TodosAnimation;
};

const TodoList = ({
  todos,
  removeTodo,
  tempTodo,
  isLoading,
  toggleTodo,
  animationState,
}: Readonly<Props>) => {
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const [togglingTodoId, setTogglingTodoId] = useState<number | null>(null);

  const handleRemoveTodo = async (id: number) => {
    setDeletingTodoId(id);
    await removeTodo(id);
    setDeletingTodoId(null);
  };

  const handleToggleTodo = async (id: number) => {
    setTogglingTodoId(id);
    await toggleTodo(id);
    setTogglingTodoId(null);
  };

  const getAnimationState = (
    animationState: TodosAnimation,
    type: AnimationType
  ) => {
    if (
      animationState === TodosAnimation.adding &&
      type === AnimationType.initial
    ) {
      return { opacity: 0, scale: 0.8 };
    }

    if (
      animationState === TodosAnimation.deleting &&
      type === AnimationType.exit
    ) {
      return { opacity: 0, x: -100 };
    }

    if (animationState === TodosAnimation.filtering) {
      return type === AnimationType.exit
        ? { opacity: 0, scale: 0 }
        : { opacity: 0, scale: 0.8 };
    }

    return { opacity: 0, y: 20 };
  };

  return (
    <section className="border-t border-solid border-gray-100">
      <AnimatePresence>
        {todos.map((todo) => (
          <motion.div
            key={todo.id}
            initial={getAnimationState(animationState, AnimationType.initial)}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={getAnimationState(animationState, AnimationType.exit)}
            transition={{ duration: 0.3 }}
          >
            <TodoItem
              todo={todo}
              removeTodo={async (id) => await handleRemoveTodo(id)}
              isLoading={
                (isLoading && deletingTodoId === todo.id) ||
                (isLoading && togglingTodoId === todo.id)
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
            toggleTodo={() => {}}
          />
        </div>
      )}
    </section>
  );
};

export default TodoList;
