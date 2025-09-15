"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Shield,
  Eye,
  User,
  Cookie,
  Lock,
  Mail,
  Trash2,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types
interface PrivacySection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface OpenSections {
  [key: string]: boolean;
}

// Privacy sections data
const privacySections: PrivacySection[] = [
  {
    id: "introduction",
    title: "Introduction",
    icon: <Shield className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p>
          At Kyzat, we are committed to protecting your privacy
          and ensuring the security of your personal information. This Privacy
          Policy explains how we collect, use, disclose, and safeguard your
          information when you use our platform.
        </p>
        <p>
          By accessing or using Kyzat, you consent to the
          practices described in this Privacy Policy. We encourage you to read
          this policy carefully to understand our views and practices regarding
          your personal data.
        </p>
        <p className="font-semibold">Last Updated: July 12, 2023</p>
      </div>
    ),
  },
  {
    id: "data-collection",
    title: "Information We Collect",
    icon: <Eye className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <h3 className="font-semibold">Personal Information</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Account information (name, email, password)</li>
          <li>Contact information (shipping address, phone number)</li>
          <li>
            Payment information (processed securely through our payment
            partners)
          </li>
          <li>Communication preferences</li>
        </ul>

        <h3 className="font-semibold">Usage Information</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Device information (IP address, browser type, device type)</li>
          <li>Usage data (pages visited, features used, time spent)</li>
          <li>Cookies and similar tracking technologies</li>
          <li>Transaction history and preferences</li>
        </ul>

        <h3 className="font-semibold">Content Information</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Product listings and descriptions</li>
          <li>Reviews and ratings</li>
          <li>Messages between buyers and creators</li>
          <li>Profile information and photos</li>
        </ul>
      </div>
    ),
  },
  {
    id: "data-use",
    title: "How We Use Your Information",
    icon: <User className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <h3 className="font-semibold">Primary Uses</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send order confirmations</li>
          <li>Facilitate communication between buyers and creators</li>
          <li>Personalize your experience and recommendations</li>
          <li>Provide customer support and respond to inquiries</li>
        </ul>

        <h3 className="font-semibold">Marketing and Communications</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Send promotional emails (with your consent)</li>
          <li>Notify you about new features and products</li>
          <li>Conduct surveys and gather feedback</li>
          <li>Show relevant advertisements</li>
        </ul>

        <h3 className="font-semibold">Legal and Security</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Protect against fraud and unauthorized transactions</li>
          <li>Comply with legal obligations</li>
          <li>Enforce our terms and policies</li>
          <li>Protect the rights and safety of our community</li>
        </ul>
      </div>
    ),
  },
  {
    id: "data-sharing",
    title: "Information Sharing",
    icon: <Cookie className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <h3 className="font-semibold">With Your Consent</h3>
        <p>
          We may share your information with third parties when we have your
          explicit consent to do so.
        </p>

        <h3 className="font-semibold">Service Providers</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Payment processors (Stripe, PayPal)</li>
          <li>Shipping and fulfillment partners</li>
          <li>Cloud storage and hosting providers</li>
          <li>Customer support platforms</li>
          <li>Marketing and analytics services</li>
        </ul>

        <h3 className="font-semibold">Legal Requirements</h3>
        <p>
          We may disclose information if required by law, court order, or
          governmental authority, or when we believe disclosure is necessary to
          protect our rights or the rights of others.
        </p>

        <h3 className="font-semibold">Business Transfers</h3>
        <p>
          In the event of a merger, acquisition, or sale of all or a portion of
          our assets, your information may be transferred as part of that
          transaction.
        </p>

        <Alert
          variant="default"
          className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/50 dark:border-amber-800/50 dark:text-amber-400"
        >
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>
            We never sell your personal information to third parties for their
            marketing purposes without your explicit consent.
          </AlertDescription>
        </Alert>
      </div>
    ),
  },
  {
    id: "data-protection",
    title: "Data Security",
    icon: <Lock className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <h3 className="font-semibold">Security Measures</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>SSL encryption for all data transmissions</li>
          <li>Secure storage with industry-standard protections</li>
          <li>Regular security audits and vulnerability testing</li>
          <li>Access controls and authentication protocols</li>
          <li>Employee training on data protection</li>
        </ul>

        <h3 className="font-semibold">Payment Security</h3>
        <p>
          We use PCI-DSS compliant payment processors and never store your
          complete payment information on our servers. All payment transactions
          are encrypted.
        </p>

        <h3 className="font-semibold">Data Retention</h3>
        <p>
          We retain your personal information only for as long as necessary to
          fulfill the purposes outlined in this policy, unless a longer
          retention period is required or permitted by law.
        </p>

        <Alert
          variant="default"
          className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/50 dark:border-blue-800/50 dark:text-blue-400"
        >
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            While we implement strong security measures, no method of
            transmission over the Internet or electronic storage is 100% secure.
            We strive to use commercially acceptable means to protect your
            information but cannot guarantee absolute security.
          </AlertDescription>
        </Alert>
      </div>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights & Choices",
    icon: <Mail className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <h3 className="font-semibold">Access and Control</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Access and review your personal information</li>
          <li>Update or correct inaccurate information</li>
          <li>Request deletion of your personal data</li>
          <li>Export your data in a portable format</li>
          <li>Object to or restrict certain processing activities</li>
        </ul>

        <h3 className="font-semibold">Communication Preferences</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Opt-out of marketing communications</li>
          <li>Adjust notification settings in your account</li>
          <li>Manage email subscription preferences</li>
        </ul>

        <h3 className="font-semibold">Cookies and Tracking</h3>
        <p>
          You can control cookies through your browser settings. However,
          disabling cookies may affect your ability to use certain features of
          our platform.
        </p>

        <h3 className="font-semibold">Exercising Your Rights</h3>
        <p>
          To exercise any of these rights, please contact us at
          privacy@kyzat.com. We will respond to your request
          within 30 days.
        </p>
      </div>
    ),
  },
  {
    id: "cookies",
    title: "Cookies & Tracking",
    icon: <Cookie className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <h3 className="font-semibold">Types of Cookies We Use</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>
            <strong>Essential Cookies:</strong> Required for basic site
            functionality and security
          </li>
          <li>
            <strong>Preference Cookies:</strong> Remember your settings and
            preferences
          </li>
          <li>
            <strong>Analytics Cookies:</strong> Help us understand how visitors
            interact with our site
          </li>
          <li>
            <strong>Marketing Cookies:</strong> Used to deliver relevant
            advertisements
          </li>
        </ul>

        <h3 className="font-semibold">Third-Party Services</h3>
        <p>
          We use services like Google Analytics to help analyze how users use
          the site. These services may use cookies to collect information about
          your use of our platform.
        </p>

        <h3 className="font-semibold">Managing Cookies</h3>
        <p>
          Most web browsers allow you to control cookies through their settings
          preferences. However, limiting cookies may affect your user
          experience.
        </p>

        <Card className="bg-muted">
          <CardContent className="py-6">
            <h4 className="font-semibold mb-2">Cookie Preferences</h4>
            <CardDescription className="mb-3">
              You can manage your cookie preferences through our cookie consent
              banner or your browser settings.
            </CardDescription>
            <Button variant="outline" size="sm">
              Manage Cookie Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    ),
  },
  {
    id: "children",
    title: "Children's Privacy",
    icon: <User className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p>
          Our platform is not intended for children under the age of 16. We do
          not knowingly collect personal information from children under 16.
        </p>
        <p>
          If you believe we have collected information from a child under 16,
          please contact us immediately at privacy@kyzat.com, and
          we will take steps to remove that information from our systems.
        </p>
        <Alert
          variant="default"
          className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/50 dark:border-amber-800/50 dark:text-amber-400"
        >
          <AlertTitle>For Parents and Guardians</AlertTitle>
          <AlertDescription>
            We encourage you to monitor your children&apos;s online activities and
            help enforce this policy by instructing your children never to
            provide personal information without your permission.
          </AlertDescription>
        </Alert>
      </div>
    ),
  },
  {
    id: "changes",
    title: "Policy Changes",
    icon: <Trash2 className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p>
          We may update this Privacy Policy from time to time to reflect changes
          in our practices or for other operational, legal, or regulatory
          reasons.
        </p>
        <p>
          When we make changes, we will update the &quot;Last Updated&quot; date at the
          beginning of this policy. For significant changes, we will provide
          more prominent notice, such as sending an email notification or
          displaying a notice on our platform.
        </p>
        <p>
          We encourage you to review this policy periodically to stay informed
          about how we are protecting your information.
        </p>
        <Alert
          variant="default"
          className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/50 dark:border-blue-800/50 dark:text-blue-400"
        >
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Your continued use of our platform after any changes to this Privacy
            Policy constitutes your acceptance of the updated policy.
          </AlertDescription>
        </Alert>
      </div>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    icon: <Mail className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p>
          If you have any questions, concerns, or requests regarding this
          Privacy Policy or our data practices, please contact us:
        </p>

        <Card className="bg-muted">
          <CardContent className="py-6">
            <h4 className="font-semibold mb-2">
              Kyzat Privacy Team
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Email:</strong> privacy@kyzat.com
              </li>
              <li>
                <strong>Mail:</strong> 123 Privacy Lane, Data Protection Office,
                Creative City, CC 12345
              </li>
              <li>
                <strong>Response Time:</strong> We aim to respond to all privacy
                inquiries within 30 days
              </li>
            </ul>
          </CardContent>
        </Card>

        <p>
          For general customer service inquiries, please use our
          <Link href="/contact" className="text-primary hover:underline mx-1">
            contact form
          </Link>
          or email support@kyzat.com.
        </p>

        <Alert
          variant="default"
          className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-800/50 dark:text-green-400"
        >
          <AlertTitle>Data Protection Officer</AlertTitle>
          <AlertDescription>
            If you need to contact our Data Protection Officer specifically,
            please email dpo@kyzat.com.
          </AlertDescription>
        </Alert>
      </div>
    ),
  },
];

