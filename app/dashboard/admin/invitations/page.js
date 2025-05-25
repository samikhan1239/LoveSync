"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  LayoutDashboard,
  Users,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// AdminLayout Component
const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Profiles", href: "/admin/profiles", icon: Users },
    { name: "Invitations", href: "dashboard/admin/invitations", icon: Heart },
    { name: "Pending Requests", href: "/dashboard/admin/pending", icon: Clock },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className=" bg-white/10 border-white/20 text-white hover:bg-white/20"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-black/50 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Heart className="h-7 w-7 text-pink-500 fill-pink-500" />
              <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                LoveSync Admin
              </span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <div
                  key={item.name}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/30 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 mr-3 ${
                      isActive ? "text-pink-500" : ""
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <Button
              variant="ghost"
              className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-black/50 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center flex-1">
              <div className="lg:hidden w-8"></div>
              <div className="relative max-w-md w-full mx-auto lg:mx-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-white/10 border-white/20 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white/80 hover:text-white hover:bg-white/10"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-medium">A</span>
                    </div>
                    <span className="hidden md:inline-block">Admin User</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-black/80 backdrop-blur-lg border-slate-800 text-white"
                >
                  <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

// InvitationsPage Component
const InvitationsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [invitations, setInvitations] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    declined: 0,
    mutual: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchWithTimeout = async (url, options, timeout = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  };

  useEffect(() => {
    const fetchInvitations = async () => {
      console.log("fetchInvitations: Starting fetch", { status, retryCount });
      if (status !== "authenticated") {
        console.log("fetchInvitations: Not authenticated");
        setError("Please log in as admin");
        setIsLoading(false);
        return;
      }
      if (!session?.user?.role || session.user.role !== "admin") {
        console.log("fetchInvitations: Unauthorized, not admin", {
          user: session?.user,
        });
        setError("Unauthorized access: Admin role required");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const res = await fetchWithTimeout(
          "/api/invitations",
          {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          },
          10000
        );
        if (!res.ok) {
          const text = await res.text();
          console.error("Invitations raw response:", text);
          throw new Error(
            `Failed to fetch invitations: ${res.status} ${
              text || "No response body"
            }`
          );
        }
        const data = await res.json();
        if (!data.invitations || !data.counts) {
          throw new Error("Invalid invitations response structure");
        }
        setInvitations(
          data.invitations.map((inv) => ({
            ...inv,
            sentDate: inv.createdAt || new Date().toISOString().split("T")[0],
            responseDate: inv.updatedAt || null,
            sender: {
              id: inv.senderId?._id || "N/A",
              name: inv.senderId?.name || "N/A",
              age: inv.senderId?.age || "N/A",
              location: inv.senderId?.city || "N/A",
            },
            receiver: {
              id: inv.receiverId?._id || "N/A",
              name: inv.receiverId?.name || "N/A",
              age: inv.receiverId?.age || "N/A",
              location: inv.receiverId?.city || "N/A",
            },
          }))
        );
        setCounts(data.counts);
      } catch (err) {
        console.error("Fetch error:", err.message, err.stack);
        setError(err.message);
        toast.error("Failed to load invitations", {
          description: err.message,
          style: {
            background: "#ef4444",
            color: "#ffffff",
            border: "1px solid #dc2626",
          },
        });
      } finally {
        setIsLoading(false);
        console.log("fetchInvitations: Fetch completed", {
          isLoading: false,
          error,
        });
      }
    };

    if (status === "authenticated") {
      fetchInvitations();
    }
  }, [status, session, retryCount, error]);

  const handleUpdateStatus = async (invitationId, newStatus) => {
    try {
      const res = await fetchWithTimeout(
        "/api/invitations",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invitationId, status: newStatus }),
          credentials: "include",
        },
        10000
      );
      if (!res.ok) {
        const text = await res.text();
        console.error("Update status raw response:", {
          status: res.status,
          body: text || "No response body",
        });
        throw new Error(
          `Failed to update invitation: ${res.status} ${
            text || "No response body"
          }`
        );
      }
      const currentInvitation = invitations.find(
        (inv) => inv._id === invitationId
      );
      setInvitations(
        invitations.map((inv) =>
          inv._id === invitationId
            ? {
                ...inv,
                status: newStatus,
                responseDate: new Date().toISOString().split("T")[0],
              }
            : inv
        )
      );
      setCounts((prev) => ({
        ...prev,
        [newStatus.toLowerCase()]: prev[newStatus.toLowerCase()] + 1,
        [currentInvitation.status.toLowerCase()]:
          prev[currentInvitation.status.toLowerCase()] - 1,
        mutual: newStatus === "accepted" ? prev.mutual + 1 : prev.mutual,
      }));
      toast.success(`Invitation ${newStatus.toLowerCase()}`, {
        style: {
          background: "#22c55e",
          color: "#ffffff",
          border: "1px solid #16a34a",
        },
      });
    } catch (err) {
      console.error("Update status error:", err.message);
      toast.error("Failed to update invitation", {
        description: err.message,
        style: {
          background: "#ef4444",
          color: "#ffffff",
          border: "1px solid #dc2626",
        },
      });
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setIsLoading(true);
    setError("");
    console.log("handleRetry: Retrying fetch", { retryCount: retryCount + 1 });
  };

  const filteredInvitations = invitations.filter((invitation) => {
    const matchesSearch =
      invitation.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.receiver.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      invitation.sender.location
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      invitation.receiver.location
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      invitation.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const connections = invitations.filter(
    (inv) => inv.status.toLowerCase() === "accepted"
  );

  const totalPages = Math.ceil(filteredInvitations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvitations = filteredInvitations.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
        <div className="flex flex-col items-center gap-4 bg-black/50 p-8 rounded-xl">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-pink-500 animate-spin"></div>
          </div>
          <p className="text-white/80 text-lg animate-pulse">
            Loading Invitations...
          </p>
        </div>
      </div>
    );
  }

  if (error || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
        <div className="bg-red-500/20 text-white p-6 rounded-xl border border-red-500/50 text-center">
          <p className="mb-4">{error || "Please log in as admin"}</p>
          {error && (
            <Button
              onClick={handleRetry}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Invitations & Connections
          </h1>
          <Link href="/admin">
            <Button
              variant="outline"
              className=" bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 p-4 rounded-xl border border-white/20">
            <h3 className="text-sm font-semibold text-white/70">
              Total Invitations
            </h3>
            <p className="text-2xl text-pink-500">{counts.total || 0}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20">
            <h3 className="text-sm font-semibold text-white/70">
              Mutual Invitations
            </h3>
            <p className="text-2xl text-pink-500">{counts.mutual || 0}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20">
            <h3 className="text-sm font-semibold text-white/70">
              Pending Invitations
            </h3>
            <p className="text-2xl text-pink-500">{counts.pending || 0}</p>
          </div>
        </div>

        <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white">
              Manage User Interactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="invitations">
              <TabsList className="bg-white/10 border border-white/20 mb-6">
                <TabsTrigger
                  value="invitations"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 text-white"
                >
                  All Invitations
                </TabsTrigger>
                <TabsTrigger
                  value="connections"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 text-white"
                >
                  Active Connections
                </TabsTrigger>
              </TabsList>

              <TabsContent value="invitations">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                    <Input
                      placeholder="Search by name or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-40">
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border border-white/10 overflow-hidden">
                  <table className="w-full text-white/90">
                    <thead className="bg-white/10">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium">
                          Sender
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium">
                          Receiver
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium">
                          Status
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium">
                          Sent Date
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium">
                          Response Date
                        </th>
                        <th className="py-3 px-4 text-right text-sm font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {paginatedInvitations.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-3 px-4 text-center text-white/70"
                          >
                            No invitations found
                          </td>
                        </tr>
                      ) : (
                        paginatedInvitations.map((invitation) => (
                          <tr key={invitation._id} className="hover:bg-white/5">
                            <td className="py-3 px-4 text-sm">
                              <div>
                                <div className="font-medium">
                                  {invitation.sender.name}
                                </div>
                                <div className="text-white/70 text-xs">
                                  {invitation.sender.age},{" "}
                                  {invitation.sender.location}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div>
                                <div className="font-medium">
                                  {invitation.receiver.name}
                                </div>
                                <div className="text-white/70 text-xs">
                                  {invitation.receiver.age},{" "}
                                  {invitation.receiver.location}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  invitation.status.toLowerCase() === "accepted"
                                    ? "bg-green-500/20 text-green-400"
                                    : invitation.status.toLowerCase() ===
                                      "declined"
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-amber-500/20 text-amber-400"
                                }`}
                              >
                                {invitation.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {invitation.sentDate}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {invitation.responseDate || (
                                <span className="text-white/50">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-56 bg-black/80 backdrop-blur-lg border-slate-800 text-white"
                                >
                                  <DropdownMenuItem
                                    className="hover:bg-white/10 cursor-pointer"
                                    onClick={() =>
                                      router.push(
                                        `/invitations/${invitation._id}`
                                      )
                                    }
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {invitation.status.toLowerCase() ===
                                    "pending" && (
                                    <>
                                      <DropdownMenuItem
                                        className="hover:bg-white/10 cursor-pointer"
                                        onClick={() =>
                                          handleUpdateStatus(
                                            invitation._id,
                                            "accepted"
                                          )
                                        }
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Accept
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="hover:bg-white/10 cursor-pointer"
                                        onClick={() =>
                                          handleUpdateStatus(
                                            invitation._id,
                                            "declined"
                                          )
                                        }
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Decline
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {paginatedInvitations.length > 0 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-white/70">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(
                        startIndex + itemsPerPage,
                        filteredInvitations.length
                      )}{" "}
                      of {filteredInvitations.length} invitations
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className=" bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              page === currentPage ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={
                              page === currentPage
                                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0"
                                : "border-white/20 text-white hover:bg-white/10"
                            }
                          >
                            {page}
                          </Button>
                        )
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className=" bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="connections">
                <div className="rounded-md border border-white/10 overflow-hidden">
                  <table className="w-full text-white/90">
                    <thead className="bg-white/10">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium">
                          User 1
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium">
                          User 2
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium">
                          Connected Since
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium">
                          Status
                        </th>
                        <th className="py-3 px-4 text-right text-sm font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {connections.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-3 px-4 text-center text-white/70"
                          >
                            No active connections
                          </td>
                        </tr>
                      ) : (
                        connections.map((connection) => (
                          <tr key={connection._id} className="hover:bg-white/5">
                            <td className="py-3 px-4 text-sm">
                              <div>
                                <div className="font-medium">
                                  {connection.sender.name}
                                </div>
                                <div className="text-white/70 text-xs">
                                  {connection.sender.age},{" "}
                                  {connection.sender.location}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div>
                                <div className="font-medium">
                                  {connection.receiver.name}
                                </div>
                                <div className="text-white/70 text-xs">
                                  {connection.receiver.age},{" "}
                                  {connection.receiver.location}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {connection.responseDate}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <Badge className="bg-green-500 hover:bg-green-600 text-white">
                                Connected
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-56 bg-black/80 backdrop-blur-lg border-slate-800 text-white"
                                >
                                  <DropdownMenuItem
                                    className="hover:bg-white/10 cursor-pointer"
                                    onClick={() =>
                                      router.push(
                                        `/invitations/${connection._id}`
                                      )
                                    }
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="hover:bg-white/10 cursor-pointer"
                                    onClick={() =>
                                      router.push(`/messages/${connection._id}`)
                                    }
                                  >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    View Messages
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="hover:bg-white/10 cursor-pointer"
                                    onClick={() =>
                                      handleUpdateStatus(
                                        connection._id,
                                        "declined"
                                      )
                                    }
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Disconnect
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default InvitationsPage;
