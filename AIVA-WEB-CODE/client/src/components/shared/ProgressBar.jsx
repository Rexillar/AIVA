import clsx from 'clsx';

const ProgressBar = ({ progress, className = '', color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className={clsx('w-full bg-gray-200 rounded-full h-2', className)}>
      <div
        className={clsx('h-2 rounded-full transition-all duration-300', colorClasses[color])}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
};

export default ProgressBar;