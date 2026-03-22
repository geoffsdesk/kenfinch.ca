
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { format } from 'date-fns';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export interface PostData {
  slug: string;
  title: string;
  date: string;
  formattedDate: string;
  excerpt: string;
  image?: string;
  content: string;
}

export function getSortedPostsData(): Omit<PostData, 'content'>[] {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get slug
    const slug = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    const typedMatterData = matterResult.data as { title: string; date: string; excerpt: string; };

    return {
      slug,
      title: typedMatterData.title,
      date: typedMatterData.date,
      formattedDate: format(new Date(typedMatterData.date), 'MMMM d, yyyy'),
      excerpt: typedMatterData.excerpt,
      image: (typedMatterData as any).image,
    };
  });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostData(slug: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  const typedMatterData = matterResult.data as { title: string; date: string; excerpt: string; };

  // You can optionally process the content with a markdown parser here if you want to return HTML
  const content = matterResult.content;

  return {
    slug,
    title: typedMatterData.title,
    date: typedMatterData.date,
    formattedDate: format(new Date(typedMatterData.date), 'MMMM d, yyyy'),
    excerpt: typedMatterData.excerpt,
    image: (typedMatterData as any).image,
    content: content,
  };
}
