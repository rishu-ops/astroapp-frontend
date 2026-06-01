"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ProtectedRoute } from "@/components/common/ProtectedRoute"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { cn } from "@/lib/utils"
import { offeringService } from "@/services/offering.service"
import { Upload, Trash2, X, Plus, IndianRupee, AlertCircle } from "lucide-react"

const schema = z.object({
  title: z.string().min(2),
  category: z.string().min(1),
  shortDescription: z.string().min(10).max(200),
  description: z.string().min(20),
  price: z.coerce.number().min(0),
  currency: z.string().default("INR"),
  benefits: z.array(z.object({ value: z.string() })).optional(),
  instructions: z.array(z.object({ value: z.string() })).optional(),
  tags: z.array(z.string()).optional(),
})

type FormValues = z.infer<typeof schema>

const CATEGORIES = [
  "Vedic Astrology",
  "Tarot Reading",
  "Numerology",
  "Palmistry",
  "Vastu Shastra",
  "Kundli Matching",
  "Birth Chart Analysis",
  "Career Guidance",
  "Relationship Reading",
  "Spiritual Healing",
]

export default function NewOfferingPage() {
  const router = useRouter()
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [tagInput, setTagInput] = useState("")

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      category: "",
      shortDescription: "",
      description: "",
      price: 0,
      currency: "INR",
      benefits: [],
      instructions: [],
      tags: [],
    },
  })

  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit,
  } = useFieldArray({ control, name: "benefits" })

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({ control, name: "instructions" })

  const [benefitInput, setBenefitInput] = useState("")
  const [instructionInput, setInstructionInput] = useState("")

  const shortDesc = watch("shortDescription") || ""
  const tags = watch("tags") || []

  const mutation = useMutation({
    mutationFn: (formData: FormData) => offeringService.create(formData),
    onSuccess: () => {
      router.push("/astrologer/offerings")
    },
  })

  const buildFormData = (data: FormValues, isDraft: boolean) => {
    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("category", data.category)
    formData.append("shortDescription", data.shortDescription)
    formData.append("description", data.description)
    formData.append("price", String(data.price))
    formData.append("currency", data.currency)
    formData.append("status", isDraft ? "draft" : "pending_review")

    if (data.benefits && data.benefits.length > 0) {
      formData.append(
        "benefits",
        JSON.stringify(data.benefits.map((b) => b.value).filter(Boolean))
      )
    }

    if (data.instructions && data.instructions.length > 0) {
      formData.append(
        "instructions",
        JSON.stringify(data.instructions.map((i) => i.value).filter(Boolean))
      )
    }

    if (data.tags && data.tags.length > 0) {
      formData.append("tags", JSON.stringify(data.tags))
    }

    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile)
    }

    galleryFiles.forEach((file) => {
      formData.append("gallery", file)
    })

    return formData
  }

  const onSaveDraft = handleSubmit((data) => {
    mutation.mutate(buildFormData(data, true))
  })

  const onSubmitForReview = handleSubmit((data) => {
    mutation.mutate(buildFormData(data, false))
  })

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setGalleryFiles((prev) => [...prev, ...files])
  }

  const removeGalleryFile = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      const currentTags = getValues("tags") || []
      if (!currentTags.includes(tagInput.trim())) {
        setValue("tags", [...currentTags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    const currentTags = getValues("tags") || []
    setValue(
      "tags",
      currentTags.filter((t) => t !== tag)
    )
  }

  const handleAddBenefit = () => {
    if (benefitInput.trim()) {
      appendBenefit({ value: benefitInput.trim() })
      setBenefitInput("")
    }
  }

  const handleAddInstruction = () => {
    if (instructionInput.trim()) {
      appendInstruction({ value: instructionInput.trim() })
      setInstructionInput("")
    }
  }

  return (
    <ProtectedRoute allowedRoles={["astrologer"]}>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <main className="flex-1 container max-w-3xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Offering
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Fill in the details below to create your astrology offering.
            </p>
          </div>

          {mutation.isError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Something went wrong. Please try again.</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Section 1: Basic Info */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Basic Info
                </h2>

                <div className="space-y-1">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Personalized Birth Chart Reading"
                    {...register("title")}
                    className={cn(errors.title && "border-red-500")}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    {...register("category")}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      errors.category && "border-red-500"
                    )}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-xs text-red-500">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <span
                      className={cn(
                        "text-xs",
                        shortDesc.length > 200
                          ? "text-red-500"
                          : shortDesc.length > 160
                          ? "text-amber-500"
                          : "text-gray-400"
                      )}
                    >
                      {shortDesc.length}/200
                    </span>
                  </div>
                  <Textarea
                    id="shortDescription"
                    placeholder="Brief overview of what this offering includes..."
                    rows={3}
                    {...register("shortDescription")}
                    className={cn(errors.shortDescription && "border-red-500")}
                  />
                  {errors.shortDescription && (
                    <p className="text-xs text-red-500">
                      {errors.shortDescription.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="price">Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <IndianRupee className="h-4 w-4" />
                      </span>
                      <Input
                        id="price"
                        type="number"
                        min={0}
                        step={1}
                        placeholder="0"
                        className={cn("pl-9", errors.price && "border-red-500")}
                        {...register("price")}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-xs text-red-500">{errors.price.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      {...register("currency")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="INR">INR â€” Indian Rupee</option>
                      <option value="USD">USD â€” US Dollar</option>
                      <option value="GBP">GBP â€” British Pound</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Content */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Content
                </h2>

                <div className="space-y-1">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of your offering, what clients can expect, your approach, etc."
                    rows={8}
                    {...register("description")}
                    className={cn(errors.description && "border-red-500")}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Benefits */}
                <div className="space-y-2">
                  <Label>Benefits</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a benefit..."
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddBenefit()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddBenefit}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {benefitFields.length > 0 && (
                    <ul className="space-y-2 mt-2">
                      {benefitFields.map((field, index) => (
                        <li
                          key={field.id}
                          className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                          <span>{field.value}</span>
                          <button
                            type="button"
                            onClick={() => removeBenefit(index)}
                            className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <Label>Instructions</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an instruction..."
                      value={instructionInput}
                      onChange={(e) => setInstructionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddInstruction()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddInstruction}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {instructionFields.length > 0 && (
                    <ul className="space-y-2 mt-2">
                      {instructionFields.map((field, index) => (
                        <li
                          key={field.id}
                          className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                          <span>{field.value}</span>
                          <button
                            type="button"
                            onClick={() => removeInstruction(index)}
                            className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Media */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Media
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail Image</Label>
                  <div className="flex items-start gap-4">
                    <label
                      htmlFor="thumbnail"
                      className={cn(
                        "flex flex-col items-center justify-center w-36 h-36 rounded-lg border-2 border-dashed cursor-pointer transition-colors",
                        "border-gray-300 hover:border-orange-400 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-orange-500"
                      )}
                    >
                      {thumbnailPreview ? (
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500 text-center px-2">
                            Click to upload
                          </span>
                        </>
                      )}
                      <input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleThumbnailChange}
                      />
                    </label>
                    {thumbnailPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setThumbnailFile(null)
                          setThumbnailPreview(null)
                        }}
                        className="mt-1 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    Recommended: 800x600px, JPG or PNG, max 2MB
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gallery">Gallery Images</Label>
                  <label
                    htmlFor="gallery"
                    className={cn(
                      "flex flex-col items-center justify-center w-full h-24 rounded-lg border-2 border-dashed cursor-pointer transition-colors",
                      "border-gray-300 hover:border-orange-400 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-orange-500"
                    )}
                  >
                    <Upload className="h-6 w-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">
                      Click to add gallery images (multiple allowed)
                    </span>
                    <input
                      id="gallery"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleGalleryChange}
                    />
                  </label>
                  {galleryFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {galleryFiles.map((file, index) => (
                        <div
                          key={index}
                          className="relative group w-20 h-20 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryFile(index)}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Tags */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tags
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="tagInput">Add Tags</Label>
                  <Input
                    id="tagInput"
                    placeholder="Type a tag and press Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                  <p className="text-xs text-gray-400">
                    Press Enter to add a tag. Tags help clients find your offering.
                  </p>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-orange-900 dark:hover:text-orange-200 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pb-4">
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={mutation.isPending}
                className="min-w-[120px]"
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Draft"
                )}
              </Button>

              <Button
                type="button"
                onClick={onSubmitForReview}
                disabled={mutation.isPending}
                className="min-w-[160px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0"
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit for Review"
                )}
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}

