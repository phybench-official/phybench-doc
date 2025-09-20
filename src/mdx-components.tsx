import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { APIPage } from 'fumadocs-openapi/ui';
import { openapi } from '@/lib/openapi';

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
    APIPage: (props) => <APIPage {...openapi.getAPIPageProps(props)} />,
  };
}
