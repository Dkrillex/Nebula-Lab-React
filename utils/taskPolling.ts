/**
 * 通用任务轮询与进度辅助方法。
 * 默认每 10 秒轮询一次，最长 10 分钟；除非后端返回 500，否则自动重试。
 */

export type PollingStatus = string | undefined | null;

export interface PollingContext<TResponse = any> {
    attempts: number;
    elapsedMs: number;
    status: PollingStatus;
    response?: TResponse;
}

export interface PollingOptions<TResponse = any> {
    /** 发起轮询请求，返回任务最新状态 */
    request: () => Promise<TResponse>;
    /** 自定义状态解析，默认会尝试 taskStatus/status/task_status 字段 */
    parseStatus?: (response: TResponse) => PollingStatus;
    /** 自定义“进行中”状态判断 */
    isPending?: (status: PollingStatus, response: TResponse) => boolean;
    /** 自定义“成功”状态判断 */
    isSuccess?: (status: PollingStatus, response: TResponse) => boolean;
    /** 自定义“失败”状态判断 */
    isFailure?: (status: PollingStatus, response: TResponse) => boolean;
    /** 当捕获异常时是否继续轮询，默认遇到 500 停止，其余继续 */
    continueOnError?: (error: any) => boolean;
    /** 轮询间隔，默认 10s */
    intervalMs?: number;
    /** 最长轮询时长，默认 10 分钟 */
    maxDurationMs?: number;
    /** 初始进度，默认 0 */
    initialProgress?: number;
    /** 进度更新回调 */
    onProgress?: (progress: number, ctx: PollingContext<TResponse>) => void;
    /** 状态变化回调 */
    onStatusChange?: (status: PollingStatus, response: TResponse) => void;
    /** 成功回调 */
    onSuccess?: (response: TResponse, ctx: PollingContext<TResponse>) => void;
    /** 失败回调 */
    onFailure?: (response: TResponse, ctx: PollingContext<TResponse>) => void;
    /** 超时回调 */
    onTimeout?: (ctx: PollingContext<TResponse>) => void;
    /** 异常回调，返回 true 表示外部已处理，可以继续轮询 */
    onError?: (error: any, ctx: PollingContext<TResponse>) => void;
    /** 自定义进度模拟器，返回新的 progress 值 */
    progressSimulator?: (prevProgress: number) => number;
    /** 预设进度模式：fast≈1min、medium≈3min、slow≈6min */
    progressMode?: 'fast' | 'medium' | 'slow';
    /** 是否在 start 后立刻执行一次请求，默认 true；为 false 时等待一个 interval */
    immediate?: boolean;
}

export interface PollingController {
    start: () => void;
    stop: () => void;
    isRunning: () => boolean;
}

const defaultPendingStatuses = ['running', 'init', 'processing', 'pending', 'in_queue', 'queued'];
const defaultSuccessStatuses = ['success', 'succeeded', 'completed', 'done', 'finished'];
const defaultFailureStatuses = ['fail', 'failed', 'error', 'timeout', 'expired'];

const defaultParseStatus = (response: any): PollingStatus =>
    response?.taskStatus ??
    response?.task_status ??
    response?.status ??
    response?.data?.taskStatus ??
    response?.data?.status;

const defaultIsPending = (status?: PollingStatus) => {
    if (!status) return true;
    return defaultPendingStatuses.includes(String(status).toLowerCase());
};

const defaultIsSuccess = (status?: PollingStatus) => {
    if (!status) return false;
    return defaultSuccessStatuses.includes(String(status).toLowerCase());
};

const defaultIsFailure = (status?: PollingStatus) => {
    if (!status) return false;
    return defaultFailureStatuses.includes(String(status).toLowerCase());
};

const defaultContinueOnError = (error: any) => {
    const status = error?.response?.status ?? error?.status ?? error?.code;
    return status !== 500;
};

