import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { PageHeader } from "@/components/admin/page-header";
import { PencilIcon } from "@/components/icons";
import { updatePostAction } from "../../actions";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <PageHeader icon={PencilIcon} title="Yazıyı Düzenle" description={post.title} accent="violet" />
      <BlogPostForm
        action={updatePostAction.bind(null, post.id)}
        submitLabel="Değişiklikleri Kaydet"
        initialPost={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          coverImageUrl: post.coverImageUrl,
          status: post.status,
        }}
      />
    </div>
  );
}
