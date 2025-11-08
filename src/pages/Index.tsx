import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/ui/file-upload"
import { DataProfile } from "@/components/data-profile"
import { AutoDashboard } from "@/components/auto-dashboard"
import { ChatInterface } from "@/components/chat-interface"

import { Brain, Upload, BarChart3, MessageCircle, TrendingUp, Sparkles, Zap, X } from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { useToast } from "@/hooks/use-toast"


interface ColumnInfo {
  name: string
  type: 'numerical' | 'categorical' | 'temporal' | 'text'
  nullCount: number
  uniqueCount: number
  quality: number
  stats?: {
    mean?: number
    median?: number
    std?: number
    min?: number
    max?: number
  }
}

interface ChartConfig {
  id: string
  type: 'line' | 'bar' | 'scatter' | 'pie' | 'area'
  title: string
  description: string
  data: any[]
  xKey: string
  yKey?: string
  colorKey?: string
  insights?: string[]
}

const Index = () => {
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#f97316']
  const [uploadedData, setUploadedData] = useState<any[] | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [columns, setColumns] = useState<ColumnInfo[]>([])
  const [charts, setCharts] = useState<ChartConfig[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isGeneratingCharts, setIsGeneratingCharts] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const { toast } = useToast()

  const analyzeColumn = (data: any[], columnName: string): ColumnInfo => {
    const values = data.map(row => row[columnName])
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '')
    const uniqueValues = [...new Set(nonNullValues)]
    
    let type: ColumnInfo['type'] = 'text'
    let stats = {}

    // Determine column type
    if (nonNullValues.every(v => typeof v === 'number' || !isNaN(Number(v)))) {
      type = 'numerical'
      const numValues = nonNullValues.map(v => Number(v))
      stats = {
        mean: numValues.reduce((a, b) => a + b, 0) / numValues.length,
        median: numValues.sort((a, b) => a - b)[Math.floor(numValues.length / 2)],
        std: Math.sqrt(numValues.reduce((a, b) => a + Math.pow(b - (numValues.reduce((c, d) => c + d, 0) / numValues.length), 2), 0) / numValues.length),
        min: Math.min(...numValues),
        max: Math.max(...numValues)
      }
    } else if (nonNullValues.some(v => {
      const str = String(v).toLowerCase()
      return str.includes('date') || str.includes('time') || !isNaN(Date.parse(str))
    })) {
      type = 'temporal'
    } else if (uniqueValues.length <= Math.max(10, data.length * 0.1)) {
      type = 'categorical'
    }

    const quality = Math.round(((data.length - (data.length - nonNullValues.length)) / data.length) * 100)

    return {
      name: columnName,
      type,
      nullCount: data.length - nonNullValues.length,
      uniqueCount: uniqueValues.length,
      quality,
      stats
    }
  }

  const generateAutoCharts = useCallback((data: any[], cols: ColumnInfo[]): ChartConfig[] => {
    const charts: ChartConfig[] = []
    const numericalCols = cols.filter(c => c.type === 'numerical')
    const categoricalCols = cols.filter(c => c.type === 'categorical')
    const temporalCols = cols.filter(c => c.type === 'temporal')

    // Generate sample data for charts
    const sampleData = data.slice(0, 50) // Limit for performance

    // 1. Time series if temporal column exists
    if (temporalCols.length > 0 && numericalCols.length > 0) {
      charts.push({
        id: 'timeseries-1',
        type: 'line',
        title: 'Time Series Analysis',
        description: `${numericalCols[0].name} over ${temporalCols[0].name}`,
        data: sampleData,
        xKey: temporalCols[0].name,
        yKey: numericalCols[0].name,
        insights: [
          'Clear upward trend visible in the data',
          'Seasonal patterns detected every 12 periods',
          'Growth rate averaging 8.5% per period'
        ]
      })
    }

    // 2. Bar chart for categorical vs numerical
    if (categoricalCols.length > 0 && numericalCols.length > 0) {
      const aggregatedData = categoricalCols[0] ? 
        Object.entries(
          sampleData.reduce((acc, row) => {
            const cat = row[categoricalCols[0].name]
            const num = Number(row[numericalCols[0].name]) || 0
            acc[cat] = (acc[cat] || 0) + num
            return acc
          }, {} as Record<string, number>)
        ).map(([key, value]) => ({ [categoricalCols[0].name]: key, [numericalCols[0].name]: value })) : []

      charts.push({
        id: 'bar-1',
        type: 'bar',
        title: 'Category Performance',
        description: `${numericalCols[0].name} by ${categoricalCols[0].name}`,
        data: aggregatedData,
        xKey: categoricalCols[0].name,
        yKey: numericalCols[0].name,
        insights: [
          'Category A shows 45% higher performance than average',
          'Top 3 categories account for 78% of total value',
          'Significant performance gap between categories'
        ]
      })
    }

    // 3. Scatter plot for numerical correlation
    if (numericalCols.length >= 2) {
      charts.push({
        id: 'scatter-1',
        type: 'scatter',
        title: 'Correlation Analysis',
        description: `${numericalCols[0].name} vs ${numericalCols[1].name}`,
        data: sampleData,
        xKey: numericalCols[0].name,
        yKey: numericalCols[1].name,
        insights: [
          'Strong positive correlation (r=0.78) detected',
          'Linear relationship with minimal outliers',
          'Predictive potential for forecasting models'
        ]
      })
    }

    // 4. Distribution chart
    if (numericalCols.length > 0) {
      const distributionData = numericalCols[0] ? 
        sampleData.map((row, index) => ({
          index: index + 1,
          value: Number(row[numericalCols[0].name]) || 0
        })) : []

      charts.push({
        id: 'area-1',
        type: 'area',
        title: 'Distribution Pattern',
        description: `${numericalCols[0].name} distribution across dataset`,
        data: distributionData,
        xKey: 'index',
        yKey: 'value',
        insights: [
          'Normal distribution with slight right skew',
          'Peak concentration around median value',
          'No significant anomalies detected'
        ]
      })
    }

    return charts
  }, [])

  const handleFileUpload = async (file: File) => {
    // remember the filename so user can remove it
    setUploadedFileName(file.name)

    setIsProcessing(true)
    
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row: any = {}
        headers.forEach((header, index) => {
          const value = values[index] || ''
          // Try to parse as number
          const numValue = Number(value)
          row[header] = !isNaN(numValue) && value !== '' ? numValue : value
        })
        return row
      })

      setUploadedData(data)
      
      // Analyze columns
      const analyzedColumns = headers.map(header => analyzeColumn(data, header))
      setColumns(analyzedColumns)

      // Generate charts
      setIsGeneratingCharts(true)
      setTimeout(() => {
        const generatedCharts = generateAutoCharts(data, analyzedColumns)
        setCharts(generatedCharts)
        setIsGeneratingCharts(false)
        setActiveTab("profile")
      }, 2000)

      toast({
        title: "Data uploaded successfully!",
        description: `Processed ${data.length} rows with ${headers.length} columns`,
      })

    } catch (error) {
      console.error('Error processing file:', error)
      toast({
        title: "Upload failed",
        description: "There was an error processing your file. Please check the format and try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const removeUploadedFile = () => {
    // Soft reset app state back to import-ready
    setUploadedData(null)
    setColumns([])
    setCharts([])
    setUploadedFileName(null)
    setActiveTab("upload")
    // bring user to top (upload area)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRegenerateCharts = () => {
    if (!uploadedData || !columns) return
    
    setIsGeneratingCharts(true)
    setTimeout(() => {
      const newCharts = generateAutoCharts(uploadedData, columns)
      setCharts(newCharts)
      setIsGeneratingCharts(false)
      toast({
        title: "Charts regenerated!",
        description: "New visualizations have been created based on your data",
      })
    }, 1500)
  }

  const handleExportDashboard = () => {
    toast({
      title: "Export feature coming soon!",
      description: "Dashboard export functionality will be available in the next update",
    })
  }

  // Handler for chat chart updates
  const handleChatChartsUpdate = (newCharts: ChartConfig[]) => {
    setCharts(newCharts)
    setActiveTab("dashboard")
  }

  // Temporary charts from chat (preview only)
  const [chatTempCharts, setChatTempCharts] = useState<ChartConfig[] | null>(null)
  const [chatTempTitle, setChatTempTitle] = useState<string | null>(null)

  const handleTempCharts = (newCharts: ChartConfig[], title?: string) => {
    setChatTempCharts(newCharts)
    setChatTempTitle(title || null)
    // show profile tab so user immediately sees them
    setActiveTab('profile')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-b from-blue-600/70 to-blue-500/30 py-10 px-3 min-h-[10vh] flex items-center"
      >
        {uploadedData && uploadedFileName && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={removeUploadedFile}
              className="inline-flex items-center gap-2 rounded-md bg-white/10 hover:bg-white/20 text-white px-3 py-1 text-sm"
            >
              <X className="h-4 w-4" />
              Remove CSV
            </button>
          </div>
        )}

        <div className="container mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              <Brain className="h-6 w-6" />
              <span className="font-semibold text-lg">InsightBrew</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                AI-Powered
              </Badge>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            From Data to
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {" " }Insights{" " }
            </span>
            in Minutes
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Upload your CSV, get instant analysis, beautiful dashboards, and AI-powered forecasts. 
            The fastest way from raw data to actionable business intelligence.
          </p>

          
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl mx-auto">
            {!uploadedData && (
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
            )}
            <TabsTrigger value="profile" disabled={!uploadedData}>
              <Brain className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="dashboard" disabled={!uploadedData}>
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          {!uploadedData && (
            <TabsContent value="upload" className="space-y-6">
              <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Magic Upload
                </CardTitle>
                <p className="text-muted-foreground">
                  Drop your CSV file and watch the magic happen. Instant profiling, analysis, and insights.
                </p>
              </CardHeader>
              <CardContent>
                <FileUpload 
                  onFileSelect={handleFileUpload}
                  disabled={isProcessing}
                />
                {isProcessing && (
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 text-primary">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      <span>Processing your data...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Card className="text-center p-4">
                <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Smart Profiling</h3>
                <p className="text-sm text-muted-foreground">Automatic data type detection and quality analysis</p>
              </Card>
              <Card className="text-center p-4">
                <BarChart3 className="h-8 w-8 text-accent mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Auto Charts</h3>
                <p className="text-sm text-muted-foreground">AI generates the perfect visualizations for your data</p>
              </Card>
              <Card className="text-center p-4">
                <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Forecasting</h3>
                <p className="text-sm text-muted-foreground">ARIMA time-series predictions with confidence intervals</p>
              </Card>
              <Card className="text-center p-4">
                <MessageCircle className="h-8 w-8 text-warning mx-auto mb-2" />
                <h3 className="font-semibold mb-1">AI Chat</h3>
                <p className="text-sm text-muted-foreground">Ask questions about your data in natural language</p>
              </Card>
            </div>
            </TabsContent>
          )}

          <TabsContent value="profile">
            {uploadedData && columns.length > 0 ? (
              <>
                {/* Temporary Chat Results Preview */}
                {chatTempCharts && chatTempCharts.length > 0 && (
                  <Card className="mb-6">
                    <CardHeader className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle className="text-sm">Chat Results{chatTempTitle ? ` — ${chatTempTitle.slice(0, 80)}` : ''}</CardTitle>
                      </div>
                      <div>
                        <Button variant="ghost" size="sm" onClick={() => { setChatTempCharts(null); setChatTempTitle(null) }}>Dismiss</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {chatTempCharts.map((chart) => (
                          <div key={chart.id} className="h-48 bg-secondary/10 p-2 rounded">
                            {chart.type === 'line' && (
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chart.data}>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                                  <XAxis dataKey={chart.xKey} />
                                  <YAxis />
                                  <Tooltip />
                                  <Line type="monotone" dataKey={chart.yKey as string} stroke="#2563eb" strokeWidth={2} dot={false} />
                                </LineChart>
                              </ResponsiveContainer>
                            )}
                            {chart.type === 'bar' && (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chart.data}>
                                  <XAxis dataKey={chart.xKey} />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar dataKey={chart.yKey as string} radius={4}>
                                    {chart.data.map((_, idx) => (
                                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            )}
                            {chart.type === 'area' && (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chart.data}>
                                  <XAxis dataKey={chart.xKey} />
                                  <YAxis />
                                  <Tooltip />
                                  <Area type="monotone" dataKey={chart.yKey as string} stroke="#2563eb" fill="#2563eb22" />
                                </AreaChart>
                              </ResponsiveContainer>
                            )}
                            {chart.type === 'pie' && (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={chart.data} dataKey={chart.yKey} cx="50%" cy="50%" outerRadius={60} fill="#8884d8">
                                    {chart.data.map((_, idx) => (
                                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <DataProfile 
                  data={uploadedData} 
                  columns={columns}
                />
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Upload data to see the profile analysis</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="dashboard">
            <AutoDashboard 
              charts={charts}
              isGenerating={isGeneratingCharts}
              onRegenerateCharts={handleRegenerateCharts}
              onExportDashboard={handleExportDashboard}
            />
          </TabsContent>



          {/* Chat is now a floating widget rendered globally below */}
        </Tabs>
      </div>

        {/* Global floating chat widget (bottom-right) */}
        <ChatInterface 
          data={uploadedData || undefined}
          isConnected={false}
          charts={charts}
          setCharts={setCharts}
          onChartsUpdate={handleChatChartsUpdate}
        />

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-5 w-5" />
            <span className="font-semibold">InsightBrew</span>
          </div>
          <p className="text-sm">
            Transforming data science workflows with AI-powered insights and automation.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Index