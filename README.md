# AI RESBOX 🎯

**Shrink Words. Mash Meanings. Not a Game. A New Way to See Words.**

---

## 🌟 What is AI RESBOX?

AI RESBOX is an innovative AI-powered word puzzle application that challenges players to think about language in completely new ways. Born from the Nano Banana Hackathon, this isn't just another word game—it's a conceptual exploration of how we can interact with language through AI assistance.

### 🎮 Two Unique Game Modes

#### 🧩 **Word Shrinker**
- **Concept**: Break down complex words into visual components and individual letters
- **Challenge**: Deconstruct words like "CARPENTER" into ["CAR", "P", "E", "N", "T", "E", "R"]
- **Visual Style**: Clean, minimal icons with transparent backgrounds
- **Difficulty Levels**: Easy (6-12 letters) and Hard (8-15 letters)
- **AI Integration**: Generates images for 3+ letter word parts, validates creative solutions

#### 🎨 **Word Mashup**
- **Concept**: Transform a starter image by creatively combining it with another object
- **Challenge**: Given "STAR", create "STARFISH" by adding fish elements
- **Visual Style**: Kawaii sticker aesthetic with bold outlines and vibrant colors
- **AI Integration**: Generates starter images, processes user edit prompts, judges creativity
- **Scoring**: 0-10 points based on creativity, object visibility, and integration quality

---

## 🛠️ Technical Architecture

### **Core Technologies**
- **Frontend**: React 19 with TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0 for fast development and optimized builds
- **AI Engine**: Google Gemini API (2.5-flash, 2.5-pro, 2.5-flash-image-preview)
- **Styling**: Tailwind CSS with custom animations

### **Key Features**
- **🔄 Smart Prefetching**: Background puzzle generation for instant gameplay
- **🚫 Anti-Repetition System**: Session-wide word tracking prevents duplicate puzzles
- **🎯 Bias Reduction**: Actively avoids overused words like "STARFISH" and "FOOTBALL"
- **📱 Responsive Design**: Optimized for desktop and mobile experiences
- **⚡ Real-time AI Processing**: Live image generation and creative judgment
- **🎨 Dual Visual Styles**: Minimal icons for Word Shrinker, kawaii stickers for Word Mashup

### **AI Integration Highlights**
- **Image Generation**: Custom prompts for two distinct visual styles
- **Natural Language Processing**: User prompt interpretation for image editing
- **Creative Judgment**: AI scoring system that analyzes visual creativity
- **Schema Validation**: Structured JSON responses ensure game reliability
- **Fallback Systems**: Graceful degradation when AI services are unavailable

---

## 🍌 Nano Banana AI Integration

### **Leveraging Nano Banana's Core Strengths**

AI RESBOX showcases two distinct aspects of Nano Banana's AI capabilities:

#### 🧩 **Word Shrinker: Generation Mastery**
- **Nano Banana's Core Strength**: Utilizes Nano Banana's powerful image generation capabilities to create clean, minimal icon-style images for word parts
- **Gemini 2.5 Pro/Flash Integration**: Leverages Google's Gemini models for intelligent puzzle generation and creative word deconstructions
- **Smart Puzzle Creation**: Generates complex word deconstructions that balance challenge with solvability
- **Dynamic Content**: Creates fresh puzzles on-demand while maintaining quality and educational value
- **Validation Intelligence**: Uses AI reasoning to validate creative alternative solutions from players

#### 🎨 **Word Mashup: Consistency in Complexity**
- **Nano Banana's Powerful Editing**: Demonstrates advanced image manipulation capabilities while maintaining visual consistency
- **Style Preservation**: Seamlessly integrates new elements into existing images without breaking the kawaii sticker aesthetic
- **Creative Interpretation**: Transforms user text prompts into sophisticated visual edits
- **Consistency Mastery**: Maintains coherent visual style across diverse creative requests

