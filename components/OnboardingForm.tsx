"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/Input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

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

// Comprehensive list of country codes
const countryCodes = [
  { code: "+1", name: "United States" },
  { code: "+7", name: "Russia" },
  { code: "+20", name: "Egypt" },
  { code: "+27", name: "South Africa" },
  { code: "+30", name: "Greece" },
  { code: "+31", name: "Netherlands" },
  { code: "+32", name: "Belgium" },
  { code: "+33", name: "France" },
  { code: "+34", name: "Spain" },
  { code: "+36", name: "Hungary" },
  { code: "+39", name: "Italy" },
  { code: "+40", name: "Romania" },
  { code: "+41", name: "Switzerland" },
  { code: "+43", name: "Austria" },
  { code: "+44", name: "United Kingdom" },
  { code: "+45", name: "Denmark" },
  { code: "+46", name: "Sweden" },
  { code: "+47", name: "Norway" },
  { code: "+48", name: "Poland" },
  { code: "+49", name: "Germany" },
  { code: "+51", name: "Peru" },
  { code: "+52", name: "Mexico" },
  { code: "+53", name: "Cuba" },
  { code: "+54", name: "Argentina" },
  { code: "+55", name: "Brazil" },
  { code: "+56", name: "Chile" },
  { code: "+57", name: "Colombia" },
  { code: "+58", name: "Venezuela" },
  { code: "+60", name: "Malaysia" },
  { code: "+61", name: "Australia" },
  { code: "+62", name: "Indonesia" },
  { code: "+63", name: "Philippines" },
  { code: "+64", name: "New Zealand" },
  { code: "+65", name: "Singapore" },
  { code: "+66", name: "Thailand" },
  { code: "+81", name: "Japan" },
  { code: "+82", name: "South Korea" },
  { code: "+84", name: "Vietnam" },
  { code: "+86", name: "China" },
  { code: "+90", name: "Turkey" },
  { code: "+91", name: "India" },
  { code: "+92", name: "Pakistan" },
  { code: "+93", name: "Afghanistan" },
  { code: "+94", name: "Sri Lanka" },
  { code: "+95", name: "Myanmar" },
  { code: "+98", name: "Iran" },
  { code: "+212", name: "Morocco" },
  { code: "+213", name: "Algeria" },
  { code: "+216", name: "Tunisia" },
  { code: "+218", name: "Libya" },
  { code: "+220", name: "Gambia" },
  { code: "+221", name: "Senegal" },
  { code: "+222", name: "Mauritania" },
  { code: "+223", name: "Mali" },
  { code: "+224", name: "Guinea" },
  { code: "+225", name: "Côte d'Ivoire" },
  { code: "+226", name: "Burkina Faso" },
  { code: "+227", name: "Niger" },
  { code: "+228", name: "Togo" },
  { code: "+229", name: "Benin" },
  { code: "+230", name: "Mauritius" },
  { code: "+231", name: "Liberia" },
  { code: "+232", name: "Sierra Leone" },
  { code: "+233", name: "Ghana" },
  { code: "+234", name: "Nigeria" },
  { code: "+235", name: "Chad" },
  { code: "+236", name: "Central African Republic" },
  { code: "+237", name: "Cameroon" },
  { code: "+238", name: "Cape Verde" },
  { code: "+239", name: "São Tomé and Príncipe" },
  { code: "+240", name: "Equatorial Guinea" },
  { code: "+241", name: "Gabon" },
  { code: "+242", name: "Republic of the Congo" },
  { code: "+243", name: "Democratic Republic of the Congo" },
  { code: "+244", name: "Angola" },
  { code: "+245", name: "Guinea-Bissau" },
  { code: "+246", name: "British Indian Ocean Territory" },
  { code: "+248", name: "Seychelles" },
  { code: "+249", name: "Sudan" },
  { code: "+250", name: "Rwanda" },
  { code: "+251", name: "Ethiopia" },
  { code: "+252", name: "Somalia" },
  { code: "+253", name: "Djibouti" },
  { code: "+254", name: "Kenya" },
  { code: "+255", name: "Tanzania" },
  { code: "+256", name: "Uganda" },
  { code: "+257", name: "Burundi" },
  { code: "+258", name: "Mozambique" },
  { code: "+260", name: "Zambia" },
  { code: "+261", name: "Madagascar" },
  { code: "+262", name: "Réunion" },
  { code: "+263", name: "Zimbabwe" },
  { code: "+264", name: "Namibia" },
  { code: "+265", name: "Malawi" },
  { code: "+266", name: "Lesotho" },
  { code: "+267", name: "Botswana" },
  { code: "+268", name: "Eswatini" },
  { code: "+269", name: "Comoros" },
  { code: "+290", name: "Saint Helena" },
  { code: "+291", name: "Eritrea" },
  { code: "+297", name: "Aruba" },
  { code: "+298", name: "Faroe Islands" },
  { code: "+299", name: "Greenland" },
  { code: "+350", name: "Gibraltar" },
  { code: "+351", name: "Portugal" },
  { code: "+352", name: "Luxembourg" },
  { code: "+353", name: "Ireland" },
  { code: "+354", name: "Iceland" },
  { code: "+355", name: "Albania" },
  { code: "+356", name: "Malta" },
  { code: "+357", name: "Cyprus" },
  { code: "+358", name: "Finland" },
  { code: "+359", name: "Bulgaria" },
  { code: "+370", name: "Lithuania" },
  { code: "+371", name: "Latvia" },
  { code: "+372", name: "Estonia" },
  { code: "+373", name: "Moldova" },
  { code: "+374", name: "Armenia" },
  { code: "+375", name: "Belarus" },
  { code: "+376", name: "Andorra" },
  { code: "+377", name: "Monaco" },
  { code: "+378", name: "San Marino" },
  { code: "+380", name: "Ukraine" },
  { code: "+381", name: "Serbia" },
  { code: "+382", name: "Montenegro" },
  { code: "+383", name: "Kosovo" },
  { code: "+385", name: "Croatia" },
  { code: "+386", name: "Slovenia" },
  { code: "+387", name: "Bosnia and Herzegovina" },
  { code: "+389", name: "North Macedonia" },
  { code: "+420", name: "Czech Republic" },
  { code: "+421", name: "Slovakia" },
  { code: "+423", name: "Liechtenstein" },
  { code: "+500", name: "Falkland Islands" },
  { code: "+501", name: "Belize" },
  { code: "+502", name: "Guatemala" },
  { code: "+503", name: "El Salvador" },
  { code: "+504", name: "Honduras" },
  { code: "+505", name: "Nicaragua" },
  { code: "+506", name: "Costa Rica" },
  { code: "+507", name: "Panama" },
  { code: "+508", name: "Saint Pierre and Miquelon" },
  { code: "+509", name: "Haiti" },
  { code: "+590", name: "Guadeloupe" },
  { code: "+591", name: "Bolivia" },
  { code: "+592", name: "Guyana" },
  { code: "+593", name: "Ecuador" },
  { code: "+594", name: "French Guiana" },
  { code: "+595", name: "Paraguay" },
  { code: "+596", name: "Martinique" },
  { code: "+597", name: "Suriname" },
  { code: "+598", name: "Uruguay" },
  { code: "+599", name: "Curaçao" },
  { code: "+670", name: "East Timor" },
  { code: "+672", name: "Norfolk Island" },
  { code: "+673", name: "Brunei" },
  { code: "+674", name: "Nauru" },
  { code: "+675", name: "Papua New Guinea" },
  { code: "+676", name: "Tonga" },
  { code: "+677", name: "Solomon Islands" },
  { code: "+678", name: "Vanuatu" },
  { code: "+679", name: "Fiji" },
  { code: "+680", name: "Palau" },
  { code: "+681", name: "Wallis and Futuna" },
  { code: "+682", name: "Cook Islands" },
  { code: "+683", name: "Niue" },
  { code: "+685", name: "Samoa" },
  { code: "+686", name: "Kiribati" },
  { code: "+687", name: "New Caledonia" },
  { code: "+688", name: "Tuvalu" },
  { code: "+689", name: "French Polynesia" },
  { code: "+690", name: "Tokelau" },
  { code: "+691", name: "Micronesia" },
  { code: "+692", name: "Marshall Islands" },
  { code: "+850", name: "North Korea" },
  { code: "+852", name: "Hong Kong" },
  { code: "+853", name: "Macau" },
  { code: "+855", name: "Cambodia" },
  { code: "+856", name: "Laos" },
  { code: "+880", name: "Bangladesh" },
  { code: "+886", name: "Taiwan" },
  { code: "+960", name: "Maldives" },
  { code: "+961", name: "Lebanon" },
  { code: "+962", name: "Jordan" },
  { code: "+963", name: "Syria" },
  { code: "+964", name: "Iraq" },
  { code: "+965", name: "Kuwait" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+967", name: "Yemen" },
  { code: "+968", name: "Oman" },
  { code: "+970", name: "Palestine" },
  { code: "+971", name: "United Arab Emirates" },
  { code: "+972", name: "Israel" },
  { code: "+973", name: "Bahrain" },
  { code: "+974", name: "Qatar" },
  { code: "+975", name: "Bhutan" },
  { code: "+976", name: "Mongolia" },
  { code: "+977", name: "Nepal" },
  { code: "+992", name: "Tajikistan" },
  { code: "+993", name: "Turkmenistan" },
  { code: "+994", name: "Azerbaijan" },
  { code: "+995", name: "Georgia" },
  { code: "+996", name: "Kyrgyzstan" },
  { code: "+998", name: "Uzbekistan" }
]

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
      <h2 className="text-2xl font-bold text-foreground mb-6">Complete Your Profile</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="First Name" 
            placeholder="John" 
            {...register("first_name")} 
            error={errors.first_name?.message}
          />
          <Input 
            label="Last Name" 
            placeholder="Doe" 
            {...register("last_name")} 
            error={errors.last_name?.message}
          />
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
            <label className="block text-sm font-semibold text-foreground mb-2">Country Code</label>
            <select
              {...register("phoneCode")}
              className="w-full px-4 py-3 border-2 border-input rounded-lg focus:outline-none focus:border-primary bg-background text-foreground"
            >
              <option value="">Select Country Code</option>
              {countryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.code} ({country.name})
                </option>
              ))}
            </select>
            {errors.phoneCode && (
              <p className="text-destructive text-sm mt-1">{errors.phoneCode.message}</p>
            )}
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

        <Input 
          label="Date of Birth" 
          type="date" 
          {...register("dob")} 
          error={errors.dob?.message}
        />

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

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Processing..." : "Continue to Payment"}
        </Button>
      </form>
    </Card>
  )
}