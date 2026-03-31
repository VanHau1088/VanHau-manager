import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/app/layout";
import { DashboardPage } from "@/app/page";
import { TodoPage } from "@/app/todo/page";
import { CheckPostPage } from "@/app/check-post/page";
import { WinPage } from "@/app/win/page";
import { TestHangPage } from "@/app/test-hang/page";
import { ChayHangPage } from "@/app/chay-hang/page";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { requestNotificationPermission } from "@/lib/notifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/todo" component={TodoPage} />
        <Route path="/check-post" component={CheckPostPage} />
        <Route path="/win" component={WinPage} />
        <Route path="/test-hang" component={TestHangPage} />
        <Route path="/chay-hang" component={ChayHangPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  useEffect(() => {
    setTimeout(() => {
      requestNotificationPermission();
    }, 2000);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
