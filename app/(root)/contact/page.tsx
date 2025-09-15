"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, Send, HelpCircle, MessageCircle } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactMethod {
  icon: React.ReactNode;
  title: string;
  details: string;
  link: string;
}

interface FAQ {
  question: string;
  answer: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  const contactMethods: ContactMethod[] = [
    {
      icon: <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary"/>,
      title: "Email Us",
      details: "support@kyzat.com",
      link: "mailto:support@kyzat.com"
    },
    {
      icon: <Phone className="h-5 w-5 md:h-6 md:w-6 text-primary" />,
      title: "Call Us",
      details: "+1 (555) 123-4567",
      link: "tel:+15551234567"
    },
    {
      icon: <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary" />,
      title: "Visit Us",
      details: "123 Artisan Street, Creative City, CC 12345",
      link: "#"
    },
    {
      icon: <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary" />,
      title: "Business Hours",
      details: "Mon-Fri: 9AM-5PM PST",
      link: "#"
    }
  ];

  const faqs: FAQ[] = [
    {
      question: "How do I become a creator on your platform?",
      answer: "To become a creator, simply visit our 'Sell on Kyzat' page and fill out the application form. Our team reviews each application to ensure quality and authenticity."
    },
    {
      question: "What commission do you take from sales?",
      answer: "We charge a 15% commission on each sale, which includes payment processing fees and platform maintenance."
    },
    {
      question: "How often do you pay out to creators?",
      answer: "We process payments to creators on a bi-weekly basis, with a 7-day holding period for order clearance."
    },
    {
      question: "Do you offer customer support for product issues?",
      answer: "Yes, we facilitate communication between customers and creators for any product issues. If a resolution isn't reached, our team will step in to help."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Get In Touch</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions or feedback? We&apos;d love to hear from you. Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Contact Form */}
          <Card className="py-6 h-fit">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm md:text-base">Your Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="h-10 md:h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm md:text-base">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-10 md:h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm md:text-base">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="h-10 md:h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm md:text-base">Your Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="min-h-32"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6 md:space-y-8">
            <Card className="py-6">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">Other Ways to Reach Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                {contactMethods.map((method, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mr-3 md:mr-4 mt-0.5">
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm md:text-base mb-1">{method.title}</h3>
                      {method.link !== "#" ? (
                        <a 
                          href={method.link} 
                          className="text-muted-foreground hover:text-primary text-sm md:text-base"
                        >
                          {method.details}
                        </a>
                      ) : (
                        <p className="text-muted-foreground text-sm md:text-base">{method.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card>
              <CardContent className="p-0">
                <div className="bg-muted h-48 md:h-64 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2" />
                    <p className="text-sm md:text-base">Interactive Map</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <h3 className="font-semibold text-lg md:text-xl mb-2 md:mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground text-sm md:text-base">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-muted/50 border-0">
          <CardContent className="p-6 md:p-8 lg:p-12 text-center">
            <MessageCircle className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Need More Help?</h2>
            <p className="text-muted-foreground md:text-md mb-6 md:mb-8 max-w-2xl mx-auto">
              Check out our comprehensive help center for guides, tutorials, and more answers to common questions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
              <Button asChild size="lg" className="text-sm md:text-base">
                <a href="/help-center" className="flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Visit Help Center
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-sm md:text-base">
                <a href="/creators">For Creators</a>
              </Button>
            </div>
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
// import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

// export default function ContactPage() {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     subject: "",
//     message: ""
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Handle form submission here
//     console.log("Form submitted:", formData);
//     alert("Thank you for your message! We'll get back to you soon.");
//     setFormData({
//       name: "",
//       email: "",
//       subject: "",
//       message: ""
//     });
//   };

//   const contactMethods = [
//     {
//       icon: <Mail className="h-6 w-6 text-primary"/>,
//       title: "Email Us",
//       details: "support@kyzat.com",
//       link: "mailto:support@kyzat.com"
//     },
//     {
//       icon: <Phone className="h-6 w-6 text-primary" />,
//       title: "Call Us",
//       details: "+1 (555) 123-4567",
//       link: "tel:+15551234567"
//     },
//     {
//       icon: <MapPin className="h-6 w-6 text-primary" />,
//       title: "Visit Us",
//       details: "123 Artisan Street, Creative City, CC 12345",
//       link: "#"
//     },
//     {
//       icon: <Clock className="h-6 w-6 text-primary" />,
//       title: "Business Hours",
//       details: "Mon-Fri: 9AM-5PM PST",
//       link: "#"
//     }
//   ];

//   const faqs = [
//     {
//       question: "How do I become a creator on your platform?",
//       answer: "To become a creator, simply visit our 'Sell on LAC' page and fill out the application form. Our team reviews each application to ensure quality and authenticity."
//     },
//     {
//       question: "What commission do you take from sales?",
//       answer: "We charge a 15% commission on each sale, which includes payment processing fees and platform maintenance."
//     },
//     {
//       question: "How often do you pay out to creators?",
//       answer: "We process payments to creators on a bi-weekly basis, with a 7-day holding period for order clearance."
//     },
//     {
//       question: "Do you offer customer support for product issues?",
//       answer: "Yes, we facilitate communication between customers and creators for any product issues. If a resolution isn't reached, our team will step in to help."
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-background">
//       <main className="container mx-auto px-4 py-12">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl md:text-5xl font-bold mb-6">Get In Touch</h1>
//           <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
//             Have questions or feedback? We&apos;d love to hear from you. Reach out to us through any of the channels below.
//           </p>
//         </div>

//         <div className="grid lg:grid-cols-2 gap-12 mb-16">
//           {/* Contact Form */}
//           <div>
//             <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div>
//                   <label htmlFor="name" className="block text-sm font-medium mb-2">Your Name</label>
//                   <Input
//                     id="name"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
//                   <Input
//                     id="email"
//                     name="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label htmlFor="subject" className="block text-sm font-medium mb-2">Subject</label>
//                 <Input
//                   id="subject"
//                   name="subject"
//                   value={formData.subject}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//               <div>
//                 <label htmlFor="message" className="block text-sm font-medium mb-2">Your Message</label>
//                 <Textarea
//                   id="message"
//                   name="message"
//                   rows={5}
//                   value={formData.message}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//               <Button type="submit" className="w-full">
//                 <Send className="h-4 w-4 mr-2" />
//                 Send Message
//               </Button>
//             </form>
//           </div>

//           {/* Contact Information */}
//           <div>
//             <h2 className="text-2xl font-bold mb-6">Other Ways to Reach Us</h2>
//             <div className="space-y-6">
//               {contactMethods.map((method, index) => (
//                 <div key={index} className="flex items-start">
//                   <div className="mr-4 mt-1">
//                     {method.icon}
//                   </div>
//                   <div>
//                     <h3 className="font-semibold mb-1">{method.title}</h3>
//                     {method.link !== "#" ? (
//                       <a href={method.link} className="text-muted-foreground hover:text-primary">
//                         {method.details}
//                       </a>
//                     ) : (
//                       <p className="text-muted-foreground">{method.details}</p>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Map Placeholder */}
//             <div className="mt-8 bg-muted h-64 rounded-lg flex items-center justify-center">
//               <div className="text-center text-muted-foreground">
//                 <MapPin className="h-12 w-12 mx-auto mb-2" />
//                 <p>Interactive Map</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* FAQ Section */}
//         <div className="mb-16">
//           <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
//           <div className="grid md:grid-cols-2 gap-8">
//             {faqs.map((faq, index) => (
//               <div key={index} className="bg-card p-6 rounded-lg border">
//                 <h3 className="font-semibold text-lg mb-3">{faq.question}</h3>
//                 <p className="text-muted-foreground">{faq.answer}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* CTA Section */}
//         <div className="bg-primary-50 rounded-xl p-12 text-center">
//           <h2 className="text-3xl font-bold mb-6">Need More Help?</h2>
//           <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
//             Check out our comprehensive help center for guides, tutorials, and more answers to common questions.
//           </p>
//           <div className="flex flex-col sm:flex-row justify-center gap-4">
//             <Button asChild size="lg">
//               <a href="/help-center">Visit Help Center</a>
//             </Button>
//             <Button asChild variant="outline" size="lg">
//               <a href="/creators">For Creators</a>
//             </Button>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }