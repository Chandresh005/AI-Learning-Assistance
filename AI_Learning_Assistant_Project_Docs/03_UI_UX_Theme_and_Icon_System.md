# UI/UX Theme & Icon System — AI Learning Assistant

## 1. Design Direction

### Theme Name
**Intelligent Learning Studio**

The interface should feel:
- modern
- academic
- trustworthy
- focused
- AI-native
- production-grade

Avoid a generic "AI chatbot" appearance.

## 2. Visual Concept

Primary idea:

**Learning + Context + Evidence**

Use visual hierarchy to make:
1. Video content primary.
2. AI assistance immediately accessible.
3. Evidence/citations clearly visible.
4. Learning progress easy to understand.

## 3. Suggested Color Tokens

Use CSS variables so the theme can be changed centrally.

```text
--background: #F7F9FC
--surface: #FFFFFF
--surface-muted: #EEF2F7

--primary: #2563EB
--primary-hover: #1D4ED8

--accent: #06B6D4
--success: #16A34A
--warning: #F59E0B
--danger: #DC2626

--text-primary: #0F172A
--text-secondary: #475569
--border: #E2E8F0
```

Dark mode:

```text
--background-dark: #0B1220
--surface-dark: #111827
--surface-muted-dark: #1F2937
--text-primary-dark: #F8FAFC
--text-secondary-dark: #CBD5E1
```

## 4. Typography

Recommended:
- Inter for UI
- JetBrains Mono for code/timestamps

Hierarchy:
- H1: 28–36px
- H2: 22–28px
- H3: 18–20px
- Body: 14–16px
- Caption: 12–13px

## 5. Main Application Layout

```text
┌─────────────────────────────────────────────────────┐
│ Logo │ Course │ Search │ Progress │ Profile         │
├───────────────────────────────┬─────────────────────┤
│                               │                     │
│          VIDEO PLAYER         │    AI ASSISTANT     │
│                               │                     │
│                               │  Ask a question...  │
│                               │                     │
│  ▶ 18:42 / 60:00              │  Answer             │
│  ━━━━━━━━━━━━━━━━━━━━━        │                     │
│                               │  Sources             │
├───────────────────────────────┴─────────────────────┤
│ Transcript │ Resources │ Quiz │ Notes │ Progress     │
└─────────────────────────────────────────────────────┘
```

## 6. AI Chat UX

Message should show:
- answer
- confidence/evidence state where useful
- citations
- "Jump to timestamp"
- "Open page"
- "Open slide"

Quick actions:
- Explain simply
- Give example
- Summarize so far
- Compare concepts
- Generate quiz

## 7. Timestamp UI

Display current timestamp prominently.

Example:

```text
18:42 / 60:00
```

Add an indicator:

```text
Learning boundary: 18:42
```

This makes the timestamp-aware behavior visible to judges.

## 8. Citation UI

Use source chips:

```text
[▶ Video 14:21–16:08]
[📄 PDF p.7]
[▣ PPT slide 11]
```

Clicking:
- video → seek player
- PDF → open page
- PPT → open slide/source

## 9. Resource UI

Resource panel:

```text
Resources
├── Lecture 01 Transcript
├── Attention.pdf
├── Lecture01.pptx
└── Course Notes
```

Show source type icons.

## 10. Progress UI

Show:
- course completion
- current lecture
- watch percentage
- quiz performance
- weak topics
- recently asked concepts

## 11. Quiz UI

Use clean cards:
- question
- options
- submit
- explanation
- source citation

Avoid clutter.

## 12. Accessibility
- Keyboard navigation.
- Visible focus states.
- Adequate contrast.
- Accessible labels.
- Captions/transcript support.
- Responsive layout.

## 13. Responsive Design
Desktop:
- two-column learning layout.

Tablet:
- resizable video/assistant panels.

Mobile:
- stacked layout.
- video first.
- AI assistant below.
- bottom navigation for transcript/resources/quiz.

## 14. Icon System

Use **Lucide Icons** consistently.

### Navigation
- Home
- BookOpen
- Library
- BarChart3
- Settings
- User

### Video
- Play
- Pause
- SkipBack
- SkipForward
- Volume2
- Maximize
- Captions

### AI
- Sparkles
- Bot
- MessageCircle
- Send
- Brain

### Sources
- FileText — PDF
- Presentation — PPT
- Clock3 — timestamp
- Link — source
- ExternalLink — open source

### Learning
- Lightbulb
- BookOpen
- GraduationCap
- ClipboardCheck
- HelpCircle

### Interview
- Mic
- Video
- Briefcase
- UserRound
- MessageSquare

### Status
- CheckCircle2
- AlertTriangle
- XCircle
- Loader2

## 15. Logo/Icon Concept

Create a simple product mark combining:

**play button + speech bubble + book/evidence**

Concept:
```text
   ┌───────┐
   │  ▶    │
   │   💬  │
   └───────┘
```

Do not use overly complex illustrations.

## 16. Component Naming
Use consistent names:

- AppShell
- CourseSidebar
- VideoPlayer
- TimestampBadge
- AssistantPanel
- ChatMessage
- CitationChip
- SourceDrawer
- ResourceList
- TranscriptPanel
- QuizCard
- ProgressCard
- InterviewPanel

## 17. UI Principle
The UI should make the product's differentiator visible:

**"Ask about what you are learning right now, and see exactly where the answer came from."**
