"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CldImage } from "next-cloudinary";

export default function ProfileCard({ profile }) {
  const { data: session } = useSession();
  const router = useRouter();

  const sendInvitation = async () => {
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: profile.userId._id }),
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else alert("Invitation sent!");
    } catch (error) {
      alert("Error sending invitation");
    }
  };

  return (
    <div className="border p-4 rounded shadow">
      {profile.photoUrl && (
        <CldImage
          src={profile.photoUrl}
          width={200}
          height={200}
          alt={profile.name}
        />
      )}
      <h2 className="text-xl font-bold">{profile.name}</h2>
      <p>{profile.bio}</p>
      <p>Instagram: {profile.instagramId}</p>
      {session?.user.id !== profile.userId._id && (
        <button
          onClick={sendInvitation}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send Invitation
        </button>
      )}
    </div>
  );
}
