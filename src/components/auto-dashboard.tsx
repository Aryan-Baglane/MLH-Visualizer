import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  ScatterChart, 
  Scatter,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts"
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, Sparkles, Download, RefreshCw } from "lucide-react"

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

interface AutoDashboardProps {
  charts: ChartConfig[]
  isGenerating?: boolean
  onRegenerateCharts?: () => void
  onExportDashboard?: () => void
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#f97316']

export function AutoDashboard({ charts, isGenerating, onRegenerateCharts, onExportDashboard }: AutoDashboardProps) {
  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line':
      case 'area':
        return <TrendingUp className="h-4 w-4" />
      case 'bar':
        return <BarChart3 className="h-4 w-4" />
      case 'pie':
        return <PieChartIcon className="h-4 w-4" />
      case 'scatter':
        return <Activity className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  const renderChart = (chart: ChartConfig) => {
    const commonProps = {
      width: "100%",
      height: "100%"
    }

    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey={chart.xKey} />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={chart.yKey} 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary-glow))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey={chart.xKey} />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey={chart.yKey} 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary) / 0.2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey={chart.xKey} />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Bar dataKey={chart.yKey} radius={4}>
                {chart.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )

      case 'scatter':
        return (
          <ResponsiveContainer {...commonProps}>
            <ScatterChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey={chart.xKey} />
              <YAxis dataKey={chart.yKey} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Scatter fill="hsl(var(--primary))" />
            </ScatterChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={chart.yKey}
              >
                {chart.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return <div className="flex items-center justify-center h-full text-muted-foreground">Chart type not supported</div>
    }
  }

  if (isGenerating) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Generating Your Dashboard</h3>
          <p className="text-muted-foreground text-center">
            Our AI is analyzing your data and creating beautiful visualizations...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Auto-Generated Dashboard</h2>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
            AI-Powered
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onRegenerateCharts}
            disabled={isGenerating}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
          <Button 
            onClick={onExportDashboard}
            disabled={isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart) => (
          <Card key={chart.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                {getChartIcon(chart.type)}
                <CardTitle className="text-lg">{chart.title}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">{chart.description}</p>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-4">
                {renderChart(chart)}
              </div>
              
              {/* Chart Insights */}
              {chart.insights && chart.insights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-accent">Key Insights:</h4>
                  <ul className="space-y-1">
                    {chart.insights.map((insight, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {charts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Charts Generated</h3>
            <p className="text-muted-foreground text-center">
              Upload your data to see beautiful auto-generated visualizations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}