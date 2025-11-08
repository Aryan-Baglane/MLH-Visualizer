import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, Send, Bot, User, Brain, TrendingUp, Sparkles, X } from "lucide-react"

// Add ChartConfig type for chart updates
export interface ChartConfig {
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

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  data?: any[]
  onQuery?: (query: string) => Promise<string>
  isConnected?: boolean
  charts?: ChartConfig[]
  setCharts?: (charts: ChartConfig[]) => void
  onChartsUpdate?: (charts: ChartConfig[]) => void
  onTempCharts?: (charts: ChartConfig[], title?: string) => void
}

// Function to generate dynamic queries based on data
const generateDynamicQueries = (data: any[]): string[] => {
  if (!data || data.length === 0) return [
    "What's the average value?",
    "Show me trends with charts",
    "How many records are there?",
    "Create a visual analysis",
    "Summarize the key insights"
  ]

  const firstRow = data[0]
  const columns = Object.keys(firstRow)
  const queries: string[] = []

  // Find numeric columns
  const numericColumns = columns.filter(col => {
    const value = firstRow[col]
    return !isNaN(parseFloat(value)) && isFinite(value)
  })

  // Find text/categorical columns
  const textColumns = columns.filter(col => {
    const value = firstRow[col]
    return isNaN(parseFloat(value)) || !isFinite(value)
  })

  // Generate mix of text and chart queries
  if (numericColumns.length > 0) {
    const numCol = numericColumns[0]
    // Text-only query
    queries.push(`What is the average ${numCol}?`)
    // Chart query
    queries.push(`Show ${numCol} trends`)
  }

  if (textColumns.length > 0 && numericColumns.length > 0) {
    const textCol = textColumns[0]
    const numCol = numericColumns[0]
    // Chart query
    queries.push(`Visualize ${numCol} by ${textCol}`)
    // Text-only query
    queries.push(`Which ${textCol} has highest ${numCol}?`)
  }

  if (numericColumns.length > 0) {
    // Comprehensive analysis query
    queries.push(`Analyze the data`)
  }

  // Fallback queries
  if (queries.length === 0) {
    queries.push("Tell me about this data")
  }

  return queries.slice(0, 5) // Return max 5 queries
}

