import { useRef, useState } from "react" // Import useRef and useState
import jsPDF from "jspdf" // Import jsPDF
import html2canvas from "html2canvas" // Import html2canvas
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
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, Sparkles, Download, RefreshCw, Wand2 } from "lucide-react"

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
  onExportDashboard?: () => void // This prop is now used internally
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#f97316']

// Generate dynamic insights based on chart data
const generateChartInsights = (chart: ChartConfig): string[] => {
  const insights: string[] = [];
  
  if (!chart.data || chart.data.length === 0) {
    return ['No data available for analysis'];
  }

  const actualData = chart.data.filter(item => !item.isForecast);
  
  if (actualData.length === 0) {
    return ['No historical data available'];
  }

  switch (chart.type) {
    case 'line':
    case 'area': {
      if (!chart.yKey) break;
      
      const values = actualData.map(item => Number(item[chart.yKey]) || 0);
      const firstValue = values[0];
      const lastValue = values[values.length - 1];
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
      
      // Trend analysis
      if (lastValue > firstValue) {
        const growth = ((lastValue - firstValue) / firstValue * 100).toFixed(1);
        insights.push(`📈 Overall upward trend with ${growth}% growth from start to end`);
      } else if (lastValue < firstValue) {
        const decline = ((firstValue - lastValue) / firstValue * 100).toFixed(1);
        insights.push(`📉 Overall downward trend with ${decline}% decline from start to end`);
      } else {
        insights.push(`➡️ Relatively stable trend with minimal change`);
      }
      
      // Peak identification
      const maxIndex = values.indexOf(maxValue);
      const maxLabel = actualData[maxIndex][chart.xKey];
      insights.push(`🔝 Peak value of ${maxValue.toLocaleString()} reached at ${maxLabel}`);
      
      // Average comparison
      const aboveAvg = values.filter(v => v > avgValue).length;
      const percentAbove = (aboveAvg / values.length * 100).toFixed(0);
      insights.push(`📊 Average value is ${avgValue.toFixed(2)}, with ${percentAbove}% of points above average`);
      
      // Volatility
      const variance = values.reduce((sum, val) => sum + Math.pow(val - avgValue, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = (stdDev / avgValue * 100).toFixed(1);
      
      if (parseFloat(coefficientOfVariation) < 15) {
        insights.push(`✅ Low volatility (${coefficientOfVariation}% variation) - stable and predictable`);
      } else if (parseFloat(coefficientOfVariation) < 30) {
        insights.push(`⚠️ Moderate volatility (${coefficientOfVariation}% variation) - some fluctuation`);
      } else {
        insights.push(`🔴 High volatility (${coefficientOfVariation}% variation) - significant fluctuation`);
      }
      
      break;
    }

    case 'bar': {
      if (!chart.yKey) break;
      
      const values = actualData.map(item => Number(item[chart.yKey]) || 0);
      const labels = actualData.map(item => item[chart.xKey]);
      const total = values.reduce((a, b) => a + b, 0);
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      
      // Top performer
      const maxIndex = values.indexOf(maxValue);
      insights.push(`🏆 ${labels[maxIndex]} leads with ${maxValue.toLocaleString()} (${(maxValue / total * 100).toFixed(1)}% of total)`);
      
      // Bottom performer
      if (values.length > 1) {
        const minIndex = values.indexOf(minValue);
        insights.push(`📊 ${labels[minIndex]} has the lowest value at ${minValue.toLocaleString()}`);
      }
      
      // Distribution analysis
      const avgValue = total / values.length;
      const topThree = values.filter(v => v > avgValue).length;
      
      if (topThree <= 3 && values.length > 3) {
        insights.push(`⭐ Top ${topThree} categories account for ${(values.filter(v => v > avgValue).reduce((a, b) => a + b, 0) / total * 100).toFixed(1)}% of total`);
      }
      
      // Gap analysis
      const gap = maxValue - minValue;
      const gapPercent = (gap / maxValue * 100).toFixed(1);
      insights.push(`📏 ${gapPercent}% performance gap between highest and lowest performers`);
      
      break;
    }

    case 'pie': {
      if (!chart.yKey) break;
      
      const values = actualData.map(item => Number(item[chart.yKey]) || 0);
      const labels = actualData.map(item => item[chart.xKey]);
      const total = values.reduce((a, b) => a + b, 0);
      
      // Largest segment
      const maxValue = Math.max(...values);
      const maxIndex = values.indexOf(maxValue);
      const maxPercent = (maxValue / total * 100).toFixed(1);
      insights.push(`🥇 ${labels[maxIndex]} dominates with ${maxPercent}% share`);
      
      // Distribution balance
      const avgValue = total / values.length;
      const balanced = values.filter(v => Math.abs(v - avgValue) / avgValue < 0.3).length;
      
      if (balanced >= values.length * 0.7) {
        insights.push(`⚖️ Well-balanced distribution across ${values.length} categories`);
      } else {
        insights.push(`📊 Uneven distribution with concentration in top categories`);
      }
      
      // Top 3 concentration
      if (values.length >= 3) {
        const sortedValues = [...values].sort((a, b) => b - a);
        const top3Sum = sortedValues.slice(0, 3).reduce((a, b) => a + b, 0);
        const top3Percent = (top3Sum / total * 100).toFixed(1);
        insights.push(`📈 Top 3 segments represent ${top3Percent}% of total value`);
      }
      
      break;
    }

    case 'scatter': {
      if (!chart.yKey || !chart.xKey) break;
      
      const xValues = actualData.map(item => Number(item[chart.xKey]) || 0);
      const yValues = actualData.map(item => Number(item[chart.yKey]) || 0);
      
      // Correlation analysis
      const n = xValues.length;
      const meanX = xValues.reduce((a, b) => a + b, 0) / n;
      const meanY = yValues.reduce((a, b) => a + b, 0) / n;
      
      let numerator = 0;
      let denominatorX = 0;
      let denominatorY = 0;
      
      for (let i = 0; i < n; i++) {
        const dx = xValues[i] - meanX;
        const dy = yValues[i] - meanY;
        numerator += dx * dy;
        denominatorX += dx * dx;
        denominatorY += dy * dy;
      }
      
      const correlation = numerator / Math.sqrt(denominatorX * denominatorY);
      
      if (correlation > 0.7) {
        insights.push(`📈 Strong positive correlation (${correlation.toFixed(2)}) - variables increase together`);
      } else if (correlation > 0.3) {
        insights.push(`↗️ Moderate positive correlation (${correlation.toFixed(2)}) detected`);
      } else if (correlation < -0.7) {
        insights.push(`📉 Strong negative correlation (${correlation.toFixed(2)}) - inverse relationship`);
      } else if (correlation < -0.3) {
        insights.push(`↘️ Moderate negative correlation (${correlation.toFixed(2)}) detected`);
      } else {
        insights.push(`➡️ Weak correlation (${correlation.toFixed(2)}) - variables relatively independent`);
      }
      
      insights.push(`📊 ${n} data points analyzed for relationship patterns`);
      
      break;
    }
  }
  
  // Add existing custom insights if provided
  if (chart.insights && chart.insights.length > 0) {
    insights.push(...chart.insights);
  }
  
  return insights.slice(0, 5); // Limit to top 5 insights
};

export function AutoDashboard({ charts, isGenerating, onRegenerateCharts }: AutoDashboardProps) {
  // --- FIX STARTS HERE ---
  const [isExporting, setIsExporting] = useState(false);
  const [forecastingChartId, setForecastingChartId] = useState<string | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Generate forecast data for a chart
  const handleForecast = async (chart: ChartConfig) => {
    if (!chart.yKey || chart.type === 'pie') return;
    
    setForecastingChartId(chart.id);
    
    try {
      // Get historical values for forecasting
      const historicalData = chart.data.filter(item => !item.isForecast);
      const values = historicalData.map(item => Number(item[chart.yKey]) || 0);
      
      if (values.length < 2) {
        console.warn('Not enough data points for forecasting');
        setForecastingChartId(null);
        return;
      }
      
      // Simple linear regression for better forecasting
      const n = values.length;
      const indices = Array.from({ length: n }, (_, i) => i);
      
      // Calculate means
      const meanX = indices.reduce((a, b) => a + b, 0) / n;
      const meanY = values.reduce((a, b) => a + b, 0) / n;
      
      // Calculate slope and intercept
      let numerator = 0;
      let denominator = 0;
      
      for (let i = 0; i < n; i++) {
        numerator += (indices[i] - meanX) * (values[i] - meanY);
        denominator += Math.pow(indices[i] - meanX, 2);
      }
      
      const slope = denominator !== 0 ? numerator / denominator : 0;
      const intercept = meanY - slope * meanX;
      
      // Generate forecast points
      const forecastPeriods = Math.min(12, Math.ceil(n * 0.3)); // Forecast 30% of historical data or 12 periods
      const forecastValues = [];
      
      for (let i = 1; i <= forecastPeriods; i++) {
        const forecastValue = slope * (n + i - 1) + intercept;
        // Add some randomness to make it more realistic (±5%)
        const variance = forecastValue * 0.05 * (Math.random() - 0.5);
        forecastValues.push(Math.max(0, forecastValue + variance));
      }
      
      // Add forecast points to chart data
      const lastDataPoint = historicalData[historicalData.length - 1];
      const lastXValue = lastDataPoint[chart.xKey];
      
      const extendedData = [...historicalData];
      forecastValues.forEach((value, index) => {
        let forecastLabel;
        if (typeof lastXValue === 'number') {
          forecastLabel = lastXValue + index + 1;
        } else if (typeof lastXValue === 'string') {
          // Try to extract and increment numbers from strings
          const match = lastXValue.match(/\d+/);
          if (match) {
            const baseNum = parseInt(match[0]);
            const prefix = lastXValue.substring(0, match.index);
            const suffix = lastXValue.substring(match.index! + match[0].length);
            forecastLabel = `${prefix}${baseNum + index + 1}${suffix}`;
          } else {
            forecastLabel = `F${index + 1}`;
          }
        } else {
          forecastLabel = `Forecast ${index + 1}`;
        }
        
        const newPoint = {
          [chart.xKey]: forecastLabel,
          [chart.yKey]: Math.round(value * 100) / 100, // Round to 2 decimals
          isForecast: true
        };
        extendedData.push(newPoint);
      });
      
      // Calculate trend direction
      const lastValue = values[values.length - 1];
      const forecastLastValue = forecastValues[forecastValues.length - 1];
      const trendPercent = ((forecastLastValue - lastValue) / lastValue * 100).toFixed(1);
      const trendDirection = forecastLastValue > lastValue ? 'positive' : 'negative';
      
      // Update the chart with new data including forecast
      const updatedChart = {
        ...chart,
        data: extendedData,
      };
      
      // Generate insights including forecast insight
      const baseInsights = generateChartInsights(updatedChart);
      const forecastInsight = `🔮 Forecast shows a ${trendDirection} trend (${trendPercent}% change)`;
      updatedChart.insights = [...baseInsights, forecastInsight];
      
      // Trigger chart update
      const chartIndex = charts.findIndex(c => c.id === chart.id);
      if (chartIndex !== -1) {
        charts[chartIndex] = updatedChart;
        onRegenerateCharts && onRegenerateCharts();
      }
      
    } catch (error) {
      console.error('Forecast generation failed:', error);
    } finally {
      setForecastingChartId(null);
    }
  };

  const handleExportDashboard = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(dashboardRef.current, {
        useCORS: true, // Handle images from other origins
        scale: 2, // Increase resolution for better quality
      });

      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      // Check if the image height exceeds the page, adjust if necessary
      let finalHeight = imgHeight > pdfHeight ? pdfHeight : imgHeight;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, finalHeight);
      pdf.save('dashboard-export.pdf');

    } catch (error) {
      console.error("Error exporting dashboard:", error);
    } finally {
      setIsExporting(false);
    }
  };
  // --- FIX ENDS HERE ---

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
                formatter={(value: any, name: string, props: any) => {
                  const isForecast = props.payload.isForecast;
                  return [value, isForecast ? '🔮 Forecast' : '📊 Actual'];
                }}
              />
              <Legend 
                formatter={(value) => {
                  if (value.includes('Forecast')) return '🔮 Forecast';
                  return '📊 Actual';
                }}
              />
              
              {/* Actual data line - Solid blue */}
              <Line 
                type="monotone" 
                name={chart.yKey}
                dataKey={(dataPoint) => dataPoint.isForecast ? null : dataPoint[chart.yKey]}
                stroke="#2563eb"
                strokeWidth={3}
                connectNulls
                dot={(props) => {
                  if (props.payload.isForecast) return null;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={5}
                      fill="#2563eb"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={(props) => {
                  if (props.payload.isForecast) return null;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={7}
                      fill="#2563eb"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  );
                }}
              />
              
              {/* Forecast data line - Dashed orange */}
              <Line 
                type="monotone" 
                name={`${chart.yKey} (Forecast)`}
                dataKey={(dataPoint) => dataPoint.isForecast ? dataPoint[chart.yKey] : null}
                stroke="#f97316"
                strokeWidth={3}
                strokeDasharray="8 4"
                connectNulls
                dot={(props) => {
                  if (!props.payload.isForecast) return null;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={5}
                      fill="#f97316"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={(props) => {
                  if (!props.payload.isForecast) return null;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={7}
                      fill="#f97316"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  );
                }}
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
                formatter={(value: any, name: string, props: any) => {
                  const isForecast = props.payload.isForecast;
                  return [value, isForecast ? '🔮 Forecast' : '📊 Actual'];
                }}
              />
              <Legend 
                formatter={(value) => {
                  if (value.includes('Forecast')) return '🔮 Forecast';
                  return '📊 Actual';
                }}
              />
              
              {/* Actual data area - Solid blue */}
              <Area 
                type="monotone" 
                name={chart.yKey}
                dataKey={(dataPoint) => dataPoint.isForecast ? null : dataPoint[chart.yKey]} 
                stroke="#2563eb" 
                fill="#2563eb33"
                strokeWidth={2}
                connectNulls
              />
              
              {/* Forecast data area - Dashed orange */}
              <Area 
                type="monotone" 
                name={`${chart.yKey} (Forecast)`}
                dataKey={(dataPoint) => dataPoint.isForecast ? dataPoint[chart.yKey] : null}
                stroke="#f97316"
                fill="#f9731633"
                strokeWidth={2}
                strokeDasharray="8 4"
                connectNulls
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
                formatter={(value: any, name: string, props: any) => {
                  const isForecast = props.payload.isForecast;
                  return [value, isForecast ? '🔮 Forecast' : '📊 Actual'];
                }}
              />
              <Legend />
              <Bar dataKey={chart.yKey} radius={4}>
                {chart.data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isForecast ? '#f97316' : COLORS[index % COLORS.length]}
                    opacity={entry.isForecast ? 0.7 : 1}
                  />
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
            disabled={isGenerating || isExporting}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
          {/* --- FIX: Updated Export Button --- */}
          <Button 
            onClick={handleExportDashboard}
            disabled={isGenerating || isExporting}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export as PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* --- FIX: Attach the ref to the dashboard grid --- */}
      <div ref={dashboardRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-background p-4">
        {charts.map((chart) => (
          <Card key={chart.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getChartIcon(chart.type)}
                  <CardTitle className="text-lg">{chart.title}</CardTitle>
                  {chart.data.some((item) => item.isForecast) && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                      Forecast
                    </Badge>
                  )}
                </div>
                {(chart.type === 'line' || chart.type === 'bar' || chart.type === 'area') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 px-2"
                    onClick={() => handleForecast(chart)}
                    disabled={forecastingChartId === chart.id}
                    title="Generate AI-powered forecast based on historical trends"
                  >
                    <Wand2 className={`h-4 w-4 ${forecastingChartId === chart.id ? 'animate-spin' : ''}`} />
                    <span className="text-xs">
                      {forecastingChartId === chart.id ? 'Forecasting...' : 'Forecast'}
                    </span>
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{chart.description}</p>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-4">
                {renderChart(chart)}
              </div>
              
              {(() => {
                const insights = generateChartInsights(chart);
                return insights && insights.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-accent">Key Insights:</h4>
                    <ul className="space-y-1">
                      {insights.map((insight, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
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