"use client"

import { Card } from "@/components/ui/card"

export default function TestCSS() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-2xl w-full space-y-8">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">
          CSS Test Page
        </h1>
        
        <p className="text-lg text-muted-foreground text-center">
          This page tests if Tailwind CSS is working properly
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-primary/10 border-primary/20">
            <h2 className="text-xl font-semibold mb-2">Card 1</h2>
            <p className="text-muted-foreground">This card should have a primary color background</p>
          </Card>
          
          <Card className="p-6 bg-secondary/50 border-secondary">
            <h2 className="text-xl font-semibold mb-2">Card 2</h2>
            <p className="text-muted-foreground">This card should have a secondary color background</p>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-primary/20 to-green-500/20 border-primary/30">
            <h2 className="text-xl font-semibold mb-2">Card 3</h2>
            <p className="text-muted-foreground">This card should have a gradient background</p>
          </Card>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Primary Button
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
            Secondary Button
          </button>
        </div>
      </div>
    </div>
  )
}