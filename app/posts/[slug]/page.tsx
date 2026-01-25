import { format, parseISO } from "date-fns";
import type { NextPage } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { allPosts } from "contentlayer/generated";
import Card from "modules/article/components/card";

const SITE_DOMAIN = process.env.SITE_DOMAIN
  ? process.env.SITE_DOMAIN
  : "blog.k16em.net";

export const generateStaticParams = async () =>
  allPosts.map((post) => ({ slug: post._raw.flattenedPath }));

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug);
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`);

  return {
    title: post.title + " - " + SITE_DOMAIN,
    description: post.description,
    alternates: {
      canonical: post.url,
    },
    openGraph: {
      title: post.title + " - " + SITE_DOMAIN,
      description: post.description,
    },
  };
};

const extractFootnotes = (markdown: string): Record<string, string> =>
  Object.fromEntries(
    [...markdown.matchAll(/\[\^([^\]]+)\]:\s*(.+)/g)].map((match) => [
      match[1],
      match[2],
    ])
  );

const Article: NextPage = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug);
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`);

  const { body } = { ...post };
  const footnotes = extractFootnotes(body.raw);

  return (
    <>
      <header>
        <Card {...post} />
        <hr />
      </header>
      <ReactMarkdown
        components={{
          a: ({ node, ...props }) => {
            const href = props.href || "";
            if (href.startsWith("#user-content-fn-")) {
              const id = href.replace("#user-content-fn-", "");
              return <a {...props} title={footnotes[id]} />;
            }
            if (href.startsWith("#")) {
              return <a {...props} />;
            }
            return <a {...props} target="_blank" rel="noopener noreferrer" />;
          },
        }}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        remarkRehypeOptions={{
          footnoteLabel: "注釈",
        }}
        className="hyphens-auto content"
      >
        {body.raw}
      </ReactMarkdown>
    </>
  );
};

export default Article;
