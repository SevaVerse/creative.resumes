import type { ComponentType } from 'react'

type MDXComponents = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [component: string]: ComponentType<any>
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Custom components can go here
    ...components,
  }
}