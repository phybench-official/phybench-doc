"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScoreRadarChart } from "./ScoreRadarChart";
import { EvaluationTask } from "./TaskList";

// 任务详细分数数据类型
interface ProblemScore {
  problem_id: number;
  eed_score: number | null;
  category: string;
  model_name: string;
  is_exact_match: boolean;
  status: string;
}

interface TaskDetailedScores {
  task_id: string;
  status: string;
  total_problems: number;
  completed_problems: number;
  problem_scores: Record<string, ProblemScore>;
}

// EED和ACC分数汇总
interface CategoryScores {
  category: string;
  eed: number;
  acc: number;
}

interface TaskDetailDialogProps {
  task: EvaluationTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  const [detailedScores, setDetailedScores] = useState<TaskDetailedScores | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取任务详细分数
  const fetchDetailedScores = async (taskId: string, accessToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://evaluate.phybench.cn/tasks/${taskId}/scores`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`获取详细分数失败: ${response.status}`);
      }

      const result = await response.json();
      setDetailedScores(result);
    } catch (error) {
      console.error('Error fetching detailed scores:', error);
      setError(error instanceof Error ? error.message : '获取详细分数失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理分数数据为雷达图格式
  const processScoresForRadarChart = (scores: TaskDetailedScores): CategoryScores[] => {
    const categoryMap = new Map<string, { totalEed: number; totalAcc: number; count: number }>();

    Object.values(scores.problem_scores).forEach((score) => {
      if (score.status === 'success') {
        const category = score.category;
        const existing = categoryMap.get(category) || { totalEed: 0, totalAcc: 0, count: 0 };
        
        existing.totalEed += score.eed_score || 0;
        existing.totalAcc += score.is_exact_match ? 100 : 0; // 将布尔值转换为百分比
        existing.count += 1;
        
        categoryMap.set(category, existing);
      }
    });

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category: getCategoryDisplayName(category),
      eed: Math.round(data.totalEed / data.count * 100) / 100, // 保留两位小数
      acc: Math.round(data.totalAcc / data.count * 100) / 100,
    }));
  };

  // 获取类别显示名称
  const getCategoryDisplayName = (category: string): string => {
    const displayNames: Record<string, string> = {
      'MECHANICS': '力学',
      'THERMODYNAMICS': '热力学',
      'ELECTRICITY': '电学',
      'OPTICS': '光学',
      'MODERN': '近代物理',
      'ADVANCED': '高等物理',
    };
    return displayNames[category] || category;
  };

  // 计算总体分数
  const calculateOverallScores = (scores: TaskDetailedScores) => {
    const validScores = Object.values(scores.problem_scores).filter(
      score => score.status === 'success' && score.eed_score !== null
    );

    if (validScores.length === 0) {
      return { meanEed: 0, accuracy: 0 };
    }

    const totalEed = validScores.reduce((sum, score) => sum + (score.eed_score || 0), 0);
    const exactMatches = validScores.filter(score => score.is_exact_match).length;

    return {
      meanEed: Math.round(totalEed / validScores.length * 100) / 100,
      accuracy: Math.round(exactMatches / validScores.length * 100 * 100) / 100,
    };
  };

  // 当弹窗打开且有任务时获取详细分数
  useEffect(() => {
    if (open && task && task.status === 'success') {
      fetchDetailedScores(task.task_id, task.access_token);
    }
  }, [open, task]);

  // 重置状态当弹窗关闭时
  useEffect(() => {
    if (!open) {
      setDetailedScores(null);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  if (!task) return null;

  const radarData = detailedScores ? processScoresForRadarChart(detailedScores) : [];
  const overallScores = detailedScores ? calculateOverallScores(detailedScores) : { meanEed: 0, accuracy: 0 };
  const modelName = detailedScores ? Object.values(detailedScores.problem_scores)[0]?.model_name || '未知模型' : '未知模型';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl md:min-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">评测任务详情</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            任务ID: {task.task_id} | 创建时间: {new Date(task.created_at).toLocaleString('zh-CN')}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <div className="text-muted-foreground">加载详细结果中...</div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-red-600 dark:text-red-400 font-medium">错误: {error}</div>
          </div>
        )}

        {detailedScores && !loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：雷达图 */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
                <ScoreRadarChart 
                  data={radarData}
                  title="各类别得分分析"
                  description="EED分数和准确率对比"
                />
              </div>
            </div>

            {/* 右侧：详细信息 */}
            <div className="space-y-6">
              {/* 总体分数 */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  总体评测结果
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{overallScores.meanEed}</div>
                    <div className="text-sm text-muted-foreground">平均EED分数</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{overallScores.accuracy}%</div>
                    <div className="text-sm text-muted-foreground">整体准确率</div>
                  </div>
                </div>
              </div>

              {/* 模型信息 */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  模型信息
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-800 rounded-md border dark:border-gray-600">
                    <span className="text-muted-foreground">模型名称:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{modelName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-800 rounded-md border dark:border-gray-600">
                    <span className="text-muted-foreground">总题目数:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{detailedScores.total_problems}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-800 rounded-md border dark:border-gray-600">
                    <span className="text-muted-foreground">完成题目数:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{detailedScores.completed_problems}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-800 rounded-md border dark:border-gray-600">
                    <span className="text-muted-foreground">完成率:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {Math.round(detailedScores.completed_problems / detailedScores.total_problems * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 任务状态 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">任务状态</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">状态:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">已完成</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">创建时间:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(task.created_at).toLocaleString('zh-CN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}