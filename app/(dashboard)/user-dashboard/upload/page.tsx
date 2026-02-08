'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Image, CheckCircle, X } from 'lucide-react'
import { useState } from 'react'

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; size: string; progress: number }>
  >([
    { name: 'Biology Chapter 5 Notes.pdf', size: '2.4 MB', progress: 100 },
    { name: 'Chemistry Formula Sheet.pdf', size: '1.8 MB', progress: 100 },
  ])

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Upload Notes</h1>
          <p className="text-muted-foreground">
            Upload your study materials to generate AI-powered learning tools
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Zone */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-dashed border-border bg-gradient-to-br from-primary/5 to-accent/5 p-12 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center">
                <div className="bg-primary/10 rounded-xl p-4 mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Drop files here or click to browse
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supported formats: PDF, Word, Images (JPG, PNG)
                </p>
                <Button variant="outline">Choose Files</Button>
              </div>
            </Card>

            {/* File List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Uploaded Files</h3>
                {uploadedFiles.map((file, idx) => (
                  <Card key={idx} className="border border-border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-primary/10 rounded-lg p-2 mt-1">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium text-foreground text-sm">{file.name}</p>
                            {file.progress === 100 && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${file.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {file.size}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(idx)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex-1" size="lg">
                Process with AI
              </Button>
              <Button variant="outline" size="lg">
                Clear All
              </Button>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4">
            <Card className="border border-border p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="font-semibold text-foreground mb-4">Quick Tips</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Upload clear, legible documents for best results</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Supported formats: PDF, DOCX, JPG, PNG</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Maximum file size: 50 MB</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Processing takes 2-5 minutes</span>
                </li>
              </ul>
            </Card>

            <Card className="border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Supported File Types</h3>
              <div className="space-y-2">
                {[
                  { icon: FileText, name: 'PDF Documents', color: 'text-red-600' },
                  { icon: FileText, name: 'Word Files', color: 'text-blue-600' },
                  { icon: Image, name: 'Images', color: 'text-green-600' },
                ].map((type) => (
                  <div
                    key={type.name}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <type.icon className={`w-5 h-5 ${type.color}`} />
                    <span className="text-sm text-muted-foreground">{type.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
