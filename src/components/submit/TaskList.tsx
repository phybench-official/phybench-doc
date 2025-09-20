"use client";

import React from "react";
import { CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { TaskDetailDialog } from "./TaskDetailDialog";

// 任务数据类型定义
export interface EvaluationTask {
  task_id: string;
  access_token: string;
  created_at: string;
  status: string;
  progress?: number;
  isCompleted?: boolean;
  queue_info?: {
    position?: number | null;
    total_pending: number;
    estimated_wait_time?: number | null;
    status: string;
  };
}

interface TaskListProps {
  tasks: EvaluationTask[];
}

export function TaskList({ tasks }: TaskListProps) {
  const [selectedTask, setSelectedTask] = React.useState<EvaluationTask | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // 查询单个任务状态
  const fetchTaskStatus = React.useCallback(async (task: EvaluationTask): Promise<EvaluationTask> => {
    try {
      const response = await fetch(`https://evaluate.phybench.cn/tasks/${task.task_id}`, {
        headers: {
          'Authorization': `Bearer ${task.access_token}`,
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch task ${task.task_id} status: ${response.status}`);
        return task;
      }

      const result = await response.json();
      const updatedTask = {
        ...task,
        status: result.status,
        progress: result.progress || 0,
        queue_info: result.queue_info,
      };

      // 检查任务是否已完成（成功、失败或取消）
      const completedStatuses = ['success', 'failure', 'cancelled'];
      if (completedStatuses.includes(result.status)) {
        updatedTask.isCompleted = true;
        console.log(`任务 ${task.task_id.slice(-8)} 已完成，状态: ${result.status}，将停止轮询`);
      } else {
        // 确保任务仍被标记为未完成
        updatedTask.isCompleted = false;
      }

      return updatedTask;
    } catch (error) {
      console.error(`Error fetching task ${task.task_id} status:`, error);
      return task;
    }
  }, []);

  // 更新所有任务状态（只轮询未完成的任务）
  const updateTasksStatus = React.useCallback(async () => {
    if (typeof window === 'undefined') return;

    const storedTasks = localStorage.getItem('evaluation');
    if (!storedTasks) return;

    const parsedTasks: EvaluationTask[] = JSON.parse(storedTasks);
    
    // 迁移旧数据：为没有isCompleted字段的任务添加该字段
    const migratedTasks = parsedTasks.map(task => {
      if (task.isCompleted === undefined) {
        const completedStatuses = ['success', 'failure', 'cancelled'];
        return {
          ...task,
          isCompleted: completedStatuses.includes(task.status)
        };
      }
      return task;
    });
    
    // 分离已完成和未完成的任务
    const incompleteTasks = migratedTasks.filter(task => !task.isCompleted);
    const completedTasks = migratedTasks.filter(task => task.isCompleted);

    // 只对未完成的任务进行轮询
    if (incompleteTasks.length === 0) {
      console.log('所有任务都已完成，跳过轮询');
      return; // 所有任务都已完成，不需要轮询
    }

    console.log(`轮询 ${incompleteTasks.length} 个未完成任务，跳过 ${completedTasks.length} 个已完成任务`);

    const updatedIncompleteTasks = await Promise.all(
      incompleteTasks.map(task => fetchTaskStatus(task))
    );

    // 合并已完成和更新后的未完成任务
    const allUpdatedTasks = [...completedTasks, ...updatedIncompleteTasks];

    // 更新localStorage
    localStorage.setItem('evaluation', JSON.stringify(allUpdatedTasks));
    
    // 触发页面重新渲染
    window.dispatchEvent(new CustomEvent('tasksUpdated'));
  }, [fetchTaskStatus]);

  // 设置轮询
  React.useEffect(() => {
    const interval = setInterval(updateTasksStatus, 3000);
    return () => clearInterval(interval);
  }, [updateTasksStatus]);

  // 处理任务点击
  const handleTaskClick = (task: EvaluationTask) => {
    if (task.status === 'success') {
      setSelectedTask(task);
      setIsDialogOpen(true);
    }
  };

  // 删除任务
  const handleDeleteTask = (taskId: string) => {
    if (typeof window === 'undefined') return;

    const storedTasks = localStorage.getItem('evaluation');
    if (!storedTasks) return;

    const parsedTasks: EvaluationTask[] = JSON.parse(storedTasks);
    const updatedTasks = parsedTasks.filter(task => task.task_id !== taskId);
    
    localStorage.setItem('evaluation', JSON.stringify(updatedTasks));
    
    // 触发页面重新渲染
    window.dispatchEvent(new CustomEvent('tasksUpdated'));
  };
  // 获取任务状态图标
  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failure':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  // 获取任务状态Badge
  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">已完成</Badge>;
      case 'failure':
        return <Badge variant="destructive">失败</Badge>;
      case 'pending':
        return <Badge variant="secondary">等待中</Badge>;
      case 'processing':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">处理中</Badge>;
      case 'cancelled':
        return <Badge variant="outline">已取消</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // 格式化创建时间
  const formatDate = (dateString: string) => {
    // 创建 Date 对象，JavaScript 会自动处理 UTC 到本地时区的转换
    const date = new Date(dateString);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return '无效日期';
    }
    
    // 获取用户的时区
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // 使用 Intl.DateTimeFormat 进行精确的时区转换
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timeZone, // 使用用户的本地时区
      hour12: false, // 使用24小时制
    }).format(date);
  };

  if (tasks.length === 0) {
    return (
      <Card className="flex-1 min-w-0">
        <CardHeader>
          <CardTitle>评测任务列表</CardTitle>
          <CardDescription>
            暂无评测任务，请先上传文件创建任务
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Clock className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              暂无评测任务
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
              上传您的模型答案文件即可开始评测，系统将自动创建任务并显示在此处。
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          评测任务列表
          <div className="flex gap-2">
            <Badge variant="outline" className="ml-2">
              总共 {tasks.length} 个
            </Badge>
            {tasks.filter(task => !task.isCompleted).length > 0 && (
              <Badge variant="default" className="bg-blue-500">
                {tasks.filter(task => !task.isCompleted).length} 个轮询中
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          正在进行的评测任务，每3秒自动更新未完成任务的状态
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div 
              key={task.task_id} 
              className={`border rounded-lg p-4 transition-colors ${
                task.status === 'success' 
                  ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-950 hover:border-blue-200' 
                  : ''
              }`}
              onClick={() => handleTaskClick(task)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getTaskStatusIcon(task.status)}
                  <span className="font-medium">任务 {task.task_id.slice(-8)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getTaskStatusBadge(task.status)}
                  
                  {/* 删除按钮 */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 transition-colors px-2 py-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Badge>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除评测记录？</AlertDialogTitle>
                          <AlertDialogDescription>
                            此操作将永久删除任务 {task.task_id.slice(-8)} 的评测记录，
                            该操作无法撤销。请确认是否继续？
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteTask(task.task_id)}
                            className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-600 dark:bg-red-700 dark:hover:bg-red-800"
                          >
                            确认删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mb-3 flex items-center justify-between">
                <span>创建时间: {formatDate(task.created_at)}</span>
                {!task.isCompleted && (
                  <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                    🔄 实时更新中
                  </Badge>
                )}
              </div>
              
              {/* 进度条 */}
              {(task.status === 'processing' || task.status === 'pending') && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">进度</span>
                    <Badge variant="outline" className="text-xs">
                      {task.progress || 0}%
                    </Badge>
                  </div>
                  <Progress value={task.progress || 0} className="w-full h-2" />
                  
                  {/* 队列信息 */}
                  {task.queue_info && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {task.queue_info.position !== null && task.queue_info.position !== undefined && task.queue_info.position > 0 ? (
                        <>
                          <Badge variant="secondary" className="text-xs">
                            队列位置: {task.queue_info.position}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            总等待: {task.queue_info.total_pending}
                          </Badge>
                        </>
                      ) : (
                        <>
                          <Badge variant="default" className="text-xs bg-blue-500">
                            正在运行
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            总等待: {task.queue_info.total_pending}
                          </Badge>
                        </>
                      )}
                      {task.queue_info.estimated_wait_time && (
                        <Badge variant="secondary" className="text-xs">
                          预计: {Math.round(task.queue_info.estimated_wait_time / 60)}分钟
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 完成任务提示 */}
              {task.status === 'success' && (
                <div className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                  <span>💡</span>
                  <span>点击查看详细结果</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 任务详情弹窗 */}
        {selectedTask && (
          <TaskDetailDialog
            task={selectedTask}
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        )}
      </CardContent>
    </Card>
  );
}