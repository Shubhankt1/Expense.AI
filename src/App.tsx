import { Authenticated, Unauthenticated } from "convex/react";
import { Toaster } from "sonner";
import { DateFilterProvider } from "./contexts/DateFilterContext";
import { AppContent } from "./components/AppContent";
import { LandingPage } from "./components/LandingPage";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Authenticated>
        <DateFilterProvider>
          <AppContent />
        </DateFilterProvider>
      </Authenticated>
      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>
      <Toaster />
    </div>
  );
}
