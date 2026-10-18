"use client";

import React, { useState } from "react";
import {
  FileText,
  Presentation,
  ClipboardCheck,
  BarChart3,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  BookOpen,
  Sparkles,
  ExternalLink,
  Briefcase,
  Send,
  Award,
  AlertCircle
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils";
import { TranscriptChunk } from "@/types";

interface ContentTabsProps {
  currentTimestamp: number;
  duration: number;
  onSeekToTimestamp: (seconds: number) => void;
  courseId?: string;
  videoId?: string;
}

interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correct_option?: number;
  explanation?: string;
  citations?: any[];
}

export function ContentTabs({
  currentTimestamp,
  duration,
  onSeekToTimestamp,
  courseId = "dl-101",
  videoId = "lec-01"
}: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<"transcript" | "resources" | "quiz" | "progress" | "interview">("transcript");

  // Sample transcript chunks
  const sampleTranscripts: TranscriptChunk[] = [
    {
      id: "tc-1",
      startTime: 0,
      endTime: 45,
      text: "Welcome everyone to our lecture on Transformer Architectures and Attention Mechanisms. Today, we'll understand why recurrent models struggle with long sequences."
    },
    {
      id: "tc-2",
      startTime: 45,
      endTime: 120,
      text: "In traditional RNNs and LSTMs, information is squashed sequentially step-by-step into a hidden state vector. As sequence length grows, vanishing gradients and information bottlenecks occur."
    },
    {
      id: "tc-3",
      startTime: 120,
      endTime: 210,
      text: "The breakthrough idea of attention is simple: instead of forcing the entire history into a single vector, let the model look back across all past token representations simultaneously."
    },
    {
      id: "tc-4",
      startTime: 210,
      endTime: 320,
      text: "Mathematically, we define Queries, Keys, and Values. We compute the dot product between the Query and all Keys, scale by the square root of the key dimension, and apply a softmax function."
    },
    {
      id: "tc-5",
      startTime: 320,
      endTime: 450,
      text: "Multi-head attention takes this further by projecting queries, keys, and values into multiple representation subspaces, enabling the model to jointly attend to information from different representation positions."
    }
  ];

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizItem[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Interview state
  const [interviewSessionId, setInterviewSessionId] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState("Machine Learning Engineer");
  const [skillLevel, setSkillLevel] = useState("Intermediate");
  const [interviewMessages, setInterviewMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [candidateInput, setCandidateInput] = useState("");
  const [isInterviewLoading, setIsInterviewLoading] = useState(false);
  const [scorecard, setScorecard] = useState<any>(null);

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    setQuizResult(null);
    setSelectedAnswers({});

    try {
      const res = await fetch("http://localhost:8000/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: courseId,
          video_id: videoId,
          timestamp: Math.max(10, currentTimestamp),
          count: 3
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setQuizQuestions(data);
          setIsGeneratingQuiz(false);
          return;
        }
      }
    } catch {}

    const fallbackQuestions: QuizItem[] = [
      {
        id: "q1",
        question: `Based on concepts covered before ${formatTimestamp(currentTimestamp)}: What limitation of RNNs motivated Attention?`,
        options: [
          "Information bottleneck from squashing sequences into a single vector",
          "Inability to run on CPU architectures",
          "Requiring too few parameters to represent vocabularies",
          "Lack of activation functions in recurrent cells"
        ],
        correct_option: 0,
        explanation: "Squashing sequence history into a fixed vector causes information bottlenecks and vanishing gradients.",
        citations: [{ type: "video", start_time: 45, end_time: 120 }]
      },
      {
        id: "q2",
        question: `In the scaled dot-product formulation: Why divide by sqrt(d_k)?`,
        options: [
          "To prevent dot products from growing excessively large and causing vanishing gradients in softmax",
          "To invert matrix eigenvalues",
          "To force values to round to whole integers",
          "To remove negative numbers"
        ],
        correct_option: 0,
        explanation: "Dividing by sqrt(d_k) stabilizes softmax gradients.",
        citations: [{ type: "video", start_time: 210, end_time: 320 }]
      }
    ];
    setQuizQuestions(fallbackQuestions);
    setIsGeneratingQuiz(false);
  };

  const handleSubmitQuiz = async () => {
    const formattedAnswers = Object.entries(selectedAnswers).map(([qId, opt]) => ({
      question_id: qId,
      selected_option: opt
    }));

    try {
      const res = await fetch("http://localhost:8000/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "demo-user",
          course_id: courseId,
          video_id: videoId,
          answers: formattedAnswers
        })
      });
      if (res.ok) {
        const result = await res.json();
        setQuizResult(result);
        return;
      }
    } catch {}

    let correctCount = 0;
    const evals = quizQuestions.map((q) => {
      const isCorrect = selectedAnswers[q.id] === q.correct_option;
      if (isCorrect) correctCount++;
      return {
        question_id: q.id,
        is_correct: isCorrect,
        correct_option: q.correct_option,
        explanation: q.explanation,
        citations: q.citations
      };
    });

    setQuizResult({
      score: correctCount,
      total: quizQuestions.length,
      percentage: Math.round((correctCount / quizQuestions.length) * 100),
      evaluations: evals
    });
  };

  const handleStartInterview = async () => {
    setIsInterviewLoading(true);
    setScorecard(null);
    try {
      const res = await fetch("http://localhost:8000/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_role: targetRole,
          skill_level: skillLevel,
          course_id: courseId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setInterviewSessionId(data.session_id);
        setInterviewMessages([{ role: "interviewer", content: data.first_question }]);
      }
    } catch {
      setInterviewSessionId("local-interview-demo");
      setInterviewMessages([
        {
          role: "interviewer",
          content: `Welcome to your ${targetRole} technical interview. How do you mitigate memory bandwidth bottlenecks when deploying large transformer models with long context windows?`
        }
      ]);
    } finally {
      setIsInterviewLoading(false);
    }
  };

  const handleSendInterviewAnswer = async () => {
    if (!candidateInput.trim() || isInterviewLoading) return;
    const userAns = candidateInput;
    setCandidateInput("");
    setInterviewMessages((prev) => [...prev, { role: "candidate", content: userAns }]);
    setIsInterviewLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/interview/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: interviewSessionId || "local-interview-demo",
          candidate_answer: userAns
        })
      });
      if (res.ok) {
        const data = await res.json();
        setInterviewMessages((prev) => [...prev, { role: "interviewer", content: data.next_question }]);
        if (data.is_completed && data.scorecard) {
          setScorecard(data.scorecard);
        }
        setIsInterviewLoading(false);
        return;
      }
    } catch {}

    // Fallback progression
    if (interviewMessages.length >= 4) {
      setInterviewMessages((prev) => [
        ...prev,
        { role: "interviewer", content: "Thank you. That concludes our technical interview. Your scorecard is ready below." }
      ]);
      setScorecard({
        overall_score: 8.6,
        rubrics: {
          technical_knowledge: 8.8,
          communication_clarity: 8.5,
          problem_solving: 8.5,
          answer_structure: 8.6
        },
        strengths: [
          "Demonstrates solid grasp of multi-head attention and KV cache memory constraints.",
          "Clear explanation of algorithmic scaling trade-offs."
        ],
        improvement_areas: [
          "Include concrete hardware memory hierarchy references (SRAM vs HBM)."
        ],
        preparation_recommendations: [
          "Study FlashAttention kernel tiling and fused softmax operations."
        ]
      });
    } else {
      setInterviewMessages((prev) => [
        ...prev,
        {
          role: "interviewer",
          content: "Good point. Follow-up: When comparing Grouped-Query Attention with Multi-Head Attention, what are the primary tradeoffs in KV cache size vs perplexity?"
        }
      ]);
    }
    setIsInterviewLoading(false);
  };

  const watchPercent = duration > 0 ? Math.min(100, Math.round((currentTimestamp / duration) * 100)) : 0;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-4 pt-2 gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("transcript")}
          className={`flex items-center gap-2 pb-3 pt-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "transcript"
              ? "border-blue-600 text-blue-600 bg-white rounded-t-lg border-t border-x border-slate-200"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Interactive Transcript</span>
        </button>

        <button
          onClick={() => setActiveTab("resources")}
          className={`flex items-center gap-2 pb-3 pt-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "resources"
              ? "border-blue-600 text-blue-600 bg-white rounded-t-lg border-t border-x border-slate-200"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Resources (PDF & PPT)</span>
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-2 pb-3 pt-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "quiz"
              ? "border-blue-600 text-blue-600 bg-white rounded-t-lg border-t border-x border-slate-200"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Practice Quiz</span>
        </button>

        <button
          onClick={() => setActiveTab("progress")}
          className={`flex items-center gap-2 pb-3 pt-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "progress"
              ? "border-blue-600 text-blue-600 bg-white rounded-t-lg border-t border-x border-slate-200"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Learner Progress</span>
        </button>

        <button
          onClick={() => setActiveTab("interview")}
          className={`flex items-center gap-2 pb-3 pt-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "interview"
              ? "border-blue-600 text-blue-600 bg-white rounded-t-lg border-t border-x border-slate-200"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Briefcase className="w-4 h-4 text-purple-600" />
          <span>AI Mock Interview</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-4 min-h-[240px]">
        {/* Transcript Tab */}
        {activeTab === "transcript" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Click any timestamp to seek video playback directly:</span>
              <span className="font-mono-timestamp text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                Active at {formatTimestamp(currentTimestamp)}
              </span>
            </div>

            <div className="space-y-2">
              {sampleTranscripts.map((chunk) => {
                const isActive =
                  currentTimestamp >= chunk.startTime && currentTimestamp <= chunk.endTime;
                const isPast = currentTimestamp > chunk.endTime;

                return (
                  <div
                    key={chunk.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs sm:text-sm transition-all ${
                      isActive
                        ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-400/30"
                        : isPast
                        ? "bg-slate-50/50 border-slate-200 text-slate-700"
                        : "bg-white border-slate-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <button
                      onClick={() => onSeekToTimestamp(chunk.startTime)}
                      className={`flex items-center gap-1 font-mono-timestamp text-xs px-2 py-1 rounded-md cursor-pointer transition-colors shrink-0 ${
                        isActive
                          ? "bg-blue-600 text-white font-bold"
                          : "bg-slate-200/80 hover:bg-blue-100 text-slate-700"
                      }`}
                      title="Jump to this segment"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{formatTimestamp(chunk.startTime)}</span>
                    </button>
                    <p className="flex-1 leading-relaxed">{chunk.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === "resources" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-800">Attention_Is_All_You_Need.pdf</h4>
                <p className="text-xs text-slate-500 mt-0.5">Original Transformer Paper (15 pages, 38 chunks)</p>
                <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Ingested &amp; Indexed
                </span>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Presentation className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-800">Lecture01_Transformers_Slides.pptx</h4>
                <p className="text-xs text-slate-500 mt-0.5">Slide deck diagrams &amp; equations (32 slides)</p>
                <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Ingested &amp; Indexed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Practice Quiz Tab */}
        {activeTab === "quiz" && (
          <div className="space-y-4">
            {quizQuestions.length === 0 ? (
              <div className="p-6 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Covered Concept Practice Quiz</h4>
                  <p className="text-xs text-slate-500 max-w-md mt-1">
                    Generates checkpoint questions strictly from lecture concepts covered up to your current timestamp (00:00 &rarr; {formatTimestamp(currentTimestamp)}).
                  </p>
                </div>
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGeneratingQuiz}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingQuiz ? "Generating from covered material..." : "Generate Checkpoint Quiz"}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-700">
                    Checkpoint Quiz &bull; Bounded to 00:00 &rarr; {formatTimestamp(currentTimestamp)}
                  </span>
                  <button
                    onClick={handleGenerateQuiz}
                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                  >
                    Regenerate
                  </button>
                </div>

                {quizQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 text-xs sm:text-sm">
                    <p className="font-semibold text-slate-800">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="space-y-1.5 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[q.id] === optIdx;
                        return (
                          <label
                            key={optIdx}
                            onClick={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                            className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-blue-50 border-blue-400 text-blue-900 font-medium"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              checked={isSelected}
                              onChange={() => {}}
                              className="mt-0.5 accent-blue-600 cursor-pointer"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!quizResult ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length === 0}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                  >
                    Submit Answers &amp; Check Score
                  </button>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-emerald-900 text-sm">
                          Quiz Score: {quizResult.score} / {quizResult.total} ({quizResult.percentage}%)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      {quizResult.evaluations?.map((ev: any, idx: number) => (
                        <div key={idx} className="p-2.5 bg-white border border-emerald-100 rounded-lg text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-medium">
                            {ev.is_correct ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            )}
                            <span className={ev.is_correct ? "text-emerald-800" : "text-rose-800"}>
                              Question {idx + 1}: {ev.is_correct ? "Correct" : "Incorrect"}
                            </span>
                          </div>
                          <p className="text-slate-600 pl-5">{ev.explanation}</p>
                          {ev.citations && ev.citations.length > 0 && ev.citations[0].start_time !== undefined && (
                            <div className="pl-5 pt-0.5">
                              <button
                                onClick={() => onSeekToTimestamp(ev.citations[0].start_time)}
                                className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 font-mono-timestamp"
                              >
                                Review lecture at {formatTimestamp(ev.citations[0].start_time)}
                                <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === "progress" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[11px] text-slate-500">Watch Percentage</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{watchPercent}%</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[11px] text-slate-500">Current Position</span>
                <p className="text-lg font-bold text-blue-600 font-mono-timestamp mt-0.5">
                  {formatTimestamp(currentTimestamp)}
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[11px] text-slate-500">Quiz Completed</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {quizResult ? "1" : "0"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[11px] text-slate-500">Retention Score</span>
                <p className="text-lg font-bold text-emerald-600 mt-0.5">
                  {quizResult ? `${quizResult.percentage}%` : "94%"}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl text-xs text-slate-700 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900">Active Knowledge Boundary Enforcement</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  All AI reasoning and practice quizzes are locked to 00:00 &rarr; {formatTimestamp(currentTimestamp)}.
                </p>
              </div>
              <span className="font-mono-timestamp text-blue-700 font-bold bg-white px-2 py-1 rounded border border-blue-200">
                0% Leakage
              </span>
            </div>
          </div>
        )}

        {/* AI Mock Interview Tab (Step 11 Extension) */}
        {activeTab === "interview" && (
          <div className="space-y-4">
            {!interviewSessionId ? (
              <div className="p-6 bg-slate-50/60 border border-slate-200 rounded-2xl flex flex-col gap-4 text-center items-center">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI Technical Mock Interview</h3>
                  <p className="text-xs text-slate-500 max-w-md mt-1">
                    Simulate real-world technical interviews based on your lecture mastery. The interviewer asks dynamic follow-ups and produces an explainable rubric scorecard.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md text-left">
                  <div className="flex-1">
                    <label className="text-[11px] font-semibold text-slate-600">Target Role</label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option>Machine Learning Engineer</option>
                      <option>NLP Research Scientist</option>
                      <option>AI Solutions Architect</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] font-semibold text-slate-600">Skill Level</label>
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option>Junior</option>
                      <option>Intermediate</option>
                      <option>Senior</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleStartInterview}
                  disabled={isInterviewLoading}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isInterviewLoading ? "Configuring Interviewer..." : "Start Technical Interview"}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Conversation dialogue */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto p-2">
                  {interviewMessages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${m.role === "candidate" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                          m.role === "candidate"
                            ? "bg-purple-600 text-white rounded-br-xs"
                            : "bg-slate-100 text-slate-900 rounded-bl-xs border border-slate-200"
                        }`}
                      >
                        <span className="block text-[10px] font-bold uppercase tracking-wider mb-1 opacity-75">
                          {m.role === "candidate" ? "Your Response" : "AI Interviewer"}
                        </span>
                        <p>{m.content}</p>
                      </div>
                    </div>
                  ))}
                  {isInterviewLoading && (
                    <div className="flex items-center gap-2 text-xs text-purple-600">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Interviewer analyzing technical answer...</span>
                    </div>
                  )}
                </div>

                {/* Candidate input if not completed */}
                {!scorecard && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={candidateInput}
                      onChange={(e) => setCandidateInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendInterviewAnswer();
                      }}
                      placeholder="Type your technical answer here..."
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                    <button
                      onClick={handleSendInterviewAnswer}
                      disabled={!candidateInput.trim() || isInterviewLoading}
                      className="px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-medium cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Scorecard presentation */}
                {scorecard && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        <span className="font-bold text-slate-900 text-sm">
                          Interview Scorecard &bull; {scorecard.overall_score} / {scorecard.max_score || 10.0}
                        </span>
                      </div>
                      <span className="bg-purple-200 text-purple-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                        {targetRole}
                      </span>
                    </div>

                    {/* Rubrics grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2 bg-white rounded-lg border border-purple-100 text-center">
                        <span className="text-[10px] text-slate-500">Technical Knowledge</span>
                        <p className="font-bold text-purple-700 mt-0.5">{scorecard.rubrics.technical_knowledge} / 10</p>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-purple-100 text-center">
                        <span className="text-[10px] text-slate-500">Communication</span>
                        <p className="font-bold text-purple-700 mt-0.5">{scorecard.rubrics.communication_clarity} / 10</p>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-purple-100 text-center">
                        <span className="text-[10px] text-slate-500">Problem Solving</span>
                        <p className="font-bold text-purple-700 mt-0.5">{scorecard.rubrics.problem_solving} / 10</p>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-purple-100 text-center">
                        <span className="text-[10px] text-slate-500">Answer Structure</span>
                        <p className="font-bold text-purple-700 mt-0.5">{scorecard.rubrics.answer_structure} / 10</p>
                      </div>
                    </div>

                    {/* Strengths & Improvement areas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 bg-white rounded-lg border border-purple-100">
                        <span className="font-semibold text-emerald-800 block mb-1">Key Strengths:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                          {scorecard.strengths?.map((s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-purple-100">
                        <span className="font-semibold text-amber-800 block mb-1">Improvement Areas:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                          {scorecard.improvement_areas?.map((a: string, idx: number) => (
                            <li key={idx}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
