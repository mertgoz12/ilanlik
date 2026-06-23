import { BlogPostForm } from "@/components/admin/blog-post-form";
import { PageHeader } from "@/components/admin/page-header";
import { PlusIcon } from "@/components/icons";
import { createPostAction } from "../actions";

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <PageHeader icon={PlusIcon} title="Yeni Blog Yazısı" accent="violet" />
      <BlogPostForm action={createPostAction} submitLabel="Yazıyı Oluştur" />
    </div>
  );
}
