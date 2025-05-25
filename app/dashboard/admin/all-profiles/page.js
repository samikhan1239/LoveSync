"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  Heart,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
} from "lucide-react";
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
    { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Profiles", href: "/dashboard/admin/all-profiles", icon: Users },
    { name: "Invitations", href: "/dashboard/admin/invitations", icon: Heart },
    { name: "Pending Requests", href: "/dashboard/admin/pending", icon: Clock },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setSidebarOpen(!sidebarOpen);
          }}
          className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-white/10 border-white/20 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Link>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-black/50 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-white/10">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-2"
            >
              <Heart className="h-7 w-7 text-pink-500 fill-pink-500" />
              <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                LoveSync Admin
              </span>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
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

// ProfileManagement Component
const ProfileManagement = () => {
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingProfileId, setDeletingProfileId] = useState(null);
  const itemsPerPage = 8;

  // Log deletingProfileId changes
  useEffect(() => {
    console.log("deletingProfileId state changed", { deletingProfileId });
  }, [deletingProfileId]);

  const fetchWithTimeout = async (url, options, timeout = 30000) => {
    console.log(`fetchWithTimeout: Initiating fetch to ${url}`, {
      options,
      timeout,
    });
    const controller = new AbortController();
    const id = setTimeout(() => {
      console.warn(`fetchWithTimeout: Timeout triggered for ${url}`);
      controller.abort("Request timed out after " + timeout + "ms");
    }, timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      console.log(`fetchWithTimeout: Response received for ${url}`, {
        status: response.status,
      });
      clearTimeout(id);
      if (!response.ok) {
        const text = await response.text();
        console.error(`fetchWithTimeout: Fetch error for ${url}`, {
          status: response.status,
          body: text || "No response body",
        });
        throw new Error(`HTTP ${response.status}: ${text || "Unknown error"}`);
      }
      return response;
    } catch (err) {
      console.error(`fetchWithTimeout: Fetch failed for ${url}`, {
        error: err.message,
        name: err.name,
        cause: err.cause,
      });
      if (err.name === "AbortError") {
        throw new Error(`Request aborted: ${err.message || "Unknown reason"}`);
      }
      throw err;
    } finally {
      clearTimeout(id);
      console.log(`fetchWithTimeout: Timeout cleared for ${url}`);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchProfiles = async () => {
      console.log("fetchProfiles: Starting", {
        status,
        retryCount,
        session: !!session,
      });
      if (status !== "authenticated") {
        console.log("fetchProfiles: Not authenticated");
        setError("Please log in as admin");
        setIsLoading(false);
        return;
      }
      if (!session?.user?.role || session.user.role !== "admin") {
        console.log("fetchProfiles: Unauthorized", { user: session?.user });
        setError("Unauthorized access: Admin role required");
        setIsLoading(false);
        router.push("/auth/signin");
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const res = await fetchWithTimeout(
          "/api/profiles?adminView=true",
          {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            signal: controller.signal,
          },
          30000
        );
        const data = await res.json();
        console.log("fetchProfiles: Response received", {
          profiles: data.profiles?.length,
          counts: data.counts,
        });
        if (!data.profiles || !data.counts) {
          throw new Error(
            "Invalid response structure: missing profiles or counts"
          );
        }
        setProfiles(
          data.profiles.map((p) => ({
            ...p,
            _id: p._id || "",
            name: p.name || "Unknown",
            city: p.city || "N/A",
            occupation: p.occupation || "N/A",
            status: p.status || "pending",
            verified: p.verified || false,
            premium: p.premium || false,
          }))
        );
        setCounts({
          total: data.counts.total || 0,
          pending: data.counts.pending || 0,
          approved: data.counts.approved || 0,
          rejected: data.counts.rejected || 0,
        });
        console.log("fetchProfiles: Profiles and counts updated");
      } catch (err) {
        if (err.name === "AbortError") {
          console.log(
            "fetchProfiles: Request aborted due to component unmount or timeout",
            {
              reason: err.message,
            }
          );
          return;
        }
        console.error("fetchProfiles: Error", err.message, err.stack);
        setError(err.message);
        toast.error("Failed to load profiles", {
          description: err.message,
          duration: 5000,
          style: {
            background: "#ef4444",
            color: "#ffffff",
            border: "1px solid #dc2626",
          },
          action: {
            label: "Retry",
            onClick: () => setRetryCount((prev) => prev + 1),
          },
        });
      } finally {
        setIsLoading(false);
        console.log("fetchProfiles: Completed", { isLoading: false });
      }
    };

    if (status === "authenticated") {
      console.log(
        "fetchProfiles: Triggering fetch due to authenticated status"
      );
      fetchProfiles();
    }

    return () => {
      console.log("fetchProfiles: Aborting fetch on cleanup");
      controller.abort("Component unmounted");
    };
  }, [status, session, retryCount, router]);

  const handleDelete = async (profileId, profileName) => {
    if (!profileId || !profileName) {
      console.error("handleDelete: Invalid profileId or profileName", {
        profileId,
        profileName,
      });
      toast.error("Invalid profile data", {
        duration: 5000,
        style: {
          background: "#ef4444",
          color: "#ffffff",
          border: "1px solid #dc2626",
        },
      });
      return;
    }

    console.log("handleDelete: Starting deletion process", {
      profileId,
      profileName,
    });
    setDeletingProfileId(profileId);

    try {
      const controller = new AbortController();
      const fetchOptions = {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      };
      console.log("handleDelete: Fetch options", fetchOptions);
      const res = await fetchWithTimeout(
        `/api/profiles/${profileId}`,
        fetchOptions,
        60000
      );
      const data = await res.json();
      console.log("handleDelete: Response data", { data });

      if (!res.ok) {
        throw new Error(
          `Delete failed: HTTP ${res.status} - ${data.error || "Unknown error"}`
        );
      }

      const deletedProfile = profiles.find((p) => p._id === profileId);
      if (!deletedProfile) {
        console.error("handleDelete: Profile not found in local state", {
          profileId,
        });
        throw new Error("Profile not found in local state");
      }
      console.log("handleDelete: Updating profiles and counts", {
        deletedProfile,
      });
      setProfiles((prevProfiles) =>
        prevProfiles.filter((p) => p._id !== profileId)
      );
      setCounts((prev) => ({
        ...prev,
        total: prev.total > 0 ? prev.total - 1 : 0,
        pending:
          deletedProfile.status === "pending" && prev.pending > 0
            ? prev.pending - 1
            : prev.pending,
        approved:
          deletedProfile.status === "approved" && prev.approved > 0
            ? prev.approved - 1
            : prev.approved,
        rejected: prev.rejected + 1,
      }));
      console.log("handleDelete: State updated successfully");
      toast.success(`Profile "${profileName}" successfully deleted`, {
        duration: 5000,
        style: {
          background: "#22c55e",
          color: "#ffffff",
          border: "1px solid #16a34a",
        },
      });
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("handleDelete: Request aborted", { reason: err.message });
        toast.error("Delete request was canceled", {
          description: err.message,
          duration: 5000,
          style: {
            background: "#ef4444",
            color: "#ffffff",
            border: "1px solid #dc2626",
          },
        });
        return;
      }
      console.error(
        "handleDelete: Error during deletion",
        err.message,
        err.stack
      );
      toast.error("Failed to delete profile", {
        description: err.message,
        duration: 5000,
        action: {
          label: "Retry",
          onClick: () => {
            console.log("handleDelete: Retry triggered", {
              profileId,
              profileName,
            });
            handleDelete(profileId, profileName);
          },
        },
        style: {
          background: "#ef4444",
          color: "#ffffff",
          border: "1px solid #dc2626",
        },
      });
    } finally {
      console.log("handleDelete: Resetting deletingProfileId", { profileId });
      setDeletingProfileId(null);
      console.log("handleDelete: Triggering profile refresh");
      setRetryCount((prev) => prev + 1);
    }
  };

  const handleRetry = () => {
    console.log("handleRetry: Retrying fetch", { retryCount: retryCount + 1 });
    setRetryCount((prev) => prev + 1);
    setIsLoading(true);
    setError("");
  };

  const handleSearchChange = useCallback(
    (value) => {
      console.log("handleSearchChange: Scheduling search update", { value });
      const timeoutId = setTimeout(() => {
        console.log("handleSearchChange: Search term updated", { value });
        setSearchTerm(value);
        setCurrentPage(1);
      }, 300);
      return () => clearTimeout(timeoutId);
    },
    [setSearchTerm, setCurrentPage]
  );

  const filteredProfiles = React.useMemo(() => {
    console.log("filteredProfiles: Computing filtered profiles", {
      searchTerm,
      statusFilter,
    });
    return profiles.filter((profile) => {
      const matchesSearch =
        (profile.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (profile.city || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (profile.occupation || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && profile.status === "approved") ||
        (statusFilter === "pending" && profile.status === "pending") ||
        (statusFilter === "inactive" && profile.status === "inactive");

      return matchesSearch && matchesStatus;
    });
  }, [profiles, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProfiles = filteredProfiles.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      console.log("useEffect: Resetting currentPage", {
        currentPage,
        totalPages,
      });
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const SkeletonLoader = () => (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-white/10 rounded" />
        <div className="h-10 w-32 bg-white/10 rounded" />
      </div>
      <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="h-6 w-32 bg-white/10 rounded" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="h-10 w-full bg-white/10 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-40 bg-white/10 rounded" />
              <div className="h-10 w-32 bg-white/10 rounded" />
            </div>
          </div>
          <div className="rounded-md border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  {[
                    "Name",
                    "Age",
                    "City",
                    "Occupation",
                    "Status",
                    "View",
                    "Delete",
                  ].map((header) => (
                    <th key={header} className="py-3 px-4">
                      <div className="h-4 w-20 bg-white/10 rounded" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {Array.from({ length: itemsPerPage }).map((_, index) => (
                  <tr key={index} className="hover:bg-white/5">
                    <td className="py-3 px-4">
                      <div className="h-4 w-32 bg-white/10 rounded" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-12 bg-white/10 rounded" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-24 bg-white/10 rounded" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-28 bg-white/10 rounded" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-16 bg-white/10 rounded" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-8 bg-white/10 rounded" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-8 bg-white/10 rounded" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="h-4 w-48 bg-white/10 rounded" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 w-8 bg-white/10 rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (status === "loading" || isLoading) {
    return (
      <AdminLayout>
        <SkeletonLoader />
      </AdminLayout>
    );
  }

  if (error || status === "unauthenticated") {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
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
            {status === "unauthenticated" && (
              <Link href="/auth/signin">
                <Button className="mt-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
                  Go to Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Profile Management
          </h1>
          <Link href="/admin/add-profile">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
              Add New Profile
            </Button>
          </Link>
        </div>

        <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white">All Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[120px] p-4 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-white/10">
                <p className="text-sm text-white/70">Total Profiles</p>
                <p className="text-xl font-bold text-white">
                  {counts.total || 0}
                </p>
              </div>
              <div className="flex-1 min-w-[120px] p-4 rounded-lg bg-amber-500/20 border border-white/10">
                <p className="text-sm text-white/70">Pending</p>
                <p className="text-xl font-bold text-amber-400">
                  {counts.pending || 0}
                </p>
              </div>
              <div className="flex-1 min-w-[120px] p-4 rounded-lg bg-green-500/20 border border-white/10">
                <p className="text-sm text-white/70">Approved</p>
                <p className="text-xl font-bold text-green-400">
                  {counts.approved || 0}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                <Input
                  placeholder="Search by name, city, occupation..."
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500"
                />
              </div>
              <div className="flex gap-2">
                <div className="w-40">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Filter className="h-4 w-4 mr-2" /> More Filters
                </Button>
              </div>
            </div>

            <div className="rounded-md border border-white/10 overflow-hidden">
              <table className="w-full text-white/90">
                <thead className="bg-white/10">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium">
                      Name
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium">
                      Age
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium">
                      City
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium">
                      Occupation
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium">
                      Status
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-medium">
                      View
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-medium">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {paginatedProfiles.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-3 px-4 text-center text-white/70"
                      >
                        No profiles found
                      </td>
                    </tr>
                  ) : (
                    paginatedProfiles.map((profile) => (
                      <tr key={profile._id} className="hover:bg-white/5">
                        <td className="py-3 px-4 text-sm font-medium">
                          {profile.name}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {profile.age || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-sm">{profile.city}</td>
                        <td className="py-3 px-4 text-sm">
                          {profile.occupation}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              profile.status === "approved"
                                ? "bg-green-500/20 text-green-400"
                                : profile.status === "inactive"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            {profile.status === "approved"
                              ? "Active"
                              : profile.status === "pending"
                              ? "Pending"
                              : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              router.push(`/profiles/${profile._id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-400"
                                disabled={deletingProfileId === profile._id}
                                onClick={() =>
                                  console.log("Delete Button: Clicked", {
                                    profileId: profile._id,
                                    profileName: profile.name,
                                  })
                                }
                              >
                                {deletingProfileId === profile._id ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-black/80 border-white/10 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Profile
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-white/70">
                                  Are you sure you want to delete{" "}
                                  <strong>{profile.name}</strong>
                                  {"'s"} profile? This action is permanent and
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => {
                                    console.log(
                                      "AlertDialogAction: Delete confirmed",
                                      {
                                        profileId: profile._id,
                                        profileName: profile.name,
                                      }
                                    );
                                    handleDelete(profile._id, profile.name);
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {paginatedProfiles.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-white/70">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, filteredProfiles.length)}{" "}
                  of {filteredProfiles.length} profiles
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
                Total Profiles: {counts.total || 0} | Approved:{" "}
                {counts.approved || 0} | Pending: {counts.pending || 0} |
                Rejected: {counts.rejected || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default ProfileManagement;
