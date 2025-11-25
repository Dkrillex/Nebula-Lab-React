import React, { useEffect, useState, useMemo } from 'react';
import { Trophy, Zap, DollarSign, Brain, Code, Calculator, TrendingUp, Medal, Crown, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppOutletContext } from '../../router/context';
import { translations } from '../../translations';

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

type MetricType = 'intelligence' | 'coding' | 'math' | 'speed';

const METRIC_CONFIG = {
  intelligence: { 
    label: '智能指数',
    icon: Brain,
    barColor: 'from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500',
    bgColor: 'bg-slate-100 dark:bg-slate-800/40',
    tagBg: 'bg-slate-100 dark:bg-slate-800/50',
    tagText: 'text-slate-600 dark:text-slate-400',
  },
  coding: { 
    label: '编码能力',
    icon: Code,
    barColor: 'from-stone-300 to-stone-400 dark:from-stone-600 dark:to-stone-500',
    bgColor: 'bg-stone-100 dark:bg-stone-800/40',
    tagBg: 'bg-stone-100 dark:bg-stone-800/50',
    tagText: 'text-stone-600 dark:text-stone-400',
  },
  math: { 
    label: '数学能力',
    icon: Calculator,
    barColor: 'from-zinc-300 to-zinc-400 dark:from-zinc-600 dark:to-zinc-500',
    bgColor: 'bg-zinc-100 dark:bg-zinc-800/40',
    tagBg: 'bg-zinc-100 dark:bg-zinc-800/50',
    tagText: 'text-zinc-600 dark:text-zinc-400',
  },
  speed: { 
    label: '推理速度',
    icon: Zap,
    barColor: 'from-neutral-300 to-neutral-400 dark:from-neutral-600 dark:to-neutral-500',
    bgColor: 'bg-neutral-100 dark:bg-neutral-800/40',
    tagBg: 'bg-neutral-100 dark:bg-neutral-800/50',
    tagText: 'text-neutral-600 dark:text-neutral-400',
  },
};

const MEDAL_COLORS = ['text-amber-400', 'text-slate-400', 'text-orange-300'];

const RankPage: React.FC = () => {
  const { t } = useAppOutletContext();
  const [models, setModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<MetricType>('intelligence');
  const [showAllModels, setShowAllModels] = useState(false);
  const rankT = t?.rankPage || translations['zh'].rankPage;
  const failureMessage = rankT.fetchError;
  const LIST_INITIAL_COUNT = 10;

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
        if (!response.ok) {
          throw new Error(failureMessage);
        }
        const result: ApiResponse = await response.json();
        const sortedData = result.data.sort((a, b) =>
          (b.evaluations.artificial_analysis_intelligence_index || 0) - (a.evaluations.artificial_analysis_intelligence_index || 0)
        );
        setModels(sortedData);
      } catch (err) {
        console.error('Rank fetch error', err);
        setError(failureMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [failureMessage]);

  // 获取指标值
  const getMetricValue = (model: ModelData, metric: MetricType): number => {
    switch (metric) {
      case 'intelligence':
        return model.evaluations.artificial_analysis_intelligence_index || 0;
      case 'coding':
        return model.evaluations.artificial_analysis_coding_index || 0;
      case 'math':
        return model.evaluations.artificial_analysis_math_index || 0;
      case 'speed':
        return model.median_output_tokens_per_second || 0;
      default:
        return 0;
    }
  };

  // 按当前选择的指标排序
  const sortedByMetric = useMemo(() => {
    return [...models].sort((a, b) => getMetricValue(b, chartMetric) - getMetricValue(a, chartMetric));
  }, [models, chartMetric]);

  const maxValue = useMemo(() => {
    if (sortedByMetric.length === 0) return 100;
    return Math.max(...sortedByMetric.map(m => getMetricValue(m, chartMetric)));
  }, [sortedByMetric, chartMetric]);

  // 计算各指标最佳模型
  const bestModels = useMemo(() => {
    if (models.length === 0) return {};
    return {
      intelligence: models.reduce((best, m) => 
        (m.evaluations.artificial_analysis_intelligence_index || 0) > (best.evaluations.artificial_analysis_intelligence_index || 0) ? m : best
      ).id,
      coding: models.reduce((best, m) => 
        (m.evaluations.artificial_analysis_coding_index || 0) > (best.evaluations.artificial_analysis_coding_index || 0) ? m : best
      ).id,
      math: models.reduce((best, m) => 
        (m.evaluations.artificial_analysis_math_index || 0) > (best.evaluations.artificial_analysis_math_index || 0) ? m : best
      ).id,
      speed: models.reduce((best, m) => 
        (m.median_output_tokens_per_second || 0) > (best.median_output_tokens_per_second || 0) ? m : best
      ).id,
    };
  }, [models]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-red-500">
        {error}
      </div>
    );
  }

  const config = METRIC_CONFIG[chartMetric];

  const renderBarChart = () => {
    const top10 = sortedByMetric.slice(0, 10);

    return (
      <div className="space-y-2.5">
        {top10.map((model, index) => {
          const value = getMetricValue(model, chartMetric);
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const isTopThree = index < 3;
          const isFirst = index === 0;

          return (
            <div
              key={model.id}
              className={`group relative rounded-lg p-2 -mx-2 transition-colors ${isFirst ? 'bg-violet-50/50 dark:bg-violet-900/10' : ''}`}
            >
              <div className="flex items-center gap-3">
                {/* 排名 */}
                <div className="w-7 flex-shrink-0 flex items-center justify-center">
                  {isFirst ? (
                    <Crown className="w-5 h-5 text-violet-500" />
                  ) : isTopThree ? (
                    <Medal className={`w-5 h-5 ${MEDAL_COLORS[index]}`} />
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
                  )}
                </div>

                {/* 模型信息和柱状图 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`font-medium truncate text-sm ${isFirst ? 'text-violet-700 dark:text-violet-400' : isTopThree ? 'text-foreground' : 'text-foreground/80'}`}>
                        {model.name}
                      </span>
                      {isFirst && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                          <Sparkles className="w-3 h-3" />
                          最佳
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {model.model_creator.name}
                      </span>
                    </div>
                    <span className={`font-semibold tabular-nums text-sm flex-shrink-0 ml-2 ${isFirst ? 'text-violet-600 dark:text-violet-400' : 'text-foreground/70'}`}>
                      {chartMetric === 'speed' ? `${Math.round(value)} t/s` : value.toFixed(1)}
                    </span>
                  </div>

                  {/* 柱状图 */}
                  <div className={`h-6 rounded-md ${config.bgColor} overflow-hidden`}>
                    <div
                      className={`h-full bg-gradient-to-r ${isFirst ? 'from-violet-300 to-violet-400 dark:from-violet-600 dark:to-violet-500' : config.barColor} rounded-md transition-all duration-700 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    const displayModels = showAllModels ? models : models.slice(0, LIST_INITIAL_COUNT);
    const hasMore = models.length > LIST_INITIAL_COUNT;

    return (
      <div className="space-y-3">
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/30 text-muted-foreground text-xs font-medium">
              <tr>
                <th className="px-4 py-3 w-12 text-center">#</th>
                <th className="px-4 py-3 min-w-[160px]">{rankT.columns.model}</th>
                <th className="px-4 py-3 text-center min-w-[90px]">
                  <div className="flex items-center justify-center gap-1">
                    <Brain size={13} />
                    <span>{rankT.columns.intelligence}</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-center min-w-[90px]">
                  <div className="flex items-center justify-center gap-1">
                    <Code size={13} />
                    <span>{rankT.columns.coding}</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-center min-w-[90px]">
                  <div className="flex items-center justify-center gap-1">
                    <Calculator size={13} />
                    <span>{rankT.columns.math}</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-center min-w-[90px]">
                  <div className="flex items-center justify-center gap-1">
                    <Zap size={13} />
                    <span>{rankT.columns.speed}</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-center min-w-[90px]">
                  <div className="flex items-center justify-center gap-1">
                    <DollarSign size={13} />
                    <span>{rankT.columns.price}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {displayModels.map((model, index) => {
                const isTopThree = index < 3;
                const isBestIntelligence = model.id === bestModels.intelligence;
                const isBestCoding = model.id === bestModels.coding;
                const isBestMath = model.id === bestModels.math;
                const isBestSpeed = model.id === bestModels.speed;

                return (
                  <tr
                    key={model.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-center">
                      {isTopThree ? (
                        <Medal className={`w-4 h-4 mx-auto ${MEDAL_COLORS[index]}`} />
                      ) : (
                        <span className="text-muted-foreground text-xs">{index + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground/90 text-sm">
                          {model.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{model.model_creator.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        isBestIntelligence 
                          ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 ring-1 ring-violet-300 dark:ring-violet-700' 
                          : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                      }`}>
                        {isBestIntelligence && <Crown className="w-3 h-3" />}
                        {model.evaluations.artificial_analysis_intelligence_index?.toFixed(1) || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        isBestCoding 
                          ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 ring-1 ring-violet-300 dark:ring-violet-700' 
                          : 'bg-stone-100 dark:bg-stone-800/50 text-stone-600 dark:text-stone-400'
                      }`}>
                        {isBestCoding && <Crown className="w-3 h-3" />}
                        {model.evaluations.artificial_analysis_coding_index?.toFixed(1) || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        isBestMath 
                          ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 ring-1 ring-violet-300 dark:ring-violet-700' 
                          : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                      }`}>
                        {isBestMath && <Crown className="w-3 h-3" />}
                        {model.evaluations.artificial_analysis_math_index?.toFixed(1) || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        isBestSpeed 
                          ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 ring-1 ring-violet-300 dark:ring-violet-700' 
                          : 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400'
                      }`}>
                        {isBestSpeed && <Crown className="w-3 h-3" />}
                        {Math.round(model.median_output_tokens_per_second)} t/s
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-medium text-slate-600 dark:text-slate-400 text-sm">
                        ${model.pricing.price_1m_blended_3_to_1?.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 展示更多/收起按钮 */}
        {hasMore && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowAllModels(!showAllModels)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
            >
              {showAllModels ? (
                <>
                  <ChevronUp size={16} />
                  收起
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  展示更多（{models.length - LIST_INITIAL_COUNT} 个）
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* 页面标题 */}
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          {rankT.title}
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">{rankT.description}</p>
      </div>

      {/* 柱状图区域 */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-medium text-foreground/80">
              {config.label} TOP 10
            </h2>
          </div>

          {/* 指标类型切换 */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/50">
            {(Object.keys(METRIC_CONFIG) as MetricType[]).map((key) => {
              const { icon: Icon, label } = METRIC_CONFIG[key];
              const isActive = chartMetric === key;
              return (
                <button
                  key={key}
                  onClick={() => setChartMetric(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title={label}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
        {renderBarChart()}
      </div>

      {/* 列表区域 */}
      <div>
        <h2 className="text-sm font-medium text-foreground/80 mb-3 flex items-center gap-2">
          全部模型
          <span className="text-xs text-muted-foreground font-normal">
            （<Crown className="w-3 h-3 inline text-violet-500" /> 表示该指标最佳）
          </span>
        </h2>
        {renderListView()}
      </div>
    </div>
  );
};

export default RankPage;
