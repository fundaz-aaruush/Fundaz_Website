import { motion } from "framer-motion";
import { CalendarDays, MapPin, Users, Trophy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LetterPageShell, PageSection, SectionKicker, MarqueeStats, fadeUp } from "@/components/LetterPageShell";
import { FLAGSHIP, FLAGSHIP_STATS, IMAGES } from "@/data/content";

export default function FlagshipPage() {
  return (
    <LetterPageShell
      idx={0}
      heroImage={IMAGES.quizStage}
      title={<span>The Main Quiz. <span className="text-gradient-silver">Our crown event.</span></span>}
      intro={FLAGSHIP.description}
    >
      {/* Current edition — editorial split */}
      <PageSection data-testid="flagship-edition">
        <div className="grid items-center gap-10 border-t border-border pt-12 lg:grid-cols-2">
          <motion.div {...fadeUp} transition={{ duration: 0.7 }} className="relative overflow-hidden rounded-xl shadow-elegant">
            <img src={IMAGES.audiCar} alt="Audi car" className="h-[300px] w-full object-cover opacity-80 grayscale md:h-[400px]" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
            <p className="absolute bottom-4 left-5 font-mono-tech text-[10px] uppercase tracking-[0.3em] text-primary/80">Finale night · archive</p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}>
            <SectionKicker>2026 Edition</SectionKicker>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">{FLAGSHIP.edition}</h2>
            <p className="mt-1 font-mono-tech text-xs uppercase tracking-[0.3em] text-accent">{FLAGSHIP.theme}</p>
            <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2.5"><CalendarDays className="h-4 w-4 text-primary" />{FLAGSHIP.date}</span>
              <span className="inline-flex items-center gap-2.5"><Users className="h-4 w-4 text-primary" />{FLAGSHIP.teamSize}</span>
              <span className="col-span-2 inline-flex items-center gap-2.5"><MapPin className="h-4 w-4 text-primary" />{FLAGSHIP.venue}</span>
              <span className="col-span-2 inline-flex items-center gap-2.5"><Trophy className="h-4 w-4 text-primary" />Prize pool {FLAGSHIP.prizePool}</span>
            </div>

          </motion.div>
        </div>
      </PageSection>

      <MarqueeStats stats={FLAGSHIP_STATS} />

      {/* Rounds — vertical timeline */}
      <PageSection data-testid="flagship-rounds">
        <SectionKicker>The Road to the Title</SectionKicker>
        <h2 className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl">Three rounds. One survivor.</h2>
        <div className="relative mt-12 border-l border-border pl-8 sm:pl-12">
          {FLAGSHIP.rounds.map((r, i) => (
            <motion.div key={r.name} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.1 }} className="relative pb-12 last:pb-0" data-testid={`flagship-round-${i}`}>
              <span className="absolute -left-[41px] flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-background font-mono-tech text-xs text-primary shadow-glow sm:-left-[57px]">
                0{i + 1}
              </span>
              <h3 className="font-display text-xl font-semibold text-foreground">{r.name}</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">{r.detail}</p>
            </motion.div>
          ))}
        </div>
      </PageSection>

      {/* Previous editions — editorial year rows */}
      <PageSection data-testid="flagship-past">
        <SectionKicker>The Archive</SectionKicker>
        <h2 className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl">Previous editions</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Looking back at the legacy of the Main Quiz, each past edition brought its own unique flavor, challenging participants with unprecedented formats and brain-bending questions that set the gold standard for quizzing at Aaruush.
        </p>
        <div className="mt-10">
          {FLAGSHIP.pastEditions.map((e, i) => (
            <motion.div
              key={e.year}
              {...fadeUp}
              transition={{ duration: 0.55, delay: i * 0.06 }}
              className="group grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 border-t border-border py-7 last:border-b hover:bg-secondary/30 sm:grid-cols-[120px_1fr_auto] sm:gap-x-10"
              style={{ transition: "background-color 0.3s ease" }}
              data-testid={`flagship-past-${e.year}`}
            >
              <span className="font-display text-3xl font-bold text-gradient-silver sm:text-4xl">{e.year}</span>
              <div>
                <p className="max-w-xl text-sm text-muted-foreground">{e.note}</p>
              </div>
              {e.organiser ? (
                <span className="col-span-2 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-accent sm:col-span-1 sm:text-right">
                  Organiser: {e.organiser}
                </span>
              ) : (
                <span className="col-span-2 sm:col-span-1" />
              )}
            </motion.div>
          ))}
        </div>
      </PageSection>

    
    </LetterPageShell>
  );
}
