"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

const schema = z.object({
  first_name: z.string().min(1, "First name required"),
  last_name: z.string().min(1, "Last name required"),
  email: z.string().email("Invalid email"),
  phoneCode: z.string().min(1, "Country code required"),
  phoneNumber: z.string().min(7, "Invalid phone number"),
  dob: z.string().min(1, "Date of birth required"),
  addressNumber: z.string().min(1, "Address number required"),
  address: z.string().min(1, "Street address required"),
})

type FormData = z.infer<typeof schema>

interface OnboardingFormProps {
  onSubmit: (data: FormData) => void
  isLoading?: boolean
}

export function OnboardingForm({ onSubmit, isLoading = false }: OnboardingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <Card className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-dark mb-6">Complete Your Profile</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First Name" placeholder="John" {...register("first_name")} error={errors.first_name?.message} />
          <Input label="Last Name" placeholder="Doe" {...register("last_name")} error={errors.last_name?.message} />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          {...register("email")}
          error={errors.email?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Country Code</label>
            <select
              {...register("phoneCode")}
              className="w-full px-4 py-3 border-2 border-beige rounded-lg focus:outline-none focus:border-gold"
            >
              <option value="">Select</option>
              <option value="+1">+1 (US)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+91">+91 (India)</option>
              <option value="+234">+234 (Nigeria)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Input
              label="Phone Number"
              placeholder="1234567890"
              {...register("phoneNumber")}
              error={errors.phoneNumber?.message}
            />
          </div>
        </div>

        <Input label="Date of Birth" type="date" {...register("dob")} error={errors.dob?.message} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Address Number"
            placeholder="123"
            {...register("addressNumber")}
            error={errors.addressNumber?.message}
          />
          <div className="md:col-span-2">
            <Input
              label="Street Address"
              placeholder="Main Street"
              {...register("address")}
              error={errors.address?.message}
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          Continue to Payment
        </Button>
      </form>
    </Card>
  )
}