"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bold, Heading2, ImagePlus, List, Quote, X } from "lucide-react";
import { uploadBlogImageAction, type BlogPostFormState } from "@/app/admin/blog/actions";
import { useToast } from "@/components/admin/toast";
import { errorClass, FormSection, inputClass, labelClass, selectClass } from "@/components/form-ui";
import { ImageIcon, SpinnerIcon, TagIcon } from "@/components/icons";
import { BLOG_CATEGORIES, slugify } from "@/lib/blog-utils";

const toolbarButtonClass =
  "flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50";

export type BlogPostFormInitial = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImageUrl: string | null;
  status: string;
};

type BlogPostFormProps = {
  action: (prevState: BlogPostFormState, formData: FormData) => Promise<BlogPostFormState>;
  initialPost?: BlogPostFormInitial;
  submitLabel: string;
};

const initialState: BlogPostFormState = {};

export function BlogPostForm({ action, initialPost, submitLabel }: BlogPostFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const { showToast } = useToast();

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initialPost);
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialPost?.coverImageUrl ?? "");
  const [coverUploading, setCoverUploading] = useState(false);
  const [contentImageUploading, setContentImageUploading] = useState(false);
  const [preview, setPreview] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.set("image", file);
    try {
      const result = await uploadBlogImageAction(formData);
      if (result.url) return result.url;
      showToast({ variant: "error", message: result.error ?? "Görsel yüklenemedi." });
      return null;
    } catch {
      showToast({ variant: "error", message: "Görsel yüklenemedi." });
      return null;
    }
  }

  async function handleCoverFile(file: File) {
    setCoverUploading(true);
    const url = await uploadImage(file);
    if (url) setCoverImageUrl(url);
    setCoverUploading(false);
  }

  async function handleContentImageFile(file: File) {
    setContentImageUploading(true);
    const url = await uploadImage(file);
    if (url) insertAtCursor(`![${file.name.replace(/\.[^.]+$/, "")}](${url})`);
    setContentImageUploading(false);
  }

  function insertAtCursor(snippet: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => `${prev}\n${snippet}\n`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = content.slice(0, start) + snippet + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + snippet.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  function wrapSelection(mark: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end) || "metin";
    const next = content.slice(0, start) + mark + selected + mark + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + mark.length, start + mark.length + selected.length);
    });
  }

  function insertLinePrefix(prefix: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const next = content.slice(0, lineStart) + prefix + content.slice(lineStart);
    setContent(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + prefix.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="coverImageUrl" value={coverImageUrl} />

      {state.error && (
        <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.error}</div>
      )}

      <FormSection title="Yazı Bilgileri" icon={TagIcon} accent="violet">
        <div>
          <label className={labelClass} htmlFor="title">
            Başlık
          </label>
          <input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Örn: İkinci El Alışverişte 5 Altın Kural"
            className={inputClass}
          />
          {state.fieldErrors?.title && <p className={errorClass}>{state.fieldErrors.title[0]}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="slug">
            Slug (URL)
          </label>
          <input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className={`${inputClass} font-mono`}
          />
          <p className="mt-1 text-xs text-slate-400">ilanlio.com/blog/{slug || "..."}</p>
          {state.fieldErrors?.slug && <p className={errorClass}>{state.fieldErrors.slug[0]}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="category">
            Kategori
          </label>
          <select id="category" name="category" required defaultValue={initialPost?.category ?? ""} className={selectClass}>
            <option value="" disabled>
              Kategori seçin
            </option>
            {BLOG_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {state.fieldErrors?.category && <p className={errorClass}>{state.fieldErrors.category[0]}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="excerpt">
            Özet
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            required
            rows={2}
            maxLength={300}
            defaultValue={initialPost?.excerpt}
            placeholder="Yazı listesinde ve arama sonuçlarında görünecek kısa özet."
            className={inputClass}
          />
          {state.fieldErrors?.excerpt && <p className={errorClass}>{state.fieldErrors.excerpt[0]}</p>}
        </div>

        <div>
          <label className={labelClass}>Kapak Görseli</label>
          {coverImageUrl ? (
            <div className="relative h-44 w-full max-w-sm overflow-hidden rounded-lg bg-slate-100">
              <Image src={coverImageUrl} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setCoverImageUrl("")}
                aria-label="Kapak görselini kaldır"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-soft hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
              className="flex w-full max-w-sm items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {coverUploading ? (
                <SpinnerIcon className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
              {coverUploading ? "Yükleniyor..." : "Kapak Görseli Yükle"}
            </button>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCoverFile(file);
              e.target.value = "";
            }}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="status">
            Durum
          </label>
          <select id="status" name="status" defaultValue={initialPost?.status ?? "yayinda"} className={selectClass}>
            <option value="yayinda">Yayında</option>
            <option value="taslak">Taslak</option>
          </select>
        </div>
      </FormSection>

      <FormSection
        title="İçerik"
        description="Markdown destekler: ## Başlık, **kalın**, - liste, > alıntı, ![açıklama](görsel)"
        icon={ImageIcon}
        accent="blue"
      >
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1.5">
          <button type="button" onClick={() => insertLinePrefix("## ")} className={toolbarButtonClass} title="Başlık">
            <Heading2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => wrapSelection("**")} className={toolbarButtonClass} title="Kalın">
            <Bold className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => insertLinePrefix("- ")} className={toolbarButtonClass} title="Liste">
            <List className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => insertLinePrefix("> ")} className={toolbarButtonClass} title="Alıntı">
            <Quote className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => contentImageInputRef.current?.click()}
            disabled={contentImageUploading}
            className={toolbarButtonClass}
            title="Görsel ekle"
          >
            {contentImageUploading ? (
              <SpinnerIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
          </button>
          <input
            ref={contentImageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleContentImageFile(file);
              e.target.value = "";
            }}
          />

          <div className="ml-auto flex shrink-0 gap-1 rounded-md bg-white p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                !preview ? "bg-brand text-white" : "text-slate-500 hover:text-foreground"
              }`}
            >
              Yaz
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                preview ? "bg-brand text-white" : "text-slate-500 hover:text-foreground"
              }`}
            >
              Önizle
            </button>
          </div>
        </div>

        {preview ? (
          <div className="prose prose-sm min-h-[320px] max-w-none rounded-lg border border-slate-200 p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "*İçerik boş*"}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            name="content"
            required
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="## Bölüm başlığı&#10;&#10;Paragraf metni...&#10;&#10;- Liste öğesi 1&#10;- Liste öğesi 2"
            className={`${inputClass} font-mono text-sm`}
          />
        )}
        {state.fieldErrors?.content && <p className={errorClass}>{state.fieldErrors.content[0]}</p>}
      </FormSection>

      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <SpinnerIcon className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}
