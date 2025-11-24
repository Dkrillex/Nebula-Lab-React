import React, { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Zap, DollarSign, Brain, Code, Calculator } from 'lucide-react';
import { useAppOutletContext } from '../../router';
interface ModelCreator {
  id: string;
  name: string;
  slug: string;
}

interface Evaluations {
  artificial_analysis_intelligence_index: number;
  artificial_analysis_coding_index: number;
  artificial_analysis_math_index: number;
  mmlu_pro: number;
  gpqa: number;
  hle: number;
  livecodebench: number;
  scicode: number;
  math_500: number | null;
  aime: number | null;
  aime_25: number | null;
  ifbench: number;
  lcr: number;
  terminalbench_hard: number;
  tau2: number;
}

interface Pricing {
  price_1m_blended_3_to_1: number;
  price_1m_input_tokens: number;
  price_1m_output_tokens: number;
}

interface ModelData {
  id: string;
  name: string;
  slug: string;
  release_date: string;
  model_creator: ModelCreator;
  evaluations: Evaluations;
  pricing: Pricing;
  median_output_tokens_per_second: number;
  median_time_to_first_token_seconds: number;
  median_time_to_first_answer_token: number;
}

interface ApiResponse {
  status: number;
  prompt_options: {
    parallel_queries: number;
    prompt_length: number;
  };
  data: ModelData[];
}

const RankPage: React.FC = () => {
  const { t } = useAppOutletContext();
  const [models, setModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/rank', {
          method: 'GET',
          headers: {
            'x-api-key': 'aa_mKpAYvFzbkXVycTHshPUgTxbVKfQqqlu',
            'Content-Type': 'application/json'
          }
        });
        console.log("response", response);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result: ApiResponse = await response.json();
        // Sort by intelligence index by default
        const sortedData = result.data.sort((a, b) => 
          (b.evaluations.artificial_analysis_intelligence_index || 0) - (a.evaluations.artificial_analysis_intelligence_index || 0)
        );
        setModels(sortedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            AI Model Leaderboard
          </h1>
          <p className="text-muted mt-2">
            Comprehensive ranking of LLM performance, speed, and pricing
          </p>
        </div>
        <div className="text-xs text-muted">
          Data source: artificialanalysis.ai
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4 min-w-[200px]">Model</th>
              <th className="px-6 py-4 text-center min-w-[120px]">
                <div className="flex items-center justify-center gap-1" title="Intelligence Index">
                  <Brain size={14} />
                  <span>Intelligence</span>
                </div>
              </th>
              <th className="px-6 py-4 text-center min-w-[120px]">
                <div className="flex items-center justify-center gap-1" title="Coding Index">
                  <Code size={14} />
                  <span>Coding</span>
                </div>
              </th>
              <th className="px-6 py-4 text-center min-w-[120px]">
                <div className="flex items-center justify-center gap-1" title="Math Index">
                  <Calculator size={14} />
                  <span>Math</span>
                </div>
              </th>
              <th className="px-6 py-4 text-center min-w-[120px]">
                <div className="flex items-center justify-center gap-1" title="Tokens per second">
                  <Zap size={14} />
                  <span>Speed</span>
                </div>
              </th>
              <th className="px-6 py-4 text-center min-w-[120px]">
                <div className="flex items-center justify-center gap-1" title="Price per 1M blended tokens">
                  <DollarSign size={14} />
                  <span>Price (1M)</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {models.map((model, index) => (
              <tr 
                key={model.id} 
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground text-base">{model.name}</span>
                    <span className="text-xs text-muted">{model.model_creator.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium">
                    {model.evaluations.artificial_analysis_intelligence_index?.toFixed(1) || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-medium text-muted-foreground">
                  {model.evaluations.artificial_analysis_coding_index?.toFixed(1) || '-'}
                </td>
                <td className="px-6 py-4 text-center font-medium text-muted-foreground">
                  {model.evaluations.artificial_analysis_math_index?.toFixed(1) || '-'}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-medium">{Math.round(model.median_output_tokens_per_second)} t/s</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      ${model.pricing.price_1m_blended_3_to_1?.toFixed(2)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankPage;
