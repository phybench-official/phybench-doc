import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, Upload, X } from "lucide-react";

export default function FileUpload() {
  return (
    <div className="sm:mx-auto sm:max-w-lg flex items-center justify-center p-10 w-full max-w-lg">
      <form>
        <h3 className="text-lg font-semibold text-foreground">File Upload</h3>
        <div className="mt-4 flex justify-center space-x-4 rounded-md border border-dashed border-input px-6 py-10">
          <div className="sm:flex sm:items-center sm:gap-x-3">
            <Upload
              className="mx-auto h-8 w-8 text-muted-foreground sm:mx-0 sm:h-6 sm:w-6"
              aria-hidden={true}
            />
            <div className="mt-4 flex text-sm leading-6 text-foreground sm:mt-0">

              <Label
                htmlFor="file-upload-4"
                className="relative cursor-pointer rounded-sm pl-1 font-medium text-primary hover:underline hover:underline-offset-4"
              >
                <span> Drag and drop or choose file to upload </span>
                <input
                  id="file-upload-4"
                  name="file-upload-4"
                  type="file"
                  className="sr-only"
                />
              </Label>
            </div>
          </div>
        </div>
        <p className="mt-2 flex items-center justify-between text-xs leading-5 text-muted-foreground">
          Recommended max. size: 10 MB, Accepted file type: JSON
        </p>
        <div className="relative mt-8 rounded-lg bg-muted p-3">
          <div className="absolute right-1 top-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-sm p-2 text-muted-foreground hover:text-foreground"
              aria-label="Remove"
            >
              <X className="size-4 shrink-0" aria-hidden={true} />
            </Button>
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-background shadow-sm ring-1 ring-inset ring-input">
              <FileSpreadsheet
                className="size-5 text-foreground"
                aria-hidden={true}
              />
            </span>
            <div className="w-full">
              <p className="text-xs font-medium text-foreground">
                Revenue_Q1_2024.xlsx
              </p>
              <p className="mt-0.5 flex justify-between text-xs text-muted-foreground">
                <span>3.1 MB</span>
                <span>Completed</span>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            className="whitespace-nowrap rounded-sm border border-input px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            className="whitespace-nowrap rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Upload
          </Button>
        </div>
      </form>
    </div>
  );
}
