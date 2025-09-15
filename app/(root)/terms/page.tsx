"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Shield, User, Store, CreditCard, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsOfServicePage() {
  const lastUpdated = "July 12, 2023";

  const tableOfContents = [
    { id: "introduction", title: "Introduction" },
    { id: "definitions", title: "Definitions" },
    { id: "accounts", title: "Accounts & Registration" },
    { id: "user-content", title: "User Content" },
    { id: "transactions", title: "Transactions & Payments" },
    { id: "intellectual-property", title: "Intellectual Property" },
    { id: "prohibited-conduct", title: "Prohibited Conduct" },
    { id: "termination", title: "Termination" },
    { id: "disclaimers", title: "Disclaimers" },
    { id: "limitation-liability", title: "Limitation of Liability" },
    { id: "dispute-resolution", title: "Dispute Resolution" },
    { id: "changes", title: "Changes to Terms" },
    { id: "contact", title: "Contact Information" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-3xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-muted-foreground">
              Last Updated: {lastUpdated}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Table of Contents */}
            <div className="md:col-span-1">
              <Card className="sticky top-24 py-6">
                <CardHeader>
                  <CardTitle className="text-lg">Table of Contents</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    {tableOfContents.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className="block text-left text-sm text-muted-foreground hover:text-primary w-full py-1"
                      >
                        {item.title}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              <Card className="py-6">
                <CardHeader>
                  <CardTitle>Kyzat Terms of Service</CardTitle>
                  <CardDescription>
                    Please read these Terms of Service carefully before using our platform.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Introduction */}
                  <section id="introduction">
                    <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                    <p className="text-muted-foreground mb-4">
                      Welcome to Kyzat! These Terms of Service (&quot;Terms&quot;) govern your access to and use of 
                      Kyzat&apos;s website, services, and applications (collectively, the &quot;Service&quot;). 
                    </p>
                    <p className="text-muted-foreground mb-4">
                      By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy. 
                      If you do not agree to these Terms, you may not access or use our Service.
                    </p>
                    <p className="text-muted-foreground">
                      Our Service connects artisans and creators (&quot;Creators&quot;) with customers (&quot;Customers&quot;) who wish to 
                      purchase handmade, unique products. We provide a platform for transactions but are not a party to 
                      any agreement between Creators and Customers.
                    </p>
                  </section>

                  <Separator />

                  {/* Definitions */}
                  <section id="definitions">
                    <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li><strong>&quot;Service&quot;</strong> refers to the Kyzat website, mobile applications, and related services.</li>
                      <li><strong>&quot;User&quot;</strong> refers to any individual or entity that accesses or uses our Service.</li>
                      <li><strong>&quot;Creator&quot;</strong> refers to Users who list and sell products through our Service.</li>
                      <li><strong>&quot;Customer&quot;</strong> refers to Users who purchase products through our Service.</li>
                      <li><strong>&quot;Content&quot;</strong> refers to text, images, photos, audio, video, and all other forms of data or communication.</li>
                      <li><strong>&quot;User Content&quot;</strong> refers to Content that Users submit or transmit through our Service.</li>
                    </ul>
                  </section>

                  <Separator />

                  {/* Accounts & Registration */}
                  <section id="accounts">
                    <h2 className="text-2xl font-semibold mb-4">3. Accounts & Registration</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        To access certain features of our Service, you must register for an account. When creating an account, 
                        you agree to provide accurate, current, and complete information.
                      </p>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <User className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                          <p className="text-blue-800 text-sm">
                            <strong>Customer Accounts:</strong> Customers must be at least 18 years old or have parental consent to use our Service.
                          </p>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <Store className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                          <p className="text-amber-800 text-sm">
                            <strong>Creator Accounts:</strong> Creators must provide accurate information about their business, products, 
                            and production methods. We may require verification before you can list products for sale.
                          </p>
                        </div>
                      </div>

                      <p>
                        You are responsible for safeguarding your account password and for any activities or actions under your account. 
                        You agree to notify us immediately of any unauthorized use of your account.
                      </p>
                    </div>
                  </section>

                  <Separator />

                  {/* User Content */}
                  <section id="user-content">
                    <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        Our Service allows you to post, link, store, share, and otherwise make available certain information, 
                        text, graphics, videos, or other material (&quot;Content&quot;). You are responsible for the Content that you post 
                        to the Service, including its legality, reliability, and appropriateness.
                      </p>
                      
                      <p>
                        By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, 
                        publicly display, reproduce, and distribute such Content on and through the Service. You retain any and 
                        all of your rights to any Content you submit, post, or display on or through the Service.
                      </p>

                      <p>
                        You represent and warrant that: (i) the Content is yours (you own it) or you have the right to use it and 
                        grant us the rights and license as provided in these Terms, and (ii) the posting of your Content on or 
                        through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights, or 
                        any other rights of any person.
                      </p>
                    </div>
                  </section>

                  <Separator />

                  {/* Transactions & Payments */}
                  <section id="transactions">
                    <h2 className="text-2xl font-semibold mb-4">5. Transactions & Payments</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <CreditCard className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div className="text-blue-800 text-sm">
                            <strong>Payment Processing:</strong> We use third-party payment processors to handle transactions. 
                            By making a purchase, you agree to the payment processor&apos;s terms of service.
                          </div>
                        </div>
                      </div>

                      <p>
                        <strong>Fees:</strong> We charge a commission on sales made through our platform. The current commission 
                        structure is 15% of the sale price. This fee covers payment processing, platform maintenance, and marketing.
                      </p>

                      <p>
                        <strong>Pricing:</strong> Creators are responsible for setting their own prices and ensuring they comply with 
                        any applicable laws and regulations regarding pricing and sales tax collection.
                      </p>

                      <p>
                        <strong>Refunds & Disputes:</strong> We facilitate communication between Creators and Customers regarding 
                        refunds and disputes, but ultimate responsibility for resolving issues lies with the Creator. We may intervene 
                        in cases of policy violations or fraudulent activity.
                      </p>

                      <p>
                        <strong>Sales Tax:</strong> Creators are responsible for collecting and remitting any applicable sales tax 
                        unless we explicitly agree to handle tax collection on your behalf for specific jurisdictions.
                      </p>
                    </div>
                  </section>

                  <Separator />

                  {/* Intellectual Property */}
                  <section id="intellectual-property">
                    <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        The Service and its original content, features, and functionality are and will remain the exclusive property 
                        of Kyzat and its licensors. The Service is protected by copyright, trademark, and other laws 
                        of both the United States and foreign countries.
                      </p>

                      <p>
                        Our trademarks and trade dress may not be used in connection with any product or service without the prior 
                        written consent of Kyzat.
                      </p>

                      <p>
                        Creators retain all intellectual property rights in their original designs and products. By listing items 
                        on our platform, Creators grant Kyzat a non-exclusive, worldwide, royalty-free license to 
                        use, display, and distribute images and information about their products for marketing and operational purposes.
                      </p>
                    </div>
                  </section>

                  <Separator />

                  {/* Prohibited Conduct */}
                  <section id="prohibited-conduct">
                    <h2 className="text-2xl font-semibold mb-4">7. Prohibited Conduct</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>You agree not to:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Violate any laws or regulations through use of our Service</li>
                        <li>Infringe upon the intellectual property rights of others</li>
                        <li>Post false, inaccurate, misleading, or deceptive content</li>
                        <li>Distribute spam or unsolicited commercial communications</li>
                        <li>Impersonate any person or entity</li>
                        <li>Interfere with or disrupt the Service or servers</li>
                        <li>Attempt to bypass any security or access control measures</li>
                        <li>Sell products that are illegal, hazardous, or violate our policies</li>
                        <li>Engage in fraudulent or deceptive practices</li>
                        <li>Harass, abuse, or harm other users</li>
                      </ul>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <Shield className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div className="text-red-800 text-sm">
                            <strong>Prohibited Items:</strong> The following items are strictly prohibited from being sold on our platform: 
                            weapons, drugs, alcohol, tobacco, live animals, human remains, hazardous materials, and items that promote hate speech or violence.
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  {/* Termination */}
                  <section id="termination">
                    <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        We may terminate or suspend your account immediately, without prior notice or liability, for any reason 
                        whatsoever, including without limitation if you breach the Terms.
                      </p>

                      <p>
                        Upon termination, your right to use the Service will immediately cease. If you wish to terminate your 
                        account, you may simply discontinue using the Service or contact us to delete your account.
                      </p>

                      <p>
                        All provisions of the Terms which by their nature should survive termination shall survive termination, 
                        including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                      </p>
                    </div>
                  </section>

                  <Separator />

                  {/* Disclaimers */}
                  <section id="disclaimers">
                    <h2 className="text-2xl font-semibold mb-4">9. Disclaimers</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        Your use of the Service is at your sole risk. The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. 
                        The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, 
                        implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
                      </p>

                      <p>
                        Kyzat does not guarantee the quality, safety, or legality of products listed on our platform. 
                        We are not responsible for the actions or omissions of Users, including Creators&apos; ability to sell items or 
                        Customers&apos; ability to pay for items.
                      </p>

                      <p>
                        We do not warrant that a) the Service will function uninterrupted, secure, or available at any particular time or location; 
                        b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results 
                        of using the Service will meet your requirements.
                      </p>
                    </div>
                  </section>

                  <Separator />

                  {/* Limitation of Liability */}
                  <section id="limitation-liability">
                    <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        In no event shall Kyzat, nor its directors, employees, partners, agents, suppliers, or affiliates, 
                        be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, 
                        loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                      </p>

                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Your access to or use of or inability to access or use the Service</li>
                        <li>Any conduct or content of any third party on the Service</li>
                        <li>Any content obtained from the Service</li>
                        <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                      </ul>

                      <p>
                        Our total cumulative liability to you for all claims arising from or relating to these Terms or your use of the 
                        Service shall not exceed the greater of (a) the total commissions we have earned from your transactions in the 
                        six (6) months prior to the event giving rise to the claim, or (b) one hundred rupee (₹100).
                      </p>
                    </div>
                  </section>

                  <Separator />

                  {/* Dispute Resolution */}
                  <section id="dispute-resolution">
                    <h2 className="text-2xl font-semibold mb-4">11. Dispute Resolution</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        <strong>Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of the 
                        State of Washington, without regard to its conflict of law provisions.
                      </p>

                      <p>
                        <strong>Informal Resolution:</strong> We encourage you to contact us directly to resolve any disputes before 
                        initiating formal proceedings.
                      </p>

                      <p>
                        <strong>Binding Arbitration:</strong> Any dispute arising from these Terms or your use of the Service shall be 
                        resolved through binding arbitration in Seattle, Washington, rather than in court.
                      </p>

                      <p>
                        <strong>Class Action Waiver:</strong> You agree that any arbitration or proceeding shall be limited to the dispute 
                        between us and you individually.
                      </p>
                    </div>
                  </section>

                  <Separator />

                  {/* Changes to Terms */}
                  <section id="changes">
                    <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is 
                        material we will provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a 
                        material change will be determined at our sole discretion.
                      </p>

                      <p>
                        By continuing to access or use our Service after any revisions become effective, you agree to be bound by the 
                        revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
                      </p>
                    </div>
                  </section>

                  <Separator />

                  {/* Contact Information */}
                  <section id="contact">
                    <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        If you have any questions about these Terms, please contact us:
                      </p>

                      <div className="bg-gray-50 dark:bg-background/10 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start mb-2">
                          <Mail className="h-5 w-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Email</p>
                            <p>legal@kyzat.com</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Shield className="h-5 w-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Mail</p>
                            <p>Kyzat LLC</p>
                            <p>123 Legal Avenue, Suite 100</p>
                            <p>Seattle, WA 98101</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  <div className="text-center py-6">
                    <p className="text-muted-foreground">
                      Thank you for taking the time to read our Terms of Service.
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/">
                        Return to Homepage
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}