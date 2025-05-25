"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const fetchProfile = async (userId) => {
    try {
      const res = await fetch(`/api/profiles?userId=${userId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
      const profile = await res.json();
      return profile;
    } catch (err) {
      console.error("Fetch profile error:", err);
      return null;
    }
  };

  const fetchInvitations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/invitations", {
        credentials: "include",
      });
      if (!res.ok)
        throw new Error(`Failed to fetch invitations: ${res.status}`);
      const { invitations } = await res.json();

      const enrichedInvitations = await Promise.all(
        invitations.map(async (inv) => {
          const senderProfile = await fetchProfile(inv.senderId._id);
          const receiverProfile = await fetchProfile(inv.receiverId._id);
          const isSender = inv.senderId._id === session.user.id;
          const otherProfile = isSender ? receiverProfile : senderProfile;

          return {
            id: inv._id,
            name: otherProfile?.name || "Unknown",
            age: otherProfile?.age || 0,
            location: otherProfile?.location || "N/A",
            occupation: otherProfile?.occupation || "N/A",
            education: otherProfile?.education?.degree || "N/A",
            image: otherProfile?.image || "/placeholder.svg",
            phoneNumber: otherProfile?.phoneNumber || "N/A",
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
        })
      );

      const incoming = enrichedInvitations.filter(
        (inv) => inv.status === "pending" && inv.receiverId === session.user.id
      );
      const sent = enrichedInvitations.filter(
        (inv) => inv.senderId === session.user.id
      );
      const connected = enrichedInvitations.filter(
        (inv) => inv.status === "accepted" || inv.status === "mutual"
      );

      setIncomingRequests(incoming);
      setSentRequests(sent);
      setConnections(connected);
      setError("");
    } catch (err) {
      console.error("Fetch invitations error:", err);
      setError("Failed to load connections. Please try again.");
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
      const res = await fetch(`/api/invitations/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "accepted" }),
      });
      if (!res.ok) throw new Error(`Failed to accept request: ${res.status}`);
      toast.success("Request accepted successfully!");
      fetchInvitations();
    } catch (err) {
      console.error("Accept request error:", err);
      toast.error("Failed to accept request.");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const res = await fetch(`/api/invitations/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "declined" }),
      });
      if (!res.ok) throw new Error(`Failed to reject request: ${res.status}`);
      toast.success("Request declined successfully!");
      fetchInvitations();
    } catch (err) {
      console.error("Reject request error:", err);
      toast.error("Failed to reject request.");
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
          <p className="text-white/70 text-lg">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 relative min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 animate-fade-in">
      <Toaster richColors position="top-right" />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          My Connections
        </h1>
        <p className="text-white/70 text-lg">
          Manage your connection requests and chat with your matches
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <Card className="border border-red-500/20 bg-red-500/10">
            <CardContent className="p-4">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
        {[
          { label: "Requests Received", value: stats.totalReceived },
          { label: "Requests Sent", value: stats.totalSent },
          { label: "Active Connections", value: stats.totalConnections },
          { label: "Pending Responses", value: stats.pendingRequests },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="border border-white/10 bg-white/5 backdrop-blur-sm shadow-md min-w-[150px]"
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-white/70 text-sm md:text-base">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Connection Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-white/10 border border-white/20 mb-6">
              <TabsTrigger
                value="received"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 text-white"
              >
                Received ({stats.totalReceived})
              </TabsTrigger>
              <TabsTrigger
                value="sent"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 text-white"
              >
                Sent ({stats.totalSent})
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 text-white"
              >
                Approved ({stats.totalConnections})
              </TabsTrigger>
            </TabsList>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
              <Input
                placeholder="Search connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500"
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
                      className="border border-white/10 bg-white/5 backdrop-blur-sm"
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
                                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                                    Premium
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1 text-sm text-white/70">
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1 text-pink-500" />
                                  {request.location}
                                </div>
                                <div className="flex items-center">
                                  <Briefcase className="h-3 w-3 mr-1 text-pink-500" />
                                  {request.occupation}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1 text-pink-500" />
                                  Sent on{" "}
                                  {new Date(
                                    request.sentDate
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                              {request.message && (
                                <div className="mt-2 p-2 bg-white/5 rounded text-white/80 text-sm">
                                  {request.message}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 md:w-32">
                            <Link href={`/profiles/${request.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-white/20 text-white hover:bg-white/10"
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
                      className="border border-white/10 bg-white/5 backdrop-blur-sm"
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
                                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                                    Premium
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1 text-sm text-white/70">
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1 text-pink-500" />
                                  {request.location}
                                </div>
                                <div className="flex items-center">
                                  <Briefcase className="h-3 w-3 mr-1 text-pink-500" />
                                  {request.occupation}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1 text-pink-500" />
                                  Sent on{" "}
                                  {new Date(
                                    request.sentDate
                                  ).toLocaleDateString()}
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
                            <Link href={`/profiles/${request.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            {(request.status === "accepted" ||
                              request.status === "mutual") && (
                              <Button
                                size="sm"
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
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
                      className="border border-white/10 bg-white/5 backdrop-blur-sm"
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
                                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                                    Premium
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1 text-sm text-white/70">
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1 text-pink-500" />
                                  {connection.location}
                                </div>
                                <div className="flex items-center">
                                  <Briefcase className="h-3 w-3 mr-1 text-pink-500" />
                                  {connection.occupation}
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1 text-pink-500" />
                                  {connection.phoneNumber}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1 text-pink-500" />
                                  Approved on{" "}
                                  {new Date(
                                    connection.connectedDate
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                              {connection.lastMessage && (
                                <div className="mt-2 p-2 bg-white/5 rounded text-white/80 text-sm">
                                  <MessageCircle className="h-3 w-3 inline mr-1" />
                                  {connection.lastMessage}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 md:w-32">
                            <Link href={`/profiles/${connection.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Chat
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
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
