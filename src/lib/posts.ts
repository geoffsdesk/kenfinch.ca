import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { format } from 'date-fns';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export type PostCategory = 'buying' | 'mortgage' | 'selling' | 'market';

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  buying: 'Buying',
  mortgage: 'Mortgages',
  selling: 'Selling',
  market: 'Market',
};

export interface PostData {
  slug: string;
  title: string;
  date: string;
  formattedDate: string;
  excerpt: string;
  image?: string;
  category: PostCategory;
  content: string;
}

interface FrontMatter {
  title: string;
  date: string;
  excerpt: string;
  image?: string;
  category?: PostCategory;
}

function normalizeCategory(raw?: string): PostCategory {
  if (raw === 'buying' || raw === 'mortgage' || raw === 'selling' || raw === 'market') return raw;
  // Older posts pre-date the category field and are all seller content.
  return 'selling';
}

export function getSortedPostsData(): Omit<PostData, 'content'>[] {
  const fileNames = fs.readdirSync(postsDirectory).filter((f) => f.endsWith('.md'));
  const allPostsData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
    const data = matterResult.data as FrontMatter;

    return {
      slug,
      title: data.title,
      date: data.date,
      formattedDate: format(new Date(data.date), 'MMMM d, yyyy'),
      excerpt: data.excerpt,
      image: data.image,
      category: normalizeCategory(data.category),
    };
  });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Buyer-facing posts first (buying + mortgage), newest first. */
export function getBuyerPosts(limit?: number): Omit<PostData, 'content'>[] {
  const posts = getSortedPostsData().filter((p) => p.category === 'buying' || p.category === 'mortgage');
  return typeof limit === 'number' ? posts.slice(0, limit) : posts;
}

export async function getPostData(slug: string): Promise<PostData | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);
  const data = matterResult.data as FrontMatter;

  return {
    slug,
    title: data.title,
    date: data.date,
    formattedDate: format(new Date(data.date), 'MMMM d, yyyy'),
    excerpt: data.excerpt,
    image: data.image,
    category: normalizeCategory(data.category),
    content: matterResult.content,
  };
}
