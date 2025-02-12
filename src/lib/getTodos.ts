import { Todo } from '@/types';
import axios from 'axios';

const API_URL = 'https://jsonplaceholder.typicode.com/todos';

async function getTodos(): Promise<Todo[]> {
  const { data } = await axios.get(`${API_URL}?_limit=10`);

  return data;
}

export default getTodos;
