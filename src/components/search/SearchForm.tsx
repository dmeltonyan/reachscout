"use client"

import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { searchFormSchema, type SearchFormSchema } from "@/validation/search"

const CONTACT_TYPE_OPTIONS = [
  { value: "RECRUITER", label: "Recruiter" },
  { value: "HIRING_MANAGER", label: "Hiring Manager" },
  { value: "ENGINEERING_MANAGER", label: "Engineering Manager" },
  { value: "FOUNDER", label: "Founder" },
  { value: "EXECUTIVE", label: "Executive" },
  { value: "PROFESSOR", label: "Professor" },
  { value: "RESEARCHER", label: "Researcher" },
  { value: "ALUMNI", label: "Alumni" },
  { value: "GENERAL_RECRUITING", label: "General Recruiting Contact" },
  { value: "OTHER", label: "Other Professional Contact" },
]

interface SearchFormProps {
  onSubmit: (values: SearchFormSchema) => void
  isLoading?: boolean
  defaultValues?: Partial<SearchFormSchema>
}

export function SearchForm({ onSubmit, isLoading, defaultValues }: SearchFormProps) {
  const form = useForm<SearchFormSchema>({
    resolver: zodResolver(searchFormSchema) as unknown as Resolver<SearchFormSchema>,
    defaultValues: {
      organization: "",
      maxResults: 10,
      onlyPublicEmails: false,
      includeGeneralContacts: true,
      ...defaultValues,
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="organization">
            Organization or Domain <span className="text-destructive">*</span>
          </Label>
          <Input
            id="organization"
            placeholder="e.g. Stripe, stripe.com, Stanford University"
            {...register("organization")}
            aria-invalid={!!errors.organization}
          />
          {errors.organization && (
            <p className="text-xs text-destructive">{errors.organization.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetRole">Target Role or Topic</Label>
          <Input
            id="targetRole"
            placeholder="e.g. software engineering, machine learning"
            {...register("targetRole")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactType">Contact Type</Label>
          <Select onValueChange={(v) => setValue("contactType", v as SearchFormSchema["contactType"])}>
            <SelectTrigger id="contactType">
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              {CONTACT_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            placeholder="e.g. Engineering, Research, Talent"
            {...register("department")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g. San Francisco, Remote"
            {...register("location")}
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="keywords">Keywords</Label>
          <Textarea
            id="keywords"
            placeholder="e.g. natural language processing, distributed systems, Series B"
            rows={2}
            {...register("keywords")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxResults">Max Results</Label>
          <Input
            id="maxResults"
            type="number"
            min={1}
            max={50}
            {...register("maxResults", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center gap-3 flex-1">
          <Switch
            id="onlyPublicEmails"
            checked={watch("onlyPublicEmails")}
            onCheckedChange={(v) => setValue("onlyPublicEmails", v)}
          />
          <Label htmlFor="onlyPublicEmails" className="cursor-pointer font-normal">
            Only show publicly listed emails
          </Label>
        </div>
        <div className="flex items-center gap-3 flex-1">
          <Switch
            id="includeGeneralContacts"
            checked={watch("includeGeneralContacts")}
            onCheckedChange={(v) => setValue("includeGeneralContacts", v)}
          />
          <Label htmlFor="includeGeneralContacts" className="cursor-pointer font-normal">
            Include general contact addresses
          </Label>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching…
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Search
          </>
        )}
      </Button>
    </form>
  )
}
