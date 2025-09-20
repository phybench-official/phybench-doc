import { generateFiles } from 'fumadocs-openapi';
import { openapi } from '@/lib/openapi';

void generateFiles({
  input: openapi,
  output: './content/docs',
  // we recommend to enable it
  // make sure your endpoint description doesn't break MDX syntax.
  includeDescription: true,
  index: {
    // for generating `href`
    url: {
      baseUrl: '/docs',
      contentDir: './content/docs',
    },
    items: [
      {
        path: 'index.mdx',
        description: 'OpenAPI generated documentation',
      },
    ],
  },
  addGeneratedComment: true,

});