const createProgressSimulator = (mode: 'fast' | 'medium' | 'slow' = 'medium') => {
    let upperBound = 99;
    let stepConfig: { threshold: number; maxStep: number; minStep: number }[];

    switch (mode) {
        case 'fast':
            stepConfig = [
                { threshold: 70, maxStep: 15, minStep: 6 },
                { threshold: 90, maxStep: 8, minStep: 4 },
                { threshold: 99, maxStep: 4, minStep: 1 },
            ];
            break;
        case 'slow':
            stepConfig = [
                { threshold: 60, maxStep: 3, minStep: 0 },
                { threshold: 80, maxStep: 2, minStep: 0 },
                { threshold: 95, maxStep: 1, minStep: 0 },
            ];
            upperBound = 95;
            break;
        case 'medium':
        default:
            stepConfig = [
                { threshold: 75, maxStep: 7, minStep: 2 },
                { threshold: 90, maxStep: 4, minStep: 1 },
                { threshold: 99, maxStep: 2, minStep: 0 },
            ];
            break;
    }

    return (prev: number) => {
        if (prev >= upperBound) {
            return Math.min(prev + 1, 99);
        }

        const config = stepConfig.find(item => prev < item.threshold) ?? stepConfig[stepConfig.length - 1];
        const step = Math.floor(Math.random() * (config.maxStep - config.minStep + 1)) + config.minStep;
        return Math.min(prev + step, upperBound);
    };
};

/**
 * 创建一个可启动/停止的轮询器。
 */
export const createTaskPoller = <TResponse = any>(
    options: PollingOptions<TResponse>
): PollingController => {
    const {
        request,
        parseStatus = defaultParseStatus,
        isPending = defaultIsPending,
        isSuccess = defaultIsSuccess,
        isFailure = defaultIsFailure,
        continueOnError = defaultContinueOnError,
        intervalMs = 10_000,
        maxDurationMs = 10 * 60 * 1000,
        onProgress,
        onStatusChange,
        onSuccess,
        onFailure,
        onTimeout,
        onError,
        progressSimulator,
        progressMode = 'fast',
        initialProgress = 0,
        immediate = true,
    } = options;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let progress = Math.max(0, Math.min(initialProgress, 100));
    let attempts = 0;
    let startTime = 0;
    let running = false;
    const simulator = progressSimulator ?? createProgressSimulator(progressMode);

    const clearTimer = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    };

    const stop = () => {
        running = false;
        clearTimer();
    };

    const tick = async () => {
        attempts += 1;
        const ctxBase = (): PollingContext<TResponse> => ({
            attempts,
            elapsedMs: Date.now() - startTime,
            status: undefined,
        });

        try {
            const response = await request();
            const status = parseStatus(response);
            const ctx: PollingContext<TResponse> = {
                ...ctxBase(),
                status,
                response,
            };

            onStatusChange?.(status, response);

            if (isSuccess(status, response)) {
                progress = 100;
                onProgress?.(progress, ctx);
                onSuccess?.(response, ctx);
                stop();
                return;
            }

            if (isFailure(status, response)) {
                onFailure?.(response, ctx);
                stop();
                return;
            }

            if (isPending(status, response)) {
                progress = Math.min(99, simulator(progress));
                onProgress?.(progress, ctx);
            }
        } catch (error) {
            const ctx = ctxBase();
            onError?.(error, ctx);

            const shouldContinue = continueOnError?.(error);
            if (!shouldContinue) {
                stop();
                throw error;
            }
        }

        const elapsed = Date.now() - startTime;
        if (elapsed >= maxDurationMs) {
            const ctx: PollingContext<TResponse> = {
                attempts,
                elapsedMs: elapsed,
                status: undefined,
            };
            onTimeout?.(ctx);
            stop();
            return;
        }

        timer = setTimeout(tick, intervalMs);
    };

    const start = () => {
        if (running) return;
        running = true;
        attempts = 0;
        startTime = Date.now();
        progress = Math.max(0, Math.min(initialProgress, 100));

        if (onProgress) {
            onProgress(progress, {
                attempts,
                elapsedMs: 0,
                status: undefined,
            });
        }

        if (immediate) {
            void tick();
        } else {
            timer = setTimeout(tick, intervalMs);
        }
    };

    return {
        start,
        stop,
        isRunning: () => running,
    };
};

/**
 * 使用示例（在 ProductReplacePage 等组件中）：
 *
 * const poller = createTaskPoller({
 *   request: () => avatarService.queryImageReplaceTask(taskId),
 *   parseStatus: (res) => (res.data?.result || res)?.taskStatus,
 *   onProgress: (progress) => setProgress(progress),
 *   onSuccess: (res) => {
 *     setTaskResult(res);
 *     setPageLoading(false);
 *   },
 *   onFailure: (res) => {
 *     toast.error(res?.errorMsg || '任务失败');
 *     setPageLoading(false);
 *   },
 *   onTimeout: () => toast.error('任务超时，请稍后重试'),
 *   progressMode: 'slow', // 根据业务选择 fast / medium / slow
 * });
 *
 * poller.start();
 * // 根据需要调用 poller.stop() 终止轮询
 */


