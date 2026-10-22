import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Shell } from '@/components/shell';
import { AppProvider } from '@/lib/store';
import Overview from '@/pages/overview';
import HalfLife from '@/pages/half-life';
import RadarPage from '@/pages/radar';
import Careers from '@/pages/careers';
import Pathway from '@/pages/pathway';
import Sdg from '@/pages/sdg';
import Lab from '@/pages/lab';
import Sources from '@/pages/sources';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

function Router() {
  return (
    <Shell>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={Overview} />
          <Route path="/half-life" component={HalfLife} />
          <Route path="/radar" component={RadarPage} />
          <Route path="/careers" component={Careers} />
          <Route path="/pathway" component={Pathway} />
          <Route path="/sdg" component={Sdg} />
          <Route path="/lab" component={Lab} />
          <Route path="/sources" component={Sources} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </Shell>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
        </AppProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
