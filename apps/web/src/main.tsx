import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { Provider as JotaiProvider } from 'jotai';
import { createQueryClient } from '@jtl/shared';
import { createAppRouter } from './router';
import './index.css';

async function enableMocking() {
  // The mock backend is part of this demo, so it runs in dev and preview builds alike.
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: !import.meta.env.DEV,
  });
}

const queryClient = createQueryClient();
const router = createAppRouter(queryClient);

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <JotaiProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </JotaiProvider>
    </StrictMode>
  );
});
