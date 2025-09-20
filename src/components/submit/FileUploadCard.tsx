"use client";

import { File, Trash } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FileUploadCardProps {
  onUploadSuccess: () => void;
}

export function FileUploadCard({ onUploadSuccess }: FileUploadCardProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const router = useRouter();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 1) {
        toast.error("只能上传单个文件");
        return;
      }
      if (acceptedFiles.length === 1) {
        setFiles([acceptedFiles[0]]);
      }
    },
    accept: {
      'application/json': ['.json']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // 上传文件到API
  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://evaluate.phybench.cn/tasks', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `上传失败: ${response.status}`);
      }

      const result = await response.json();
      
      // 保存到localStorage
      const evaluations = JSON.parse(localStorage.getItem('evaluation') || '[]');
      evaluations.push({
        task_id: result.task_id,
        access_token: result.access_token,
        created_at: result.created_at,
        status: result.status || 'pending',
        isCompleted: false // 新创建的任务标记为未完成
      });
      localStorage.setItem('evaluation', JSON.stringify(evaluations));

      toast.success('文件上传成功！评测任务已创建');
      setFiles([]); // 清空文件列表
      onUploadSuccess(); // 通知父组件
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : '上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('请先选择要上传的文件');
      return;
    }
    if (files.length > 1) {
      toast.error('只能上传单个文件');
      return;
    }
    uploadFile(files[0]);
  };

  const filesList = files.map((file) => (
    <li key={file.name} className="relative">
      <Card className="relative p-4">
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove file"
            onClick={() =>
              setFiles((prevFiles) =>
                prevFiles.filter((prevFile) => prevFile.name !== file.name)
              )
            }
          >
            <Trash className="h-5 w-5" aria-hidden={true} />
          </Button>
        </div>
        <CardContent className="flex items-center space-x-3 p-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <File className="h-5 w-5 text-foreground" aria-hidden={true} />
          </span>
          <div>
            <p className="font-medium text-foreground">{file.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {file.size} bytes
            </p>
          </div>
        </CardContent>
      </Card>
    </li>
  ));

  return (
    <Card className="flex-1 min-w-0">
      <CardHeader>
        <CardTitle>上传模型回答文件进行评测</CardTitle>
        <CardDescription>
          如果对该步骤有任何疑问，请先参考<Link href="/docs/doc" className="text-primary hover:underline hover:underline-offset-4">快速开始</Link>页面
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
            <div className="col-span-full">
              <Label htmlFor="file-upload-2" className="font-medium">
                文件列表
              </Label>
              <div
                {...getRootProps()}
                className={cn(
                  isDragActive
                    ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                    : "border-border",
                  "mt-2 flex justify-center rounded-md border border-dashed px-6 py-20 transition-colors duration-200"
                )}
              >
                <div>
                  <File
                    className="mx-auto h-12 w-12 text-muted-foreground/80"
                    aria-hidden={true}
                  />
                  <div className="mt-4 flex text-muted-foreground">
                    <p>拖拽或</p>
                    <label
                      htmlFor="file"
                      className="relative cursor-pointer rounded-sm pl-1 font-medium text-primary hover:text-primary/80 hover:underline hover:underline-offset-4"
                    >
                      <span>选择文件</span>
                      <input
                        {...getInputProps()}
                        id="file-upload-2"
                        name="file-upload-2"
                        type="file"
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">以上传</p>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm leading-5 text-muted-foreground">
                <span>仅支持单个JSON文件，格式请参考文档说明</span>
                <br />
                <span className="pl-1 sm:pl-0">单个文件大小限制：10MB</span>
              </p>
              {filesList.length > 0 && (
                <>
                  <h4 className="mt-6 font-medium text-foreground">
                    文件列表
                  </h4>
                  <ul role="list" className="mt-4 space-y-4">
                    {filesList}
                  </ul>
                </>
              )}
            </div>
          </div>
          <Separator className="my-6" />
          <div className="flex items-center justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              取消
            </Button>
            <Button type="submit" disabled={isUploading || files.length === 0}>
              {isUploading ? '上传中...' : '提交'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}