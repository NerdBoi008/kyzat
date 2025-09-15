"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Users,
  Heart,
  Sparkles,
  TrendingUp,
  MapPin,
  Clock,
  BookOpen,
  Award,
  Mail,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  IndianRupee,
} from "lucide-react";
import Link from "next/link";
import { JobPosition } from "@/lib/db/schema/index";

const openJobs: JobPosition[] = [
  {
    id: "3e7106fb-17fe-4a8d-b848-725ed3a26379",
    createdAt: new Date(),
    updatedAt: new Date(),
    title: "Senior Frontend Developer",
    department: "Engineering",
    type: "Full-time",
    location: "Remote",
    experience: "Senior",
    description:
      "Help us build beautiful, responsive interfaces for our growing community of creators and shoppers.",
    responsibilities: [
      "Develop and maintain our React/Next.js frontend",
      "Implement responsive UI components with Tailwind CSS",
      "Collaborate with design and product teams",
      "Mentor junior developers and conduct code reviews",
    ],
    requirements: [
      "5+ years of frontend development experience",
      "Expert knowledge of React, Next.js, and TypeScript",
      "Experience with modern CSS frameworks",
      "Strong understanding of web performance optimization",
    ],
    isActive: true,
  },
  {
    id: "58c768f3-d81d-4498-b7e9-01b47f19eb1d",
    createdAt: new Date(),
    updatedAt: new Date(),
    title: "Product Designer",
    department: "Design",
    type: "Full-time",
    location: "Remote",
    experience: "Mid-level",
    description:
      "Shape the future of our platform with user-centered design that delights our community.",
    responsibilities: [
      "Create user flows, wireframes, and prototypes",
      "Design beautiful, intuitive interfaces",
      "Conduct user research and usability testing",
      "Collaborate with engineering on implementation",
    ],
    requirements: [
      "3+ years of product design experience",
      "Strong portfolio showcasing UX/UI work",
      "Proficiency in Figma and design systems",
      "Experience with user research methodologies",
    ],
    isActive: true,
  },
  {
    id: "62440459-d1ae-42b5-a275-60edd07795c2",
    createdAt: new Date(),
    updatedAt: new Date(),
    title: "Community Manager",
    department: "Community",
    type: "Full-time",
    location: "Remote",
    experience: "Mid-level",
    description:
      "Build and nurture our community of creators, fostering engagement and support.",
    responsibilities: [
      "Manage social media channels and online communities",
      "Create engaging content and campaigns",
      "Support creators and resolve community issues",
      "Gather and share community feedback",
    ],
    requirements: [
      "3+ years of community management experience",
      "Excellent communication and interpersonal skills",
      "Experience with social media and community platforms",
      "Passion for supporting creative entrepreneurs",
    ],
    isActive: true,
  },
  {
    id: "959a7939-a3c2-4e49-b5d2-df08cfdea9ab",
    createdAt: new Date(),
    updatedAt: new Date(),
    title: "DevOps Engineer",
    department: "Engineering",
    type: "Full-time",
    location: "Remote",
    experience: "Mid-level",
    description:
      "Build and maintain our cloud infrastructure to ensure reliability and scalability.",
    responsibilities: [
      "Manage AWS infrastructure and services",
      "Implement CI/CD pipelines",
      "Monitor system performance and reliability",
      "Ensure security best practices",
    ],
    requirements: [
      "3+ years of DevOps or infrastructure experience",
      "Strong knowledge of AWS and Docker",
      "Experience with infrastructure as code",
      "Knowledge of security best practices",
    ],
    isActive: true,
  },
];

