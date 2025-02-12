import { Todo } from '@/types';

const getTodos = async (): Promise<Todo[]> => {
  const response = await fetch(
    'https://jsonplaceholder.typicode.com/todos?_limit=10',
    {
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }

  return response.json();
};

export default getTodos;
