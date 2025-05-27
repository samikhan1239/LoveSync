"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";
import {
  Search,
  Heart,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MapPin,
  Briefcase,
  Calendar,
  Phone,
  Loader2,
} from "lucide-react";

export default function ConnectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("received");
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInvitations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/invitations?page=1&limit=10", {
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          `Failed to fetch invitations: ${res.status} - ${
            errorData.error || "Unknown error"
          }`
        );
      }
      const { invitations } = await res.json();

      const enrichedInvitations = invitations.map((inv) => {
        const isSender = inv.senderId === session.user.id;
        const otherProfile = isSender ? inv.receiverProfile : inv.senderProfile;
        const phoneNumber = isSender
          ? inv.receiverProfile?.phone
          : inv.senderProfile?.phone;
        const otherUserId = isSender ? inv.receiverId : inv.senderId;

        return {
          id: inv._id,
          userId: otherUserId,
          receiverId: inv.receiverId,
          name: otherProfile?.name || "Unknown",
          age: otherProfile?.age || 0,
          location: otherProfile?.location || "N/A",
          occupation: otherProfile?.occupation || "N/A",
          education: otherProfile?.education?.degree || "N/A",
          image: otherProfile?.photos?.[0] || "/placeholder.svg",
          phoneNumber: phoneNumber || "N/A",
          sentDate: inv.createdAt,
          status: inv.status,
          message: inv.message,
          verified: otherProfile?.verified || false,
          premium: otherProfile?.premium || false,
          connectedDate:
            inv.status === "accepted" || inv.status === "mutual"
              ? inv.updatedAt
              : null,
          lastMessage: inv.lastMessage || "",
        };
      });

      setIncomingRequests(
        enrichedInvitations.filter(
          (inv) =>
            inv.status === "pending" && inv.receiverId === session.user.id
        )
      );
      setSentRequests(
        enrichedInvitations.filter((inv) => inv.senderId === session.user.id)
      );
      setConnections(
        enrichedInvitations.filter(
          (inv) => inv.status === "accepted" || inv.status === "mutual"
        )
      );
      setError("");
    } catch (err) {
      console.error("Fetch invitations error:", err);
      setError(`Failed to load connections: ${err.message}`);
      toast.error("Failed to load connections.");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      toast.error("Please log in to view your connections.");
      router.push("/signin");
      return;
    }
    fetchInvitations();
  }, [status, router, fetchInvitations]);

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await fetch(`/api/invitations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ invitationId: requestId, status: "accepted" }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          `Failed to accept request: ${res.status} - ${
            errorData.error || "Unknown error"
          }`
        );
      }
      toast.success("Request accepted successfully!");
      fetchInvitations();
    } catch (err) {
      console.error("Accept request error:", err);
      toast.error(`Failed to accept request: ${err.message}`);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const res = await fetch(`/api/invitations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ invitationId: requestId, status: "declined" }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          `Failed to decline request: ${res.status} - ${
            errorData.error || "Unknown error"
          }`
        );
      }
      toast.success("Request declined successfully!");
      fetchInvitations();
    } catch (err) {
      console.error("Reject request error:", err);
      toast.error(`Failed to decline request: ${err.message}`);
    }
  };

  const stats = {
    totalReceived: incomingRequests.length,
    totalSent: sentRequests.length,
    totalConnections: connections.length,
    pendingRequests: sentRequests.filter((req) => req.status === "pending")
      .length,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600" />
          <p className="text-white/70 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-24 relative sm:min-w-[640px] min-h-screen">
      <Toaster richColors position="top-right" />
      <div className="mb-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
          My Connections
        </h1>
        <p className="text-gray-400 text-lg">
          Manage your connection requests and chat with your matches
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Card className="border border-red-500/20 bg-red-500/10">
            <CardContent className="p-4">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
        {[
          { label: "Requests Received", value: stats.totalReceived },
          { label: "Requests Sent", value: stats.totalSent },
          { label: "Active Connections", value: stats.totalConnections },
          { label: "Pending Responses", value: stats.pendingRequests },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="border border-gray-700/50 bg-white/5 backdrop-blur-sm shadow-md min-w-[150px]"
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm md:text-base">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-gray-700/50 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Connection Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-600/50 mb-6 rounded-lg">
              <TabsTrigger
                value="received"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-300 hover:text-white"
              >
                Received ({stats.totalReceived})
              </TabsTrigger>
              <TabsTrigger
                value="sent"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-300 hover:text-white"
              >
                Sent ({stats.totalSent})
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-300 hover:text-white"
              >
                Approved ({stats.totalConnections})
              </TabsTrigger>
            </TabsList>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-500 rounded-lg"
              />
            </div>

            <TabsContent value="received">
              <div className="space-y-4">
                {incomingRequests
                  .filter((req) =>
                    req.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((request) => (
                    <Card
                      key={request.id}
                      className="border border-gray-700/50 bg-white/5 backdrop-blur-sm shadow-md rounded-xl"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={request.image}
                                alt={request.name}
                                fill
                                className="object-cover"
                              />
                              {request.verified && (
                                <div className="absolute top-1 right-1">
                                  <Badge className="bg-green-500 text-white text-xs p-1">
                                    <CheckCircle className="h-3 w-3" />
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white">
                                  {request.name}, {request.age}
                                </h3>
                                {request.premium && (
                                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                                    Premium
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1 text-sm text-gray-400">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1 text-purple-500 flex-shrink-0" />
                                  <span>{request.location}</span>
                                </div>
                                <div className="flex items-center">
                                  <Briefcase className="h-4 w-4 mr-1 text-purple-500 flex-shrink-0" />
                                  <span>{request.occupation}</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1 text-purple-500 flex-shrink-0" />
                                  <span>
                                    Sent on{" "}
                                    {new Date(
                                      request.sentDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              {request.message && (
                                <div className="mt-2 p-2 bg-gray-800/50 rounded text-gray-300 text-sm">
                                  {request.message}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 md:w-32">
                            <Link href={`/profiles/${request.userId}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-gray-600/50 text-white hover:bg-gray-700/50"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              onClick={() => handleAcceptRequest(request.id)}
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectRequest(request.id)}
                              className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-0"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="sent">
              <div className="space-y-4">
                {sentRequests
                  .filter((req) =>
                    req.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((request) => (
                    <Card
                      key={request.id}
                      className="border border-gray-700/50 bg-white/5 backdrop-blur-sm shadow-md rounded-xl"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={request.image}
                                alt={request.name}
                                fill
                                className="object-cover"
                              />
                              {request.verified && (
                                <div className="absolute top-1 right-1">
                                  <Badge className="bg-green-500 text-white text-xs p-1">
                                    <CheckCircle className="h-3 w-3" />
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white">
                                  {request.name}, {request.age}
                                </h3>
                                {request.premium && (
                                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                                    Premium
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1 text-sm text-gray-400">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1 text-purple-500 flex-shrink-0" />
                                  <span>{request.location}</span>
                                </div>
                                <div className="flex items-center">
                                  <Briefcase className="h-4 w-4 mr-1 text-purple-500 flex-shrink-0" />
                                  <span>{request.occupation}</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1 text-purple-500 flex-shrink-0" />
                                  <span>
                                    Sent on{" "}
                                    {new Date(
                                      request.sentDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 md:w-32">
                            <Badge
                              className={`text-center ${
                                request.status === "pending"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : request.status === "accepted" ||
                                    request.status === "mutual"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {request.status === "pending" && (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              {(request.status === "accepted" ||
                                request.status === "mutual") && (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              {request.status === "declined" && (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </Badge>
                            <Link href={`/profiles/${request.userId}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-gray-800/50 border-gray-600/50 text-white hover:bg-gray-700/50"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            {(request.status === "accepted" ||
                              request.status === "mutual") && (
                              <Button
                                size="sm"
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Chat
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="approved">
              <div className="space-y-4">
                {connections
                  .filter((conn) =>
                    conn.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((connection) => (
                    <Card
                      key={connection.id}
                      className="border border-gray-700/50 bg-white/5 backdrop-blur-sm shadow-md rounded-xl"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={connection.image}
                                alt={connection.name}
                                fill
                                className="object-cover"
                              />
                              {connection.verified && (
                                <div className="absolute top-1 right-1">
                                  <Badge className="bg-green-500 text-white text-xs p-1">
                                    <CheckCircle className="h-3 w-3" />
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white">
                                  {connection.name}, {connection.age}
                                </h3>
                                {connection.premium && (
                                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                                    Premium
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1 text-sm text-gray-400">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1 text-purple-500 flex-shrink-0" />
                                  <span>{connection.location}</span>
                                </div>
                                <div className="flex items-center">
                                  <Briefcase className="h-4 w-4 mr-1 text-purple-500 flex-shrink-0" />
                                  <span>{connection.occupation}</span>
                                </div>
                                {connection.phoneNumber !== "N/A" && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <a
                                      href={`tel:${connection.phoneNumber}`}
                                      className="text-sm text-white hover:text-purple-500 transition-colors truncate"
                                    >
                                      {connection.phoneNumber}
                                    </a>
                                    <Badge className="bg-green-500/20 text-green-300 text-xs">
                                      Shared
                                    </Badge>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1 text-purple-500 flex-shrink-0" />
                                  <span>
                                    Approved on{" "}
                                    {new Date(
                                      connection.connectedDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              {connection.lastMessage && (
                                <div className="mt-2 p-2 bg-gray-800/50 rounded text-gray-300 text-sm">
                                  <MessageCircle className="h-3 w-3 inline mr-1" />
                                  {connection.lastMessage}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 md:w-32">
                            <Link href={`/profiles/${connection.userId}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-gray-800/50 border-gray-600/50 text-white hover:bg-gray-700/50"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Chat
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full bg-gray-800/50 border-gray-600/50 text-white hover:bg-gray-700/50"
                            >
                              <Heart className="h-4 w-4 mr-1" />
                              Favorite
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
