"use client";
import { useSession } from "next-auth/react";

export default function InvitationCard({ invitation }) {
  const { data: session } = useSession();

  const handleInvitation = async (status) => {
    try {
      const res = await fetch(`/api/invitations/${invitation._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else alert(`Invitation ${status}!`);
    } catch (error) {
      alert("Error updating invitation");
    }
  };

  return (
    <div className="border p-4 rounded shadow">
      <p>
        From: {invitation.senderId.email} | To: {invitation.receiverId.email}
      </p>
      <p>Status: {invitation.status}</p>
      {invitation.receiverId._id === session?.user.id &&
        invitation.status === "pending" && (
          <div className="space-x-2">
            <button
              onClick={() => handleInvitation("accepted")}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Accept
            </button>
            <button
              onClick={() => handleInvitation("rejected")}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Reject
            </button>
          </div>
        )}
    </div>
  );
}
