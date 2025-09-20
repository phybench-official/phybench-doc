"use client";

import React from "react";
import { FileUploadCard } from "@/components/submit/FileUploadCard";
import { TaskList } from "@/components/submit/TaskList";

// 任务数据类型定义
export interface EvaluationTask {
  task_id: string;
  access_token: string;
  created_at: string;
  status: string;
  progress?: number;
  isCompleted?: boolean; // 标记任务是否已完成，避免重复轮询
  queue_info?: {
    position?: number | null;
    total_pending: number;
    estimated_wait_time?: number | null;
    status: string;
  };
}

export default function SubmitPage() {
  const [tasks, setTasks] = React.useState<EvaluationTask[]>([]);

  // 从localStorage加载任务
  const loadTasks = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      const storedTasks = localStorage.getItem('evaluation');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
      }
    }
  }, []);

  // 页面加载时加载任务
  React.useEffect(() => {
    loadTasks();

    // 监听自定义事件，当任务更新时重新加载
    const handleTasksUpdated = () => {
      loadTasks();
    };

    window.addEventListener('tasksUpdated', handleTasksUpdated);
    
    return () => {
      window.removeEventListener('tasksUpdated', handleTasksUpdated);
    };
  }, [loadTasks]);

  // 处理任务更新
  const handleTaskUpdate = React.useCallback(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <div className="flex items-start justify-center p-10 gap-8">
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl">
        {/* 文件上传卡片 */}
        <FileUploadCard onUploadSuccess={handleTaskUpdate} />

        {/* 任务列表 */}
        <TaskList tasks={tasks} />
      </div>
    </div>
  );
}
