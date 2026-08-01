import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchSubstances from "./tools/search-substances";
import getSubstance from "./tools/get-substance";
import checkMix from "./tools/check-mix";
import findDrugChecking from "./tools/find-drug-checking";
import reagentTestInfo from "./tools/reagent-test-info";
import emergencySteps from "./tools/emergency-steps";

// Direkter Supabase-Host als OAuth-Issuer (der publizierte Proxy-Host würde
// die RFC-8414-Issuer-Prüfung brechen).
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "rave-safe",
  title: "Rave Safe",
  version: "0.1.0",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  instructions:
    "Harm-Reduction-Tools von Rave Safe (DE/AT/CH). `search_substances` und `get_substance` liefern Substanzprofile mit Wirkung, Dauer, Dosis-Orientierung, Risiken und Quellen. `check_mix` bewertet Mischkonsum mit einer Ampel. `reagent_test_info` zeigt Reagenz-Farbreaktionen, `find_drug_checking` Anlaufstellen, `emergency_steps` Erste-Hilfe-Schritte. Antworten sind neutral und faktenbasiert, keine Dosierungsempfehlungen. Bei akuten Symptomen immer auf den Notruf 112 verweisen.",
  tools: [
    searchSubstances,
    getSubstance,
    checkMix,
    reagentTestInfo,
    findDrugChecking,
    emergencySteps,
  ],
});
