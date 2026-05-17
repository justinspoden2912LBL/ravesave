import { NeuroRadar } from "./NeuroRadar";
import { TransmitterBars } from "./TransmitterBars";
import { EffectMeters } from "./EffectMeters";
import type { PharmaProfile } from "@/lib/pharmacology";

export function NeuroProfile({ profile }: { profile: PharmaProfile }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="glass-card p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Rezeptor-Profil
        </div>
        <NeuroRadar profile={profile} />
      </div>
      <div className="space-y-4">
        <div className="glass-card p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
            Transmitter-Aktivität
          </div>
          <TransmitterBars profile={profile.transmitter} />
        </div>
        <div className="glass-card p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
            Subjektives Effekt-Profil
          </div>
          <EffectMeters profile={profile.effects} />
        </div>
      </div>
    </div>
  );
}
