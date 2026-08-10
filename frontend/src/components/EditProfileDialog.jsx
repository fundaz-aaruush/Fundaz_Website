import { useState, useEffect } from "react";
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
import { useAuth } from "@/components/AuthContext";

export const EditProfileDialog = ({ open, onOpenChange }) => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: "", regNo: "", phone: "", course: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Sync form with current user profile when dialog opens
  useEffect(() => {
    if (open && user) {
      setForm({
        name:   user.name   || user.displayName || "",
        regNo:  user.regNo  || "",
        phone:  user.phone  || "",
        course: user.course || "",
      });
      setErrors({});
    }
  }, [open, user]);

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim())  errs.name  = "Required";
    if (!form.regNo.trim()) errs.regNo = "Required";
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) errs.phone = "10-digit number";
    if (!form.course.trim()) errs.course = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await updateProfile({
        name:   form.name.trim(),
        regNo:  form.regNo.trim(),
        phone:  form.phone.trim(),
        course: form.course.trim(),
      });
      toast.success("Profile updated!", { description: "Your details have been saved." });
      onOpenChange(false);
    } catch (err) {
      toast.error("Update failed", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="glass-panel max-w-sm border-border sm:rounded-xl"
        data-testid="edit-profile-dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">Edit Profile</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {user?.email && (
              <span className="font-mono-tech text-[10px] uppercase tracking-[0.15em]">
                {user.email}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-4">
          {/* Full Name */}
          <div className="grid gap-1.5">
            <Label htmlFor="ep-name">Full Name</Label>
            <Input
              id="ep-name"
              value={form.name}
              onChange={setF("name")}
              placeholder="Ada Lovelace"
              disabled={loading}
              data-testid="ep-input-name"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Reg No + Phone side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="ep-regno">Reg. No.</Label>
              <Input
                id="ep-regno"
                value={form.regNo}
                onChange={setF("regNo")}
                placeholder="RA2311…"
                disabled={loading}
                data-testid="ep-input-regno"
              />
              {errors.regNo && <p className="text-xs text-destructive">{errors.regNo}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ep-phone">Phone</Label>
              <Input
                id="ep-phone"
                value={form.phone}
                onChange={setF("phone")}
                placeholder="98765 43210"
                disabled={loading}
                data-testid="ep-input-phone"
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
          </div>

          {/* Course */}
          <div className="grid gap-1.5">
            <Label htmlFor="ep-course">Course / Department</Label>
            <Input
              id="ep-course"
              value={form.course}
              onChange={setF("course")}
              placeholder="B.Tech CSE"
              disabled={loading}
              data-testid="ep-input-course"
            />
            {errors.course && <p className="text-xs text-destructive">{errors.course}</p>}
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="ghostSilver"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="silver" disabled={loading} data-testid="ep-submit">
              {loading ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
