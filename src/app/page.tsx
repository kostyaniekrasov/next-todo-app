import { TodoApp } from '@/components';
import { getTodos } from '@/lib';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

const TodosPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TodoApp />
    </HydrationBoundary>
  );
};

export default TodosPage;
