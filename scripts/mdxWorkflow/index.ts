// 這段 TypeScript 程式碼的主要功能是處理和格式化 .mdx 文件。它會遍歷指定目錄中的所有 .mdx 文件，讀取其內容，進行一系列的格式化操作，並將結果寫回文件。如果文件是空的，則會刪除該文件。

import { consola } from 'consola';
import { globSync } from 'glob';
import matter from 'gray-matter';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const fixWinPath = (path: string) => path.replaceAll('\\', '/');

export const root = resolve(__dirname, '../..');

const run = () => {
  const posts = globSync(fixWinPath(resolve(root, 'docs/**/*.mdx')));

  for (const post of posts) {
    try {
      const mdx = readFileSync(post, 'utf8');
      if (!mdx || mdx.replaceAll(' ', '').replaceAll('\n', '') === '') {
        consola.error(post, 'is EMPTY !!!!!');
        unlinkSync(post);
        continue;
      }
      const { data, content } = matter(mdx);
      const formatedContent = content
        .replaceAll('\\<', '<')
        .replaceAll("{' '}\n", '')
        .replaceAll(`'<`, `'`)
        .replaceAll(`"<`, `"`)
        .replaceAll(`>'`, `'`)
        .replaceAll(`>"`, `"`)
        .replaceAll(' </', '\n</')
        .replaceAll(' </', '\n</')
        .replaceAll('}> width', '} width')
        .replaceAll("'[https", "'https")
        .replaceAll('"[https', '"https')
        .replaceAll(/]\(http(.*)\/>\)/g, '')
        .replaceAll(`\\*\\* `, '** ')
        .replaceAll(` \\*\\*`, ' **')
        .replaceAll(/\n{2,}/g, '\n\n');

      if (!data?.title) {
        const regex = /^#\s(.+)/;
        const match = regex.exec(formatedContent.trim());
        const title = match ? match[1] : '';
        data.title = title;
      }

      writeFileSync(post, matter.stringify(formatedContent, data));
    } catch (error) {
      consola.error(post);
      consola.error(error);
    }
  }
};

run();
