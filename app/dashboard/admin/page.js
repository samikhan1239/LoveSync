"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  LayoutDashboard,
  Users,
  Heart,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Check,
  Trash2,
  Edit,
  Plus,
  Send,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Component: AllProfiles
const AllProfiles = ({ profiles, counts, handleDelete }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-4">
        Approved Profiles
      </h2>
      {profiles.length === 0 ? (
        <div className="text-center py-8 text-white/70">
          No approved profiles
        </div>
      ) : (
        <Table className="bg-black/50 border border-white/10">
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-white/80">Name</TableHead>
              <TableHead className="text-white/80">Age</TableHead>
              <TableHead className="text-white/80">City</TableHead>
              <TableHead className="text-white/80">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile._id} className="border-white/10">
                <TableCell className="text-white">{profile.name}</TableCell>
                <TableCell className="text-white">{profile.age}</TableCell>
                <TableCell className="text-white">
                  {profile.city || "N/A"}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Link href={`/profiles/${profile._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                    >
                      <Edit className="h-4 w-4 mr-1" /> View
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-black/80 border-white/10 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Profile</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/70">
                          Are you sure you want to delete {profile.name}&apos;s
                          profile? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => handleDelete(profile._id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div className="mt-4">
        <p className="text-sm text-white/70">
          Total Approved: {counts.approved || 0} | Total Profiles:{" "}
          {counts.total || 0}
        </p>
      </div>
    </div>
  );
};

// Component: PendingProfiles
const PendingProfiles = ({ profiles, counts, handleApprove, handleDelete }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-4">
        Pending Profiles
      </h2>
      {profiles.length === 0 ? (
        <div className="text-center py-8 text-white/70">
          No pending profiles
        </div>
      ) : (
        <Table className="bg-black/50 border border-white/10">
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-white/80">Name</TableHead>
              <TableHead className="text-white/80">Age</TableHead>
              <TableHead className="text-white/80">City</TableHead>
              <TableHead className="text-white/80">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile._id} className="border-white/10">
                <TableCell className="text-white">{profile.name}</TableCell>
                <TableCell className="text-white">{profile.age}</TableCell>
                <TableCell className="text-white">
                  {profile.city || "N/A"}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApprove(profile._id)}
                    className="border-green-200 text-green-400 hover:bg-green-500/20 hover:text-green-300"
                  >
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Link href={`/admin/edit-profile/${profile._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-black/80 border-white/10 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Profile</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/70">
                          Are you sure you want to delete {profile.name}&apos;s
                          profile? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => handleDelete(profile._id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div className="mt-4">
        <p className="text-sm text-white/70">
          Pending: {counts.pending || 0} | Total Profiles: {counts.total || 0}
        </p>
      </div>
    </div>
  );
};

// Component: Invitations
const Invitations = ({ invitations, invitationCounts }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-4">Invitations</h2>
      {invitations.length === 0 ? (
        <div className="text-center py-8 text-white/70">No invitations</div>
      ) : (
        <Table className="bg-black/50 border border-white/10">
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-white/80">Sender</TableHead>
              <TableHead className="text-white/80">Receiver</TableHead>
              <TableHead className="text-white/80">Message</TableHead>
              <TableHead className="text-white/80">Status</TableHead>
              <TableHead className="text-white/80">Sent At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((inv) => (
              <TableRow key={inv._id} className="border-white/10">
                <TableCell className="text-white">
                  {inv.senderName || "Unknown"}
                </TableCell>
                <TableCell className="text-white">
                  {inv.receiverName || "Unknown"}
                </TableCell>
                <TableCell className="max-w-xs truncate text-white">
                  {inv.message || "No message"}
                </TableCell>
                <TableCell className="text-white">{inv.status}</TableCell>
                <TableCell className="text-white">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div className="mt-4">
        <p className="text-sm text-white/70">
          Total: {invitationCounts.total || 0} | Pending:{" "}
          {invitationCounts.pending || 0} | Accepted:{" "}
          {invitationCounts.accepted || 0} | Mutual:{" "}
          {invitationCounts.mutual || 0}
        </p>
      </div>
    </div>
  );
};

// Component: AdminLayout
const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Profiles", href: "/admin/profiles", icon: Users },
    { name: "Invitations", href: "dashboard/admin/invitations", icon: Heart },
    { name: "Pending Requests", href: "/dashboard/admin/pending", icon: Clock },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 mb-9">
      {/* Mobile sidebar toggle */}
      <div className="py-7">
        <div className="lg:hidden fixed top-4 left-4 z-50 py-10">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="border-white/20  hover:bg-white/10"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-black/50 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full py-10">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-white/10">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-2"
            ></Link>
          </div>

          {/* Navigation */}
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

          {/* Logout */}
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

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

// Component: AdminDashboard
const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [approvedProfiles, setApprovedProfiles] = useState([]);
  const [pendingProfiles, setPendingProfiles] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [invitationCounts, setInvitationCounts] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    declined: 0,
    mutual: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated") {
        setError("Please log in as admin");
        setIsLoading(false);
        return;
      }
      if (!session?.user?.role || session.user.role !== "admin") {
        console.log("Unauthorized: Not admin", { user: session?.user });
        setError("Unauthorized access: Admin role required");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch approved profiles
        const approvedRes = await fetch(
          "/api/profiles?status=approved&adminView=true",
          {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!approvedRes.ok) {
          const text = await approvedRes.text();
          throw new Error(
            `Failed to fetch approved profiles: ${approvedRes.status} ${
              text || "No response body"
            }`
          );
        }
        const approvedData = await approvedRes.json();
        if (!approvedData.profiles || !approvedData.counts) {
          throw new Error("Invalid approved profiles response structure");
        }
        setApprovedProfiles(approvedData.profiles);
        setCounts(approvedData.counts);

        // Fetch pending profiles
        const pendingRes = await fetch(
          "/api/profiles?status=pending&adminView=true",
          {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!pendingRes.ok) {
          const text = await pendingRes.text();
          throw new Error(
            `Failed to fetch pending profiles: ${pendingRes.status} ${
              text || "No response body"
            }`
          );
        }
        const pendingData = await pendingRes.json();
        if (!pendingData.profiles || !pendingData.counts) {
          throw new Error("Invalid pending profiles response structure");
        }
        setPendingProfiles(pendingData.profiles);
        setCounts((prev) => ({
          ...prev,
          pending: pendingData.counts.pending,
        }));

        // Fetch invitations
        const invRes = await fetch("/api/invitations", {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!invRes.ok) {
          const text = await invRes.text();
          throw new Error(
            `Failed to fetch invitations: ${invRes.status} ${
              text || "No response body"
            }`
          );
        }
        const invData = await invRes.json();
        if (!invData.invitations || !invData.counts) {
          throw new Error("Invalid invitations response structure");
        }
        setInvitations(invData.invitations);
        setInvitationCounts(invData.counts);
      } catch (err) {
        console.error("Fetch error:", err.message, err.stack);
        setError(err.message);
        toast.error("Failed to load data", {
          description: err.message,
          style: {
            background: "#ef4444",
            color: "#ffffff",
            border: "1px solid #dc2626",
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchData();
    }
  }, [status, session]);

  const handleApprove = async (profileId) => {
    try {
      const res = await fetch("/api/profiles/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to approve profile: ${res.status} ${
            text || "No response body"
          }`
        );
      }
      const updatedProfile = await res.json();
      setPendingProfiles(pendingProfiles.filter((p) => p._id !== profileId));
      setApprovedProfiles([...approvedProfiles, updatedProfile.profile]);
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
      console.error("Approve error:", err.message, err.stack);
      toast.error("Failed to approve profile", {
        description:
          err.message === "Failed to approve profile: 405 No response body"
            ? "Approval endpoint not found. Please contact support."
            : err.message,
        style: {
          background: "#ef4444",
          color: "#ffffff",
          border: "1px solid #dc2626",
        },
      });
    }
  };

  const handleDelete = async (profileId) => {
    try {
      const res = await fetch(`/api/profiles/${profileId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to delete profile: ${res.status} ${
            text || "No response body"
          }`
        );
      }
      setApprovedProfiles(approvedProfiles.filter((p) => p._id !== profileId));
      setPendingProfiles(pendingProfiles.filter((p) => p._id !== profileId));
      setCounts((prev) => ({
        ...prev,
        total: prev.total - 1,
        approved: approvedProfiles.some((p) => p._id === profileId)
          ? prev.approved - 1
          : prev.approved,
        pending: pendingProfiles.some((p) => p._id === profileId)
          ? prev.pending - 1
          : prev.pending,
      }));
      toast.success("Profile deleted", {
        style: {
          background: "#22c55e",
          color: "#ffffff",
          border: "1px solid #16a34a",
        },
      });
    } catch (err) {
      console.error("Delete error:", err.message);
      toast.error("Failed to delete profile", {
        description: err.message,
        style: {
          background: "#ef4444",
          color: "#ffffff",
          border: "1px solid #dc2626",
        },
      });
    }
  };

  const dashboardContent = (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6 text-center">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-black/50 p-4 rounded-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white/80">
            Total Profiles
          </h3>
          <p className="text-2xl text-pink-500">{counts.total || 0}</p>
        </div>
        <div className="bg-black/50 p-4 rounded-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white/80">
            Pending Profiles
          </h3>
          <p className="text-2xl text-pink-500">{counts.pending || 0}</p>
        </div>
        <div className="bg-black/50 p-4 rounded-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white/80">
            Mutual Invitations
          </h3>
          <p className="text-2xl text-pink-500">
            {invitationCounts.mutual || 0}
          </p>
        </div>
      </div>

      {pathname === "/admin/profiles" && (
        <AllProfiles
          profiles={approvedProfiles}
          counts={counts}
          handleDelete={handleDelete}
        />
      )}
      {pathname === "/admin/pending-requests" && (
        <PendingProfiles
          profiles={pendingProfiles}
          counts={counts}
          handleApprove={handleApprove}
          handleDelete={handleDelete}
        />
      )}
      {pathname === "/admin/invitations" && (
        <Invitations
          invitations={invitations}
          invitationCounts={invitationCounts}
        />
      )}
      {pathname === "/admin/dashboard" && (
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Add Profile
          </h2>
          <Link href="/dashboard/user">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Create New Profile
            </Button>
          </Link>
          <p className="mt-4 text-white/70">
            Use the profile editor to add a new user profile.
          </p>
        </div>
      )}
    </div>
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500"></div>
      </div>
    );
  }

  if (error || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
        <div className="bg-red-500/20 text-white p-6 rounded-xl border border-red-500/50">
          {error || "Please log in as admin"}
        </div>
      </div>
    );
  }

  return <AdminLayout>{dashboardContent}</AdminLayout>;
};

export default AdminDashboard;
