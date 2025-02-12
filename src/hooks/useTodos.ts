import { FilterStatus, Todo } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { v4 } from 'uuid';

const API_URL = 'https://jsonplaceholder.typicode.com/todos';

const fetchTodos = async (): Promise<Todo[]> => {
  const { data } = await axios.get(`${API_URL}?_limit=10`);
  return data;
};

function useTodos(filterStatus: FilterStatus) {
  const queryClient = useQueryClient();

  const { data: todos = [], isLoading: isFetchingTodos } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    staleTime: 1000 * 60 * 5,
  });

  const getAllTodos = (): Todo[] => {
    return queryClient.getQueryData<Todo[]>(['todos']) || [];
  };

  const updateTodoInQuery = (updatedTodo: Partial<Todo>) => {
    queryClient.setQueryData<Todo[]>(['todos'], (oldTodos = []) =>
      oldTodos.map((todo) =>
        todo.id === updatedTodo.id ? { ...todo, ...updatedTodo } : todo
      )
    );
  };

  const removeTodosFromQuery = (deletedIds: number[]) => {
    queryClient.setQueryData<Todo[]>(['todos'], (oldTodos = []) =>
      oldTodos.filter((todo) => !deletedIds.includes(todo.id))
    );
  };

  const uniqueId = () => parseInt(v4().replace(/\D/g, '').slice(0, 10), 10);

  const filteredTodos = getAllTodos().filter((todo) => {
    switch (filterStatus) {
      case FilterStatus.active:
        return !todo.completed;
      case FilterStatus.completed:
        return todo.completed;
      default:
        return true;
    }
  });

  const addTodo = useMutation({
    mutationFn: async (title: string) => {
      return { id: uniqueId(), userId: 1, title, completed: false };
    },

    onMutate: async (newTitle: string) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      const previousTodos = getAllTodos();

      const tempTodo: Todo = {
        id: uniqueId(),
        userId: 1,
        title: newTitle,
        completed: false,
      };

      queryClient.setQueryData(['todos'], [...previousTodos, tempTodo]);

      return { previousTodos };
    },

    onError: (_error, _newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },
  });

  const updateTodo = useMutation({
    mutationFn: async (updatedTodo: Partial<Todo>) => {
      if (updatedTodo.id && updatedTodo.id <= 200) {
        return updatedTodo;
      }

      const { data } = await axios.patch<Todo>(
        `${API_URL}/${updatedTodo.id}`,
        updatedTodo
      );
      return data;
    },
    onSuccess: updateTodoInQuery,
  });

  const toggleTodo = useMutation({
    mutationFn: async (id: number) => {
      const todo = getAllTodos().find((t) => t.id === id);
      if (!todo) return;

      return updateTodo.mutateAsync({ id, completed: !todo.completed });
    },
  });

  const renameTodo = useMutation({
    mutationFn: async ({ id, newTitle }: { id: number; newTitle: string }) => {
      return updateTodo.mutateAsync({ id, title: newTitle });
    },
  });

  const deleteTodo = useMutation({
    mutationFn: async (id: number) => {
      if (id > 200) {
        await axios.delete(`${API_URL}/${id}`);
      }
      return id;
    },
    onSuccess: (deletedId) => removeTodosFromQuery([deletedId]),
  });

  const clearCompleted = useMutation({
    mutationFn: async () => {
      const completedTodos = getAllTodos().filter((todo) => todo.completed);
      const deletableTodos = completedTodos.filter((todo) => todo.id > 200);

      await Promise.all(
        deletableTodos.map((todo) => axios.delete(`${API_URL}/${todo.id}`))
      );

      return completedTodos.map((todo) => todo.id);
    },
    onSuccess: removeTodosFromQuery,
  });

  const toggleAllTodos = useMutation({
    mutationFn: async () => {
      const allTodos = getAllTodos();
      const newCompletedState = !allTodos.every((todo) => todo.completed);

      const updatedTodos = allTodos.map((todo) => ({
        ...todo,
        completed: newCompletedState,
      }));

      queryClient.setQueryData(['todos'], updatedTodos);

      return updatedTodos;
    },
  });

  const isLoading =
    isFetchingTodos ||
    addTodo.isPending ||
    renameTodo.isPending ||
    toggleTodo.isPending ||
    deleteTodo.isPending ||
    clearCompleted.isPending ||
    toggleAllTodos.isPending;

  return {
    todos,
    isLoading,
    addTodo,
    renameTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    toggleAllTodos,
    filteredTodos,
  };
}

export default useTodos;
