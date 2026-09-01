import React from 'react';

export const ViewSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-neutral-800 rounded-lg"></div>
          <div className="h-4 w-72 bg-neutral-800/60 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-neutral-800 rounded-xl"></div>
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <div className="h-4 w-24 bg-neutral-800 rounded"></div>
            <div className="h-8 w-36 bg-neutral-800 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Main Content Area skeleton */}
      <div className="h-96 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <div className="h-6 w-56 bg-neutral-800 rounded"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-neutral-800/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
};
