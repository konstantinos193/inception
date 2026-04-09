"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, X, FileImage, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DropzoneProps {
  onFilesDrop: (files: File[]) => void
  accept?: string
  maxFiles?: number
  maxSize?: number
  className?: string
  disabled?: boolean
}

export function Dropzone({
  onFilesDrop,
  accept = "image/*",
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false
}: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isDragReject, setIsDragReject] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFiles = useCallback((files: FileList | File[]): File[] => {
    const fileArray = Array.from(files)
    const validFiles: File[] = []
    const errors: string[] = []

    if (fileArray.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`)
      return []
    }

    fileArray.forEach((file) => {
      // Check file type
      if (accept && !file.type.match(accept.replace('*', '.*'))) {
        errors.push(`${file.name} is not a supported file type`)
        return
      }

      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name} exceeds maximum size of ${maxSize / 1024 / 1024}MB`)
        return
      }

      validFiles.push(file)
    })

    if (errors.length > 0) {
      setError(errors.join(', '))
      return []
    }

    setError(null)
    return validFiles
  }, [accept, maxFiles, maxSize])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
    setIsDragOver(false)
    setIsDragReject(false)

    if (disabled) return

    const files = validateFiles(e.dataTransfer.files)
    if (files.length > 0) {
      const newFiles = [...uploadedFiles, ...files].slice(0, maxFiles)
      setUploadedFiles(newFiles)
      onFilesDrop(newFiles)
    }
  }, [disabled, validateFiles, uploadedFiles, maxFiles, onFilesDrop])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (disabled) return

    setIsDragActive(true)
    setIsDragOver(true)
    
    // Check if files are valid
    const files = Array.from(e.dataTransfer.items)
      .map(item => item.kind === 'file' ? item.getAsFile() : null)
      .filter(Boolean) as File[]

    const validFiles = validateFiles(files)
    setIsDragReject(validFiles.length === 0 && files.length > 0)
  }, [disabled, validateFiles])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
    setIsDragOver(false)
    setIsDragReject(false)
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(true)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !e.target.files) return

    const files = validateFiles(e.target.files)
    if (files.length > 0) {
      const newFiles = [...uploadedFiles, ...files].slice(0, maxFiles)
      setUploadedFiles(newFiles)
      onFilesDrop(newFiles)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [disabled, validateFiles, uploadedFiles, maxFiles, onFilesDrop])

  const removeFile = useCallback((index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    onFilesDrop(newFiles)
  }, [uploadedFiles, onFilesDrop])

  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
          "focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 focus-within:ring-offset-black",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && isDragActive && !isDragReject && "border-purple-400 bg-purple-500/10",
          !disabled && isDragReject && "border-red-400 bg-red-500/10",
          !disabled && !isDragActive && "border-gray-600 hover:border-purple-400 hover:bg-purple-500/5",
          !disabled && "cursor-pointer"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnter={handleDragEnter}
        onClick={openFileDialog}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            openFileDialog()
          }
        }}
        aria-label="Dropzone for file upload"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleFileSelect}
          className="sr-only"
          disabled={disabled}
          aria-label="File input"
        />
        
        <div className="space-y-4">
          <div className={cn(
            "mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            isDragActive && !isDragReject ? "bg-purple-500 text-white" : 
            isDragReject ? "bg-red-500 text-white" : 
            "bg-gray-700 text-gray-400"
          )}>
            {isDragReject ? (
              <AlertCircle className="w-6 h-6" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-white mb-2">
              {isDragReject 
                ? "Invalid file type or size" 
                : isDragActive 
                  ? "Drop files here" 
                  : "Drop NFT images here or click to browse"
              }
            </p>
            <p className="text-sm text-gray-400">
              {accept === "image/*" ? "PNG, JPG, GIF up to 10MB" : `Accepted: ${accept}`}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maximum {maxFiles} files
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-white">Uploaded Files:</p>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileImage className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
