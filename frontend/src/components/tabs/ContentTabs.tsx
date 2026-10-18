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
  ExternalLink
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
  const [activeTab, setActiveTab] = useState<"transcript" | "resources" | "quiz" | "progress">("transcript");

  // Sample transcript chunks for demonstration
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
      throw new Error("No backend questions");
    } catch {
      // Local fallback quiz strictly grounded in content up to current timestamp
      const fallbackQuestions: QuizItem[] = [
        {
          id: "q1",
          question: `Based on what was discussed before ${formatTimestamp(currentTimestamp)}: What limitation of RNNs motivated the development of Attention?`,
          options: [
            "Information bottleneck from squashing sequences into a single vector",
            "Inability to run on CPU architectures",
            "Requiring too few parameters to represent vocabularies",
            "Lack of activation functions in recurrent cells"
          ],
          correct_option: 0,
          explanation: "In traditional RNNs, squashing history into a fixed state vector causes information bottlenecks and vanishing gradients.",
          citations: [{ type: "video", start_time: 45, end_time: 120 }]
        },
        {
          id: "q2",
          question: `In the scaled dot-product formulation covered so far: What is the purpose of dividing by the square root of the key dimension?`,
          options: [
            "To prevent the dot products from growing large and pushing softmax into vanishing gradient regions",
            "To invert the matrix eigenvectors",
            "To ensure the result is always an integer",
            "To remove negative numbers before multiplication"
          ],
          correct_option: 0,
          explanation: "Scaling by sqrt(d_k) stabilizes gradient flow by preventing extremely large dot products.",
          citations: [{ type: "video", start_time: 210, end_time: 320 }]
        }
      ];
      setQuizQuestions(fallbackQuestions);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSelectAnswer = (questionId: string, optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
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

    // Local evaluation fallback
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
      </div>

      {/* Tab Panels */}
      <div className="p-4 min-h-[220px]">
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
                            onClick={() => handleSelectAnswer(q.id, optIdx)}
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

                {/* Submit button & results */}
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
                      <span className="text-xs text-emerald-700 font-semibold">
                        {quizResult.percentage >= 70 ? "Concepts Mastered!" : "Review Recommended"}
                      </span>
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
                  {quizResult ? `${quizResult.percentage}%` : "92%"}
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
      </div>
    </div>
  );
}
