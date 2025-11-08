import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import { Activity, Database, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"

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

interface DataProfileProps {
  data: any[]
  columns: ColumnInfo[]
  correlations?: Array<{ x: string; y: string; value: number }>
}

export function DataProfile({ data, columns, correlations }: DataProfileProps) {
  const totalRows = data.length
  const overallQuality = Math.round(columns.reduce((sum, col) => sum + col.quality, 0) / columns.length)
  
  const typeColors = {
    numerical: '#3b82f6',
    categorical: '#10b981',
    temporal: '#f59e0b',
    text: '#8b5cf6'
  }

  const typeDistribution = columns.reduce((acc, col) => {
    acc[col.type] = (acc[col.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(typeDistribution).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count,
    color: typeColors[type as keyof typeof typeColors]
  }))

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="animate-fade-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalRows.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Columns</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{columns.length}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            {overallQuality >= 80 ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-warning" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{overallQuality}%</div>
            <Progress value={overallQuality} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="animate-fade-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insights Ready</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Ready</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column Types Distribution */}
        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle>Column Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Bar dataKey="count" radius={4} isAnimationActive={true} animationDuration={900} animationEasing="ease-out">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Column Details */}
        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle>Column Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {columns.map((column, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{column.name}</span>
                      <Badge 
                        variant="outline" 
                        style={{ 
                          backgroundColor: `${typeColors[column.type]}20`,
                          borderColor: typeColors[column.type],
                          color: typeColors[column.type]
                        }}
                      >
                        {column.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-x-4">
                      <span>Unique: {column.uniqueCount}</span>
                      <span>Nulls: {column.nullCount}</span>
                      <span>Quality: {column.quality}%</span>
                    </div>
                  </div>
                  <Progress 
                    value={column.quality} 
                    className="w-16 h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Correlation Matrix (if available) */}
      {correlations && correlations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Correlation Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {correlations.slice(0, 6).map((corr, index) => (
                <div key={index} className="p-4 rounded-lg bg-secondary/50 animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{corr.x} ↔ {corr.y}</p>
                      <p className="text-xs text-muted-foreground">Correlation</p>
                    </div>
                    <div className={`text-lg font-bold ${
                      Math.abs(corr.value) > 0.7 ? 'text-warning' :
                      Math.abs(corr.value) > 0.4 ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {corr.value.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}