import { AutoBreadcrumbs } from '../../ui/Breadcrumbs';
import type { PageHeaderProps } from './types';

export default function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      <div>
        {breadcrumbs && <AutoBreadcrumbs items={breadcrumbs} />}
        <h2 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight">{title}</h2>
        {subtitle && <p className="text-slate-500 mt-2 font-medium">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}
