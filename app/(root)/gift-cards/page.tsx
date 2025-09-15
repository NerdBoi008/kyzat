"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Gift,
  CreditCard,
  Calendar,
  Sparkles,
  Star,
  Heart,
  ArrowRight,
  Shield,
  Truck,
  CheckCircle,
} from "lucide-react";

// shadcn/ui components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Types
interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface Testimonial {
  rating: number;
  content: string;
  author: string;
}

// Form validation schema
const giftCardSchema = z.object({
  amount: z
    .number()
    .min(10, "Minimum amount is ₹10")
    .max(500, "Maximum amount is ₹500"),
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientEmail: z.string().email("Invalid email address"),
  senderName: z.string().min(1, "Your name is required"),
  message: z.string().optional(),
  deliveryDate: z.string().optional(),
});

type GiftCardFormData = z.infer<typeof giftCardSchema>;

// Sample data
const features: Feature[] = [
  {
    icon: <Sparkles className="h-6 w-6 text-primary" />,
    title: "Instant Delivery",
    description: "Digital gift cards delivered immediately via email",
  },
  {
    icon: <Heart className="h-6 w-6 text-primary" />,
    title: "Perfect for Any Occasion",
    description: "Birthdays, holidays, thank yous, or just because",
  },
  {
    icon: <Truck className="h-6 w-6 text-primary" />,
    title: "No Shipping Fees",
    description: "Digital delivery means no waiting and no extra costs",
  },
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: "Secure & Reliable",
    description: "Protected by our security guarantee",
  },
];

const faqs: FAQ[] = [
  {
    question: "How do digital gift cards work?",
    answer:
      "After purchase, the recipient receives an email with a unique gift card code. They can enter this code at checkout to apply the balance to their order.",
  },
  {
    question: "Can I schedule delivery for a specific date?",
    answer:
      "Yes! You can choose to have the gift card delivered immediately or schedule it for a future date like a birthday or holiday.",
  },
  {
    question: "Do gift cards expire?",
    answer:
      "Our gift cards never expire. The recipient can use them whenever they're ready to shop.",
  },
  {
    question: "Can gift cards be used with other promotions?",
    answer:
      "Yes, gift cards can be combined with most other offers and promotions on our platform.",
  },
];

const testimonials: Testimonial[] = [
  {
    rating: 5,
    content:
      "The perfect solution when I don't know what to get someone. Everyone loves choosing their own handmade treasures!",
    author: "Sarah M.",
  },
  {
    rating: 5,
    content:
      "I scheduled gift cards for all my holiday shopping in advance. So convenient and the recipients loved them!",
    author: "Michael T.",
  },
  {
    rating: 5,
    content:
      "Received one as a gift and discovered amazing creators I wouldn't have found otherwise. Now I give them too!",
    author: "Jessica L.",
  },
];

const presetAmounts = [25, 50, 100, 150, 200];

// Reusable components
const FeatureCard = ({ feature }: { feature: Feature }) => (
  <Card className="text-center py-6">
    <CardContent>
      <div className="flex justify-center mb-4">{feature.icon}</div>
      <h3 className="font-semibold mb-2">{feature.title}</h3>
      <CardDescription>{feature.description}</CardDescription>
    </CardContent>
  </Card>
);

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
  <Card>
    <CardContent className="pt-6 py-6">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-amber-500 fill-current" />
        ))}
      </div>
      <CardDescription className="mb-4">{testimonial.content}</CardDescription>
      <p className="font-semibold">{testimonial.author}</p>
    </CardContent>
  </Card>
);

const FAQItem = ({ faq }: { faq: FAQ }) => (
  <div>
    <h3 className="font-semibold mb-2">{faq.question}</h3>
    <CardDescription>{faq.answer}</CardDescription>
  </div>
);

const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => (
  <div className="mb-8">
    <div className="flex justify-between mb-2">
      {[...Array(totalSteps)].map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= i + 1
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}
          </div>
          <span className="text-sm mt-2">
            {i === 0 && "Amount"}
            {i === 1 && "Recipient"}
            {i === 2 && "Review"}
          </span>
        </div>
      ))}
    </div>
    <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
  </div>
);

