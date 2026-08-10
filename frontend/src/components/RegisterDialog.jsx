import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthContext";
import { AuthDialog } from "@/components/AuthDialog";

/*
  Domain event team registration dialog.
  - If user is NOT logged in → shows AuthDialog first
  - If logged in → shows team registration form:
    • Team Name, Number of People
    • Team Lead (pre-filled from logged-in user): Name, Email, Reg No, Course
    • Dynamic member forms based on team size
  
  PLACEHOLDER — data is stored in localStorage only.
  Connect to backend when storage/auth device is provided.
*/

const EMPTY_MEMBER = { name: "", email: "", regNo: "", course: "" };

export const RegisterDialog = ({ event, open, onOpenChange }) => {
  const { user, isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState(2);
  const [members, setMembers] = useState([{ ...EMPTY_MEMBER }]);
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  // Team lead is pre-filled from logged-in user
  const teamLead = user
    ? { name: user.name, email: user.email, regNo: user.regNo, course: user.course || "" }
    : EMPTY_MEMBER;

  const handleTeamSizeChange = (e) => {
    const size = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
    setTeamSize(size);
    const memberCount = Math.max(0, size - 1); // minus the team lead
    setMembers((prev) => {
      if (prev.length < memberCount) {
        return [...prev, ...Array(memberCount - prev.length).fill(null).map(() => ({ ...EMPTY_MEMBER }))];
      }
      return prev.slice(0, memberCount);
    });
  };

  const updateMember = (idx, key, value) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [key]: value } : m))
    );
  };

  const validate = () => {
    const errs = {};
    if (!teamName.trim()) errs.teamName = "Required";
    if (teamSize < 1 || teamSize > 10) errs.teamSize = "1–10 members";

    members.forEach((m, i) => {
      if (!m.name.trim()) errs[`member_${i}_name`] = "Required";
      if (!/^\S+@\S+\.\S+$/.test(m.email)) errs[`member_${i}_email`] = "Valid email required";
      if (!m.regNo.trim()) errs[`member_${i}_regNo`] = "Required";
      if (!m.course.trim()) errs[`member_${i}_course`] = "Required";
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Guard: must have a real authenticated UID
    const userId = user?.uid;
    if (!userId) {
      toast.error("Authentication required", { description: "Please log in to register for events." });
      return;
    }

    setLoading(true);
    try {
      const registration = {
        eventId: event?.id,
        eventName: event?.name,
        teamName,
        teamSize,
        teamLead,
        members,
        registeredBy: userId,
        at: new Date().toISOString(),
      };

      // Write directly to Firestore in a collection specific to the Domain Event (DE)
      const collectionName = `registrations_${event?.id || 'unknown'}`;
      const { collection, addDoc, getDocs, query, where } = await import("firebase/firestore");
      const { db } = await import("../firebase");

      // Check for duplicate registration by this user for THIS specific event
      const q = query(collection(db, collectionName), where("registeredBy", "==", userId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast.error("Already registered", { description: "You have already registered a team for this event." });
        setLoading(false);
        return;
      }

      await addDoc(collection(db, collectionName), registration);

      toast.success(`Team "${teamName}" registered for ${event?.name}`, {
        description: `${teamSize} member${teamSize > 1 ? "s" : ""} locked in. See you at the arena.`,
      });

      // Reset form
      setTeamName("");
      setTeamSize(2);
      setMembers([{ ...EMPTY_MEMBER }]);
      setErrors({});
      onOpenChange(false);
    } catch (err) {
      toast.error("Registration failed", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  // If not logged in, intercept and show auth dialog
  if (open && !isAuthenticated) {
    return (
      <>
        <AuthDialog
          open={open && !isAuthenticated}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setShowAuth(false);
              onOpenChange(false);
            }
          }}
          defaultTab="signup"
        />
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel max-h-[90vh] max-w-lg overflow-y-auto border-border sm:rounded-xl" data-testid="register-dialog">
        <DialogHeader>
          <Badge variant="outline" className="w-fit border-primary/40 font-mono-tech text-[10px] uppercase tracking-[0.25em] text-primary">
            Domain Event · Team Registration
          </Badge>
          <DialogTitle className="font-display text-xl text-foreground">{event?.name}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {event?.date} — fill in your team details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 flex flex-col gap-5" data-testid="register-form">
          {/* Team info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="reg-team">Team Name</Label>
              <Input id="reg-team" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Occam's Lazers" data-testid="reg-input-team" />
              {errors.teamName && <p className="text-xs text-destructive">{errors.teamName}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="reg-size">No. of People</Label>
              <Input id="reg-size" type="number" min={1} max={10} value={teamSize} onChange={handleTeamSizeChange} data-testid="reg-input-size" />
              {errors.teamSize && <p className="text-xs text-destructive">{errors.teamSize}</p>}
            </div>
          </div>

          {/* Team Lead (pre-filled, read-only) */}
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <p className="font-mono-tech text-[10px] uppercase tracking-[0.3em] text-accent">Team Lead (You)</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-[10px] text-muted-foreground">Name</span>
                <p className="text-foreground">{teamLead.name || "—"}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Email</span>
                <p className="text-foreground">{teamLead.email || "—"}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Reg No.</span>
                <p className="text-foreground">{teamLead.regNo || "—"}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Course</span>
                <p className="text-foreground">{teamLead.course || "—"}</p>
              </div>
            </div>
          </div>

          {/* Dynamic member forms */}
          {members.map((m, i) => (
            <div key={i} className="rounded-lg border border-border bg-secondary/20 p-4">
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.3em] text-accent">
                Member {i + 2}
              </p>
              <div className="mt-3 grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <Label htmlFor={`member-${i}-name`} className="text-[11px]">Name</Label>
                    <Input
                      id={`member-${i}-name`}
                      value={m.name}
                      onChange={(e) => updateMember(i, "name", e.target.value)}
                      placeholder="Full name"
                      data-testid={`reg-member-${i}-name`}
                    />
                    {errors[`member_${i}_name`] && <p className="text-xs text-destructive">{errors[`member_${i}_name`]}</p>}
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor={`member-${i}-email`} className="text-[11px]">Email</Label>
                    <Input
                      id={`member-${i}-email`}
                      type="email"
                      value={m.email}
                      onChange={(e) => updateMember(i, "email", e.target.value)}
                      placeholder="email@srmist.edu.in"
                      data-testid={`reg-member-${i}-email`}
                    />
                    {errors[`member_${i}_email`] && <p className="text-xs text-destructive">{errors[`member_${i}_email`]}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <Label htmlFor={`member-${i}-regNo`} className="text-[11px]">Reg No.</Label>
                    <Input
                      id={`member-${i}-regNo`}
                      value={m.regNo}
                      onChange={(e) => updateMember(i, "regNo", e.target.value)}
                      placeholder="RA2311…"
                      data-testid={`reg-member-${i}-regno`}
                    />
                    {errors[`member_${i}_regNo`] && <p className="text-xs text-destructive">{errors[`member_${i}_regNo`]}</p>}
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor={`member-${i}-course`} className="text-[11px]">Course</Label>
                    <Input
                      id={`member-${i}-course`}
                      value={m.course}
                      onChange={(e) => updateMember(i, "course", e.target.value)}
                      placeholder="B.Tech CSE"
                      data-testid={`reg-member-${i}-course`}
                    />
                    {errors[`member_${i}_course`] && <p className="text-xs text-destructive">{errors[`member_${i}_course`]}</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <DialogFooter className="mt-2">
            <Button type="button" variant="ghostSilver" onClick={() => onOpenChange(false)} data-testid="reg-cancel" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="silver" data-testid="reg-submit" disabled={loading}>
              {loading ? "Registering..." : "Confirm Registration"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
