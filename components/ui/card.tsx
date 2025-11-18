import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function Card({
  children,
  className,
  onClick,
  selected = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border transition-all',
        onClick && 'cursor-pointer hover:shadow-md',
        selected
          ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
          : 'border-gray-200 hover:border-gray-300',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('px-4 py-3 border-b border-gray-200', className)}>
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('p-4', className)}>{children}</div>;
}