export function ChatInterface({ data, onQuery, isConnected = false, charts, setCharts, onChartsUpdate, onTempCharts }: ChatInterfaceProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello! I'm your AI data assistant. I can help you analyze your data, answer questions, and even generate predictions. ${data ? `I can see you've uploaded ${data.length} rows of data.` : 'Upload some data to get started!'} What would you like to explore?`,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Generate dynamic queries based on data
  const sampleQueries = data ? generateDynamicQueries(data) : [
    "What's the average value?",
    "Show me trends with charts",
    "How many records are there?",
    "Create a visual analysis",
    "Summarize the key insights"
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  async function queryGemini(query: string, data: any[]): Promise<{ response: string, charts?: ChartConfig[] }> {
    let apiKey = (window as any).GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) {
      apiKey = prompt("Enter your Gemini API Key:")
      ;(window as any).GEMINI_API_KEY = apiKey
    }
    if (!apiKey) throw new Error("No Gemini API key provided.")

    const sampleRows = data.slice(0, 50)
    
    const promptText = `
You are an expert data analyst with advanced visualization capabilities. Analyze the user's question and provide an appropriate response.

Your FINAL output MUST be a single, valid JSON object following this structure:
{
  "response": "Your detailed text answer here.",
  "charts": [{
      "id": "unique-chart-id",
      "type": "line" | "bar" | "area" | "pie" | "scatter",
      "title": "Descriptive Chart Title",
      "description": "Brief description of the chart.",
      "data": [ ... ],
      "xKey": "key_for_x_axis",
      "yKey": "key_for_y_axis",
      "colorKey": "key_for_pie_chart_categories",
      "insights": ["Key observation from the chart."]
  }]
}

DECISION LOGIC - When to Generate Charts vs Text Only:

GENERATE CHARTS when the user asks about:
- Visualizations, charts, graphs, or dashboards
- Trends, patterns, or changes over time
- Comparisons between categories or groups
- Distributions, breakdowns, or proportions
- Sales, revenue, performance metrics with visual context
- "Show me...", "Display...", "Visualize...", "Create charts..."
- Any question that would benefit from visual representation

PROVIDE TEXT ONLY (empty charts array) when the user asks:
- Specific numerical questions (e.g., "What is the average?", "How many?")
- Yes/no questions
- Definitions or explanations
- Questions about data quality or structure
- Simple calculations or statistics
- "Tell me...", "What is...", "How many...", "Calculate..."
- Casual conversation or greetings

CHART GENERATION GUIDELINES:
- Generate 2-4 charts when asking for comprehensive visualization
- Use LINE charts for time-based trends
- Use BAR charts for categorical comparisons
- Use PIE charts for proportions/distributions (only when categories < 8)
- Use AREA charts for cumulative trends
- Use SCATTER charts for correlation analysis
- For line, bar, area, and scatter charts, "yKey" is MANDATORY
- For pie charts, use "colorKey" for categories and "yKey" for values

EXAMPLES:

Example 1 - VISUALIZATION REQUEST:
User: "Show me sales trends"
Response:
{
  "response": "Here's a comprehensive analysis of sales trends with visualizations showing patterns over time and category breakdowns.",
  "charts": [
    {
      "id": "sales-trend",
      "type": "line",
      "title": "Sales Trend Over Time",
      "description": "Line chart showing sales progression",
      "data": [{"month": "Jan", "sales": 4500}, {"month": "Feb", "sales": 5200}],
      "xKey": "month",
      "yKey": "sales",
      "insights": ["Upward trend observed", "Peak in February"]
    },
    {
      "id": "sales-by-category",
      "type": "bar",
      "title": "Sales by Category",
      "description": "Comparison across categories",
      "data": [{"category": "Electronics", "sales": 15000}],
      "xKey": "category",
      "yKey": "sales",
      "insights": ["Electronics leading"]
    }
  ]
}

Example 2 - STATISTICAL QUESTION (TEXT ONLY):
User: "What is the average sales?"
Response:
{
  "response": "The average sales across all records is $12,450. This represents a 15% increase from the previous period. The median value is $11,200, indicating a relatively balanced distribution with some high-value outliers pulling the mean upward.",
  "charts": []
}

Example 3 - CALCULATION REQUEST (TEXT ONLY):
User: "How many products sold more than 1000 units?"
Response:
{
  "response": "Based on the data, 23 products sold more than 1000 units. This represents 45% of the total product catalog. The top performer sold 5,432 units, while the threshold product sold exactly 1,001 units.",
  "charts": []
}

Example 4 - COMPREHENSIVE ANALYSIS WITH CHARTS:
User: "Analyze the data" or "Give me insights"
Response:
{
  "response": "Here's a comprehensive analysis of your data with multiple perspectives including trends, comparisons, and distributions.",
  "charts": [
    {
      "id": "trend-analysis",
      "type": "line",
      "title": "Trend Analysis",
      "description": "Overall trend pattern",
      "data": [...],
      "xKey": "period",
      "yKey": "value",
      "insights": ["Strong upward momentum"]
    },
    {
      "id": "category-comparison",
      "type": "bar",
      "title": "Category Comparison",
      "description": "Performance by category",
      "data": [...],
      "xKey": "category",
      "yKey": "value",
      "insights": ["Top category outperforms"]
    },
    {
      "id": "distribution",
      "type": "pie",
      "title": "Distribution",
      "description": "Proportion breakdown",
      "data": [...],
      "xKey": "category",
      "yKey": "value",
      "colorKey": "category",
      "insights": ["Balanced distribution"]
    }
  ]
}

Example 5 - GREETING (TEXT ONLY):
User: "Hello" or "Hi"
Response:
{
  "response": "Hello! I'm your data analysis assistant. I can help you understand your data by creating visualizations, calculating statistics, identifying trends, and answering questions. What would you like to explore?",
  "charts": []
}

Example 6 - PREDICTION WITH CHART:
User: "Predict next quarter revenue"
Response:
{
  "response": "Based on historical trends and using time series analysis, I predict next quarter revenue will be approximately $156,000, representing an 8% growth from the current quarter.",
  "charts": [
    {
      "id": "revenue-forecast",
      "type": "line",
      "title": "Revenue Forecast",
      "description": "Historical data with prediction",
      "data": [
        {"period": "Q1", "revenue": 120000},
        {"period": "Q2", "revenue": 135000},
        {"period": "Q3", "revenue": 144000},
        {"period": "Q4 (Forecast)", "revenue": 156000}
      ],
      "xKey": "period",
      "yKey": "revenue",
      "insights": ["Consistent growth pattern", "8% projected increase"]
    }
  ]
}

---
Data sample (first 50 rows): ${JSON.stringify(sampleRows)}

User question: "${query}"

INSTRUCTIONS:
1. Read the user's question carefully
2. Decide if charts would enhance the answer or if text alone is sufficient
3. If charts are needed, determine the best chart types and generate 1-4 appropriate visualizations
4. Always provide a clear, detailed text response
5. Use the actual data provided above to generate accurate charts
6. Generate the JSON response now.
    `.trim()

    const model = 'gemini-2.0-flash-exp';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
                temperature: 0.2,
            }
        }),
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error("Gemini API Error Body:", errorBody);
        throw new Error(`Gemini API error: ${res.status} ${res.statusText}`);
    }
    const dataJson = await res.json()
    
    const content = dataJson.candidates?.[0]?.content?.parts?.[0]?.text || ""
    if (!content) {
        console.error("Empty response from Gemini API:", dataJson);
        throw new Error("Empty response from Gemini API")
    }

    try {
      // The response might be wrapped in markdown JSON block, so we clean it up.
      const cleanedContent = content.replace(/^```json\s*|```\s*$/g, '');
      return JSON.parse(cleanedContent);
    } catch (e) {
      console.error("Failed to parse JSON response from LLM:", content)
      return { response: "Sorry, I received an invalid response format. Please try again.", charts: [] }
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
    setError(null)

    try {
      let response = ""
      let chartUpdates: ChartConfig[] | undefined

      if (data) {
        const llmResult = await queryGemini(content, data)
        response = llmResult.response
        chartUpdates = llmResult.charts
      } else if (onQuery) {
        response = await onQuery(content)
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
        response = generateSimulatedResponse(content)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // --- FIX STARTS HERE ---
      // This logic now intelligently updates all relevant charts on the dashboard.
      if (chartUpdates && chartUpdates.length > 0) {
        // Notify parent about temporary chat charts (for quick preview)
        if (typeof onTempCharts === 'function') {
          try {
            onTempCharts(chartUpdates, response)
          } catch (err) {
            console.warn('onTempCharts handler failed', err)
          }
        }

        // If setCharts is available, merge into main charts (existing behavior)
        if (setCharts) {
        let updatedCharts = charts ? [...charts] : [];

        // For each chart update returned by the AI...
        chartUpdates.forEach(aiChart => {
            const { xKey: aiXKey, yKey: aiYKey, data: newData, description: newDescription, insights: newInsights } = aiChart;

            // Flag to check if we updated any existing chart or if this is a new one.
            let chartWasMatchedAndUpdated = false;

            // Map over the current charts to find all matches.
            updatedCharts = updatedCharts.map(existingChart => {
                // A match is found if the X and Y keys are the same.
                if (existingChart.xKey === aiXKey && existingChart.yKey === aiYKey) {
                    chartWasMatchedAndUpdated = true;
                    // Update this chart with the new data from the AI.
                    return {
                        ...existingChart,
                        data: newData,
                        description: newDescription || `Updated with new prediction.`, // Provide a sensible default
                        insights: newInsights || existingChart.insights,
                    };
                }
                return existingChart; // No match, return the chart as is.
            });

            // If no existing charts were matched, it means this is a brand new chart.
            // Add it to the dashboard.
            if (!chartWasMatchedAndUpdated) {
                updatedCharts.push(aiChart);
            }
        });

          // Update the application state with the fully merged list of charts.
          setCharts(updatedCharts);

          // Notify the parent to show the updated dashboard.
          if (onChartsUpdate) {
              onChartsUpdate(updatedCharts);
          }
        }
      }
      // --- FIX ENDS HERE ---

    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      setError(error?.message || "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  const generateSimulatedResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('average') || lowerQuery.includes('mean')) {
      return "Based on your data analysis, the average value appears to be $24,567. This represents a 12% increase from the previous period. The data shows consistent growth trends across most categories."
    }
    
    if (lowerQuery.includes('top') || lowerQuery.includes('best') || lowerQuery.includes('highest')) {
      return "Here are the top 5 performers from your dataset:\n\n1. Product Alpha - $45,220\n2. Service Beta - $38,910\n3. Product Gamma - $31,567\n4. Service Delta - $28,440\n5. Product Epsilon - $24,890\n\nProduct Alpha shows particularly strong performance with 23% growth."
    }
    
    if (lowerQuery.includes('predict') || lowerQuery.includes('forecast') || lowerQuery.includes('future')) {
      return "Based on ARIMA time series analysis of your data, I predict:\n\n📈 Next Quarter: $156,780 (±15% confidence interval)\n📊 Growth Rate: 8.5% projected increase\n🎯 Key Factors: Seasonal trends suggest continued upward momentum\n\nWould you like me to generate a detailed forecast chart?"
    }
    
    if (lowerQuery.includes('trend') || lowerQuery.includes('pattern')) {
      return "I've identified several key trends in your data:\n\n🔍 **Seasonal Pattern**: Clear quarterly cycles with Q4 showing strongest performance\n📈 **Growth Trend**: Overall 15% year-over-year increase\n⚡ **Volatility**: Reduced variance indicates more stable performance\n🎯 **Outliers**: 3 significant anomalies detected, likely due to promotional events"
    }
    
    if (lowerQuery.includes('compare') || lowerQuery.includes('vs') || lowerQuery.includes('versus')) {
      return "Comparison analysis reveals:\n\n**Region A vs Region B:**\n• Region A: $89,450 (52% of total)\n• Region B: $82,330 (48% of total)\n• Difference: $7,120 in favor of Region A\n\n**Performance Insights:**\n• Region A shows more consistent growth\n• Region B has higher volatility but better peak performance"
    }
    
    // Default response
    return `I understand you're asking about "${query}". While I don't have access to live data analysis yet, I can help you explore patterns, calculate statistics, generate forecasts, and create visualizations once your data is connected. Upload a CSV file to unlock my full analytical capabilities!`
  }

  const handleSampleQuery = (query: string) => {
    handleSendMessage(query)
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Dialog */}
      <div 
        className={`fixed bottom-[88px] right-6 z-50 w-96 transform transition-all duration-200 ease-in-out ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <Card className="h-[500px] flex flex-col shadow-xl">
          <CardHeader className="py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Data Assistant</CardTitle>
                <Badge 
                  variant={isConnected ? "default" : "secondary"}
                  className={isConnected ? "bg-success text-success-foreground" : ""}
                >
                  {isConnected ? "Connected" : "Demo Mode"}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.type === 'assistant' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      <div className="text-xs opacity-70 mt-1">
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>

                    {message.type === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-accent" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="bg-secondary text-secondary-foreground rounded-xl px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">Analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="text-red-500 text-xs mb-2">{error}</div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Sample Queries */}
            {messages.length === 1 && (
              <div className="space-y-2">
                <Separator />
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Try asking:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sampleQueries.map((query, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendMessage(query)}
                      disabled={isLoading}
                      className="text-xs h-8"
                    >
                      {query}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(inputValue)
                  }
                }}
                placeholder="Ask me about your data..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}