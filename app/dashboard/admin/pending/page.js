"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Clock,
  LayoutDashboard,
  Users,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Edit,
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
    { name: "Invitations", href: "/dashboard/admin/invitations", icon: Heart },
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
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
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
                <Link href={item.href} key={item.name}>
                  <div
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
                </Link>
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

// PendingProfiles Component
const PendingProfiles = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
    const fetchPendingProfiles = async () => {
      console.log("fetchPendingProfiles: Starting fetch", {
        status,
        retryCount,
      });
      if (status !== "authenticated") {
        console.log("fetchPendingProfiles: Not authenticated");
        setError("Please log in as admin");
        setIsLoading(false);
        return;
      }
      if (!session?.user?.role || session.user.role !== "admin") {
        console.log("fetchPendingProfiles: Unauthorized, not admin", {
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
          "/api/profiles?status=pending&adminView=true",
          {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          },
          10000
        );
        if (!res.ok) {
          const text = await res.text();
          console.error("Pending profiles raw response:", text);
          throw new Error(
            `Failed to fetch pending profiles: ${res.status} ${
              text || "No response body"
            }`
          );
        }
        const data = await res.json();
        if (!data.profiles || !data.counts) {
          throw new Error("Invalid pending profiles response structure");
        }
        setProfiles(
          data.profiles.map((p) => ({
            ...p,
            submittedDate:
              p.createdAt || new Date().toISOString().split("T")[0],
            reason: p.reason || "New profile registration",
            images: [p.photo || "/placeholder.svg?height=100&width=100"],
          }))
        );
        setCounts(data.counts);
      } catch (err) {
        console.error("Fetch error:", err.message, err.stack);
        setError(err.message);
        toast.error("Failed to load pending profiles", {
          description: err.message,
          style: {
            background: "#ef4444",
            color: "#ffffff",
            border: "1px solid #dc2626",
          },
        });
      } finally {
        setIsLoading(false);
        console.log("fetchPendingProfiles: Fetch completed", {
          isLoading: false,
        });
      }
    };

    if (status === "authenticated") {
      fetchPendingProfiles();
    }
  }, [status, session, retryCount, error]);

  const handleApprove = async (profileId) => {
    try {
      const res = await fetchWithTimeout(
        "/api/profiles/approve",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId }),
          credentials: "include",
        },
        10000
      );
      if (!res.ok) {
        const text = await res.text();
        console.error("Approve raw response:", {
          status: res.status,
          body: text || "No response body",
        });
        throw new Error(
          `Failed to approve profile: ${res.status} ${
            text || "No response body"
          }`
        );
      }
      setProfiles(profiles.filter((p) => p._id !== profileId));
      setCounts((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        approved: prev.approved + 1,
      }));
      toast.success("Profile approved", {
        style: {
          background: "#22c55e",
          color: "#ffffff",
          border: "1px solid #16a34a",
        },
      });
    } catch (err) {
      console.error("Approve error:", err.message);
      toast.error("Failed to approve profile", {
        description: err.message,
        style: {
          background: "#ef4444",
          color: "#ffffff",
          border: "1px solid #dc2626",
        },
      });
    }
  };

  const handleReject = async (profileId) => {
    try {
      const res = await fetchWithTimeout(
        `/api/profiles/${profileId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
        10000
      );
      if (!res.ok) {
        const text = await res.text();
        console.error("Delete raw response:", {
          status: res.status,
          body: text || "No response body",
        });
        throw new Error(
          `Failed to reject profile: ${res.status} ${
            text || "No response body"
          }`
        );
      }
      setProfiles(profiles.filter((p) => p._id !== profileId));
      setCounts((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        total: prev.total - 1,
        rejected: prev.rejected + 1,
      }));
      toast.success("Profile rejected", {
        style: {
          background: "#22c55e",
          color: "#ffffff",
          border: "1px solid #16a34a",
        },
      });
    } catch (err) {
      console.error("Reject error:", err.message);
      toast.error("Failed to reject profile", {
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

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.city || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.occupation || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesReason =
      reasonFilter === "all" ||
      (reasonFilter === "new profile" &&
        profile.reason.toLowerCase().includes("new profile")) ||
      (reasonFilter === "update" &&
        profile.reason.toLowerCase().includes("update"));

    return matchesSearch && matchesReason;
  });

  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProfiles = filteredProfiles.slice(
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
            Loading Pending Requests...
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
            Pending Requests
          </h1>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20">
            <h3 className="text-sm font-semibold text-white/70">
              Pending Profiles
            </h3>
            <p className="text-2xl text-pink-500">{counts.pending || 0}</p>
          </div>
        </div>

        <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white">Approval Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                <Input
                  placeholder="Search by name, city, occupation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500"
                />
              </div>
              <div className="flex gap-2">
                <div className="w-48">
                  <Select value={reasonFilter} onValueChange={setReasonFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Filter by reason" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                      <SelectItem value="all">All Reasons</SelectItem>
                      <SelectItem value="new profile">New Profiles</SelectItem>
                      <SelectItem value="update">Profile Updates</SelectItem>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedProfiles.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-white/70">
                  No pending profiles
                </div>
              ) : (
                paginatedProfiles.map((profile) => (
                  <Card
                    key={profile._id}
                    className="border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden">
                          <Image
                            src={profile.images[0]}
                            alt={profile.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate">
                            {profile.name}
                          </h3>
                          <p className="text-white/70 text-sm">
                            {profile.age}, {profile.city || "N/A"}
                          </p>
                          <p className="text-white/70 text-sm">
                            {profile.occupation || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-white/70 text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-pink-500" />
                          Submitted: {profile.submittedDate}
                        </div>
                        <div className="flex items-center text-white/70 text-sm">
                          <Clock className="h-4 w-4 mr-2 text-pink-500" />
                          Reason: {profile.reason}
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                          onClick={() =>
                            router.push(`/profiles/${profile._id}`)
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
                          onClick={() => handleApprove(profile._id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Link href={`/admin/edit-profile/${profile._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-blue-200 text-blue-400 hover:bg-blue-200/10"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-0"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-black/80 border-white/10 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Reject Profile
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-white/70">
                                Are you sure you want to reject{" "}
                                <strong>{profile.name}</strong>&apos;s profile?
                                This action will delete the profile and cannot
                                be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleReject(profile._id)}
                              >
                                Reject
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {paginatedProfiles.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-white/70">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, filteredProfiles.length)}{" "}
                  of {filteredProfiles.length} pending profiles
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={
                          page === currentPage
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0"
                            : "bg-white/10 border-white/20 text-white hover:bg-white/20"
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
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm text-white/70">
                Pending: {counts.pending || 0} | Total Profiles:{" "}
                {counts.total || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default PendingProfiles;