interface CompanyValue {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface OpenPositionsState {
  [key: string]: boolean;
}

export default function CareersPage() {
  const [openPositions, setOpenPositions] = useState<OpenPositionsState>({});

  const togglePosition = (id: string) => {
    setOpenPositions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const companyValues: CompanyValue[] = [
    {
      icon: <Heart className="h-6 w-6 md:h-8 md:w-8 text-primary" />,
      title: "Passion for Craft",
      description: "We celebrate and support artisans and their crafts",
    },
    {
      icon: <Users className="h-6 w-6 md:h-8 md:w-8 text-primary" />,
      title: "Community First",
      description: "We build with and for our community of creators",
    },
    {
      icon: <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary" />,
      title: "Innovation",
      description: "We embrace creative solutions and new ideas",
    },
    {
      icon: <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-primary" />,
      title: "Growth Mindset",
      description: "We learn, adapt, and grow together",
    },
  ];

  const benefits: Benefit[] = [
    {
      icon: <IndianRupee className="h-5 w-5 md:h-6 md:w-6 text-green-600" />,
      title: "Competitive Compensation",
      description: "Salary, equity, and performance bonuses",
    },
    {
      icon: <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />,
      title: "Learning & Development",
      description: "Annual stipend for courses and conferences",
    },
    {
      icon: <Clock className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />,
      title: "Flexible Work",
      description: "Remote-friendly with flexible hours",
    },
    {
      icon: <Award className="h-5 w-5 md:h-6 md:w-6 text-amber-600" />,
      title: "Health & Wellness",
      description: "Comprehensive health insurance and wellness programs",
    },
  ];

  const scrollToPositions = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Join Our Mission
          </h1>
          <p className="text-muted-foreground text-lg">
            Help us build the best platform for creators and artisans worldwide
          </p>
        </div>

        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-primary to-purple-700 text-primary-foreground border-0 mb-8 md:mb-12">
          <CardContent className="p-6 md:p-8">
            <div className="max-w-3xl mx-auto text-center">
              <CardTitle className="text-2xl md:text-3xl font-bold mb-4 text-white">
                Build the Future of Creative Commerce
              </CardTitle>
              <p className="text-primary-foreground/90 mb-6">
                At Kyzat, we&apos;re empowering creators to turn their passion
                into sustainable businesses. Join us in building tools that help
                artisans thrive in the digital economy.
              </p>
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-background/90"
                onClick={() => scrollToPositions("open-positions")}
              >
                View Open Positions
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Company Values */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {companyValues.map((value, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex justify-center mb-3 md:mb-4">
                    {value.icon}
                  </div>
                  <h3 className="font-semibold mb-2 text-base md:text-lg">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <Card className="bg-muted/50 border-0 mb-12 md:mb-16">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
              Why Join Us?
            </h2>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 md:mb-6">
                  Perks & Benefits
                </h3>
                <div className="space-y-4 md:space-y-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 mr-3 md:mr-4 mt-0.5">
                        {benefit.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 text-sm md:text-base">
                          {benefit.title}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 md:mb-6">
                  Our Culture
                </h3>
                <div className="space-y-3 md:space-y-4">
                  <p className="text-muted-foreground text-sm md:text-base">
                    We&apos;re a fully remote team that values autonomy, trust,
                    and results. We believe in working smart, not just hard, and
                    we prioritize work-life balance.
                  </p>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Our team is passionate about supporting the creator economy.
                    We regularly feature team members&apos; projects and
                    encourage creative pursuits outside of work.
                  </p>
                  <p className="text-muted-foreground text-sm md:text-base">
                    We&apos;re building a diverse and inclusive workplace where
                    everyone can bring their whole self to work and do their
                    best work.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Open Positions */}
        {openJobs.length > 0 ? (
          <div id="open-positions" className="mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
              Open Positions
            </h2>
            <p className="text-muted-foreground mb-6 md:mb-8">
              We&apos;re always looking for talented individuals to join our
              team. Check out our current openings below.
            </p>

            <div className="space-y-4">
              {openJobs.map((job) => (
                <Card
                  key={job.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 md:p-6">
                    <button
                      onClick={() => togglePosition(job.id)}
                      className="flex items-center justify-between w-full text-left"
                      aria-expanded={openPositions[job.id]}
                      aria-controls={`job-content-${job.id}`}
                    >
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold mb-2">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 md:gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            {job.location}
                          </span>
                          <span>{job.type}</span>
                          <span>{job.experience} Level</span>
                          <span>{job.department}</span>
                        </div>
                      </div>
                      {openPositions[job.id] ? (
                        <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                      )}
                    </button>

                    {openPositions[job.id] && (
                      <div
                        id={`job-content-${job.id}`}
                        className="mt-4 md:mt-6 space-y-4 md:space-y-6"
                      >
                        <div>
                          <h4 className="font-semibold mb-2 md:mb-3">
                            About the Role
                          </h4>
                          <p className="text-muted-foreground text-sm md:text-base">
                            {job.description}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 md:mb-3">
                            Responsibilities
                          </h4>
                          <ul className="list-disc list-inside space-y-1 md:space-y-2 text-muted-foreground text-sm md:text-base ml-2">
                            {job.responsibilities?.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 md:mb-3">
                            Requirements
                          </h4>
                          <ul className="list-disc list-inside space-y-1 md:space-y-2 text-muted-foreground text-sm md:text-base ml-2">
                            {job.requirements?.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <Button asChild className="w-full md:w-auto">
                          <a
                            href={`mailto:careers@kyzat.com?subject=Application for ${encodeURIComponent(
                              job.title
                            )}`}
                          >
                            Apply Now
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-12 md:mb-16" id="open-positions">
            <div className="bg-muted/40 rounded-2xl p-8 md:p-12 text-center shadow-sm">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                🚀 Open Positions
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                We&apos;re not hiring right now, but we&apos;re always looking
                for passionate people to join our journey. Stay tuned for future
                opportunities!
              </p>

              <div className="flex justify-center">
                <Button className="px-6 py-3 rounded-xl">
                  Notify Me When Hiring
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-5">
                Follow us on{" "}
                <a href="#" className="underline hover:text-primary">
                  LinkedIn
                </a>{" "}
                or{" "}
                <a href="#" className="underline hover:text-primary">
                  Twitter
                </a>{" "}
                for updates.
              </p>

              <div className="mt-3">
                <span className="text-sm text-muted-foreground">or</span>
                <p className="text-sm mt-2">
                  Send us a general application{" "}
                  <Link
                    href="#general-application"
                    className="underline hover:text-primary inline-flex items-center"
                    onClick={() => scrollToPositions("general-application")}
                  >
                    here <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </p>
              </div>
            </div>

            {/* Future roles oppuritinty */}
            <div id="future-roles" className="mt-16">
              <h3 className="text-xl md:text-2xl font-semibold mb-6 text-center">
                Roles We Often Hire For
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Frontend Developer",
                  "UX/UI Designer",
                  "Product Manager",
                  "Data Analyst",
                  "Content Creator",
                  "Customer Support Specialist",
                ].map((role, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <h4 className="font-medium">{role}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Check back for future opportunities in this area
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Interview Process */}
        <Card className="mb-12 md:mb-16">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Our Hiring Process
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center text-white dark:text-background mx-auto mb-3 md:mb-4">
                    <span className="font-bold text-sm md:text-base">
                      {step}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">
                    {step === 1 && "Application Review"}
                    {step === 2 && "Initial Call"}
                    {step === 3 && "Skills Assessment"}
                    {step === 4 && "Team Interviews"}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    {step === 1 &&
                      "We review your application within 3-5 business days"}
                    {step === 2 &&
                      "30-minute video call to discuss experience and opportunity"}
                    {step === 3 &&
                      "Practical exercise or technical interview based on role"}
                    {step === 4 && "Meet the team and discuss collaboration"}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-6 md:mt-8">
              <p className="text-muted-foreground text-sm md:text-base">
                Typical process takes 2-3 weeks from application to offer
              </p>
            </div>
          </CardContent>
        </Card>

        {/* General Application */}
        <Card className="mb-12 md:mb-16" id="general-application">
          <CardContent className="p-6 md:p-8" >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Don&apos;t See the Perfect Role?
            </h2>
            <p className="text-muted-foreground mb-4 md:mb-6">
              We&apos;re always interested in meeting talented people who share
              our passion for supporting creators. If you don&apos;t see a
              current opening that matches your skills, we&apos;d still love to
              hear from you.
            </p>
            <Button asChild variant="outline" className="w-full md:w-auto">
              <a href="mailto:careers@kyzat.com?subject=General Application">
                <Mail className="h-4 w-4 mr-2" />
                Send General Application
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Final CTA */}
        <Card className="bg-gradient-to-r from-primary to-purple-700 text-primary-foreground border-0">
          <CardContent className="p-6 md:p-8 lg:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
              Ready to Build With Us?
            </h2>
            <p className="text-primary-foreground/90 mb-6 md:mb-8 max-w-2xl mx-auto">
              Join our mission to empower creators and build a platform that
              makes creative entrepreneurship accessible to everyone.
            </p>
            <Button
              size="lg"
              className="bg-background text-foreground hover:bg-background/90"
              onClick={() => scrollToPositions("open-positions")}
            >
              View Open Positions
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
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
// import {
//   Users,
//   Heart,
//   Sparkles,
//   TrendingUp,
//   MapPin,
//   Clock,
//   DollarSign,
//   BookOpen,
//   Award,
//   Mail,
//   ArrowRight,
//   ChevronDown,
//   ChevronUp
// } from "lucide-react";
// import { JobPosition } from "@/lib/types";

// export default function CareersPage() {
//   const [openPositions, setOpenPositions] = useState({});

//   const togglePosition = (id: number) => {
//     setOpenPositions(prev => ({
//       ...prev,
//       [id]: !prev[id]
//     }));
//   };

//   const companyValues = [
//     {
//       icon: <Heart className="h-8 w-8 text-primary" />,
//       title: "Passion for Craft",
//       description: "We celebrate and support artisans and their crafts"
//     },
//     {
//       icon: <Users className="h-8 w-8 text-primary" />,
//       title: "Community First",
//       description: "We build with and for our community of creators"
//     },
//     {
//       icon: <Sparkles className="h-8 w-8 text-primary" />,
//       title: "Innovation",
//       description: "We embrace creative solutions and new ideas"
//     },
//     {
//       icon: <TrendingUp className="h-8 w-8 text-primary" />,
//       title: "Growth Mindset",
//       description: "We learn, adapt, and grow together"
//     }
//   ];

//   const benefits = [
//     {
//       icon: <DollarSign className="h-6 w-6 text-green-600" />,
//       title: "Competitive Compensation",
//       description: "Salary, equity, and performance bonuses"
//     },
//     {
//       icon: <BookOpen className="h-6 w-6 text-blue-600" />,
//       title: "Learning & Development",
//       description: "Annual stipend for courses and conferences"
//     },
//     {
//       icon: <Clock className="h-6 w-6 text-purple-600" />,
//       title: "Flexible Work",
//       description: "Remote-friendly with flexible hours"
//     },
//     {
//       icon: <Award className="h-6 w-6 text-amber-600" />,
//       title: "Health & Wellness",
//       description: "Comprehensive health insurance and wellness programs"
//     }
//   ];

//   const openJobs: JobPosition[] = [
//     {
//       id: "1",
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       title: "Senior Frontend Developer",
//       department: "Engineering",
//       type: "Full-time",
//       location: "Remote",
//       experience: "Senior",
//       description: "Help us build beautiful, responsive interfaces for our growing community of creators and shoppers.",
//       responsibilities: [
//         "Develop and maintain our React/Next.js frontend",
//         "Implement responsive UI components with Tailwind CSS",
//         "Collaborate with design and product teams",
//         "Mentor junior developers and conduct code reviews"
//       ],
//       requirements: [
//         "5+ years of frontend development experience",
//         "Expert knowledge of React, Next.js, and TypeScript",
//         "Experience with modern CSS frameworks",
//         "Strong understanding of web performance optimization"
//       ]
//     },
//     {
//       id: "2",
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       title: "Product Designer",
//       department: "Design",
//       type: "Full-time",
//       location: "Remote",
//       experience: "Mid-level",
//       description: "Shape the future of our platform with user-centered design that delights our community.",
//       responsibilities: [
//         "Create user flows, wireframes, and prototypes",
//         "Design beautiful, intuitive interfaces",
//         "Conduct user research and usability testing",
//         "Collaborate with engineering on implementation"
//       ],
//       requirements: [
//         "3+ years of product design experience",
//         "Strong portfolio showcasing UX/UI work",
//         "Proficiency in Figma and design systems",
//         "Experience with user research methodologies"
//       ]
//     },
//     {
//       id: "3",
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       title: "Community Manager",
//       department: "Community",
//       type: "Full-time",
//       location: "Remote",
//       experience: "Mid-level",
//       description: "Build and nurture our community of creators, fostering engagement and support.",
//       responsibilities: [
//         "Manage social media channels and online communities",
//         "Create engaging content and campaigns",
//         "Support creators and resolve community issues",
//         "Gather and share community feedback"
//       ],
//       requirements: [
//         "3+ years of community management experience",
//         "Excellent communication and interpersonal skills",
//         "Experience with social media and community platforms",
//         "Passion for supporting creative entrepreneurs"
//       ]
//     },
//     {
//       id: "4",
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       title: "DevOps Engineer",
//       department: "Engineering",
//       type: "Full-time",
//       location: "Remote",
//       experience: "Mid-level",
//       description: "Build and maintain our cloud infrastructure to ensure reliability and scalability.",
//       responsibilities: [
//         "Manage AWS infrastructure and services",
//         "Implement CI/CD pipelines",
//         "Monitor system performance and reliability",
//         "Ensure security best practices"
//       ],
//       requirements: [
//         "3+ years of DevOps or infrastructure experience",
//         "Strong knowledge of AWS and Docker",
//         "Experience with infrastructure as code",
//         "Knowledge of security best practices"
//       ]
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-background">
//       <main className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-3xl font-bold mb-4">Join Our Mission</h1>
//           <p className="text-muted-foreground text-lg">
//             Help us build the best platform for creators and artisans worldwide
//           </p>
//         </div>

//         {/* Hero Section */}
//         <div className="bg-gradient-to-r from-primary to-purple-700 text-white rounded-xl p-8 mb-12">
//           <div className="max-w-3xl mx-auto text-center">
//             <h2 className="text-2xl font-bold mb-4">Build the Future of Creative Commerce</h2>
//             <p className="text-primary-100 mb-6">
//               At Kyzat, we&apos;re empowering creators to turn their passion into sustainable
//               businesses. Join us in building tools that help artisans thrive in the digital economy.
//             </p>
//             <Button
//               size="lg"
//               className="bg-white text-primary-700 hover:bg-gray-100"
//               onClick={() => document.getElementById("open-positions").scrollIntoView()}
//             >
//               View Open Positions
//               <ArrowRight className="h-5 w-5 ml-2" />
//             </Button>
//           </div>
//         </div>

//         {/* Company Values */}
//         <div className="mb-16">
//           <h2 className="text-2xl font-bold text-center mb-12">Our Values</h2>
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {companyValues.map((value, index) => (
//               <div key={index} className="bg-card rounded-lg border p-6 text-center">
//                 <div className="flex justify-center mb-4">
//                   {value.icon}
//                 </div>
//                 <h3 className="font-semibold mb-2">{value.title}</h3>
//                 <p className="text-muted-foreground text-sm">{value.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Benefits */}
//         <div className="bg-primary-50 rounded-xl p-8 mb-16">
//           <h2 className="text-2xl font-bold text-center mb-12">Why Join Us?</h2>

//           <div className="grid md:grid-cols-2 gap-8">
//             <div>
//               <h3 className="text-xl font-semibold mb-6">Perks & Benefits</h3>
//               <div className="space-y-6">
//                 {benefits.map((benefit, index) => (
//                   <div key={index} className="flex items-start">
//                     <div className="flex-shrink-0 mr-4 mt-1">
//                       {benefit.icon}
//                     </div>
//                     <div>
//                       <h4 className="font-semibold mb-1">{benefit.title}</h4>
//                       <p className="text-muted-foreground">{benefit.description}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <h3 className="text-xl font-semibold mb-6">Our Culture</h3>
//               <div className="space-y-4">
//                 <p className="text-muted-foreground">
//                   We&apos;re a fully remote team that values autonomy, trust, and results. We believe in
//                   working smart, not just hard, and we prioritize work-life balance.
//                 </p>
//                 <p className="text-muted-foreground">
//                   Our team is passionate about supporting the creator economy. We regularly feature
//                   team members&apos; projects and encourage creative pursuits outside of work.
//                 </p>
//                 <p className="text-muted-foreground">
//                   We&apos;re building a diverse and inclusive workplace where everyone can bring their
//                   whole self to work and do their best work.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Open Positions */}
//         <div id="open-positions" className="mb-16">
//           <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
//           <p className="text-muted-foreground mb-8">
//             We&apos;re always looking for talented individuals to join our team. Check out our current openings below.
//           </p>

//           <div className="space-y-4">
//             {openJobs.map((job) => (
//               <div key={job.id} className="bg-card rounded-lg border p-6">
//                 <button
//                   onClick={() => togglePosition(job.id)}
//                   className="flex items-center justify-between w-full text-left"
//                 >
//                   <div>
//                     <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
//                     <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
//                       <span className="flex items-center">
//                         <MapPin className="h-4 w-4 mr-1" />
//                         {job.location}
//                       </span>
//                       <span>{job.type}</span>
//                       <span>{job.experience} Level</span>
//                       <span>{job.department}</span>
//                     </div>
//                   </div>
//                   {openPositions[job.id] ? (
//                     <ChevronUp className="h-5 w-5 text-muted-foreground" />
//                   ) : (
//                     <ChevronDown className="h-5 w-5 text-muted-foreground" />
//                   )}
//                 </button>

//                 {openPositions[job.id] && (
//                   <div className="mt-6 space-y-6">
//                     <div>
//                       <h4 className="font-semibold mb-3">About the Role</h4>
//                       <p className="text-muted-foreground">{job.description}</p>
//                     </div>

//                     <div>
//                       <h4 className="font-semibold mb-3">Responsibilities</h4>
//                       <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
//                         {job.responsibilities.map((item, index) => (
//                           <li key={index}>{item}</li>
//                         ))}
//                       </ul>
//                     </div>

//                     <div>
//                       <h4 className="font-semibold mb-3">Requirements</h4>
//                       <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
//                         {job.requirements.map((item, index) => (
//                           <li key={index}>{item}</li>
//                         ))}
//                       </ul>
//                     </div>

//                     <Button asChild>
//                       <a href={`mailto:careers@localartisanconnect.com?subject=Application for ${job.title}`}>
//                         Apply Now
//                       </a>
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Interview Process */}
//         <div className="bg-card rounded-xl border p-8 mb-16">
//           <h2 className="text-2xl font-bold mb-6">Our Hiring Process</h2>

//           <div className="grid md:grid-cols-4 gap-8">
//             <div className="text-center">
//               <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mx-auto mb-4">
//                 <span className="font-bold">1</span>
//               </div>
//               <h3 className="font-semibold mb-2">Application Review</h3>
//               <p className="text-muted-foreground text-sm">
//                 We review your application and portfolio within 3-5 business days
//               </p>
//             </div>

//             <div className="text-center">
//               <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mx-auto mb-4">
//                 <span className="font-bold">2</span>
//               </div>
//               <h3 className="font-semibold mb-2">Initial Call</h3>
//               <p className="text-muted-foreground text-sm">
//                 30-minute video call to discuss your experience and our opportunity
//               </p>
//             </div>

//             <div className="text-center">
//               <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mx-auto mb-4">
//                 <span className="font-bold">3</span>
//               </div>
//               <h3 className="font-semibold mb-2">Skills Assessment</h3>
//               <p className="text-muted-foreground text-sm">
//                 Practical exercise or technical interview based on the role
//               </p>
//             </div>

//             <div className="text-center">
//               <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mx-auto mb-4">
//                 <span className="font-bold">4</span>
//               </div>
//               <h3 className="font-semibold mb-2">Team Interviews</h3>
//               <p className="text-muted-foreground text-sm">
//                 Meet the team and discuss how you&apos;d collaborate together
//               </p>
//             </div>
//           </div>

//           <div className="text-center mt-8">
//             <p className="text-muted-foreground">
//               Typical process takes 2-3 weeks from application to offer
//             </p>
//           </div>
//         </div>

//         {/* General Application */}
//         <div className="bg-card rounded-xl border p-8 mb-16">
//           <h2 className="text-2xl font-bold mb-4">Don&apos;t See the Perfect Role?</h2>
//           <p className="text-muted-foreground mb-6">
//             We&apos;re always interested in meeting talented people who share our passion for supporting creators.
//             If you don&apos;t see a current opening that matches your skills, we&apos;d still love to hear from you.
//           </p>
//           <Button asChild variant="outline">
//             <a href="mailto:careers@localartisanconnect.com?subject=General Application">
//               <Mail className="h-4 w-4 mr-2" />
//               Send General Application
//             </a>
//           </Button>
//         </div>

//         {/* Final CTA */}
//         <div className="bg-gradient-to-r from-primary to-purple-700 text-white rounded-xl p-12 text-center">
//           <h2 className="text-2xl font-bold mb-4">Ready to Build With Us?</h2>
//           <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
//             Join our mission to empower creators and build a platform that makes creative entrepreneurship
//             accessible to everyone.
//           </p>
//           <Button
//             size="lg"
//             className="bg-white text-primary-700 hover:bg-gray-100"
//             onClick={() => document.getElementById("open-positions").scrollIntoView()}
//           >
//             View Open Positions
//             <ArrowRight className="h-5 w-5 ml-2" />
//           </Button>
//         </div>
//       </main>
//     </div>
//   );
// }
