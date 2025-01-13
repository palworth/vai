import { NavigationButtons } from './NavigationButtons'

interface PageHeaderProps {
  title: string;
  rightContent?: React.ReactNode;
}

export function PageHeader({ title, rightContent }: PageHeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center">
        <NavigationButtons />
        <h1 className="text-3xl font-bold text-gray-900 flex-grow text-center">{title}</h1>
        {rightContent && <div className="flex-shrink-0">{rightContent}</div>}
      </div>
    </header>
  );
}

