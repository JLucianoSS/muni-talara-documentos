'use client';

type ChartCardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export const ChartCard = ({ title, children, className = '' }: ChartCardProps) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
