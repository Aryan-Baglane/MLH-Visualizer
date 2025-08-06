import * as React from "react"
import { cn } from "@/lib/utils"
import { Upload, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number
  disabled?: boolean
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  ({ className, onFileSelect, accept = ".csv", maxSize = 100 * 1024 * 1024, disabled, ...props }, ref) => {
    const [isDragOver, setIsDragOver] = React.useState(false)
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      
      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      const file = files[0]
      
      if (file && validateFile(file)) {
        setSelectedFile(file)
        onFileSelect(file)
      }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && validateFile(file)) {
        setSelectedFile(file)
        onFileSelect(file)
      }
    }

    const validateFile = (file: File) => {
      if (file.size > maxSize) {
        alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`)
        return false
      }
      return true
    }

    const removeFile = () => {
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300",
          isDragOver && !disabled
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        {...props}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-primary">
              <FileText className="h-8 w-8" />
              <div className="text-left">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={removeFile}
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary animate-float" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Drop your CSV file here</h3>
              <p className="text-muted-foreground">
                or click to browse from your computer
              </p>
              <p className="text-sm text-muted-foreground">
                Maximum file size: {maxSize / (1024 * 1024)}MB
              </p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="mt-4"
            >
              Choose File
            </Button>
          </div>
        )}
      </div>
    )
  }
)

FileUpload.displayName = "FileUpload"

export { FileUpload }