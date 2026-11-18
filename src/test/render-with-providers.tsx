import {
  render,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { ReactElement, ReactNode } from 'react';

export interface ProviderOptions {
  /** Initial router location: a path, or a path with navigation state. */
  route?: string | { pathname: string; state?: unknown };
}

/**
 * Renders with the same providers as root.tsx: the router. i18n is the global instance with real `en` resources (loaded in
 * test/setup.ts). Network is mocked by MSW, nothing else.
 */
export const renderWithProviders = (
  ui: ReactElement,
  {
    route = '/',
    ...options
  }: ProviderOptions & Omit<RenderOptions, 'wrapper'> = {},
): RenderResult => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  );
  return render(ui, { wrapper: Wrapper, ...options });
};
