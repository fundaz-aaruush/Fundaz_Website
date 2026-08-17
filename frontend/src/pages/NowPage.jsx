import { useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LetterPageShell, PageSection, SectionKicker, fadeUp } from "@/components/LetterPageShell";
import { NOW_EVENTS, NOW_GLANCE } from "@/data/content";
import DomeGallery from "@/components/DomeGallery";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

const typeStyles = {
  Flagship: "border-primary/60 text-primary",
  Activity: "border-accent/60 text-accent",
  "Domain Event": "border-muted-foreground/50 text-muted-foreground",
};

function VolunteerForm() {
  const [formData, setFormData] = useState({ 
    name: "", regNo: "", email: "", phone: "" 
  });
  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const err = {};
    if (!formData.name.trim()) err.name = "Required";
    
    const regNo = formData.regNo.trim().toUpperCase();
    if (!regNo) err.regNo = "Required";
    else if (!regNo.startsWith("RA") || regNo.length < 13) err.regNo = "Invalid registration number format";

    if (!formData.email.trim()) err.email = "Required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) err.email = "Invalid email address";

    const phone = formData.phone.replace(/[\s()\-+]/g, "");
    if (!phone) err.phone = "Required";
    else if (!/^\d{10}$/.test(phone)) err.phone = "Enter a valid 10-digit number";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setStatus("submitting");
    try {
      // Storing Name, Reg No, Email, and Phone perfectly to Firebase
      await addDoc(collection(db, "volunteers"), {
        name: formData.name.trim(),
        regNo: formData.regNo.trim().toUpperCase(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/[\s()\-+]/g, ""),
        submittedAt: serverTimestamp(),
      });
      setStatus("success");
      setFormData({ name: "", regNo: "", email: "", phone: "" });
      setErrors({});
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex justify-between">
            <span>Full Name</span>
            {errors.name && <span className="text-destructive lowercase tracking-normal">{errors.name}</span>}
          </label>
          <Input 
            placeholder="Ada Lovelace" 
            value={formData.name} 
            onChange={(e) => { setFormData(d => ({ ...d, name: e.target.value })); setErrors(e => ({...e, name: null})) }}
            className={`bg-background/50 border-border/50 focus-visible:ring-primary/50 ${errors.name ? "border-destructive/50" : ""}`}
          />
        </div>
        <div className="space-y-2">
          <label className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex justify-between">
            <span>Register No.</span>
            {errors.regNo && <span className="text-destructive lowercase tracking-normal">{errors.regNo}</span>}
          </label>
          <Input 
            placeholder="RA2311XXXXXXX" 
            value={formData.regNo} 
            onChange={(e) => { setFormData(d => ({ ...d, regNo: e.target.value.toUpperCase() })); setErrors(e => ({...e, regNo: null})) }}
            className={`bg-background/50 border-border/50 focus-visible:ring-primary/50 ${errors.regNo ? "border-destructive/50" : ""}`}
          />
        </div>
        <div className="space-y-2">
          <label className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex justify-between">
            <span>Email</span>
            {errors.email && <span className="text-destructive lowercase tracking-normal">{errors.email}</span>}
          </label>
          <Input 
            type="email"
            placeholder="ada@srmist.edu.in" 
            value={formData.email} 
            onChange={(e) => { setFormData(d => ({ ...d, email: e.target.value })); setErrors(e => ({...e, email: null})) }}
            className={`bg-background/50 border-border/50 focus-visible:ring-primary/50 ${errors.email ? "border-destructive/50" : ""}`}
          />
        </div>
        <div className="space-y-2">
          <label className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex justify-between">
            <span>Phone</span>
            {errors.phone && <span className="text-destructive lowercase tracking-normal">{errors.phone}</span>}
          </label>
          <Input 
            type="tel"
            placeholder="98765 43210" 
            value={formData.phone} 
            onChange={(e) => { setFormData(d => ({ ...d, phone: e.target.value })); setErrors(e => ({...e, phone: null})) }}
            className={`bg-background/50 border-border/50 focus-visible:ring-primary/50 ${errors.phone ? "border-destructive/50" : ""}`}
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={status === "submitting" || status === "success"}
        className="w-full font-mono-tech uppercase tracking-[0.1em] text-xs h-11"
      >
        {status === "submitting" ? "Submitting..." : status === "success" ? "Submitted Successfully ✓" : "Submit Application"}
      </Button>
      {status === "error" && (
        <p className="text-destructive text-xs font-mono-tech uppercase tracking-wider text-center mt-2">Error submitting. Please check your connection.</p>
      )}
    </form>
  );
}

