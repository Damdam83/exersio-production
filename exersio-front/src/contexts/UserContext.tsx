import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, Club, Invitation } from "../types";

interface UserContextType {
  currentUser: User | null;
  currentClub: Club | null;
  invitations: Invitation[];
  actions: {
    updateUser: (updates: Partial<User>) => void;
    createClub: (club: Omit<Club, "id" | "createdAt">) => void;
    joinClub: (inviteCode: string) => void;
    sendInvitation: (email: string, role: "coach" | "assistant") => void;
    respondToInvitation: (invitationId: string, response: "accepted" | "declined") => void;
  };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: "u1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "coach",
    createdAt: new Date(),
  });

  const [currentClub, setCurrentClub] = useState<Club | null>(null);

  const [invitations, setInvitations] = useState<Invitation[]>([
    {
      id: "inv1",
      clubId: "club-1",
      clubName: "Volley Club",
      invitedBy: "u2",
      invitedByName: "Alice",
      email: "test@example.com",
      role: "coach",
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    },
  ]);

  const actions = {
    updateUser: (updates: Partial<User>) => {
      if (currentUser) {
        setCurrentUser({ ...currentUser, ...updates });
      }
    },

    createClub: (club: Omit<Club, "id" | "createdAt">) => {
      const newClub: Club = {
        ...club,
        id: `club-${Date.now()}`,
        createdAt: new Date(),
      };
      setCurrentClub(newClub);
    },

    joinClub: (inviteCode: string) => {
      const newClub: Club = {
        id: "club-joined",
        ownerId: currentUser?.id || "",
        name: "Volley Club",
        description: "Club rejoint via code",
        members: [currentUser?.id || ""],
        inviteCode,
        createdAt: new Date(),
      };
      setCurrentClub(newClub);
    },

    sendInvitation: (email: string, role: "coach" | "assistant") => {
      if (!currentClub || !currentUser) return;

      const newInvitation: Invitation = {
        id: `inv-${Date.now()}`,
        clubId: currentClub.id,
        clubName: currentClub.name,
        invitedBy: currentUser.id,
        invitedByName: currentUser.name,
        email,
        role,
        status: "pending",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      setInvitations((prev) => [...prev, newInvitation]);
    },

    respondToInvitation: (invitationId: string, response: "accepted" | "declined") => {
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === invitationId ? { ...inv, status: response } : inv))
      );

      if (response === "accepted") {
        const invitation = invitations.find((inv) => inv.id === invitationId);
        if (invitation && currentUser) {
          setCurrentClub({
            id: invitation.clubId,
            ownerId: invitation.invitedBy,
            name: invitation.clubName,
            description: "Club rejoint via invitation",
            members: [currentUser.id],
            inviteCode: "INVITE123",
            createdAt: new Date(),
          });
        }
      }
    },
  };

  return (
    <UserContext.Provider value={{ currentUser, currentClub, invitations, actions }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
