import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const stories = [
  {
    id: 1,
    couple: "Sarah & David",
    image: "/placeholder.svg?height=400&width=600",
    story:
      "We matched on HeartMatch in 2021 and got married last year. The platform helped us find each other when we least expected it!",
    location: "Chicago, USA",
  },
  {
    id: 2,
    couple: "Priya & Raj",
    image: "/placeholder.svg?height=400&width=600",
    story:
      "After chatting for a few weeks, we knew we had something special. Thanks to HeartMatch, we're now planning our wedding!",
    location: "Mumbai, India",
  },
  {
    id: 3,
    couple: "Elena & Miguel",
    image: "/placeholder.svg?height=400&width=600",
    story:
      "We were both skeptical about online matchmaking, but HeartMatch proved us wrong. We're now happily married with a baby on the way!",
    location: "Barcelona, Spain",
  },
];

export default function SuccessStories() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Success Stories
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Read about couples who found their perfect match on our platform.
            Your love story could be next!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story) => (
            <Card
              key={story.id}
              className="overflow-hidden border-none shadow-lg"
            >
              <div className="relative h-64">
                <Image
                  src={story.image || "/placeholder.svg"}
                  alt={story.couple}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-4 text-white">
                    <h3 className="font-bold text-xl">{story.couple}</h3>
                    <p className="text-sm opacity-80">{story.location}</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 relative">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-rose-100" />
                <p className="text-gray-700">{story.story}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-rose-500 text-white hover:bg-rose-600 h-10 px-4 py-2">
            Read More Success Stories
          </button>
        </div>
      </div>
    </section>
  );
}
