import 'react-query/types/react/QueryClientProvider'

import type { ReactNode } from 'react'

declare module 'react-query/types/react/QueryClientProvider' {
  interface QueryClientProviderProps {
    children?: ReactNode
  }
}
