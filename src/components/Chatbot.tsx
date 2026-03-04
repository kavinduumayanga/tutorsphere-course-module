import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { courseService } from '../services/courseService';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

const FAQ: Record<string, string> = {
  enroll:
    'To enroll in a course:\n1. Browse the Courses page\n2. Click on a course you like\n3. Click the "Enroll Now" button\n4. Start learning!',
  certificate:
    'You can earn a certificate by completing all modules in a course. Once 100% complete, a "Download Certificate" button will appear on the course details page.',
  resource:
    'Visit the Resources page to browse free papers, notes, articles, and PDFs uploaded by tutors. You can download them anytime!',
  progress:
    'Your learning progress is tracked automatically. As you complete modules in a course, your progress bar updates on the course details page.',
  tutor:
    'Tutors can create and manage courses from the "Manage Courses" page. They can add modules with video links, descriptions, and resources.',
  help:
    "I can help you with:\n• Finding courses by topic\n• Explaining how to enroll\n• Information about certificates\n• Resource library questions\n• General platform help\n\nJust ask me anything!",
};

function getBotResponse(message: string): string {
  const lower = message.toLowerCase();

  // Check for course search
  const courseKeywords = ['course', 'learn', 'study', 'find', 'recommend', 'suggest', 'want'];
  if (courseKeywords.some(k => lower.includes(k))) {
    const subjects = [
      'java', 'python', 'react', 'web', 'data', 'programming',
      'science', 'javascript', 'typescript', 'sql', 'database',
    ];
    const foundSubject = subjects.find(s => lower.includes(s));

    if (foundSubject) {
      const courses = courseService.searchCourses(foundSubject);
      if (courses.length > 0) {
        const list = courses.map(c => `• ${c.title}`).join('\n');
        return `I found these courses matching "${foundSubject}":\n\n${list}\n\nVisit the Courses page to learn more and enroll!`;
      }
      return `I couldn't find courses matching "${foundSubject}" right now. Check the Courses page for all available options!`;
    }

    const allCourses = courseService.getAllCourses();
    if (allCourses.length > 0) {
      const list = allCourses.slice(0, 5).map(c => `• ${c.title} (${c.subject})`).join('\n');
      return `Here are some available courses:\n\n${list}\n\nTell me a specific topic and I'll search for you!`;
    }
  }

  // Check FAQ patterns
  for (const [key, response] of Object.entries(FAQ)) {
    if (lower.includes(key)) return response;
  }

  // Greetings
  if (lower.match(/^(hi|hello|hey|greetings|good)/)) {
    return 'Hello! Welcome to TutorSphere. I can help you find courses, explain features, or answer questions about the platform. What would you like to know?';
  }

  if (lower.includes('thank')) {
    return "You're welcome! Let me know if you need anything else. Happy learning!";
  }

  return "I'm not sure about that, but I can help you with:\n• Finding courses (try: \"find Java courses\")\n• Enrollment steps\n• Certificate info\n• Resource library\n• General platform help\n\nTry asking about one of these topics!";
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: "Hello! I'm the TutorSphere assistant. I can help you find courses, answer platform questions, or guide you through features. What can I help you with?",
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');

    // Simulate slight delay for natural feel
    setTimeout(() => {
      const response = getBotResponse(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    }, 400);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4 animate-in fade-in">
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-bold">TutorSphere Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-slate-100 text-slate-700 rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
