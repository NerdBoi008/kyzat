"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  MapPin,
  Heart,
  Star,
  CreditCard,
  LogOut,
  Store,
  ImageIcon,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Save,
  X,
  Edit,
  RefreshCcw,
  Bookmark,
  Package,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Users,
  LoaderCircle,
  PackageOpen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserProfile } from "@/hooks/useUserProfile";
import { redirect, useRouter } from "next/navigation";
import { toast } from "sonner";
import { User } from "@/lib/db/schema/index";
import { formatSmartDate } from "@/lib/utils";
import CreatorReviewsList from "@/components/common/creator-reviews-list";
import ProductReviewsList from "@/components/common/product-reviews-list";
import UserWrittenReviews from "@/components/common/user-written-reviews";
import ProfileProductCard from "@/components/common/profile-product-card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { signOut, useSession } from "@/lib/auth-client";

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

// Define form schemas with Zod
const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Please enter a valid email address"),
  phone: z.string().optional(),
});

const addressSchema = z.object({
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  label: z.string().min(1).max(100),
  name: z.string().min(2).max(255),
  phone: z.string().min(7).max(15).optional().or(z.literal("")),
  street: z.string().min(1),
  apartment: z.string().optional().or(z.literal("")),
  country: z.string().min(1),
  isDefault: z.boolean().optional(),
  type: z.enum(["home", "work", "other"]).optional(),
});

// Creator application schema
const creatorApplicationSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  businessDescription: z
    .string()
    .min(
      50,
      "Please provide a detailed description of your business (at least 50 characters)",
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
      "You must agree to maintain our quality standards",
    ),
  agreeToPolicies: z
    .boolean()
    .refine((val) => val === true, "You must agree to our seller policies"),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;
type AddressValues = z.infer<typeof addressSchema>;
type CreatorApplicationValues = z.infer<typeof creatorApplicationSchema>;

interface EditedProfileType {
  name: string;
  bio: string;
  location: string;
  website: string;
}

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
                    ? "bg-primary text-white"
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

