import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle } from "lucide-react";

const profiles = [
  {
    id: 1,
    name: "Sophia, 28",
    location: "New York, USA",
    occupation: "Marketing Executive",
    image: "/placeholder.svg?height=400&width=300",
    verified: true,
  },
  {
    id: 2,
    name: "James, 32",
    location: "London, UK",
    occupation: "Software Engineer",
    image: "/placeholder.svg?height=400&width=300",
    verified: true,
  },
  {
    id: 3,
    name: "Emma, 26",
    location: "Toronto, Canada",
    occupation: "Teacher",
    image: "/placeholder.svg?height=400&width=300",
    verified: false,
  },
  {
    id: 4,
    name: "Michael, 30",
    location: "Sydney, Australia",
    occupation: "Architect",
    image: "/placeholder.svg?height=400&width=300",
    verified: true,
  },
];

export default function FeaturedProfiles() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Profiles
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Meet some of our featured members who are looking for their perfect
            match. Browse profiles and find someone who shares your interests.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className="overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="relative">
                <Image
                  src={profile.image || "/placeholder.svg"}
                  alt={profile.name}
                  width={300}
                  height={400}
                  className="w-full h-80 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <div className="flex gap-2">
                    <button className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors">
                      <Heart className="h-5 w-5 text-white" />
                    </button>
                    <button className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
                {profile.verified && (
                  <Badge className="absolute top-3 right-3 bg-green-500 hover:bg-green-600">
                    Verified
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">{profile.name}</h3>
                <p className="text-gray-500 text-sm">{profile.location}</p>
                <p className="text-gray-700 text-sm mt-1">
                  {profile.occupation}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            View More Profiles
          </button>
        </div>
      </div>
    </section>
  );
}