export default function GiftCardsPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [isCustomAmount, setIsCustomAmount] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    control,
  } = useForm<GiftCardFormData>({
    resolver: zodResolver(giftCardSchema),
    defaultValues: {
      amount: 50,
      recipientName: "",
      recipientEmail: "",
      senderName: "",
      message: "",
      deliveryDate: "",
    },
  });

  const watchAmount = useWatch({
    control,
    name: "amount",
  });

  const recipientName = useWatch({
    control,
    name: "recipientName",
  });

  const recipientEmail = useWatch({
    control,
    name: "recipientEmail",
  });

  const senderName = useWatch({
    control,
    name: "senderName",
  });

  const deliveryDate = useWatch({
    control,
    name: "deliveryDate",
  });

  const message = useWatch({
    control,
    name: "message",
  });

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleAmountSelect = (amount: number) => {
    setValue("amount", amount);
    setSelectedAmount(amount);
    setIsCustomAmount(false);
  };

  const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const amount = value ? parseFloat(value) : 0;
    setValue("amount", amount);
    setSelectedAmount(amount);
    setIsCustomAmount(true);
  };

  const onSubmit = (data: GiftCardFormData) => {
    // In a real application, this would process the gift card purchase
    alert("Gift card purchase would be processed here!");
    console.log(data);
    setCurrentStep(1);
  };

  const scrollToForm = () => {
    document
      .getElementById("gift-card-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Gift Cards</h1>
          <CardDescription className="text-lg">
            The perfect gift for anyone who loves handmade, unique products
          </CardDescription>
        </div>

        {/* Hero Section */}
        <Card className="bg-linear-to-r from-primary to-purple-700 text-white border-0 mb-12 text-center py-6">
          <CardHeader>
            <div className="flex justify-center mb-6">
              <Gift className="h-12 w-12 text-amber-400" />
            </div>
            <CardTitle className="text-2xl text-white mb-4">
              Give the Gift of Creativity
            </CardTitle>
            <CardDescription className="text-white">
              Let your loved ones choose exactly what they want from hundreds of
              independent creators and unique handmade products.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              className="bg-white font-semibold text-primary dark:text-background hover:bg-gray-100"
              onClick={scrollToForm}
            >
              Send a Gift Card
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>

        {/* Gift Card Form */}
        <Card id="gift-card-form" className="mb-16 py-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="h-6 w-6 mr-3 text-primary" />
              Create Your Gift Card
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StepIndicator currentStep={currentStep} totalSteps={3} />

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Amount Selection */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Choose Amount</h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {presetAmounts.map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant={
                          selectedAmount === preset && !isCustomAmount
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handleAmountSelect(preset)}
                        className="h-auto py-4"
                      >
                        <span className="font-bold">₹{preset}</span>
                      </Button>
                    ))}

                    <Button
                      type="button"
                      variant={isCustomAmount ? "default" : "outline"}
                      onClick={() => setIsCustomAmount(true)}
                      className="h-auto py-4"
                    >
                      <span className="font-bold">Custom</span>
                    </Button>
                  </div>

                  {isCustomAmount && (
                    <div className="mb-6">
                      <Label htmlFor="custom-amount">
                        Enter custom amount (₹10 - ₹500)
                      </Label>
                      <div className="relative mt-2">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                          ₹
                        </span>
                        <Input
                          id="custom-amount"
                          type="number"
                          min="10"
                          max="500"
                          {...register("amount", { valueAsNumber: true })}
                          onChange={handleCustomAmount}
                          className="pl-8"
                          placeholder="Enter amount"
                        />
                      </div>
                      {errors.amount && (
                        <p className="text-destructive text-sm mt-2">
                          {errors.amount.message}
                        </p>
                      )}
                    </div>
                  )}

                  <Alert>
                    <CheckCircle className="h-5 w-5" />
                    <AlertTitle>Note</AlertTitle>
                    <AlertDescription>
                      Gift cards never expire and can be used toward any
                      purchase on our platform.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Step 2: Recipient Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Recipient Details
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="recipient-name">Recipient Name *</Label>
                      <Input
                        id="recipient-name"
                        {...register("recipientName")}
                        className="mt-2"
                        placeholder="Full name"
                      />
                      {errors.recipientName && (
                        <p className="text-destructive text-sm mt-2">
                          {errors.recipientName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="recipient-email">Recipient Email *</Label>
                      <Input
                        id="recipient-email"
                        type="email"
                        {...register("recipientEmail")}
                        className="mt-2"
                        placeholder="email@example.com"
                      />
                      {errors.recipientEmail && (
                        <p className="text-destructive text-sm mt-2">
                          {errors.recipientEmail.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sender-name">Your Name *</Label>
                    <Input
                      id="sender-name"
                      {...register("senderName")}
                      className="mt-2"
                      placeholder="Full name"
                    />
                    {errors.senderName && (
                      <p className="text-destructive text-sm mt-2">
                        {errors.senderName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message">Personal Message (Optional)</Label>
                    <Textarea
                      id="message"
                      {...register("message")}
                      className="mt-2"
                      rows={3}
                      placeholder="Add a personal message to your gift card..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="delivery-date">Delivery Date</Label>
                    <div className="flex items-center mt-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                      <Input
                        id="delivery-date"
                        type="date"
                        {...register("deliveryDate")}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <CardDescription className="mt-2">
                      Leave blank to send immediately
                    </CardDescription>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Payment */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Review Your Gift Card
                  </h3>

                  <Card className="bg-linear-to-br from-primary/10 to-purple-50 border-0">
                    <CardContent className="p-6">
                      <div className="text-center mb-6">
                        <div className="text-3xl font-bold text-primary mb-2">
                          ₹{watchAmount}
                        </div>
                        <CardDescription>Gift Card Amount</CardDescription>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span>To:</span>
                          <span className="font-semibold">{recipientName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span className="font-semibold">
                            {recipientEmail}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>From:</span>
                          <span className="font-semibold">{senderName}</span>
                        </div>
                        {deliveryDate && (
                          <div className="flex justify-between">
                            <span>Delivery Date:</span>
                            <span className="font-semibold">
                              {new Date(deliveryDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {message && (
                        <div className="mt-4 p-4 bg-white rounded-lg border">
                          <CardDescription className="italic">
                            &quot;{message}&quot;
                          </CardDescription>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Alert
                    variant="default"
                    className="bg-amber-50 border-amber-200 text-amber-800"
                  >
                    <CheckCircle className="h-5 w-5 text-amber-600" />
                    <AlertTitle>Note</AlertTitle>
                    <AlertDescription>
                      This is a preview. Your gift card will be beautifully
                      formatted and include instructions for redemption.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={currentStep === 1 && watchAmount < 10}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Complete Purchase
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mb-16 py-6">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {faqs.map((faq, index) => (
              <FAQItem key={index} faq={faq} />
            ))}
          </CardContent>
        </Card>

        {/* Testimonials */}
        <div className="mb-16 py-6">
          <h2 className="text-2xl font-bold mb-8">What People Are Saying</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <Card className="bg-linear-to-r from-primary to-purple-700 text-white border-0 text-center py-6">
          <CardHeader>
            <CardTitle className="text-white">
              Give the Gift of Choice
            </CardTitle>
            <CardDescription className="text-white">
              Let your loved ones choose from hundreds of unique handmade
              products while supporting independent creators and their craft.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              className="bg-white text-primary dark:text-background font-semibold hover:bg-gray-100"
              onClick={scrollToForm}
            >
              Send a Gift Card Today
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Gift,
//   CreditCard,
//   Mail,
//   Calendar,
//   Sparkles,
//   Star,
//   Heart,
//   ArrowRight,
//   Shield,
//   Truck,
//   Clock,
//   CheckCircle
// } from "lucide-react";

// export default function GiftCardsPage() {
//   const [amount, setAmount] = useState(50);
//   const [customAmount, setCustomAmount] = useState("");
//   const [recipientName, setRecipientName] = useState("");
//   const [recipientEmail, setRecipientEmail] = useState("");
//   const [senderName, setSenderName] = useState("");
//   const [message, setMessage] = useState("");
//   const [deliveryDate, setDeliveryDate] = useState("");
//   const [currentStep, setCurrentStep] = useState(1);

//   const presetAmounts = [25, 50, 100, 150, 200];
//   const isCustomAmount = !presetAmounts.includes(amount);

//   const nextStep = () => {
//     setCurrentStep(prev => prev + 1);
//   };

//   const prevStep = () => {
//     setCurrentStep(prev => prev - 1);
//   };

//   const handleAmountSelect = (selectedAmount) => {
//     setAmount(selectedAmount);
//     setCustomAmount("");
//   };

//   const handleCustomAmount = (e) => {
//     const value = e.target.value;
//     setCustomAmount(value);
//     if (value) {
//       setAmount(parseFloat(value));
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // In a real application, this would process the gift card purchase
//     alert("Gift card purchase would be processed here!");
//     setCurrentStep(1);
//   };

//   const features = [
//     {
//       icon: <Sparkles className="h-6 w-6 text-primary" />,
//       title: "Instant Delivery",
//       description: "Digital gift cards delivered immediately via email"
//     },
//     {
//       icon: <Heart className="h-6 w-6 text-primary" />,
//       title: "Perfect for Any Occasion",
//       description: "Birthdays, holidays, thank yous, or just because"
//     },
//     {
//       icon: <Truck className="h-6 w-6 text-primary" />,
//       title: "No Shipping Fees",
//       description: "Digital delivery means no waiting and no extra costs"
//     },
//     {
//       icon: <Shield className="h-6 w-6 text-primary" />,
//       title: "Secure & Reliable",
//       description: "Protected by our security guarantee"
//     }
//   ];

//   const faqs = [
//     {
//       question: "How do digital gift cards work?",
//       answer: "After purchase, the recipient receives an email with a unique gift card code. They can enter this code at checkout to apply the balance to their order."
//     },
//     {
//       question: "Can I schedule delivery for a specific date?",
//       answer: "Yes! You can choose to have the gift card delivered immediately or schedule it for a future date like a birthday or holiday."
//     },
//     {
//       question: "Do gift cards expire?",
//       answer: "Our gift cards never expire. The recipient can use them whenever they're ready to shop."
//     },
//     {
//       question: "Can gift cards be used with other promotions?",
//       answer: "Yes, gift cards can be combined with most other offers and promotions on our platform."
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-background">
//       <main className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-3xl font-bold mb-4">Gift Cards</h1>
//           <p className="text-muted-foreground text-lg">
//             The perfect gift for anyone who loves handmade, unique products
//           </p>
//         </div>

//         {/* Hero Section */}
//         <div className="bg-gradient-to-r from-primary to-purple-700 text-white rounded-xl p-8 mb-12 text-center">
//           <div className="max-w-2xl mx-auto">
//             <div className="flex justify-center mb-6">
//               <Gift className="h-12 w-12 text-amber-400" />
//             </div>
//             <h2 className="text-2xl font-bold mb-4">Give the Gift of Creativity</h2>
//             <p className="text-primary-100 mb-6">
//               Let your loved ones choose exactly what they want from hundreds of independent creators
//               and unique handmade products.
//             </p>
//             <Button
//               size="lg"
//               className="bg-white text-primary-700 hover:bg-gray-100"
//               onClick={() => document.getElementById("gift-card-form").scrollIntoView()}
//             >
//               Send a Gift Card
//               <ArrowRight className="h-5 w-5 ml-2" />
//             </Button>
//           </div>
//         </div>

//         {/* Features Grid */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
//           {features.map((feature, index) => (
//             <div key={index} className="bg-card rounded-lg border p-6 text-center">
//               <div className="flex justify-center mb-4">
//                 {feature.icon}
//               </div>
//               <h3 className="font-semibold mb-2">{feature.title}</h3>
//               <p className="text-muted-foreground text-sm">{feature.description}</p>
//             </div>
//           ))}
//         </div>

//         {/* Gift Card Form */}
//         <div id="gift-card-form" className="bg-card rounded-xl border p-8 mb-16">
//           <h2 className="text-2xl font-bold mb-6 flex items-center">
//             <Gift className="h-6 w-6 mr-3 text-primary" />
//             Create Your Gift Card
//           </h2>

//           {/* Progress Steps */}
//           <div className="flex justify-between mb-8 relative">
//             <div className="absolute top-3 left-0 right-0 h-0.5 bg-muted -z-10"></div>
//             {[1, 2, 3].map(step => (
//               <div key={step} className="flex flex-col items-center">
//                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                   currentStep >= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
//                 }`}>
//                   {step}
//                 </div>
//                 <span className="text-sm mt-2">
//                   {step === 1 && 'Amount'}
//                   {step === 2 && 'Recipient'}
//                   {step === 3 && 'Review'}
//                 </span>
//               </div>
//             ))}
//           </div>

//           <form onSubmit={handleSubmit}>
//             {/* Step 1: Amount Selection */}
//             {currentStep === 1 && (
//               <div className="space-y-6">
//                 <h3 className="text-xl font-semibold mb-4">Choose Amount</h3>

//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
//                   {presetAmounts.map(preset => (
//                     <button
//                       key={preset}
//                       type="button"
//                       onClick={() => handleAmountSelect(preset)}
//                       className={`p-4 border-2 rounded-lg text-center transition-all ${
//                         amount === preset && !isCustomAmount
//                           ? 'border-primary bg-primary-50 text-primary-700'
//                           : 'border-gray-300 hover:border-primary-300'
//                       }`}
//                     >
//                       <div className="font-bold text-lg">${preset}</div>
//                     </button>
//                   ))}

//                   <button
//                     type="button"
//                     onClick={() => setAmount(0)}
//                     className={`p-4 border-2 rounded-lg text-center transition-all ${
//                       isCustomAmount
//                         ? 'border-primary bg-primary-50 text-primaryy-700'
//                         : 'border-gray-300 hover:border-primary-300'
//                     }`}
//                   >
//                     <div className="font-bold text-lg">Custom</div>
//                   </button>
//                 </div>

//                 {isCustomAmount && (
//                   <div className="mb-6">
//                     <label htmlFor="custom-amount" className="block text-sm font-medium mb-2">
//                       Enter custom amount ($10 - $500)
//                     </label>
//                     <div className="relative">
//                       <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                       <Input
//                         id="custom-amount"
//                         type="number"
//                         min="10"
//                         max="500"
//                         value={customAmount}
//                         onChange={handleCustomAmount}
//                         className="pl-8"
//                         placeholder="Enter amount"
//                       />
//                     </div>
//                   </div>
//                 )}

//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                   <div className="flex items-start">
//                     <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
//                     <p className="text-blue-800 text-sm">
//                       Gift cards never expire and can be used toward any purchase on our platform.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Step 2: Recipient Information */}
//             {currentStep === 2 && (
//               <div className="space-y-6">
//                 <h3 className="text-xl font-semibold mb-4">Recipient Details</h3>

//                 <div className="grid md:grid-cols-2 gap-6">
//                   <div>
//                     <label htmlFor="recipient-name" className="block text-sm font-medium mb-2">
//                       Recipient Name *
//                     </label>
//                     <Input
//                       id="recipient-name"
//                       value={recipientName}
//                       onChange={(e) => setRecipientName(e.target.value)}
//                       required
//                       placeholder="Full name"
//                     />
//                   </div>

//                   <div>
//                     <label htmlFor="recipient-email" className="block text-sm font-medium mb-2">
//                       Recipient Email *
//                     </label>
//                     <Input
//                       id="recipient-email"
//                       type="email"
//                       value={recipientEmail}
//                       onChange={(e) => setRecipientEmail(e.target.value)}
//                       required
//                       placeholder="email@example.com"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label htmlFor="sender-name" className="block text-sm font-medium mb-2">
//                     Your Name *
//                   </label>
//                   <Input
//                     id="sender-name"
//                     value={senderName}
//                     onChange={(e) => setSenderName(e.target.value)}
//                     required
//                     placeholder="Full name"
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="message" className="block text-sm font-medium mb-2">
//                     Personal Message (Optional)
//                   </label>
//                   <Textarea
//                     id="message"
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     rows={3}
//                     placeholder="Add a personal message to your gift card..."
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="delivery-date" className="block text-sm font-medium mb-2">
//                     Delivery Date
//                   </label>
//                   <div className="flex items-center">
//                     <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
//                     <Input
//                       id="delivery-date"
//                       type="date"
//                       value={deliveryDate}
//                       onChange={(e) => setDeliveryDate(e.target.value)}
//                       min={new Date().toISOString().split('T')[0]}
//                     />
//                   </div>
//                   <p className="text-sm text-muted-foreground mt-2">
//                     Leave blank to send immediately
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Step 3: Review & Payment */}
//             {currentStep === 3 && (
//               <div className="space-y-6">
//                 <h3 className="text-xl font-semibold mb-4">Review Your Gift Card</h3>

//                 <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl p-6 mb-6">
//                   <div className="text-center mb-6">
//                     <div className="text-3xl font-bold text-primary-700 mb-2">${amount}</div>
//                     <div className="text-muted-foreground">Gift Card Amount</div>
//                   </div>

//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between">
//                       <span>To:</span>
//                       <span className="font-semibold">{recipientName}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Email:</span>
//                       <span className="font-semibold">{recipientEmail}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>From:</span>
//                       <span className="font-semibold">{senderName}</span>
//                     </div>
//                     {deliveryDate && (
//                       <div className="flex justify-between">
//                         <span>Delivery Date:</span>
//                         <span className="font-semibold">
//                           {new Date(deliveryDate).toLocaleDateString()}
//                         </span>
//                       </div>
//                     )}
//                   </div>

//                   {message && (
//                     <div className="mt-4 p-4 bg-white rounded-lg border">
//                       <p className="text-muted-foreground italic">"{message}"</p>
//                     </div>
//                   )}
//                 </div>

//                 <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
//                   <div className="flex items-start">
//                     <CheckCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
//                     <p className="text-amber-800 text-sm">
//                       <strong>Note:</strong> This is a preview. Your gift card will be beautifully formatted
//                       and include instructions for redemption.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Navigation Buttons */}
//             <div className="flex justify-between mt-8">
//               {currentStep > 1 ? (
//                 <Button type="button" variant="outline" onClick={prevStep}>
//                   Back
//                 </Button>
//               ) : (
//                 <div></div>
//               )}

//               {currentStep < 3 ? (
//                 <Button
//                   type="button"
//                   onClick={nextStep}
//                   disabled={currentStep === 1 && amount < 10}
//                 >
//                   Continue
//                   <ArrowRight className="h-4 w-4 ml-2" />
//                 </Button>
//               ) : (
//                 <Button type="submit">
//                   <CreditCard className="h-4 w-4 mr-2" />
//                   Complete Purchase
//                 </Button>
//               )}
//             </div>
//           </form>
//         </div>

//         {/* FAQ Section */}
//         <div className="bg-card rounded-xl border p-8 mb-16">
//           <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>

//           <div className="space-y-6">
//             {faqs.map((faq, index) => (
//               <div key={index}>
//                 <h3 className="font-semibold mb-2">{faq.question}</h3>
//                 <p className="text-muted-foreground">{faq.answer}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Testimonials */}
//         <div className="mb-16">
//           <h2 className="text-2xl font-bold mb-8">What People Are Saying</h2>

//           <div className="grid md:grid-cols-3 gap-6">
//             <div className="bg-muted/30 rounded-lg p-6">
//               <div className="flex mb-4">
//                 {[...Array(5)].map((_, i) => (
//                   <Star key={i} className="h-4 w-4 text-amber-500 fill-current" />
//                 ))}
//               </div>
//               <p className="text-muted-foreground mb-4">
//                 "The perfect solution when I don't know what to get someone. Everyone loves choosing their own handmade treasures!"
//               </p>
//               <p className="font-semibold">— Sarah M.</p>
//             </div>

//             <div className="bg-muted/30 rounded-lg p-6">
//               <div className="flex mb-4">
//                 {[...Array(5)].map((_, i) => (
//                   <Star key={i} className="h-4 w-4 text-amber-500 fill-current" />
//                 ))}
//               </div>
//               <p className="text-muted-foreground mb-4">
//                 "I scheduled gift cards for all my holiday shopping in advance. So convenient and the recipients loved them!"
//               </p>
//               <p className="font-semibold">— Michael T.</p>
//             </div>

//             <div className="bg-muted/30 rounded-lg p-6">
//               <div className="flex mb-4">
//                 {[...Array(5)].map((_, i) => (
//                   <Star key={i} className="h-4 w-4 text-amber-500 fill-current" />
//                 ))}
//               </div>
//               <p className="text-muted-foreground mb-4">
//                 "Received one as a gift and discovered amazing creators I wouldn't have found otherwise. Now I give them too!"
//               </p>
//               <p className="font-semibold">— Jessica L.</p>
//             </div>
//           </div>
//         </div>

//         {/* Final CTA */}
//         <div className="bg-gradient-to-r from-primary to-purple-700 text-white rounded-xl p-12 text-center">
//           <h2 className="text-2xl font-bold mb-4">Give the Gift of Choice</h2>
//           <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
//             Let your loved ones choose from hundreds of unique handmade products while supporting
//             independent creators and their craft.
//           </p>
//           <Button
//             size="lg"
//             className="bg-white text-primary-700 hover:bg-gray-100"
//             onClick={() => document.getElementById("gift-card-form").scrollIntoView()}
//           >
//             Send a Gift Card Today
//           </Button>
//         </div>
//       </main>
//     </div>
//   );
// }
