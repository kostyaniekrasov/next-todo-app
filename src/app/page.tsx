import { TodoApp } from '@/components';
import { getTodos } from '@/lib';
import {} from '@tanstack/react-query';

const TodosPage = async () => {
  const todos = await getTodos();

  return <TodoApp initialTodos={todos} />;
};

export default TodosPage;
