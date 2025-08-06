import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, Send, Bot, User, Brain, TrendingUp, Sparkles } from "lucide-react"

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
}

const SAMPLE_QUERIES = [
  "What's the average sales for Q3?",
  "Show me the top 5 performing products",
  "Predict our revenue for next quarter",
  "Compare sales by region",
  "What trends do you see in the data?"
]

export function ChatInterface({ data, onQuery, isConnected = false }: ChatInterfaceProps) {
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
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

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

    try {
      let response = ""
      
      if (onQuery && data) {
        response = await onQuery(content)
      } else {
        // Simulate AI response for demo
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
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
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
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>Data Assistant</CardTitle>
            <Badge 
              variant={isConnected ? "default" : "secondary"}
              className={isConnected ? "bg-success text-success-foreground" : ""}
            >
              {isConnected ? "Connected" : "Demo Mode"}
            </Badge>
          </div>
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Messages */}
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
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
              {SAMPLE_QUERIES.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSampleQuery(query)}
                  disabled={isLoading}
                  className="text-xs h-8"
                >
                  {query}
                </Button>
              ))}
            </div>
            <Separator />
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
  )
}