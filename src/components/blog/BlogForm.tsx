import React, { useState } from "react";
import { useForm } from "react-hook-form";
import FormLayout from "../common/FormLayout";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import RichTextEditor from "../common/RichTextEditor";
import SeoRichTextEditor from "../common/SeoRichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import TagInput from "../common/TagInput";
import { DateTimePicker } from "../common/DateTimePicker";
import ImageUpload from "../common/ImageUpload";

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  publishDate: Date | undefined;
  publishStatus: string;
  featuredPost: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  bannerImage?: File;
}

interface BlogFormProps {
  initialData?: Partial<BlogFormData>;
  onSubmit: (data: BlogFormData) => Promise<void>;
  isEdit?: boolean;
}

const BlogForm: React.FC<BlogFormProps> = ({
  initialData = {},
  onSubmit,
  isEdit = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState(initialData.content || "");
  const [seoDescription, setSeoDescription] = useState(
    initialData.seoDescription || ""
  );
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [keywords, setKeywords] = useState<string[]>(
    initialData.keywords || []
  );
  const [bannerImage, setBannerImage] = useState<File | undefined>(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<BlogFormData>({
    defaultValues: {
      title: initialData.title || "",
      slug: initialData.slug || "",
      author: initialData.author || "",
      category: initialData.category || "",
      publishStatus: initialData.publishStatus || "draft",
      featuredPost: initialData.featuredPost || "no",
      publishDate: initialData.publishDate,
      seoTitle: initialData.seoTitle || "",
    },
    mode: "onChange",
  });

  // Update form values when these states change
  React.useEffect(() => {
    setValue("content", content);
    setValue("seoDescription", seoDescription);
    setValue("tags", tags);
    setValue("keywords", keywords);
    if (bannerImage) {
      setValue("bannerImage", bannerImage);
    }
  }, [content, seoDescription, tags, keywords, bannerImage, setValue]);

  const handleFormSubmit = async (data: BlogFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        content,
        seoDescription,
        tags,
        keywords,
        bannerImage,
      });
    } catch (error) {
      console.error("Error submitting blog:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout
      title={isEdit ? "Edit Blog" : "Add Blog"}
      isValid={isValid}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitText="Save"
      cancelText="Cancel"
      backLink="/blog"
    >
      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter title"
                {...register("title", { required: true })}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">Title is required</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="Slug goes here"
                {...register("slug", { required: true })}
                className={errors.slug ? "border-red-500" : ""}
              />
              {errors.slug && (
                <p className="text-red-500 text-sm">Slug is required</p>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Enter content"
              />
              {!content && (
                <p className="text-red-500 text-sm">Content is required</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="Enter author name"
                {...register("author", { required: true })}
                className={errors.author ? "border-red-500" : ""}
              />
              {errors.author && (
                <p className="text-red-500 text-sm">Author is required</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                onValueChange={(value) =>
                  setValue("category", value, { shouldValidate: true })
                }
                defaultValue={watch("category")}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-500 text-sm">Category is required</p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <TagInput
                tags={tags}
                setTags={setTags}
                placeholder="Enter tags"
              />
            </div>

            {/* Publish Date & Time */}
            <div className="space-y-2">
              <Label htmlFor="publishDate">Publish date & time</Label>
              <DateTimePicker
              
              />
            </div>

            {/* Publish Status */}
            <div className="space-y-2">
              <Label htmlFor="publishStatus">Publish status</Label>
              <Select
                onValueChange={(value) =>
                  setValue("publishStatus", value, { shouldValidate: true })
                }
                defaultValue={watch("publishStatus")}
              >
                <SelectTrigger id="publishStatus" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Featured Post */}
            <div className="space-y-2">
              <Label htmlFor="featuredPost">Featured post</Label>
              <Select
                onValueChange={(value) =>
                  setValue("featuredPost", value, { shouldValidate: true })
                }
                defaultValue={watch("featuredPost")}
              >
                <SelectTrigger id="featuredPost" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* SEO Section */}
        <div className="border-t pt-6 mt-8">
          <h2 className="text-lg font-medium mb-6">SEO details</h2>

          <div className="space-y-6">
            {/* SEO Title */}
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                placeholder="Enter SEO title"
                {...register("seoTitle")}
              />
            </div>

            {/* SEO Description */}
            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO description</Label>
              <SeoRichTextEditor
                value={seoDescription}
                onChange={setSeoDescription}
                placeholder="Enter SEO description"
              />
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <TagInput
                tags={keywords}
                setTags={setKeywords}
                placeholder="Enter"
              />
            </div>
          </div>
        </div>

        {/* Banner Image */}
        <div className="border-t pt-6 mt-8">
          <h2 className="text-lg font-medium mb-6">Banner image</h2>
          <ImageUpload
            onImageSelect={setBannerImage}
            defaultImage={
              initialData.bannerImage
                ? URL.createObjectURL(
                    initialData.bannerImage as unknown as Blob
                  )
                : undefined
            }
          />
        </div>
      </form>
    </FormLayout>
  );
};

export default BlogForm;