export default function NowPage() {

  return (
    <LetterPageShell
      idx={2}
      title={<span>Everything happening <span className="text-gradient-silver">this year.</span></span>}
      intro="This is mission control. Every register path across FUNDAZ lands here — flagship and activities route to the official Aaruush portal, while the three domain events take registrations right on this page."
    >
      {/* Days at a glance */}
      <PageSection data-testid="now-glance">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          {NOW_GLANCE.map((d, i) => (
            <motion.div key={d.day} {...fadeUp} transition={{ duration: 0.55, delay: i * 0.08 }} className="bg-card/70 p-6 backdrop-blur" data-testid={`now-day-${i}`}>
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.3em] text-accent">{d.day} · {d.date}</p>
              <p className="mt-3 font-display text-lg font-semibold text-foreground">{d.headline}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{d.note}</p>
            </motion.div>
          ))}
        </div>
      </PageSection>

      {/* Editorial event index */}
      <PageSection data-testid="now-events">
        <SectionKicker>The 2025 Lineup</SectionKicker>
        <div className="mt-8">
          {NOW_EVENTS.map((ev, i) => (
            <motion.div
              key={ev.id}
              {...fadeUp}
              transition={{ duration: 0.55, delay: (i % 3) * 0.07 }}
              className="group grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-4 border-t border-border py-8 last:border-b hover:bg-secondary/30 sm:gap-x-10 lg:grid-cols-[80px_1fr_auto]"
              style={{ transition: "background-color 0.3s ease" }}
              data-testid={`now-event-row-${ev.id}`}
            >
              <span className="font-display text-3xl font-bold text-primary/25 group-hover:text-primary/60 sm:text-4xl" style={{ transition: "color 0.3s ease" }}>
                0{i + 1}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-xl font-semibold text-foreground group-hover:translate-x-1 sm:text-2xl" style={{ transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)" }}>
                    {ev.name}
                  </h3>
                  <Badge variant="outline" className={`font-mono-tech text-[9px] uppercase tracking-[0.2em] ${typeStyles[ev.type]}`}>
                    {ev.type}
                  </Badge>
                </div>
                <p className="mt-1.5 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{ev.date}</p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{ev.blurb}</p>
                {ev.description && (
                  <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground/80">{ev.description}</p>
                )}
              </div>
              <div className="col-span-2 lg:col-span-1">
                <div
                  className="inline-flex items-center gap-2 rounded-md border border-dashed border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-mono-tech uppercase tracking-[0.15em]"
                  data-testid={`coming-soon-${ev.id}`}
                >
                  <Clock className="h-3.5 w-3.5 animate-pulse text-primary/60" />
                  <span className="text-primary/60">Coming Soon</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </PageSection>

      {/* Volunteer Section */}
      <PageSection data-testid="now-volunteer" className="border-t border-border mt-16 pt-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp} transition={{ duration: 0.55 }}>
            <SectionKicker>Join the Crew</SectionKicker>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Register as a Volunteer
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg leading-relaxed">
              Help us make FUNDAZ 2025 the most incredible event yet. We're looking for passionate individuals to assist with operations, hospitality, media, and tech.
            </p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ duration: 0.55, delay: 0.1 }} className="rounded-2xl border border-border bg-card/50 backdrop-blur p-8">
            <VolunteerForm />
          </motion.div>
        </div>
      </PageSection>

      <PageSection data-testid="now-team" className="max-w-none px-0 sm:px-0 pt-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 mb-10 text-center">
          <SectionKicker>The People Behind It</SectionKicker>
          <h2 className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
            This Year's Team
          </h2>
        </div>
        <div style={{ width: '100%', height: '80vh', position: 'relative' }}>
          <DomeGallery 
            minRadius={400}
            segments={28}
            grayscale={false}
          />
        </div>
      </PageSection>
    </LetterPageShell>
  );
}
