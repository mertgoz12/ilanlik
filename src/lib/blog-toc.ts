import GithubSlugger from "github-slugger";

export type TocEntry = { id: string; text: string; level: 2 | 3 };

// rehype-slug (markdown-renderer.tsx'te başlıklara id atar) da aynı
// github-slugger algoritmasını kullanır; aynı metinler aynı sırayla
// işlendiği için buradaki id'ler render edilen başlıklarla bire bir eşleşir.
export function extractToc(markdown: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];
  const pattern = /^(#{2,3})\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(markdown))) {
    const level = match[1].length === 2 ? 2 : 3;
    const text = match[2].trim();
    entries.push({ id: slugger.slug(text), text, level });
  }
  return entries;
}