### **Why These Capabilities Matter**
- **Nano Banana's Image Generation** creates consistent, high-quality visual representations of word components
- **Gemini's Generation Strength** enables endless, varied puzzle content without repetition
- **Editing Consistency** ensures professional-quality visual outputs regardless of user input complexity
- Together, they create a seamless experience where AI enhances human creativity rather than replacing it

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (compatible with Vite 6.2.0)
- Google Gemini API key

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-resbox
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   ```bash
   # Create .env.local file
   echo "GEMINI_API_KEY=your_api_key_here" > .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### **Build for Production**
```bash
npm run build
npm run preview
```

---

## 🎯 Game Mechanics

### **Word Shrinker Scoring**
- **Base Points**: 5 points for correct answers
- **Time Bonus**: +1 point per second remaining
- **Creative Solutions**: AI validates alternative deconstructions

### **Word Mashup Scoring**
- **Creativity Scale**: 0-10 points based on:
  - Object visibility and clarity
  - Creative integration (not just side-by-side placement)
  - Humor and surprise factor
  - Overall visual cohesion
- **Bonus Scoring**: 2x multiplier converts AI score to game points (0-20 range)

### **Session Features**
- **Progress Tracking**: Puzzles attempted, puzzles solved, total score
- **Word Diversity**: Anti-repetition system ensures fresh content
- **Prefetch Intelligence**: Next puzzles prepared in background

---

## 🏗️ Project Structure

```
ai-resbox/
├── src/
│   ├── components/
│   │   ├── GameBoard.tsx           # Word Shrinker game interface
│   │   ├── WordMashupBoard.tsx     # Word Mashup game interface
│   │   ├── WordMashupResultModal.tsx # Results and AI judgment display
│   │   ├── Scoreboard.tsx          # Score tracking component
│   │   ├── Timer.tsx               # Game timer component
│   │   └── SessionWordTracker.tsx  # Debug word tracking display
│   ├── services/
│   │   ├── geminiService.ts        # Core AI integration logic
│   │   └── geminiClient.ts         # API client configuration
│   ├── types.ts                    # TypeScript interfaces
│   ├── App.tsx                     # Main application component
│   └── index.tsx                   # Application entry point
├── index.html                      # HTML template
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

---

## 🎨 Design Philosophy

### **"Not a Game. A New Way to See Words."**

AI RESBOX challenges traditional notions of word games by:

- **Conceptual Thinking**: Moving beyond spelling and definitions to visual and creative associations
- **AI Collaboration**: Players work *with* AI rather than against predetermined answers
- **Creative Expression**: Rewarding imagination and unconventional thinking
- **Visual Language**: Exploring how words can be represented through images and creative combinations

### **Accessibility & Inclusivity**
- **Multiple Difficulty Levels**: Easy and Hard modes accommodate different skill levels
- **Visual Feedback**: Rich animations and clear UI states guide user interaction
- **Responsive Design**: Consistent experience across devices
- **Graceful Degradation**: Fallback systems ensure functionality even during AI service interruptions

---

## 🏆 Hackathon Heritage

**"Hackathon-born. Concept-driven. Nano Banana-powered."**

**"Made for Nano Banana Hackathon — but built to outlive it."**

**"Hackathon project? Yes. Final form? Not even close."**

*imagined by **PADMANABAN SAMPATH***

This project emerged from the Nano Banana Hackathon as an exploration of AI-human creative collaboration. While built under time constraints, it represents a vision for how AI can enhance rather than replace human creativity in language and visual thinking.

---

## 🔮 Future Vision

- **Multiplayer Modes**: Collaborative word creation and competitive creativity scoring
- **Educational Integration**: Vocabulary building and visual learning tools
- **Custom Word Sets**: User-generated content and themed puzzle packs
- **Advanced AI Models**: Integration with newer multimodal AI capabilities
- **Community Features**: Sharing creative solutions and building word collections
- **Accessibility Enhancements**: Voice controls and visual aid integrations

---

## 📄 License

This project is part of the Nano Banana Hackathon submission. See hackathon guidelines for usage terms.

---

## 🤝 Contributing

While this started as a hackathon project, contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📞 Contact

**Creator**: PADMANABAN SAMPATH

**Project**: AI RESBOX - Nano Banana Hackathon 2024

---

*"Where words meet pixels, creativity meets AI, and games meet art."*
