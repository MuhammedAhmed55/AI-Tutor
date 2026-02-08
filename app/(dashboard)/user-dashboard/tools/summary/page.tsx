'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Download, RotateCcw, BookOpen } from 'lucide-react'
import { useState } from 'react'

export default function SummaryPage() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Summary Generator</h1>
              <p className="text-muted-foreground">Selected document: Biology Chapter 5 Notes</p>
            </div>
            <Button variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Regenerate
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Original Content */}
          <Card className="border border-border p-6 h-full">
            <h3 className="font-semibold text-foreground mb-4">Original Content</h3>
            <div className="bg-card rounded-lg p-4 text-sm text-muted-foreground space-y-3 max-h-96 overflow-y-auto border border-border">
              <p>
                The cell is the basic unit of life. All living organisms are composed of one or more cells. There are two types of cells: prokaryotic and eukaryotic cells. Prokaryotic cells are found in bacteria and archaea, while eukaryotic cells are found in animals, plants, fungi, and protists.
              </p>
              <p>
                The structure of a eukaryotic cell consists of a nucleus, mitochondria, endoplasmic reticulum, Golgi apparatus, lysosomes, and other organelles. The nucleus contains the genetic material (DNA) and controls the cell's activities. The mitochondria is often called the powerhouse of the cell because it produces energy in the form of ATP through cellular respiration.
              </p>
              <p>
                The endoplasmic reticulum is a network of membranes involved in protein synthesis and transport. There are two types: rough ER (with ribosomes) and smooth ER (without ribosomes). The Golgi apparatus modifies, packages, and ships proteins and lipids.
              </p>
              <p>
                Lysosomes are membrane-bound organelles containing digestive enzymes that break down waste materials and cellular debris. The cell membrane is a selectively permeable barrier that controls the movement of substances in and out of the cell.
              </p>
            </div>
          </Card>

          {/* AI Summary */}
          <Card className="border border-border p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">AI-Generated Summary</h3>
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-4 text-sm space-y-3 border border-primary/20">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Key Concepts:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Cell is the basic unit of life</li>
                  <li>• Two cell types: prokaryotic and eukaryotic</li>
                  <li>• Eukaryotic cells have nucleus and organelles</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Important Organelles:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Nucleus: controls cell activities</li>
                  <li>• Mitochondria: produces energy (ATP)</li>
                  <li>• ER: protein synthesis and transport</li>
                  <li>• Golgi apparatus: modifies and packages proteins</li>
                  <li>• Lysosomes: breaks down waste</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Main Function:</h4>
                <p className="text-muted-foreground">Cell membrane controls movement of substances in and out of the cell</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={handleCopy} variant="outline" className="flex-1 gap-2">
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
