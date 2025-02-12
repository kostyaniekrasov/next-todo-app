type Props = {
  isActive?: boolean;
};

const TodoLoader = ({ isActive }: Readonly<Props>) => {
  return (
    isActive && (
      <div className="absolute inset-0 flex items-center justify-center rounded-md bg-gray-200 bg-opacity-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-400 border-t-transparent" />
      </div>
    )
  );
};

export default TodoLoader;
