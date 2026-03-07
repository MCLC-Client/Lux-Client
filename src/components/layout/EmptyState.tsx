import React from 'react';
import { cn } from '../../lib/utils';

function EmptyState({ icon: Icon, title, description, action, className }: { icon?: any; title: any; description?: any; action?: any; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-8 text-center', className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
