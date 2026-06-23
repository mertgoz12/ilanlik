import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:font-semibold prose-a:text-brand prose-img:rounded-xl prose-blockquote:border-accent prose-blockquote:text-slate-600">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element -- yazı içeriğindeki görsellerin gerçek en-boy oranı bilinmediği için next/image'in fill zorlaması yerine doğal oranı koruyan img kullanılıyor.
            <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} className="my-4 w-full rounded-xl" loading="lazy" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
