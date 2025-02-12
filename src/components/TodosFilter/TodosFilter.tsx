import { FilterStatus } from '@/types';
import classNames from 'classnames';

type Props = {
  filterStatus: FilterStatus;
  onFilterChange: (filterStatus: FilterStatus) => void;
};

const FILTERS = [
  { label: 'All', status: FilterStatus.all, href: '#/' },
  { label: 'Active', status: FilterStatus.active, href: '#/active' },
  { label: 'Completed', status: FilterStatus.completed, href: '#/completed' },
];

const TodosFilter = ({ filterStatus, onFilterChange }: Readonly<Props>) => {
  return (
    <nav className="flex">
      {FILTERS.map(({ label, status, href }) => (
        <a
          key={status}
          href={href}
          className={classNames(
            'm-[3px] rounded-md border border-solid border-transparent px-2 py-1 font-semibold no-underline',
            {
              'border-[rgba(175,47,47,0.75)] text-[rgba(175,47,47,0.75)]':
                filterStatus === status,
            }
          )}
          onClick={() => onFilterChange(status)}
        >
          {label}
        </a>
      ))}
    </nav>
  );
};

export default TodosFilter;
