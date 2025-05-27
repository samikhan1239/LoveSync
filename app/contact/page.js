"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Users,
  Shield,
  Award,
  Globe,
  MessageCircle,
  HeadphonesIcon,
} from "lucide-react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission here
  };

  const stats = [
    { icon: Users, label: "Happy Couples", value: "50,000+" },
    { icon: Shield, label: "Verified Profiles", value: "95%" },
    { icon: Award, label: "Success Rate", value: "87%" },
    { icon: Globe, label: "Cities Covered", value: "500+" },
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak with our support team",
      value: "+91 9893846754",
      action: "Call Now",
    },
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us your queries",
      value: "samikhan10902@gmail.com",
      action: "Send Email",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with us instantly",
      value: "Available 24/7",
      action: "Start Chat",
    },
    {
      icon: HeadphonesIcon,
      title: "Support Center",
      description: "Browse our help articles",
      value: "help.lovesync.com",
      action: "Visit Center",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Contact Us
        </h1>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          We're here to help you find your perfect match. Get in touch with our
          team for any questions, support, or feedback.
        </p>
      </div>

      {/* About Section */}
      <Card className="border border-white/10 bg-white/5 backdrop-blur-sm mb-12">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                About LoveSync
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                LoveSync is India's most trusted matrimonial platform,
                connecting hearts and creating lasting relationships since 2020.
                We believe that everyone deserves to find their perfect life
                partner, and our advanced AI-powered matching system makes it
                easier than ever.
              </p>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                With over 2 million active users across 500+ cities, we've
                successfully helped thousands of couples find their soulmates.
                Our commitment to privacy, security, and authentic connections
                sets us apart in the industry.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-2">
                        <Icon className="h-6 w-6 text-pink-500" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="text-white/60 text-sm">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-600/20 rounded-3xl blur-2xl" />
              <Image
                src="/bg6.png"
                alt="Happy couple"
                width={600}
                height={400}
                className="relative rounded-3xl object-cover w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Co-Founder Section */}
      <Card className="border border-white/10 bg-white/5 backdrop-blur-sm mb-12">
        <CardHeader>
          <CardTitle className="text-white text-2xl text-center">
            Meet Our Co-Founder
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <div className="relative w-64 h-64 mx-auto lg:mx-0 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-lg opacity-30" />
                <Image
                  src="/placeholder.svg?height=256&width=256"
                  alt="Rajesh Kumar - Co-Founder"
                  width={256}
                  height={256}
                  className="relative rounded-full object-cover border-4 border-pink-500/30"
                />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">Sami Khan</h3>
              <p className="text-pink-400 text-xl mb-4">Co-Founder & CEO</p>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                With over 15 years of experience in technology and a personal
                passion for bringing people together, Rajesh founded LoveSync
                with the vision of revolutionizing how people find their life
                partners in the digital age.
              </p>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                Pursuing B.Tech from SGSITS Indore, Rajesh is passionate about
                leveraging technology to create meaningful human connections. He
                began his journey inspired by innovation and is committed to
                building impactful solutions for the future.
              </p>

              <div className="space-y-4">
                <div className="flex items-center text-white/80">
                  <Mail className="h-5 w-5 mr-3 text-pink-500" />
                  <span>samikhan10902@gmail.com</span>
                </div>
                <div className="flex items-center text-white/80">
                  <Phone className="h-5 w-5 mr-3 text-pink-500" />
                  <span>+91 9893846754</span>
                </div>
                <div className="flex items-center text-white/80">
                  <MapPin className="h-5 w-5 mr-3 text-pink-500" />
                  <span>Bhopal, India</span>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full"
                >
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full"
                >
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Mail className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {contactMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <Card
              key={index}
              className="border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-pink-500" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {method.title}
                </h3>
                <p className="text-white/60 text-sm mb-3">
                  {method.description}
                </p>
                <p className="text-white/80 font-medium mb-4">{method.value}</p>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                >
                  {method.action}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-2xl">
              Send us a Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white">
                    Inquiry Category *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="technical">
                        Technical Support
                      </SelectItem>
                      <SelectItem value="billing">
                        Billing & Payments
                      </SelectItem>
                      <SelectItem value="profile">Profile Issues</SelectItem>
                      <SelectItem value="matching">
                        Matching Problems
                      </SelectItem>
                      <SelectItem value="safety">Safety & Security</SelectItem>
                      <SelectItem value="feedback">
                        Feedback & Suggestions
                      </SelectItem>
                      <SelectItem value="partnership">
                        Business Partnership
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-white">
                  Subject *
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500"
                  placeholder="Brief description of your inquiry"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-white">
                  Message *
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500 min-h-[120px]"
                  placeholder="Please provide detailed information about your inquiry..."
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Office Information */}
        <div className="space-y-6">
          {/* Office Address */}
          <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-pink-500" />
                Our Office
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Headquarters</h4>
                <p className="text-white/80">
                  LoveSync Technologies Pvt. Ltd.
                  <br />
                  Tower A, 15th Floor
                  <br />
                  Cyber City, Sector 24
                  <br />
                  Bhopal, MP 462010
                  <br />
                  India
                </p>
              </div>
              <div className="flex items-center text-white/80">
                <Clock className="h-4 w-4 mr-2 text-pink-500" />
                <span>Monday - Saturday: 9:00 AM - 7:00 PM IST</span>
              </div>
              <div className="flex items-center text-white/80">
                <Phone className="h-4 w-4 mr-2 text-pink-500" />
                <span>+91 9893846754</span>
              </div>
              <div className="flex items-center text-white/80">
                <Mail className="h-4 w-4 mr-2 text-pink-500" />
                <span>office@lovesync.com</span>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center">
                <Clock className="h-5 w-5 mr-2 text-pink-500" />
                Support Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Customer Support</span>
                <span className="text-white">24/7</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Technical Support</span>
                <span className="text-white">9 AM - 9 PM IST</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Business Inquiries</span>
                <span className="text-white">9 AM - 6 PM IST</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Emergency Support</span>
                <span className="text-white">24/7</span>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-xl">Follow Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full"
                >
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full"
                >
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full"
                >
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full"
                >
                  <Linkedin className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-white/60 text-sm mt-4">
                Stay connected with us on social media for updates, success
                stories, and matrimonial tips.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <Card className="border border-white/10 bg-white/5 backdrop-blur-sm mt-12">
        <CardHeader>
          <CardTitle className="text-white text-2xl text-center">
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">
                  How do I create a profile?
                </h4>
                <p className="text-white/70 text-sm">
                  Click on "Create Profile" and follow our step-by-step process
                  to build your detailed matrimonial profile.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">
                  Is my information secure?
                </h4>
                <p className="text-white/70 text-sm">
                  Yes, we use industry-standard encryption and security measures
                  to protect your personal information.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">
                  How does the matching work?
                </h4>
                <p className="text-white/70 text-sm">
                  Our AI-powered algorithm matches you based on compatibility,
                  preferences, and shared interests.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">
                  What are the subscription plans?
                </h4>
                <p className="text-white/70 text-sm">
                  We offer Free, Premium, and VIP plans with different features.
                  Check our pricing page for details.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">
                  Can I cancel my subscription?
                </h4>
                <p className="text-white/70 text-sm">
                  Yes, you can cancel your subscription anytime from your
                  account settings or by contacting support.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">
                  How do I report inappropriate behavior?
                </h4>
                <p className="text-white/70 text-sm">
                  Use the report button on any profile or contact our support
                  team immediately for safety concerns.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
