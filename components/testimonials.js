import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Jessica T.",
    age: 29,
    rating: 5,
    text: "I was hesitant to try online matchmaking, but HeartMatch made it so easy and comfortable. The profiles are genuine and the matching system is spot on!",
  },
  {
    id: 2,
    name: "Robert K.",
    age: 34,
    rating: 5,
    text: "After trying several other platforms, HeartMatch stands out for its quality profiles and security features. I feel safe connecting with people here.",
  },
  {
    id: 3,
    name: "Aisha M.",
    age: 27,
    rating: 4,
    text: "The cultural sensitivity on HeartMatch is what I appreciate most. Found someone who respects my traditions while sharing modern values.",
  },
  {
    id: 4,
    name: "Thomas L.",
    age: 31,
    rating: 5,
    text: "The verification process gives me confidence that I'm talking to real people. Already had several meaningful connections!",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Members Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dont just take our word for it. Hear from our members who have found
            meaningful connections on our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 flex-grow">{testimonial.text}</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="font-semibold">
                    {testimonial.name}, {testimonial.age}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
