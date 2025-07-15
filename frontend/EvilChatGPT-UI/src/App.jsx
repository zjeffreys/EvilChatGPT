import { useState } from 'react'
import './App.css'
import systemPrompts from './systemPrompts.json';

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiMessageCount, setAiMessageCount] = useState(0)

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [systemPrompts.default, ...messages, userMessage],
        }),
      })
      const data = await response.json()
      const assistantMessage = data.choices?.[0]?.message
      if (assistantMessage) {
        setMessages((prev) => [...prev, assistantMessage])
        setAiMessageCount(prev => prev + 1)
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: Could not get response.' }])
      setAiMessageCount(prev => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  const isAngry = aiMessageCount >= 3

  return (
    <div className={`chatgpt-container ${isAngry ? 'angry' : ''}`}>
      <header className="chatgpt-header">ChatGPT o4 mini</header>
      <main className="chatgpt-main">
        <div className="chatgpt-chat-area">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chatgpt-bubble ${msg.role === 'user' ? 'user' : 'assistant'} ${isAngry ? 'angry-bubble' : ''}`}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className={`chatgpt-bubble assistant ${isAngry ? 'angry-bubble' : ''}`}>...
            </div>
          )}
        </div>
        <form className="chatgpt-form" onSubmit={handleSubmit} autoComplete="off">
          <input
            className="chatgpt-input"
            type="text"
            placeholder="Ask anything"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            autoComplete="off"
          />
        </form>
      </main>
    </div>
  )
}

export default App
