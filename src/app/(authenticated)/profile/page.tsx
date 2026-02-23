"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/lib/hooks/use-auth";
import { getUserById } from "@/lib/firestore/users";
import { ProfileView } from "@/components/profile/ProfileView";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { Spinner } from "@/components/ui/Spinner";
import type { UserDocument } from "@/lib/types/user";

export default function ProfilePage() {
  const { uid, role } = useAuth();
  const [profile, setProfile] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    getUserById(uid).then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, [uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!profile || !uid) {
    return (
      <div className="py-20 text-center text-[15px] text-[#6E6E73]">
        Profile not found. Please contact your TA.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
          My Profile
        </h1>
        <p className="mt-1 text-[15px] text-[#6E6E73]">
          View your university info and manage your trip details
        </p>
      </div>

      <div className="space-y-6">
        {role !== "ta" && <ProfileView user={profile} />}
        <ProfileEditForm
          user={profile}
          uid={uid}
          onUpdate={(data) => setProfile({ ...profile, ...data })}
        />
      </div>
    </div>
  );
}