// Reusable Section Component
const PrivacySectionItem = ({
  section,
  isOpen,
  onToggle,
}: {
  section: PrivacySection;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <Card id={section.id}>
    <CardContent className="py-6">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
        aria-expanded={isOpen}
        aria-controls={`${section.id}-content`}
      >
        <div className="flex items-center">
          <span className="text-primary mr-3">{section.icon}</span>
          <h2 className="text-xl font-semibold">{section.title}</h2>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      <div
        id={`${section.id}-content`}
        className={`mt-4 prose prose-primary max-w-none ${
          isOpen ? "block" : "hidden"
        }`}
      >
        {section.content}
      </div>
    </CardContent>
  </Card>
);

export default function PrivacyPage() {
  const [openSections, setOpenSections] = useState<OpenSections>({});

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setOpenSections((prev) => ({ ...prev, [sectionId]: true }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
            <CardDescription className="text-lg">
              How we protect and use your information
            </CardDescription>
          </div>

          <div className="bg-blue-50  border border-blue-200 rounded-lg p-4 mb-8 dark:bg-blue-900/50 dark:border-blue-800/50 dark:text-blue-400">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-3 dark:text-white" />
              <p className="text-blue-800 dark:text-white">
                <strong>Last Updated:</strong> July 12, 2023
              </p>
            </div>
          </div>

          {/* Quick Navigation */}
          <Card className="mb-8 py-6">
            <CardHeader>
              <CardTitle>Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {privacySections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="text-left text-sm text-primary hover:text-primary/80 hover:underline p-2"
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Privacy Sections */}
          <div className="space-y-4">
            {privacySections.map((section) => (
              <PrivacySectionItem
                key={section.id}
                section={section}
                isOpen={!!openSections[section.id]}
                onToggle={() => toggleSection(section.id)}
              />
            ))}
          </div>

          {/* Download Section */}
          <Card className="mt-8 py-6">
            <CardHeader>
              <CardTitle>Download Privacy Policy</CardTitle>
              <CardDescription>
                You can download a copy of our Privacy Policy for your records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF Version
              </Button>
            </CardContent>
          </Card>

          {/* Support Section */}
          <Card className="bg-primary-50 border-primary-100 mt-12 py-6">
            <CardHeader className="text-center">
              <CardTitle>Questions About Your Privacy?</CardTitle>
              <CardDescription>
                Our privacy team is here to help you understand your rights and
                how we protect your information.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href="mailto:privacy@kyzat.com">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Privacy Team
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import {
//   Shield,
//   Eye,
//   User,
//   Cookie,
//   Lock,
//   Mail,
//   Trash2,
//   Download,
//   ChevronDown,
//   ChevronUp
// } from "lucide-react";

// // Types
// interface PrivacySection {
//   id: string;
//   title: string;
//   icon: React.ReactNode;
//   content: React.ReactNode;
// }

// interface OpenSections {
//   [key: string]: boolean;
// }

// export default function PrivacyPage() {
//   const [openSections, setOpenSections] = useState({});

//   const toggleSection = (section) => {
//     setOpenSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   };

//   const privacySections: PrivacySection[] = [
//     {
//       id: "introduction",
//       title: "Introduction",
//       icon: <Shield className="h-5 w-5" />,
//       content: (
//         <div className="space-y-4">
//           <p>
//             At Kyzat, we are committed to protecting your privacy and ensuring the security
//             of your personal information. This Privacy Policy explains how we collect, use, disclose, and
//             safeguard your information when you use our platform.
//           </p>
//           <p>
//             By accessing or using Kyzat, you consent to the practices described in this
//             Privacy Policy. We encourage you to read this policy carefully to understand our views and
//             practices regarding your personal data.
//           </p>
//           <p className="font-semibold">
//             Last Updated: July 12, 2023
//           </p>
//         </div>
//       )
//     },
//     {
//       id: "data-collection",
//       title: "Information We Collect",
//       icon: <Eye className="h-5 w-5" />,
//       content: (
//         <div className="space-y-4">
//           <h3 className="font-semibold">Personal Information</h3>
//           <ul className="list-disc list-inside space-y-2 ml-4">
//             <li>Account information (name, email, password)</li>
//             <li>Contact information (shipping address, phone number)</li>
//             <li>Payment information (processed securely through our payment partners)</li>
//             <li>Communication preferences</li>
//           </ul>

//           <h3 className="font-semibold">Usage Information</h3>
//           <ul className="list-disc list-inside space-y-2 ml-4">
//             <li>Device information (IP address, browser type, device type)</li>
//             <li>Usage data (pages visited, features used, time spent)</li>
//             <li>Cookies and similar tracking technologies</li>
//             <li>Transaction history and preferences</li>
//           </ul>

//           <h3 className="font-semibold">Content Information</h3>
//           <ul className="list-disc list-inside space-y-2 ml-4">
//             <li>Product listings and descriptions</li>
//             <li>Reviews and ratings</li>
//             <li>Messages between buyers and creators</li>
//             <li>Profile information and photos</li>
//           </ul>
//         </div>
//       )
//     },
//     {
//       id: "data-use",
//       title: "How We Use Your Information",
//       icon: <User className="h-5 w-5" />,
//       content: (
//         <div className="space-y-4">
//           <h3 className="font-semibold">Primary Uses</h3>
//           <ul className="list-disc list-inside space-y-2 ml-4">
//             <li>Provide, maintain, and improve our services</li>
//             <li>Process transactions and send order confirmations</li>
//             <li>Facilitate communication between buyers and creators</li>
//             <li>Personalize your experience and recommendations</li>
//             <li>Provide customer support and respond to inquiries</li>
//           </ul>

//           <h3 className="font-semibold">Marketing and Communications</h3>
//           <ul className="list-disc list-inside space-y-2 ml-4">
//             <li>Send promotional emails (with your consent)</li>
//             <li>Notify you about new features and products</li>
//             <li>Conduct surveys and gather feedback</li>
//             <li>Show relevant advertisements</li>
//           </ul>

//           <h3 className="font-semibold">Legal and Security</h3>
//           <ul className="list-disc list-inside space-y-2 ml-4">
//             <li>Protect against fraud and unauthorized transactions</li>
//             <li>Comply with legal obligations</li>
//             <li>Enforce our terms and policies</li>
//             <li>Protect the rights and safety of our community</li>
//           </ul>
//         </div>
//       )
//     },
//     {
//       id: "data-sharing",
//       title: "Information Sharing",
//       icon: <Cookie className="h-5 w-5" />,
//       content: (
//         <div className="space-y-4">
//           <h3 className="font-semibold">With Your Consent</h3>
//           <p>We may share your information with third parties when we have your explicit consent to do so.</p>

//           <h3 className="font-semibold">Service Providers</h3>
//           <ul className="list-disc list-inside space-y-2 ml-4">
//             <li>Payment processors (Stripe, PayPal)</li>
//             <li>Shipping and fulfillment partners</li>
//             <li>Cloud storage and hosting providers</li>
//             <li>Customer support platforms</li>
//             <li>Marketing and analytics services</li>
//           </ul>

//           <h3 className="font-semibold">Legal Requirements</h3>
//           <p>
//             We may disclose information if required by law, court order, or governmental authority,
//             or when we believe disclosure is necessary to protect our rights or the rights of others.
//           </p>

//           <h3 className="font-semibold">Business Transfers</h3>
//           <p>
//             In the event of a merger, acquisition, or sale of all or a portion of our assets,
//             your information may be transferred as part of that transaction.
//           </p>

//           <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
//             <p className="text-amber-800 text-sm">
//               <strong>Note:</strong> We never sell your personal information to third parties for their
//               marketing purposes without your explicit consent.
//             </p>
//           </div>
//         </div>
//       )
//     },
//     {
//       id: "data-protection",
//       title: "Data Security",
//       icon: <Lock className="h-5 w-5" />,
//       content: (
//         <div className="space-y-4">
//           <h3 className="font-semibold">Security Measures</h3>
//           <ul className="list-disc list-inside space-y-2 ml-4">
//             <li>SSL encryption for all data transmissions</li>
//             <li>Secure storage with industry-standard protections</li>
//             <li>Regular security audits and vulnerability testing</li>
//             <li>Access controls and authentication protocols</li>
//             <li>Employee training on data protection</li>
//           </ul>

//           <h3 className="font-semibold">Payment Security</h3>
//           <p>
//             We use PCI-DSS compliant payment processors and never store your complete payment
//             information on our servers. All payment transactions are encrypted.
//           </p>

//           <h3 className="font-semibold">Data Retention</h3>
//           <p>
//             We retain your personal information only for as long as necessary to fulfill the purposes
//             outlined in this policy, unless a longer retention period is required or permitted by law.
//           </p>

//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//             <p className="text-blue-800 text-sm">
//               <strong>While we implement strong security measures, no method of transmission over the
//               Internet or electronic storage is 100% secure. We strive to use commercially acceptable
//               means to protect your information but cannot guarantee absolute security.</strong>
//             </p>
//           </div>
//         </div>
//       )
//     },
//     {
//       id: "your-rights",
//       title: "Your Rights & Choices",
//       icon: <Mail className="h-5 w-5" />,
//       content: (
//         <div className="space-y-4">
//           <h3 className="font-semibold">Access and Control</h3>
//           <ul className="list-disc list-inside space-y-2 ml-4">
//             <li>Access and review your personal information</li>
//             <li>Update or correct inaccurate information</li>
//             <li>Request deletion of your personal data</li>
//             <li>Export your data in a portable format</li>
//             <li>Object to or restrict certain processing activities</li>
//           </ul>

//           <h3 className="font-semibold">Communication Preferences</h3>
//           <ul className="list-disc list-inside space-y-2 ml-4">
//             <li>Opt-out of marketing communications</li>
//             <li>Adjust notification settings in your account</li>
//             <li>Manage email subscription preferences</li>
//           </ul>

//           <h3 className="font-semibold">Cookies and Tracking</h3>
//           <p>
//             You can control cookies through your browser settings. However, disabling cookies may
//             affect your ability to use certain features of our platform.
//           </p>

//           <h3 className="font-semibold">Exercising Your Rights</h3>
//           <p>
//             To exercise any of these rights, please contact us at privacy@localartisanconnect.com.
//             We will respond to your request within 30 days.
//           </p>
//         </div>
//       )
//     },
//     {
//       id: "cookies",
//       title: "Cookies & Tracking",
//       icon: <Cookie className="h-5 w-5" />,
//       content: (
//         <div className="space-y-4">
//           <h3 className="font-semibold">Types of Cookies We Use</h3>
//           <ul className="list-disc list-inside space-y-2 ml-4">
//             <li>
//               <strong>Essential Cookies:</strong> Required for basic site functionality and security
//             </li>
//             <li>
//               <strong>Preference Cookies:</strong> Remember your settings and preferences
//             </li>
//             <li>
//               <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our site
//             </li>
//             <li>
//               <strong>Marketing Cookies:</strong> Used to deliver relevant advertisements
//             </li>
//           </ul>

//           <h3 className="font-semibold">Third-Party Services</h3>
//           <p>
//             We use services like Google Analytics to help analyze how users use the site. These
//             services may use cookies to collect information about your use of our platform.
//           </p>

//           <h3 className="font-semibold">Managing Cookies</h3>
//           <p>
//             Most web browsers allow you to control cookies through their settings preferences.
//             However, limiting cookies may affect your user experience.
//           </p>

//           <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//             <h4 className="font-semibold mb-2">Cookie Preferences</h4>
//             <p className="text-sm text-muted-foreground mb-3">
//               You can manage your cookie preferences through our cookie consent banner or your browser settings.
//             </p>
//             <Button variant="outline" size="sm">
//               Manage Cookie Preferences
//             </Button>
//           </div>
//         </div>
//       )
//     },
//     {
//       id: "children",
//       title: "Children's Privacy",
//       icon: <User className="h-5 w-5" />,
//       content: (
//         <div className="space-y-4">
//           <p>
//             Our platform is not intended for children under the age of 16. We do not knowingly
//             collect personal information from children under 16.
//           </p>
//           <p>
//             If you believe we have collected information from a child under 16, please contact us
//             immediately at privacy@localartisanconnect.com, and we will take steps to remove
//             that information from our systems.
//           </p>
//           <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
//             <p className="text-amber-800 text-sm">
//               <strong>Parents and guardians:</strong> We encourage you to monitor your children's
//               online activities and help enforce this policy by instructing your children never to
//               provide personal information without your permission.
//             </p>
//           </div>
//         </div>
//       )
//     },
//     {
//       id: "changes",
//       title: "Policy Changes",
//       icon: <Trash2 className="h-5 w-5" />,
//       content: (
//         <div className="space-y-4">
//           <p>
//             We may update this Privacy Policy from time to time to reflect changes in our practices
//             or for other operational, legal, or regulatory reasons.
//           </p>
//           <p>
//             When we make changes, we will update the "Last Updated" date at the beginning of this
//             policy. For significant changes, we will provide more prominent notice, such as
//             sending an email notification or displaying a notice on our platform.
//           </p>
//           <p>
//             We encourage you to review this policy periodically to stay informed about how we
//             are protecting your information.
//           </p>
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//             <p className="text-blue-800 text-sm">
//               <strong>Your continued use of our platform after any changes to this Privacy Policy
//               constitutes your acceptance of the updated policy.</strong>
//             </p>
//           </div>
//         </div>
//       )
//     },
//     {
//       id: "contact",
//       title: "Contact Us",
//       icon: <Mail className="h-5 w-5" />,
//       content: (
//         <div className="space-y-4">
//           <p>
//             If you have any questions, concerns, or requests regarding this Privacy Policy or our
//             data practices, please contact us:
//           </p>

//           <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//             <h4 className="font-semibold mb-2">Kyzat Privacy Team</h4>
//             <ul className="space-y-2 text-sm">
//               <li>
//                 <strong>Email:</strong> privacy@localartisanconnect.com
//               </li>
//               <li>
//                 <strong>Mail:</strong> 123 Privacy Lane, Data Protection Office, Creative City, CC 12345
//               </li>
//               <li>
//                 <strong>Response Time:</strong> We aim to respond to all privacy inquiries within 30 days
//               </li>
//             </ul>
//           </div>

//           <p>
//             For general customer service inquiries, please use our
//             <Link href="/contact" className="text-primary hover:underline mx-1">
//               contact form
//             </Link>
//             or email support@localartisanconnect.com.
//           </p>

//           <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//             <p className="text-green-800 text-sm">
//               <strong>Data Protection Officer:</strong> If you need to contact our Data Protection
//               Officer specifically, please email dpo@localartisanconnect.com.
//             </p>
//           </div>
//         </div>
//       )
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-background">
//       <main className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           {/* Header */}
//           <div className="text-center mb-12">
//             <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
//             <p className="text-muted-foreground">
//               How we protect and use your information
//             </p>
//           </div>

//           {/* Last Updated */}
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
//             <div className="flex items-center">
//               <Shield className="h-5 w-5 text-blue-600 mr-3" />
//               <p className="text-blue-800">
//                 <strong>Last Updated:</strong> July 12, 2023
//               </p>
//             </div>
//           </div>

//           {/* Quick Navigation */}
//           <div className="bg-card rounded-lg border p-6 mb-8">
//             <h2 className="font-semibold mb-4">Quick Navigation</h2>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//               {privacySections.map((section) => (
//                 <button
//                   key={section.id}
//                   onClick={() => {
//                     document.getElementById(section.id).scrollIntoView({ behavior: 'smooth' });
//                   }}
//                   className="text-left text-sm text-primary hover:text-primary-800 hover:underline p-2"
//                 >
//                   {section.title}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Privacy Sections */}
//           <div className="space-y-4">
//             {privacySections.map((section) => (
//               <div key={section.id} id={section.id} className="bg-card rounded-lg border p-6">
//                 <button
//                   onClick={() => toggleSection(section.id)}
//                   className="flex items-center justify-between w-full text-left"
//                 >
//                   <div className="flex items-center">
//                     <span className="text-primary mr-3">{section.icon}</span>
//                     <h2 className="text-xl font-semibold">{section.title}</h2>
//                   </div>
//                   {openSections[section.id] ? (
//                     <ChevronUp className="h-5 w-5 text-muted-foreground" />
//                   ) : (
//                     <ChevronDown className="h-5 w-5 text-muted-foreground" />
//                   )}
//                 </button>

//                 <div className={`mt-4 prose prose-primary max-w-none ${openSections[section.id] ? 'block' : 'hidden'}`}>
//                   {section.content}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Download Section */}
//           <div className="bg-card rounded-lg border p-6 mt-8">
//             <h2 className="text-xl font-semibold mb-4">Download Privacy Policy</h2>
//             <p className="text-muted-foreground mb-4">
//               You can download a copy of our Privacy Policy for your records.
//             </p>
//             <Button variant="outline">
//               <Download className="h-4 w-4 mr-2" />
//               Download PDF Version
//             </Button>
//           </div>

//           {/* Support Section */}
//           <div className="bg-primary-50 rounded-lg p-8 mt-12 text-center">
//             <h2 className="text-2xl font-bold mb-4">Questions About Your Privacy?</h2>
//             <p className="text-muted-foreground mb-6">
//               Our privacy team is here to help you understand your rights and how we protect your information.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Button asChild>
//                 <a href="mailto:privacy@localartisanconnect.com">
//                   <Mail className="h-4 w-4 mr-2" />
//                   Email Privacy Team
//                 </a>
//               </Button>
//               <Button variant="outline" asChild>
//                 <Link href="/contact">
//                   Contact Support
//                 </Link>
//               </Button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
