import { registerNamespace } from '@/i18n/i18n';
import common from '@/i18n/locales/hr/common.json';
import notFound from '@/i18n/locales/hr/not-found.json';
import scout from '@/i18n/locales/hr/scout.json';
import squad from '@/i18n/locales/hr/squad.json';
import { projectMeta } from './lib/project-meta';
import type { Route } from './+types/project-hr';

// The Croatian copy lives in this route's chunk only, so English pages never load it.
registerNamespace('common', common, 'hr');
// A dead link inside /hr renders the 404 in Croatian.
registerNamespace('not-found', notFound, 'hr');
registerNamespace('squad', squad, 'hr');
registerNamespace('scout', scout, 'hr');

export const meta: Route.MetaFunction = ({ params }) =>
  projectMeta(params.slug, 'hr');

export { default } from './project';
