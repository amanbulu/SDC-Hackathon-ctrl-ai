import { useQuery } from '@tanstack/react-query';
import { evaluateProfile } from '@workspace/api-client-react';
import { useApp } from '@/lib/store';

// Read-only, separately cached evaluations: never write comparison results into
// the app's selected-scenario or hypothetical-learning state.
export function useScenarioComparison() {
  const { catalog, years, simulated, weights } = useApp();
  return useQuery({
    queryKey: ['skillhalflife-scenario-comparison', years, simulated, weights],
    enabled: !!catalog,
    staleTime: 30_000,
    retry: 1,
    queryFn: async ({ signal }) => {
      const common = { years, simulatedSkills: simulated, sdgWeights: weights };
      const [moderate, fast] = await Promise.all([
        evaluateProfile({ ...common, scenario: 'moderate' }, { signal }),
        evaluateProfile({ ...common, scenario: 'fast' }, { signal }),
      ]);
      return { moderate, fast };
    },
  });
}
