'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * Global Query Client configuration
 * - staleTime: 5 minutes (data remains fresh for 5 mins)
 * - retry: 1 (retry failed requests once)
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

interface QueryProviderProps {
    children: ReactNode;
}

/**
 * QueryProvider wraps the application to provide React Query context.
 * Used in the root layout.
 */
export function QueryProvider({ children }: QueryProviderProps) {
    // Use useState to ensure the client is created only once on the client-side
    const [client] = useState(() => queryClient);

    return (
        <QueryClientProvider client={client}>
            {children}
        </QueryClientProvider>
    );
}
