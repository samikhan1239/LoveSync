import { Search, UserCheck, Heart, Calendar } from "lucide-react";

const steps = [
  {
    icon: <UserCheck className="h-10 w-10 text-rose-500" />,
    title: "Create Your Profile",
    description:
      "Sign up and create your detailed profile with photos and personal information",
  },
  {
    icon: <Search className="h-10 w-10 text-rose-500" />,
    title: "Find Matches",
    description:
      "Browse profiles or use our advanced matching algorithm to find compatible partners",
  },
  {
    icon: <Heart className="h-10 w-10 text-rose-500" />,
    title: "Connect",
    description:
      "Send interest, chat with your matches and get to know each other better",
  },
  {
    icon: <Calendar className="h-10 w-10 text-rose-500" />,
    title: "Meet in Person",
    description:
      "When you're ready, plan a date and meet your potential life partner",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-rose-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our simple 4-step process makes finding your perfect match easy and
            enjoyable. Start your journey to finding love today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md">
                  {step.icon}
                </div>
                <div className="absolute top-1/2 left-full -translate-y-1/2 w-full h-0.5 bg-rose-200 hidden lg:block">
                  {index < steps.length - 1 && (
                    <div className="w-full h-full bg-rose-200" />
                  )}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
