import {
  AlertCircle,
  CheckCircle,
  Clock,
  ImageIcon,
  Upload,
} from "lucide-react";
import React, { useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { z } from "zod";
import Link from "next/link";

// Application steps
const applicationSteps = [
  {
    id: "intro",
    title: "Introduction",
    description: "Learn about our creator requirements",
  },
  {
    id: "profile",
    title: "Profile Info",
    description: "Tell us about yourself",
  },
  { id: "portfolio", title: "Portfolio", description: "Showcase your work" },
  {
    id: "products",
    title: "Product Info",
    description: "Describe what you'll sell",
  },
  { id: "policies", title: "Policies", description: "Agree to our terms" },
  {
    id: "submit",
    title: "Submit",
    description: "Review and submit your application",
  },
];

// Creator application schema
const creatorApplicationSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  businessDescription: z
    .string()
    .min(
      50,
      "Please provide a detailed description of your business (at least 50 characters)"
    ),
  yearsExperience: z.string().min(1, "Please select your experience level"),
  productCategory: z.string().min(1, "Please select a product category"),
  materialsUsed: z.string().min(10, "Please describe the materials you use"),
  productionProcess: z
    .string()
    .min(20, "Please describe your production process"),
  portfolioLinks: z.string().optional(),
  agreeToQualityStandards: z
    .boolean()
    .refine(
      (val) => val === true,
      "You must agree to maintain our quality standards"
    ),
  agreeToPolicies: z
    .boolean()
    .refine((val) => val === true, "You must agree to our seller policies"),
});

