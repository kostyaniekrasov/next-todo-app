import { FilterStatus, Todo } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { v4 } from 'uuid';

const API_URL = 'https://jsonplaceholder.typicode.com/todos';

const fetchTodos = async (): Promise<Todo[]> => {
  const { data } = await axios.get(`${API_URL}?_limit=10`);
  return data;
};

const useTodos = (filterStatus: FilterStatus) => {
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
      const response = await axios.post(`${API_URL}`, {
        title,
        completed: false,
        userId: 1,
      });

      return {
        status: response.status,
        todo: { id: uniqueId(), userId: 1, title, completed: false },
      };
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

    onSuccess: (_data) => {},

    onError: (_error, _newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },
  });

  const updateTodo = useMutation({
    mutationFn: async (updatedTodo: Partial<Todo>) => {
      if (updatedTodo.id && updatedTodo.id > 200) {
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

  const deleteTodo = useMutation({
    mutationFn: async (id: number) => {
      if (id < 200) {
        await axios.delete(`${API_URL}/${id}`);
      }
      return id;
    },
    onSuccess: (deletedId) => removeTodosFromQuery([deletedId]),
  });

  const isLoading =
    isFetchingTodos ||
    addTodo.isPending ||
    toggleTodo.isPending ||
    deleteTodo.isPending;

  return {
    todos: filteredTodos,
    isLoading,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
};

export default useTodos;