const CreatorStatusBadge = ({ status }: { status: User["creatorStatus"] }) => {
  const statusConfig = {
    "not-applied": { label: "Not Applied", color: "bg-gray-100 text-gray-800" },
    pending: { label: "Under Review", color: "bg-amber-100 text-amber-800" },
    approved: { label: "Approved", color: "bg-green-100 text-green-800" },
    rejected: { label: "Not Approved", color: "bg-red-100 text-red-800" },
  };

  const config = statusConfig[status ?? "not-applied"];

  return (
    <Badge variant="secondary" className={config.color}>
      {config.label}
    </Badge>
  );
};

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStep, setApplicationStep] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<EditedProfileType>();
  const [showAlert, setShowAlert] = useState(false);
  const [profileRefreshLoading, setProfileRefreshLoading] = useState(false);
  const [, setIsSavingPersonal] = useState(false);
  const [, setIsSavingAddress] = useState(false);
  const [, setIsSubmittingApplication] = useState(false);

  const { data: session, isPending, error: sessionError } = useSession();
  const { profile, isLoading, error, updateProfile, refetchProfile } =
    useUserProfile();

  let isCreator = false;

  // Handle authentication
  useEffect(() => {
    if (isPending) return;

    if (sessionError) {
      redirect("/auth");
    }
  }, [isPending, session, sessionError]);

  // Initialize edited profile when profile loads
  useEffect(() => {
    if (profile) {
      setEditedProfile({
        name: profile.user.name,
        bio: profile.user.bio || "",
        location: profile.user.location || "",
        website: profile.user.website || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.user?.creatorStatus) {
      const hasNotDismissed = !localStorage.getItem(
        `dismissed-creator-status-${profile.user.creatorStatus}`,
      );
      setShowAlert(hasNotDismissed);
    }
  }, [profile?.user?.creatorStatus]);

  useEffect(() => {
    if (profile && isCreator) {
      setActiveTab("products");
    }
  }, [profile, isCreator]);

  // Personal Info Form
  const personalInfoForm = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: profile?.user.email || "",
      phone: "",
    },
  });

  // Address Form
  const addressForm = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      city: "",
      state: "",
      zipCode: "",
    },
  });

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

  // Loading state
  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-8">
              <div className="h-8 w-48 bg-muted rounded-lg animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-9 w-24 bg-muted rounded-md animate-pulse"></div>
                <div className="h-9 w-24 bg-muted rounded-md animate-pulse"></div>
              </div>
            </div>

            {/* Profile Header Skeleton */}
            <div className="bg-card rounded-lg border p-6 mb-8 animate-pulse">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="w-20 h-20 bg-muted rounded-full mr-6"></div>
                <div className="flex-1 mt-4 md:mt-0 space-y-3">
                  <div className="h-7 w-64 bg-muted rounded"></div>
                  <div className="h-4 w-full bg-muted rounded"></div>
                  <div className="h-4 w-3/4 bg-muted rounded"></div>
                  <div className="h-3 w-48 bg-muted rounded"></div>
                </div>
                <div className="mt-4 md:mt-0 space-y-2">
                  <div className="h-6 w-32 bg-muted rounded"></div>
                  <div className="h-9 w-40 bg-muted rounded-md"></div>
                </div>
              </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="mb-8 border-b">
              <div className="flex space-x-8">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="py-3">
                    <div className="h-5 w-20 bg-muted rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="space-y-6">
              {/* Stats Grid Skeleton */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="bg-card rounded-lg border p-6 animate-pulse"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-4 w-24 bg-muted rounded"></div>
                      <div className="h-4 w-4 bg-muted rounded"></div>
                    </div>
                    <div className="h-8 w-16 bg-muted rounded mb-2"></div>
                    <div className="h-3 w-20 bg-muted rounded"></div>
                  </div>
                ))}
              </div>

              {/* Recent Activity Skeleton */}
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="bg-card rounded-lg border p-6 animate-pulse"
                  >
                    <div className="mb-4">
                      <div className="h-6 w-32 bg-muted rounded mb-2"></div>
                      <div className="h-4 w-48 bg-muted rounded"></div>
                    </div>
                    <div className="space-y-4">
                      {[1, 2, 3].map((order) => (
                        <div
                          key={order}
                          className="flex items-center justify-between pb-4 border-b last:border-0"
                        >
                          <div className="space-y-2">
                            <div className="h-4 w-24 bg-muted rounded"></div>
                            <div className="h-3 w-20 bg-muted rounded"></div>
                          </div>
                          <div className="space-y-2 text-right">
                            <div className="h-4 w-16 bg-muted rounded"></div>
                            <div className="h-5 w-20 bg-muted rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Account Info Skeleton */}
              <div className="bg-card rounded-lg border p-6 animate-pulse">
                <div className="mb-4">
                  <div className="h-6 w-40 bg-muted rounded mb-2"></div>
                  <div className="h-4 w-56 bg-muted rounded"></div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item}>
                        <div className="h-4 w-28 bg-muted rounded mb-1"></div>
                        <div className="h-4 w-36 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item}>
                        <div className="h-4 w-28 bg-muted rounded mb-1"></div>
                        <div className="h-4 w-36 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Indicator */}
            <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg">
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">
                Loading your profile...
              </span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Failed to load profile
          </h2>
          <p className="text-muted-foreground mb-4">{error?.message}</p>
          <Button onClick={() => refetchProfile()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const { user, creatorProfile, statistics, recentOrders } = profile;
  isCreator = user.role === "creator" || user.creatorStatus === "approved";
  const creatorStatus = user.creatorStatus || "not-applied";

  const handleSaveProfile = async () => {
    try {
      const result = await updateProfile({
        name: editedProfile?.name || "",
        bio: editedProfile?.bio || "",
        location: editedProfile?.location || "",
        website: editedProfile?.website || "",
      });
      if (result.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Failed to update profile", error);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile({
      name: user.name,
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || "",
    });
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess() {
          router.push("/");
        },
      },
    });
  };

  const handleProfileRefresh = async () => {
    setProfileRefreshLoading(true);
    await refetchProfile();
    setProfileRefreshLoading(false);
  };

  // const onPersonalInfoSubmit = (data: PersonalInfoValues) => {
  //   console.log("Personal info saved:", data);
  //   // Handle form submission
  // };

  // const onAddressSubmit = (data: AddressValues) => {
  //   console.log("Address saved:", data);
  //   // Handle form submission
  // };

  // const onCreatorApplicationSubmit = (data: CreatorApplicationValues) => {
  //   console.log("Creator application submitted:", data);
  //   // In a real app, this would submit to your backend for review
  //   user.creatorStatus = "pending";
  //   setIsApplying(false);
  //   setApplicationStep(0);
  // };

  // Personal Info Submit
  const onPersonalInfoSubmit = async (data: PersonalInfoValues) => {
    setIsSavingPersonal(true);

    try {
      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "personal",
          data: {
            name: `${data.firstName} ${data.lastName}`,
            // bio: data.bio,
            // website: data.website,
            // location: data.location,
            // socialLinks: {
            //   twitter: data.twitter,
            //   instagram: data.instagram,
            //   facebook: data.facebook,
            //   linkedin: data.linkedin,
            //   whatsapp: data.whatsapp,
            // },
          },
        }),
      });

      const result: { success: boolean; error?: string } =
        await response.json();

      if (result.success) {
        toast.success("Personal information updated successfully");

        // Refresh the profile data
        if (refetchProfile) {
          refetchProfile();
        }

        // Optionally update session
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update personal information");
      }
    } catch (error) {
      console.error("Error updating personal info:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSavingPersonal(false);
    }
  };

  // Address Submit
  const onAddressSubmit = async (data: AddressValues) => {
    setIsSavingAddress(true);

    try {
      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "address",
          data: {
            label: "Home", // TODO: Allow user to set label in below form
            name: profile.user.name || "User",
            phone: profile.user.phone || "",
            street: data.street,
            apartment: data.apartment,
            city: data.city,
            state: data.state,
            postalCode: data.zipCode,
            country: data.country,
          },
        }),
      });

      const result: { success: boolean; error?: string } =
        await response.json();

      if (result.success) {
        toast.success("Address updated successfully");

        // Refresh the profile data
        if (refetchProfile) {
          refetchProfile();
        }
      } else {
        toast.error(result.error || "Failed to update address");
      }
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Creator Application Submit
  const onCreatorApplicationSubmit = async (data: CreatorApplicationValues) => {
    setIsSubmittingApplication(true);

    console.log({
      file: "profile.tsx",
      data,
    });

    try {
      const response = await fetch("/api/creator/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: data.businessName,
          category: data.productCategory,
          description: data.businessDescription,
          experience: data.yearsExperience,
          portfolio: data.portfolioLinks,

          // productCategory
          // materialsUsed
          // productionProcess
          // portfolioLinks
        }),
      });

      const result: { success: boolean; error?: string } =
        await response.json();

      if (result.success) {
        toast.success("Creator application submitted successfully!", {
          description:
            "Your application is under review. We'll notify you soon.",
        });

        // Update UI
        setIsApplying(false);
        setApplicationStep(0);

        // Refresh profile to show pending status
        if (refetchProfile) {
          refetchProfile();
        }

        router.refresh();
      } else {
        toast.error(result.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmittingApplication(false);
    }
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

  const startApplication = () => {
    setIsApplying(true);
    setApplicationStep(0);
  };

  const cancelApplication = () => {
    setIsApplying(false);
    setApplicationStep(0);
    creatorApplicationForm.reset();
  };

  const dismissAlert = () => {
    setShowAlert(false);
    localStorage.setItem(
      `dismissed-creator-status-${user.creatorStatus}`,
      "true",
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <div>
              <Button
                variant="outline"
                className="mr-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>

              <Button
                variant="outline"
                className="hover:cursor-pointer mr-2"
                onClick={handleProfileRefresh}
              >
                {profileRefreshLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <>
                    <RefreshCcw className="h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>

              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} size="sm">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Creator Status Alert */}
          {showAlert && user.creatorStatus !== "not-applied" && (
            <Alert
              className={`mb-6 relative ${
                user.creatorStatus === "approved"
                  ? "bg-green-50 border-green-200"
                  : user.creatorStatus === "pending"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-red-50 border-red-200"
              }`}
            >
              {user.creatorStatus === "approved" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : user.creatorStatus === "pending" ? (
                <Clock className="h-5 w-5 text-amber-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <AlertTitle>
                {user.creatorStatus === "approved"
                  ? "Creator Account Approved"
                  : user.creatorStatus === "pending"
                    ? "Application Under Review"
                    : "Application Not Approved"}
              </AlertTitle>
              <AlertDescription
                className={
                  user.creatorStatus === "approved"
                    ? "text-green-800"
                    : user.creatorStatus === "pending"
                      ? "text-amber-800"
                      : "text-red-800"
                }
              >
                {user.creatorStatus === "approved"
                  ? "Your creator account has been approved! You can now start selling on our platform."
                  : user.creatorStatus === "pending"
                    ? "Your application is being reviewed by our team. This process typically takes 3-5 business days."
                    : "Your application did not meet our quality standards. You can reapply after 30 days."}
              </AlertDescription>
              <button
                onClick={dismissAlert}
                className="ml-auto absolute top-3 right-3 hover:cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </Alert>
          )}

          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <Avatar className="w-20 h-20 mr-6">
                  <AvatarFallback>
                    {getInitials(user.name || "User")}
                  </AvatarFallback>
                  <AvatarImage
                    src={user.profileImage}
                    alt={user.name || "User"}
                  />
                </Avatar>

                <div className="flex-1 mt-4 md:mt-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <CreatorStatusBadge
                      status={creatorStatus as User["creatorStatus"]}
                    />
                  </div>
                  {creatorProfile?.story && (
                    <p className="mt-2 text-sm">{creatorProfile.story}</p>
                  )}
                  {isCreator && creatorProfile?.location && (
                    <div className="flex items-center mt-2">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {creatorProfile.location}
                      </span>
                    </div>
                  )}
                  {!isCreator && user.location && (
                    <div className="flex items-center mt-2">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {user.location}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-muted-foreground">
                      Joined{" "}
                      <strong>
                        {formatSmartDate(new Date(user.createdAt))}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Account Type
                    </p>
                    <p className="font-medium">
                      {isCreator ? "Creator" : "Customer"}
                    </p>
                  </div>
                  {user.creatorStatus === "not-applied" && (
                    <Button onClick={startApplication}>
                      <Store className="h-4 w-4 mr-2" />
                      Become a Creator
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Creator Application Modal */}
          {isApplying && (
            <Card className="mb-8 py-6">
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
                      onCreatorApplicationSubmit,
                    )}
                    className="space-y-6"
                  >
                    {/* Step 1: Introduction */}
                    {applicationStep === 0 && (
                      <div className="space-y-4">
                        <Alert>
                          <AlertTitle>Quality Standards</AlertTitle>
                          <AlertDescription>
                            At Kyzat, we maintain high quality standards to
                            ensure our customers receive only the best handmade
                            products. All creators and their products go through
                            a thorough screening process.
                          </AlertDescription>
                        </Alert>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="font-semibold mb-2">
                            Application Process
                          </h3>
                          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                            <li>Complete this application form</li>
                            <li>
                              Our team will review your application (3-5
                              business days)
                            </li>
                            <li>
                              If approved, you&apos;ll be able to set up your
                              shop
                            </li>
                            <li>
                              Each product you list will also be reviewed before
                              going live
                            </li>
                          </ul>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <h3 className="font-semibold mb-2">
                            What We Look For
                          </h3>
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
                                This will be displayed to customers on your shop
                                page
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
                                This helps us understand your brand and
                                craftsmanship philosophy
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
                                Include links to your online portfolio or social
                                media
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
                                Explain your techniques, time investment, and
                                what makes your process special
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
                            <p>By becoming a creator on Kyzat, you agree to:</p>
                            <ul className="list-disc list-inside ml-4">
                              <li>
                                Create all products yourself or with your team
                                (no reselling)
                              </li>
                              <li>
                                Use high-quality materials appropriate for your
                                products
                              </li>
                              <li>
                                Accurately represent your products in listings
                                and photos
                              </li>
                              <li>
                                Maintain consistent quality across all your
                                products
                              </li>
                              <li>Ship products within the stated timeframe</li>
                              <li>
                                Respond to customer inquiries within 48 hours
                              </li>
                              <li>
                                Handle returns and issues according to our
                                policies
                              </li>
                              <li>
                                Not duplicate other artists&apos; work without
                                permission
                              </li>
                            </ul>
                            <p>
                              Violations of these standards may result in
                              suspension of your creator account.
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
                                  I agree to maintain Kyzat&apos;s quality
                                  standards
                                </FormLabel>
                                <FormDescription>
                                  You must agree to our quality standards to
                                  become a creator
                                </FormDescription>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Separator />

                        <div className="bg-muted p-4 rounded-lg">
                          <h3 className="font-semibold mb-2">
                            Seller Policies
                          </h3>
                          <div className="text-sm text-muted-foreground space-y-2 max-h-40 overflow-y-auto">
                            <p>
                              Our seller policies ensure a fair marketplace for
                              all:
                            </p>
                            <ul className="list-disc list-inside ml-4">
                              <li>15% commission on all sales</li>
                              <li>
                                Payment processing through our secure system
                              </li>
                              <li>Products must be approved before listing</li>
                              <li>30-day return policy requirement</li>
                              <li>Prohibited items list compliance</li>
                              <li>Tax responsibility lies with the seller</li>
                              <li>
                                Intellectual property respect and compliance
                              </li>
                            </ul>
                            <p>
                              Please review our complete Terms of Service for
                              more details.
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
                                  I agree to Kyzat&apos;s seller policies
                                </FormLabel>
                                <FormDescription>
                                  Including commission structure and marketplace
                                  rules
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
                            submitting. Our team will review your application
                            and get back to you within 3-5 business days.
                          </AlertDescription>
                        </Alert>

                        <div className="bg-muted p-4 rounded-lg">
                          <h3 className="font-semibold mb-2">
                            Application Summary
                          </h3>
                          <div className="text-sm space-y-2">
                            <p>
                              <strong>Business Name:</strong>{" "}
                              {creatorApplicationForm.watch("businessName")}
                            </p>
                            <p>
                              <strong>Category:</strong>{" "}
                              {creatorApplicationForm.watch("productCategory")}
                            </p>
                            <p>
                              <strong>Experience:</strong>{" "}
                              {creatorApplicationForm.watch("yearsExperience")}{" "}
                              years
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
                            application. If approved, you&apos;ll receive
                            instructions on setting up your shop. Each product
                            you list will also go through a quality review
                            before being published to the marketplace.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={
                          applicationStep === 0 ? cancelApplication : prevStep
                        }
                      >
                        {applicationStep === 0 ? "Cancel" : "Back"}
                      </Button>

                      {applicationStep < applicationSteps.length - 1 ? (
                        <Button type="button" onClick={nextStep}>
                          Continue
                        </Button>
                      ) : (
                        <Button type="submit">Submit Application</Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Navigation Tabs */}
          {!isApplying && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-8 w-full"
            >
              <TabsList className="w-full justify-start p-0 bg-transparent h-auto border-b rounded-none">
                {isCreator && (
                  <TabsTrigger
                    value="products"
                    className="py-3 px-1 border-0 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-b-3 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                  >
                    Products
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="overview"
                  className="py-3 px-1 border-0 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-b-3 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="py-3 px-1 border-0 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-b-3 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                >
                  Reviews
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="py-3 px-1 border-0 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-b-3 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                >
                  Profile Settings
                </TabsTrigger>
              </TabsList>

              {isCreator && (
                <TabsContent value="products" className="py-8">
                  {profile.creatorProducts.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {profile.creatorProducts.map((product) => (
                        <ProfileProductCard key={product.id} {...product} />
                      ))}
                    </div>
                  ) : (
                    <Empty className="border border-dashed">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <PackageOpen className="h-12 w-12 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle>No Products</EmptyTitle>
                        <EmptyDescription>
                          You haven&apos;t listed any products yet.
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <Button variant="outline" size="sm">
                          <Link href="/dashboard/products/new">
                            Create Your First Product
                          </Link>
                        </Button>
                      </EmptyContent>
                    </Empty>
                  )}
                </TabsContent>
              )}

              <TabsContent value="overview" className="py-8">
                <div className="space-y-6">
                  {/* Quick Stats Grid */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="py-6">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Orders
                        </CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {statistics.orders}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isCreator ? "Orders received" : "Orders placed"}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="py-6">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {isCreator ? "Products" : "Favorites"}
                        </CardTitle>
                        {isCreator ? (
                          <Package className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Heart className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {isCreator
                            ? statistics.productsCount
                            : statistics.favorites}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isCreator ? "Listed products" : "Favorited items"}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="py-6">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Cart Items
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {statistics.cartItems}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Items in cart
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="py-6">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {isCreator ? "Reviews" : "Saved Items"}
                        </CardTitle>
                        {isCreator ? (
                          <Star className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Bookmark className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {isCreator
                            ? statistics.reviews
                            : statistics.savedItems}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isCreator ? "Total reviews" : "Saved for later"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Creator-specific metrics */}
                  {isCreator && creatorProfile?.stats && (
                    <Card className="py-6">
                      <CardHeader>
                        <CardTitle>Creator Performance</CardTitle>
                        <CardDescription>
                          Your shop performance metrics and ratings
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          <div className="flex items-center space-x-4 rounded-lg border p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                              <Star className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Average Rating
                              </p>
                              <p className="text-2xl font-bold">
                                {creatorProfile.stats.avgRating}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                From {creatorProfile.stats.totalReviews} reviews
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 rounded-lg border p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                              <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Total Orders
                              </p>
                              <p className="text-2xl font-bold">
                                {creatorProfile.stats.totalOrders}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {creatorProfile.stats.completedOrders} completed
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 rounded-lg border p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                              <Clock className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Response Time
                              </p>
                              <p className="text-2xl font-bold">
                                {creatorProfile.stats.avgResponseTime}h
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Average response time
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 rounded-lg border p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                              <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Total Sales
                              </p>
                              <p className="text-2xl font-bold">
                                {creatorProfile.sales}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Lifetime sales count
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 rounded-lg border p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
                              <Users className="h-6 w-6 text-pink-600" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Followers
                              </p>
                              <p className="text-2xl font-bold">
                                {creatorProfile.followers.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Following{" "}
                                {creatorProfile.following.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 rounded-lg border p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                              <CheckCircle className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Completion Rate
                              </p>
                              <p className="text-2xl font-bold">
                                {Number(
                                  (
                                    (creatorProfile.stats.completedOrders /
                                      creatorProfile.stats.totalOrders) *
                                    100
                                  ).toFixed(2),
                                )}
                                %
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Order success rate
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recent Activity */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="py-6">
                      <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>
                          {isCreator
                            ? "Latest orders from customers"
                            : "Your recent purchases"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {recentOrders.length > 0 ? (
                          <div className="space-y-4">
                            {recentOrders.map((order) => (
                              <div
                                key={order.id}
                                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                              >
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">
                                    Order #{order.id.slice(0, 8)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(
                                      order.createdAt,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">
                                    ₹{order.totalAmount}
                                  </p>
                                  <Badge variant="outline" className="mt-1">
                                    {order.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              className="w-full"
                              asChild
                            >
                              <Link href="/orders">View All Orders</Link>
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-sm text-muted-foreground mb-4">
                              {isCreator
                                ? "No orders received yet"
                                : "You haven't placed any orders yet"}
                            </p>
                            <Button asChild>
                              <Link
                                href={
                                  isCreator
                                    ? "/dashboard/products"
                                    : "/products"
                                }
                              >
                                {isCreator ? "List Products" : "Start Shopping"}
                              </Link>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="py-6">
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                          Common tasks and shortcuts
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {isCreator ? (
                            <>
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                asChild
                              >
                                <Link href="/dashboard/products/new">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add New Product
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                asChild
                              >
                                <Link href="/dashboard/orders">
                                  <Package className="mr-2 h-4 w-4" />
                                  Manage Orders
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                asChild
                              >
                                <Link href="/dashboard/analytics">
                                  <TrendingUp className="mr-2 h-4 w-4" />
                                  View Analytics
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                asChild
                              >
                                <Link href="/dashboard/reviews">
                                  <Star className="mr-2 h-4 w-4" />
                                  Review Management
                                </Link>
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                asChild
                              >
                                <Link href="/orders">
                                  <ShoppingBag className="mr-2 h-4 w-4" />
                                  View Order History
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                asChild
                              >
                                <Link href="/wishlist">
                                  <Heart className="mr-2 h-4 w-4" />
                                  My Favorites
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                asChild
                              >
                                <Link href="/cart">
                                  <Bookmark className="mr-2 h-4 w-4" />
                                  Saved Items
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                asChild
                              >
                                <Link href="/products">
                                  <Search className="mr-2 h-4 w-4" />
                                  Browse Products
                                </Link>
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Account Information */}
                  <Card className="py-6">
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>
                        Your account details and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Email Address
                            </p>
                            <p className="text-sm">{user.email}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Account Type
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant={isCreator ? "default" : "secondary"}
                              >
                                {isCreator ? "Creator" : "Customer"}
                              </Badge>
                              {isCreator && creatorProfile?.isVerified && (
                                <Badge variant="outline" className="bg-blue-50">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Member Since
                            </p>
                            <p className="text-sm">
                              {new Date(user.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>

                        {isCreator && creatorProfile && (
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Shop Category
                              </p>
                              <p className="text-sm">
                                {creatorProfile.category}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Location
                              </p>
                              <p className="text-sm">
                                {creatorProfile.location}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Shop Status
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant={
                                    creatorProfile.isFeatured
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {creatorProfile.isFeatured
                                    ? "Featured"
                                    : "Active"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preferences */}
                  <Card className="py-6">
                    <CardHeader>
                      <CardTitle>Notifications & Preferences</CardTitle>
                      <CardDescription>
                        Manage your communication preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">
                              Email Notifications
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Receive updates about orders and account activity
                            </p>
                          </div>
                          <Badge
                            variant={
                              user?.preferences?.notifications
                                ? "default"
                                : "secondary"
                            }
                          >
                            {user?.preferences?.notifications
                              ? "Enabled"
                              : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">
                              Marketing Emails
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Get updates about new products and promotions
                            </p>
                          </div>
                          <Badge
                            variant={
                              user?.preferences?.marketing
                                ? "default"
                                : "secondary"
                            }
                          >
                            {user?.preferences?.marketing
                              ? "Enabled"
                              : "Disabled"}
                          </Badge>
                        </div>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/profile?tab=settings">
                            Manage Preferences
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="py-8">
                {isCreator ? (
                  <Tabs defaultValue="received">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="received">
                        Reviews Received ({creatorProfile?.stats?.totalReviews})
                      </TabsTrigger>
                      <TabsTrigger value="products">
                        Product Reviews ({statistics.reviews})
                      </TabsTrigger>
                      <TabsTrigger value="written">Reviews Written</TabsTrigger>
                    </TabsList>

                    <TabsContent value="received">
                      <CreatorReviewsList
                        creatorId={creatorProfile?.id || ""}
                      />
                    </TabsContent>

                    <TabsContent value="products">
                      <ProductReviewsList
                        creatorId={creatorProfile?.id || ""}
                      />
                    </TabsContent>

                    <TabsContent value="written">
                      <UserWrittenReviews userId={user.id} />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <UserWrittenReviews userId={user.id} />
                )}
              </TabsContent>

              <TabsContent value="settings" className="py-8">
                <Card className="py-6">
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Update your personal information and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Personal Information Form */}
                    <Form {...personalInfoForm}>
                      <form
                        onSubmit={personalInfoForm.handleSubmit(
                          onPersonalInfoSubmit,
                        )}
                        className="space-y-6"
                      >
                        <div>
                          <h3 className="font-medium mb-3">
                            Personal Information
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={personalInfoForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={personalInfoForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={personalInfoForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input type="email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={personalInfoForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone (Optional)</FormLabel>
                                  <FormControl>
                                    <Input type="tel" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button type="submit" className="mt-4">
                            Save Personal Information
                          </Button>
                        </div>
                      </form>
                    </Form>

                    <Separator />

                    {/* Address Form */}
                    <Form {...addressForm}>
                      <form
                        onSubmit={addressForm.handleSubmit(onAddressSubmit)}
                        className="space-y-6"
                      >
                        <div>
                          <h3 className="font-medium mb-3">Shipping Address</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={addressForm.control}
                              name="street"
                              render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                  <FormLabel>Street</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={addressForm.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={addressForm.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={addressForm.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={addressForm.control}
                              name="zipCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>ZIP Code</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button type="submit" className="mt-4">
                            Save Address
                          </Button>
                        </div>
                      </form>
                    </Form>

                    <Separator />

                    {/* Payment Methods */}
                    <div>
                      <h3 className="font-medium mb-3">Payment Methods</h3>
                      <div className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center">
                          <CreditCard className="h-6 w-6 mr-3 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Visa ending in 1234</p>
                            <CardDescription>Expires 12/2025</CardDescription>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                      <Button variant="outline" className="mt-4">
                        Add Payment Method
                      </Button>
                    </div>

                    <Separator />

                    {/* Danger Zone */}
                    <div>
                      <h3 className="font-medium mb-3 text-destructive">
                        Danger Zone
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Button
                          variant="outline"
                          className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                        <CardDescription>
                          Once you delete your account, there is no going back.
                          Please be certain.
                        </CardDescription>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Become a Creator Section (if not already and not currently applying) */}
          {!isCreator &&
            user.creatorStatus === "not-applied" &&
            !isApplying && (
              <Card className="bg-primary-50 border-primary-100 py-6">
                <CardHeader>
                  <CardTitle>Become a Creator</CardTitle>
                  <CardDescription>
                    Start selling your handmade products on our platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div>
                      <p className="mb-4">
                        Join our community of artisans and start selling your
                        unique creations. As a creator, you&apos;ll get:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Access to thousands of potential customers</li>
                        <li>Secure payment processing</li>
                        <li>Marketing and promotional support</li>
                        <li>Simple 15% commission on sales</li>
                      </ul>
                      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-amber-800 text-sm">
                          <strong>Note:</strong> All creators and products go
                          through a screening process to maintain our quality
                          standards.
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <Button size="lg" onClick={startApplication}>
                        Apply to Become a Creator
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        Application process takes about 10-15 minutes
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </main>
    </div>
  );
}