const ApplicationProgress = ({ currentStep }: { currentStep: number }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {applicationSteps.length}
        </span>
        <span className="text-sm text-muted-foreground">
          {Math.round(((currentStep + 1) / applicationSteps.length) * 100)}%
          Complete
        </span>
      </div>
      <Progress
        value={((currentStep + 1) / applicationSteps.length) * 100}
        className="h-2"
      />
      <div className="grid grid-cols-6 gap-2 mt-4">
        {applicationSteps.map((step, index) => (
          <div key={step.id} className="text-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                index < currentStep
                  ? "bg-green-100 text-green-600"
                  : index === currentStep
                  ? "bg-primary dark:text-background text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {index < currentStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <p className="text-xs mt-1 font-medium hidden md:block">
              {step.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

type CreatorApplicationValues = z.infer<typeof creatorApplicationSchema>;

const BecomeCreatorForm = () => {
  const [applicationStep, setApplicationStep] = useState(0);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Creator Application Form
  const creatorApplicationForm = useForm<CreatorApplicationValues>({
    resolver: zodResolver(creatorApplicationSchema),
    defaultValues: {
      businessName: "",
      businessDescription: "",
      yearsExperience: "",
      productCategory: "",
      materialsUsed: "",
      productionProcess: "",
      portfolioLinks: "",
      agreeToQualityStandards: false,
      agreeToPolicies: false,
    },
  });

  const businessName = useWatch({
      control: creatorApplicationForm.control,
      name: "businessName",
  })

  const productCategory = useWatch({
      control: creatorApplicationForm.control,
      name: "productCategory",
  })

  const yearsExperience = useWatch({
      control: creatorApplicationForm.control,
      name: "yearsExperience",
  })

  const onCreatorApplicationSubmit = async (data: CreatorApplicationValues) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Application submitted:", data);
    setIsSubmitting(false);
    setSubmissionSuccess(true);
    setApplicationStep(0);
  };

  const nextStep = () => {
    if (applicationStep < applicationSteps.length - 1) {
      setApplicationStep(applicationStep + 1);
    }
  };

  const prevStep = () => {
    if (applicationStep > 0) {
      setApplicationStep(applicationStep - 1);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-background py-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Application Submitted!</CardTitle>
            <CardDescription>
              Your creator application has been received and is under review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-800">
                    What happens next?
                  </h3>
                  <ul className="text-blue-700 text-sm mt-2 space-y-1">
                    <li>
                      • Our team will review your application within 3-5
                      business days
                    </li>
                    <li>
                      • We may contact you for additional information or
                      clarification
                    </li>
                    <li>
                      • You&apos;ll receive an email notification once a
                      decision is made
                    </li>
                    <li>
                      • If approved, you&apos;ll get access to creator tools and
                      onboarding
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800">
                    Quality Standards
                  </h3>
                  <p className="text-amber-700 text-sm mt-2">
                    Remember that all products you list will also go through a
                    quality review process to ensure they meet our platform
                    standards before being published.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/">Return to Home</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/profile">View Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {/* Header */}
         <div className="mb-8">
           <h1 className="text-3xl font-bold mb-2 text-center">Apply to Become a Creator</h1>
         </div>
      <Card className="w-full max-w-4xl bg-background py-6 mb-8">
        <CardHeader>
          <CardTitle>Become a Creator</CardTitle>
          <CardDescription>
            Apply to sell your handmade products on our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationProgress currentStep={applicationStep} />

          <Form {...creatorApplicationForm}>
            <form
              onSubmit={creatorApplicationForm.handleSubmit(
                onCreatorApplicationSubmit
              )}
              className="space-y-6"
            >
              {/* Step 1: Introduction */}
              {applicationStep === 0 && (
                <div className="space-y-4">
                  <Alert>
                    <AlertTitle>Quality Standards</AlertTitle>
                    <AlertDescription>
                      At Kyzat, we maintain high quality
                      standards to ensure our customers receive only the best
                      handmade products. All creators and their products go
                      through a thorough screening process.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Application Process</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                      <li>Complete this application form</li>
                      <li>
                        Our team will review your application (3-5 business
                        days)
                      </li>
                      <li>
                        If approved, you&apos;ll be able to set up your shop
                      </li>
                      <li>
                        Each product you list will also be reviewed before going
                        live
                      </li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">What We Look For</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                      <li>Original, handmade products</li>
                      <li>High-quality materials and craftsmanship</li>
                      <li>
                        Clear product descriptions and professional photos
                      </li>
                      <li>Reasonable pricing and shipping policies</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 2: Profile Information */}
              {applicationStep === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={creatorApplicationForm.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business/Shop Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your shop name"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This will be displayed to customers on your shop page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={creatorApplicationForm.control}
                    name="businessDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your business, your inspiration, and what makes your products special..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This helps us understand your brand and craftsmanship
                          philosophy
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={creatorApplicationForm.control}
                    name="yearsExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="0-1" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                0-1 years
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="1-3" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                1-3 years
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="3-5" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                3-5 years
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="5+" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                5+ years
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Portfolio */}
              {applicationStep === 2 && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">
                      Upload Portfolio Images
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Upload 3-5 high-quality images of your best work
                    </p>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Select Images
                    </Button>
                  </div>

                  <FormField
                    control={creatorApplicationForm.control}
                    name="portfolioLinks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Portfolio Links (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Website, Instagram, Etsy, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Include links to your online portfolio or social media
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 4: Product Information */}
              {applicationStep === 3 && (
                <div className="space-y-4">
                  <FormField
                    control={creatorApplicationForm.control}
                    name="productCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Product Category</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="jewelry" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Jewelry
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="pottery" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Pottery & Ceramics
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="textiles" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Textiles
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="woodworking" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Woodworking
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="art" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Art & Prints
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="other" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Other
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={creatorApplicationForm.control}
                    name="materialsUsed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Materials Used</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the materials you use in your products..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Be specific about material quality and sourcing
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={creatorApplicationForm.control}
                    name="productionProcess"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Production Process</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe how you create your products..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Explain your techniques, time investment, and what
                          makes your process special
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 5: Policies */}
              {applicationStep === 4 && (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">
                      Quality Standards Agreement
                    </h3>
                    <div className="text-sm text-muted-foreground space-y-2 max-h-40 overflow-y-auto">
                      <p>
                        By becoming a creator on Kyzat, you agree
                        to:
                      </p>
                      <ul className="list-disc list-inside ml-4">
                        <li>
                          Create all products yourself or with your team (no
                          reselling)
                        </li>
                        <li>
                          Use high-quality materials appropriate for your
                          products
                        </li>
                        <li>
                          Accurately represent your products in listings and
                          photos
                        </li>
                        <li>
                          Maintain consistent quality across all your products
                        </li>
                        <li>Ship products within the stated timeframe</li>
                        <li>Respond to customer inquiries within 48 hours</li>
                        <li>
                          Handle returns and issues according to our policies
                        </li>
                        <li>
                          Not duplicate other artists&apos; work without
                          permission
                        </li>
                      </ul>
                      <p>
                        Violations of these standards may result in suspension
                        of your creator account.
                      </p>
                    </div>
                  </div>

                  <FormField
                    control={creatorApplicationForm.control}
                    name="agreeToQualityStandards"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to maintain Kyzat&apos;s
                            quality standards
                          </FormLabel>
                          <FormDescription>
                            You must agree to our quality standards to become a
                            creator
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Seller Policies</h3>
                    <div className="text-sm text-muted-foreground space-y-2 max-h-40 overflow-y-auto">
                      <p>
                        Our seller policies ensure a fair marketplace for all:
                      </p>
                      <ul className="list-disc list-inside ml-4">
                        <li>15% commission on all sales</li>
                        <li>Payment processing through our secure system</li>
                        <li>Products must be approved before listing</li>
                        <li>30-day return policy requirement</li>
                        <li>Prohibited items list compliance</li>
                        <li>Tax responsibility lies with the seller</li>
                        <li>Intellectual property respect and compliance</li>
                      </ul>
                      <p>
                        Please review our complete Terms of Service for more
                        details.
                      </p>
                    </div>
                  </div>

                  <FormField
                    control={creatorApplicationForm.control}
                    name="agreeToPolicies"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to Kyzat&apos;s seller
                            policies
                          </FormLabel>
                          <FormDescription>
                            Including commission structure and marketplace rules
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 6: Submit */}
              {applicationStep === 5 && (
                <div className="space-y-4">
                  <Alert>
                    <AlertTitle>Ready to Submit</AlertTitle>
                    <AlertDescription>
                      Please review your application carefully before
                      submitting. Our team will review your application and get
                      back to you within 3-5 business days.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Application Summary</h3>
                    <div className="text-sm space-y-2">
                      <p>
                        <strong>Business Name:</strong>{" "}
                        {businessName}
                      </p>
                      <p>
                        <strong>Category:</strong>{" "}
                        {productCategory}
                      </p>
                      <p>
                        <strong>Experience:</strong>{" "}
                        {yearsExperience} years
                      </p>
                    </div>
                  </div>

                  <Alert
                    variant="default"
                    className="bg-blue-50 border-blue-200"
                  >
                    <AlertTitle>What Happens Next?</AlertTitle>
                    <AlertDescription className="text-blue-800">
                      After submission, our curation team will review your
                      application. If approved, you&apos;ll receive instructions
                      on setting up your shop. Each product you list will also
                      go through a quality review before being published to the
                      marketplace.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={applicationStep === 0}
                >
                  Back
                </Button>
                {applicationStep < applicationSteps.length - 1 ? (
                  <Button type="button" onClick={nextStep}>
                    Continue
                  </Button>
                ) : (
                  <Button type="submit">
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BecomeCreatorForm;

// "use client";

// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   FormDescription,
// } from "@/components/ui/form";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import {
//   Store,
//   Mail,
//   MapPin,
//   Link as LinkIcon,
//   Upload,
//   AlertCircle,
//   CheckCircle,
//   Clock,
//   Shield,
//   Award,
//   X,
// } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image";

// // Define form schema with Zod
// const creatorApplicationSchema = z.object({
//   businessName: z.string().min(1, "Business name is required"),
//   firstName: z.string().min(1, "First name is required"),
//   lastName: z.string().min(1, "Last name is required"),
//   email: z.string().email("Please enter a valid email address"),
//   phone: z.string().min(1, "Phone number is required"),
//   address: z.string().min(1, "Address is required"),
//   city: z.string().min(1, "City is required"),
//   state: z.string().min(1, "State is required"),
//   zipCode: z.string().min(1, "ZIP code is required"),
//   category: z.string().min(1, "Please select a category"),
//   productDescription: z.string().min(50, "Please provide a detailed description of at least 50 characters"),
//   materials: z.string().min(1, "Please list the materials you use"),
//   process: z.string().min(50, "Please describe your creative process in detail"),
//   experience: z.string().min(1, "Please describe your experience"),
//   website: z.string().optional(),
//   instagram: z.string().optional(),
//   agreeToTerms: z.boolean().refine(val => val === true, {
//     message: "You must agree to the terms and guidelines",
//   }),
// });

// type CreatorApplicationValues = z.infer<typeof creatorApplicationSchema>;

// export default function BecomeCreatorForm() {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [uploadedImages, setUploadedImages] = useState<string[]>([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submissionSuccess, setSubmissionSuccess] = useState(false);

//   const form = useForm<CreatorApplicationValues>({
//     resolver: zodResolver(creatorApplicationSchema),
//     defaultValues: {
//       businessName: "",
//       firstName: "",
//       lastName: "",
//       email: "",
//       phone: "",
//       address: "",
//       city: "",
//       state: "",
//       zipCode: "",
//       category: "",
//       productDescription: "",
//       materials: "",
//       process: "",
//       experience: "",
//       website: "",
//       instagram: "",
//       agreeToTerms: false,
//     },
//   });

//   const categories = [
//     "Clothing & Accessories",
//     "Jewelry",
//     "Pottery & Ceramics",
//     "Art & Prints",
//     "Home Decor",
//     "Woodworking",
//     "Textiles & Weaving",
//     "Glass Art",
//     "Metalwork",
//     "Other"
//   ];

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files) return;

//     const newImages: string[] = [];
//     for (let i = 0; i < files.length; i++) {
//       const file = files[i];
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         if (e.target?.result) {
//           newImages.push(e.target.result as string);
//           if (newImages.length === files.length) {
//             setUploadedImages(prev => [...prev, ...newImages]);
//           }
//         }
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const removeImage = (index: number) => {
//     setUploadedImages(prev => prev.filter((_, i) => i !== index));
//   };

//   const nextStep = () => {
//     setCurrentStep(prev => prev + 1);
//   };

//   const prevStep = () => {
//     setCurrentStep(prev => prev - 1);
//   };

//   const onSubmit = async (data: CreatorApplicationValues) => {
//     setIsSubmitting(true);
//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 2000));
//     console.log("Application submitted:", data, uploadedImages);
//     setIsSubmitting(false);
//     setSubmissionSuccess(true);
//   };

//   if (submissionSuccess) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-4">
//         <Card className="w-full max-w-2xl bg-background">
//           <CardHeader className="text-center">
//             <div className="flex justify-center mb-4">
//               <CheckCircle className="h-16 w-16 text-green-500" />
//             </div>
//             <CardTitle className="text-2xl">Application Submitted!</CardTitle>
//             <CardDescription>
//               Your creator application has been received and is under review.
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <div className="flex items-start">
//                 <Clock className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
//                 <div>
//                   <h3 className="font-semibold text-blue-800">What happens next?</h3>
//                   <ul className="text-blue-700 text-sm mt-2 space-y-1">
//                     <li>• Our team will review your application within 3-5 business days</li>
//                     <li>• We may contact you for additional information or clarification</li>
//                     <li>• You&apos;ll receive an email notification once a decision is made</li>
//                     <li>• If approved, you&apos;ll get access to creator tools and onboarding</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
//               <div className="flex items-start">
//                 <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
//                 <div>
//                   <h3 className="font-semibold text-amber-800">Quality Standards</h3>
//                   <p className="text-amber-700 text-sm mt-2">
//                     Remember that all products you list will also go through a quality review process
//                     to ensure they meet our platform standards before being published.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Button asChild>
//                 <Link href="/">
//                   Return to Home
//                 </Link>
//               </Button>
//               <Button variant="outline" asChild>
//                 <Link href="/profile">
//                   View Profile
//                 </Link>
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen py-8">
//       <div className="container max-w-4xl mx-auto px-4">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold mb-2 text-center">Apply to Become a Creator</h1>
//           <p className="text-muted-foreground">
//             Apply to sell your handmade products on our platform. All applications are reviewed to maintain quality standards.
//           </p>
//         </div>

//         {/* Progress Bar */}
//         <div className="mb-8">
//           <div className="flex justify-between mb-2">
//             <span className="text-sm font-medium">Step {currentStep} of 4</span>
//             <span className="text-sm text-muted-foreground">
//               {Math.round((currentStep / 4) * 100)}% Complete
//             </span>
//           </div>
//           <div className="w-full bg-muted rounded-full h-2">
//             <div
//               className="bg-indigo-600 h-2 rounded-full transition-all"
//               style={{ width: `${(currentStep / 4) * 100}%` }}
//             ></div>
//           </div>
//         </div>

//         <Card className="py-6 bg-background">
//           <CardHeader>
//             <CardTitle className="flex items-center">
//               <Award className="h-6 w-6 mr-2 text-indigo-600" />
//               {currentStep === 1 && "Business Information"}
//               {currentStep === 2 && "Product Details"}
//               {currentStep === 3 && "Portfolio & Experience"}
//               {currentStep === 4 && "Review & Submit"}
//             </CardTitle>
//             <CardDescription>
//               {currentStep === 1 && "Tell us about your business and contact information"}
//               {currentStep === 2 && "Describe your products and creative process"}
//               {currentStep === 3 && "Share your experience and portfolio"}
//               {currentStep === 4 && "Review your application before submitting"}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Form {...form}>
//               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//                 {/* Step 1: Business Information */}
//                 {currentStep === 1 && (
//                   <div className="space-y-6">
//                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                       <div className="flex items-start">
//                         <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
//                         <p className="text-blue-800 text-sm">
//                           All creator applications are manually reviewed to ensure quality standards.
//                           This process typically takes 3-5 business days.
//                         </p>
//                       </div>
//                     </div>

//                     <FormField
//                       control={form.control}
//                       name="businessName"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Business/Brand Name *</FormLabel>
//                           <FormControl>
//                             <div className="relative">
//                               <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                               <Input placeholder="Your business or brand name" className="pl-10" {...field} />
//                             </div>
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <div className="grid md:grid-cols-2 gap-4">
//                       <FormField
//                         control={form.control}
//                         name="firstName"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>First Name *</FormLabel>
//                             <FormControl>
//                               <Input placeholder="First name" {...field} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={form.control}
//                         name="lastName"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Last Name *</FormLabel>
//                             <FormControl>
//                               <Input placeholder="Last name" {...field} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>

//                     <div className="grid md:grid-cols-2 gap-4">
//                       <FormField
//                         control={form.control}
//                         name="email"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Email *</FormLabel>
//                             <FormControl>
//                               <div className="relative">
//                                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                                 <Input type="email" placeholder="Email address" className="pl-10" {...field} />
//                               </div>
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={form.control}
//                         name="phone"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Phone Number *</FormLabel>
//                             <FormControl>
//                               <Input placeholder="Phone number" {...field} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>

//                     <FormField
//                       control={form.control}
//                       name="address"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Street Address *</FormLabel>
//                           <FormControl>
//                             <div className="relative">
//                               <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                               <Input placeholder="Street address" className="pl-10" {...field} />
//                             </div>
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <div className="grid md:grid-cols-3 gap-4">
//                       <FormField
//                         control={form.control}
//                         name="city"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>City *</FormLabel>
//                             <FormControl>
//                               <Input placeholder="City" {...field} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={form.control}
//                         name="state"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>State *</FormLabel>
//                             <FormControl>
//                               <Input placeholder="State" {...field} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={form.control}
//                         name="zipCode"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>ZIP Code *</FormLabel>
//                             <FormControl>
//                               <Input placeholder="ZIP code" {...field} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                   </div>
//                 )}

//                 {/* Step 2: Product Details */}
//                 {currentStep === 2 && (
//                   <div className="space-y-6">
//                     <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
//                       <div className="flex items-start">
//                         <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
//                         <p className="text-amber-800 text-sm">
//                           Please be detailed in your descriptions. All products will undergo quality review
//                           before being listed on our platform.
//                         </p>
//                       </div>
//                     </div>

//                     <FormField
//                       control={form.control}
//                       name="category"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Primary Product Category *</FormLabel>
//                           <FormControl>
//                             <select
//                               className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//                               {...field}
//                             >
//                               <option value="">Select a category</option>
//                               {categories.map((category) => (
//                                 <option key={category} value={category}>
//                                   {category}
//                                 </option>
//                               ))}
//                             </select>
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="productDescription"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Product Description *</FormLabel>
//                           <FormDescription>
//                             Describe the types of products you create. Be specific about styles, techniques, and unique features.
//                           </FormDescription>
//                           <FormControl>
//                             <Textarea
//                               placeholder="Describe your products in detail..."
//                               rows={4}
//                               {...field}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="materials"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Materials Used *</FormLabel>
//                           <FormDescription>
//                             List all materials and components used in your products.
//                           </FormDescription>
//                           <FormControl>
//                             <Textarea
//                               placeholder="List the materials you work with..."
//                               rows={3}
//                               {...field}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="process"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Creative Process *</FormLabel>
//                           <FormDescription>
//                             Describe your creative process from start to finish. How do you make your products?
//                           </FormDescription>
//                           <FormControl>
//                             <Textarea
//                               placeholder="Describe your creative process in detail..."
//                               rows={4}
//                               {...field}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 )}

//                 {/* Step 3: Portfolio & Experience */}
//                 {currentStep === 3 && (
//                   <div className="space-y-6">
//                     <div>
//                       <h3 className="font-medium mb-3">Product Images *</h3>
//                       <FormDescription>
//                         Upload 3-5 high-quality images of your work. These will help us evaluate your application.
//                       </FormDescription>

//                       <div className="mt-4">
//                         <input
//                           type="file"
//                           id="product-images"
//                           multiple
//                           accept="image/*"
//                           onChange={handleImageUpload}
//                           className="hidden"
//                         />
//                         <label
//                           htmlFor="product-images"
//                           className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer block hover:border-indigo-300 transition-colors"
//                         >
//                           <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
//                           <p className="text-sm text-muted-foreground">
//                             Click to upload images of your products
//                           </p>
//                           <p className="text-xs text-muted-foreground mt-1">
//                             Recommended: 3-5 high-quality images showing different angles and details
//                           </p>
//                         </label>
//                       </div>

//                       {uploadedImages.length > 0 && (
//                         <div className="mt-4">
//                           <p className="text-sm font-medium mb-2">Uploaded Images ({uploadedImages.length})</p>
//                           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                             {uploadedImages.map((src, index) => (
//                               <div key={index} className="relative group">
//                                 <Image
//                                   src={src}
//                                   alt={`Product ${index + 1}`}
//                                   className="w-full h-24 object-cover rounded-md"
//                                 />
//                                 <button
//                                   type="button"
//                                   onClick={() => removeImage(index)}
//                                   className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
//                                 >
//                                   <X className="h-3 w-3" />
//                                 </button>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     <FormField
//                       control={form.control}
//                       name="experience"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Experience & Background *</FormLabel>
//                           <FormDescription>
//                             Tell us about your experience as a creator. How long have you been creating?
//                             Have you sold your work before?
//                           </FormDescription>
//                           <FormControl>
//                             <Textarea
//                               placeholder="Describe your experience and background..."
//                               rows={4}
//                               {...field}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <div className="grid md:grid-cols-2 gap-4">
//                       <FormField
//                         control={form.control}
//                         name="website"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Website (Optional)</FormLabel>
//                             <FormControl>
//                               <div className="relative">
//                                 <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                                 <Input placeholder="https://yourwebsite.com" className="pl-10" {...field} />
//                               </div>
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={form.control}
//                         name="instagram"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Instagram (Optional)</FormLabel>
//                             <FormControl>
//                               <div className="relative">
//                                 <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">@</span>
//                                 <Input placeholder="username" className="pl-8" {...field} />
//                               </div>
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                   </div>
//                 )}

//                 {/* Step 4: Review & Submit */}
//                 {currentStep === 4 && (
//                   <div className="space-y-6">
//                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                       <div className="flex items-start">
//                         <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
//                         <div>
//                           <h3 className="font-semibold text-blue-800">Quality Assurance Process</h3>
//                           <ul className="text-blue-700 text-sm mt-2 space-y-1">
//                             <li>• Your application will be reviewed within 3-5 business days</li>
//                             <li>• All products must be handmade or designed by you</li>
//                             <li>• Each product listing will undergo quality review before publication</li>
//                             <li>• We maintain high standards to ensure customer satisfaction</li>
//                           </ul>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <h3 className="font-medium">Application Summary</h3>

//                       <div className="grid md:grid-cols-2 gap-4 text-sm">
//                         <div>
//                           <p className="text-muted-foreground">Business Name</p>
//                           <p className="font-medium">{form.watch("businessName")}</p>
//                         </div>
//                         <div>
//                           <p className="text-muted-foreground">Category</p>
//                           <p className="font-medium">{form.watch("category")}</p>
//                         </div>
//                         <div>
//                           <p className="text-muted-foreground">Contact Email</p>
//                           <p className="font-medium">{form.watch("email")}</p>
//                         </div>
//                         <div>
//                           <p className="text-muted-foreground">Location</p>
//                           <p className="font-medium">
//                             {form.watch("city")}, {form.watch("state")}
//                           </p>
//                         </div>
//                       </div>

//                       <div>
//                         <p className="text-muted-foreground text-sm">Product Description</p>
//                         <p className="text-sm mt-1">{form.watch("productDescription")}</p>
//                       </div>

//                       {uploadedImages.length > 0 && (
//                         <div>
//                           <p className="text-muted-foreground text-sm mb-2">Product Images ({uploadedImages.length})</p>
//                           <div className="grid grid-cols-3 gap-2">
//                             {uploadedImages.slice(0, 3).map((src, index) => (
//                               <Image
//                                 key={index}
//                                 src={src}
//                                 alt={`Product ${index + 1}`}
//                                 className="w-full h-20 object-cover rounded-md"
//                               />
//                             ))}
//                             {uploadedImages.length > 3 && (
//                               <div className="flex items-center justify-center bg-muted rounded-md">
//                                 <span className="text-sm text-muted-foreground">
//                                   +{uploadedImages.length - 3} more
//                                 </span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     <FormField
//                       control={form.control}
//                       name="agreeToTerms"
//                       render={({ field }) => (
//                         <FormItem className="flex flex-row items-start space-x-3 space-y-0">
//                           <FormControl>
//                             <input
//                               type="checkbox"
//                               checked={field.value}
//                               onChange={field.onChange}
//                               className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                             />
//                           </FormControl>
//                           <div className="space-y-1 leading-none">
//                             <FormLabel>
//                               I agree to the{" "}
//                               <a href="/creator-guidelines" className="text-indigo-600 hover:underline">
//                                 Creator Guidelines
//                               </a>{" "}
//                               and understand that all products must pass quality review
//                             </FormLabel>
//                             <FormMessage />
//                           </div>
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 )}

//                 {/* Navigation Buttons */}
//                 <div className="flex justify-between pt-6">
//                   {currentStep > 1 ? (
//                     <Button type="button" variant="outline" onClick={prevStep}>
//                       Previous
//                     </Button>
//                   ) : (
//                     <div></div>
//                   )}

//                   {currentStep < 4 ? (
//                     <Button type="button" onClick={nextStep}>
//                       Continue
//                     </Button>
//                   ) : (
//                     <Button type="submit" disabled={isSubmitting}>
//                       {isSubmitting ? "Submitting..." : "Submit Application"}
//                     </Button>
//                   )}
//                 </div>
//               </form>
//             </Form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
