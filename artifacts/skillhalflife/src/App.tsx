import { lazy, Suspense, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Shell } from '@/components/shell';
import { AppProvider } from '@/lib/store';
import { CvProvider } from '@/lib/cv-context';
import Overview from '@/pages/overview';
import { RouteLoadError, RouteLoading } from '@/components/route-status';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

// Keep these at module scope so ordinary state updates never recreate a lazy page.
// Only Overview is eager: none of the chart modules belong in its download graph.
const HalfLife = lazy(() => import('@/pages/half-life'));
const RadarPage = lazy(() => import('@/pages/radar'));
const Careers = lazy(() => import('@/pages/careers'));
const Pathway = lazy(() => import('@/pages/pathway'));
const Sdg = lazy(() => import('@/pages/sdg'));
const Lab = lazy(() => import('@/pages/lab'));
const Sources = lazy(() => import('@/pages/sources'));
const MyCv = lazy(() => import('@/pages/my-cv'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

function Router() {
  return (
    <Shell>
      <RoutedErrorBoundary>
        <Suspense fallback={<RouteLoading />}>
          <Switch>
            <Route path="/" component={Overview} />
            <Route path="/half-life" component={HalfLife} />
            <Route path="/radar" component={RadarPage} />
            <Route path="/careers" component={Careers} />
            <Route path="/pathway" component={Pathway} />
            <Route path="/sdg" component={Sdg} />
            <Route path="/lab" component={Lab} />
            <Route path="/my-cv" component={MyCv} />
            <Route path="/sources" component={Sources} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </RoutedErrorBoundary>
    </Shell>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return (
    <ErrorBoundary resetKey={location} FallbackComponent={RouteLoadError}>
      {/* Do not leave the previous section visible while a new route loads. */}
      <div key={location}>{children}</div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CvProvider>
          <AppProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
          </AppProvider>
        </CvProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
