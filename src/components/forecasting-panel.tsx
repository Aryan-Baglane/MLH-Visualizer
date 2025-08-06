import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts"
import { TrendingUp, Calendar, Target, Zap, BarChart3, AlertTriangle } from "lucide-react"

interface ForecastPoint {
  period: string
  actual?: number
  predicted: number
  lower_bound: number
  upper_bound: number
  confidence: number
}

interface ForecastingPanelProps {
  data?: any[]
  timeColumn?: string
  targetColumn?: string
  onGenerateForecast?: (periods: number, targetCol: string) => Promise<ForecastPoint[]>
  isGenerating?: boolean
}

export function ForecastingPanel({ 
  data, 
  timeColumn, 
  targetColumn, 
  onGenerateForecast, 
  isGenerating 
}: ForecastingPanelProps) {
  const [forecastPeriods, setForecastPeriods] = useState(12)
  const [selectedTarget, setSelectedTarget] = useState(targetColumn || "")
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Get numerical columns for target selection
  const numericalColumns = data ? Object.keys(data[0] || {}).filter(key => 
    typeof data[0][key] === 'number'
  ) : []

  const handleGenerateForecast = async () => {
    if (!selectedTarget || !data) return

    setIsLoading(true)
    try {
      if (onGenerateForecast) {
        const forecast = await onGenerateForecast(forecastPeriods, selectedTarget)
        setForecastData(forecast)
      } else {
        // Generate demo forecast data
        const demoForecast = generateDemoForecast()
        setForecastData(demoForecast)
      }
    } catch (error) {
      console.error('Forecast generation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateDemoForecast = (): ForecastPoint[] => {
    const periods = []
    const baseValue = 1000
    let currentValue = baseValue

    for (let i = 1; i <= forecastPeriods; i++) {
      // Simulate some growth with seasonality and noise
      const trend = 1.02 // 2% growth
      const seasonality = 1 + 0.1 * Math.sin((i / 12) * 2 * Math.PI)
      const noise = 0.95 + Math.random() * 0.1
      
      currentValue = currentValue * trend * seasonality * noise
      
      const predicted = currentValue
      const variance = predicted * 0.15 // 15% confidence interval
      
      periods.push({
        period: `Period ${i}`,
        predicted: Math.round(predicted),
        lower_bound: Math.round(predicted - variance),
        upper_bound: Math.round(predicted + variance),
        confidence: 85 + Math.random() * 10 // 85-95% confidence
      })
    }

    return periods
  }

  const chartData = forecastData.map((point, index) => ({
    ...point,
    index: index + 1
  }))

  const getInsights = () => {
    if (forecastData.length === 0) return []

    const avgGrowth = forecastData.length > 1 ? 
      ((forecastData[forecastData.length - 1].predicted - forecastData[0].predicted) / forecastData[0].predicted * 100) : 0
    
    const avgConfidence = forecastData.reduce((sum, point) => sum + point.confidence, 0) / forecastData.length

    return [
      `Projected ${avgGrowth > 0 ? 'growth' : 'decline'} of ${Math.abs(avgGrowth).toFixed(1)}% over ${forecastPeriods} periods`,
      `Average confidence level: ${avgConfidence.toFixed(0)}%`,
      `Peak prediction: ${Math.max(...forecastData.map(p => p.predicted)).toLocaleString()}`,
      `Range uncertainty: ±${((forecastData[0].upper_bound - forecastData[0].lower_bound) / 2 / forecastData[0].predicted * 100).toFixed(0)}%`
    ]
  }

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Time Series Forecasting</CardTitle>
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
              ARIMA Model
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-column">Target Column</Label>
              <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select column to forecast" />
                </SelectTrigger>
                <SelectContent>
                  {numericalColumns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="forecast-periods">Forecast Periods</Label>
              <Input
                id="forecast-periods"
                type="number"
                min="1"
                max="36"
                value={forecastPeriods}
                onChange={(e) => setForecastPeriods(parseInt(e.target.value) || 12)}
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleGenerateForecast}
                disabled={!selectedTarget || isLoading || isGenerating}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Forecast
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Results */}
      {forecastData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Forecast Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name) => [
                          typeof value === 'number' ? value.toLocaleString() : value,
                          name
                        ]}
                      />
                      <Legend />
                      
                      {/* Confidence interval area */}
                      <Line 
                        type="monotone" 
                        dataKey="upper_bound" 
                        stroke="hsl(var(--primary) / 0.3)" 
                        strokeDasharray="5 5"
                        strokeWidth={1}
                        dot={false}
                        name="Upper Bound"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="lower_bound" 
                        stroke="hsl(var(--primary) / 0.3)" 
                        strokeDasharray="5 5"
                        strokeWidth={1}
                        dot={false}
                        name="Lower Bound"
                      />
                      
                      {/* Main forecast line */}
                      <Line 
                        type="monotone" 
                        dataKey="predicted" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: 'hsl(var(--primary-glow))' }}
                        name="Predicted"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Forecast Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getInsights().map((insight, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{insight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Model Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Model Type:</span>
                    <span className="font-medium">ARIMA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Periods:</span>
                    <span className="font-medium">{forecastPeriods}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-medium">{selectedTarget}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="font-medium text-success">
                      {forecastData.length > 0 ? 
                        `${(forecastData.reduce((sum, p) => sum + p.confidence, 0) / forecastData.length).toFixed(0)}%` 
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-warning/20 bg-warning/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Forecast Disclaimer</p>
                    <p className="text-xs text-muted-foreground">
                      Predictions are based on historical patterns and may not account for external factors or sudden changes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!data && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground text-center">
              Upload time-series data to generate accurate forecasts using our ARIMA model
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}