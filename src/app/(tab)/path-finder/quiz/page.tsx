// src/app/(tab)/path-finder/quiz/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Button, Progress, Spinner } from '@heroui/react';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { Question } from '@/data/path-finder';
import { PathFinderAnswer } from '@/types';

export default function PathFinderQuizPage() {
  const { status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchQuestions();
    }
  }, [status, router]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/path-finder/questions');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: number, rating: number) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, rating);
    setAnswers(newAnswers);
  };

  const isAllComplete = () => {
    return answers.size === questions.length && questions.length > 0;
  };

  const handleSubmit = async () => {
    if (!isAllComplete()) return;

    setSubmitting(true);
    try {
      const answersArray: PathFinderAnswer[] = Array.from(answers.entries()).map(
        ([questionId, rating]) => ({
          questionId,
          rating,
        })
      );

      const res = await fetch('/api/path-finder/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersArray }),
      });

      if (res.ok) {
        router.push('/path-finder/results');
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = questions.length > 0 ? (answers.size / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" color="warning" />
        <p className="text-gray-500 font-medium animate-pulse">กำลังโหลดแบบทดสอบ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-32">
      {/* Header Section */}
      <div className="bg-[#2C2C2C] text-white pt-10 pb-16 px-4 md:px-8 rounded-b-[40px] shadow-lg sticky top-0 z-20">
        <div className="container mx-auto max-w-5xl">
          <Button
            variant="light"
            startContent={<FiArrowLeft className="w-5 h-5" />}
            onClick={() => router.push('/path-finder')}
            className="mb-6 text-white/80 hover:text-white hover:bg-white/10"
          >
            ย้อนกลับ
          </Button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-black mb-3 text-[#F2B33D] tracking-tight">
                แบบทดสอบความถนัด
              </h1>
              <p className="text-white/70 text-base md:text-lg max-w-2xl">
                ค้นหาอาชีพที่ใช่ด้วยแบบทดสอบบุคลิกภาพ 18 ข้อ โปรดเลือกคำตอบที่ตรงกับความรู้สึกของคุณมากที่สุด
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar (Sticky just below header) */}
      <div className="sticky top-[200px] z-20 w-full px-4 md:px-8 -mt-6">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-xl border border-gray-100 flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="flex-1 w-full">
              <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                <span>ความคืบหน้าการทำแบบทดสอบ</span>
                <span className="text-[#F2B33D]">{answers.size} / {questions.length} ข้อ</span>
              </div>
              <Progress
                value={progress}
                classNames={{
                  indicator: "bg-[#F2B33D]",
                  track: "bg-gray-100"
                }}
                className="h-3 md:h-4"
                radius="full"
              />
            </div>
            <div className="shrink-0 font-black text-2xl text-[#2C2C2C] bg-[#F2B33D]/20 px-4 py-2 rounded-xl">
              {Math.round(progress)}%
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl mt-12">
        {/* Questions List */}
        <div className="space-y-6 md:space-y-8">
          {questions.map((question, index) => {
            const currentAnswer = answers.get(question.id);
            const isAnswered = currentAnswer !== undefined;

            return (
              <Card
                key={question.id}
                className={`shadow-sm border-2 transition-all duration-300 rounded-[24px] overflow-hidden ${isAnswered ? 'border-transparent bg-white/60' : 'border-gray-200 bg-white hover:border-[#F2B33D]/50 hover:shadow-md'
                  }`}
              >
                <CardBody className="p-0">
                  <div className="flex flex-col lg:flex-row items-stretch min-h-[140px]">

                    {/* Question Text */}
                    <div className="flex-1 p-6 md:p-8 flex items-center gap-6">
                      <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-xl font-black transition-colors ${isAnswered ? 'bg-[#2C2C2C] text-[#F2B33D]' : 'bg-gray-100 text-gray-400'
                        }`}>
                        {index + 1}
                      </div>
                      <p className={`text-xl md:text-2xl font-bold transition-colors ${isAnswered ? 'text-gray-500' : 'text-[#2C2C2C]'
                        }`}>
                        {question.text}
                      </p>
                    </div>

                    {/* Rating Options */}
                    <div className={`flex items-center justify-center p-6 lg:p-8 lg:min-w-[480px] border-t lg:border-t-0 lg:border-l transition-colors ${isAnswered ? 'bg-gray-50/50 border-gray-100' : 'bg-gray-50 border-gray-100'
                      }`}>
                      <div className="flex justify-between items-center w-full gap-2 sm:gap-4">
                        {[
                          { value: 1, label: 'ไม่ชอบ', color: 'border-red-400 bg-red-50', selectedStyle: 'bg-red-500 border-red-500 scale-110 shadow-lg text-white' },
                          { value: 2, label: 'ไม่ค่อยชอบ', color: 'border-orange-300 bg-orange-50', selectedStyle: 'bg-orange-400 border-orange-400 scale-110 shadow-lg text-white' },
                          { value: 3, label: 'เฉยๆ', color: 'border-gray-300 bg-gray-50', selectedStyle: 'bg-gray-400 border-gray-400 scale-110 shadow-lg text-white' },
                          { value: 4, label: 'ชอบ', color: 'border-green-300 bg-green-50', selectedStyle: 'bg-green-400 border-green-400 scale-110 shadow-lg text-white' },
                          { value: 5, label: 'ชอบมาก', color: 'border-emerald-400 bg-emerald-50', selectedStyle: 'bg-emerald-500 border-emerald-500 scale-110 shadow-lg text-white' }
                        ].map((option) => {
                          const isSelected = currentAnswer === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleAnswer(question.id, option.value)}
                              className="group relative flex flex-col items-center flex-1"
                            >
                              <div
                                className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${isSelected
                                    ? option.selectedStyle
                                    : `${option.color} text-gray-400 hover:scale-105 hover:shadow-md`
                                  } ${isAnswered && !isSelected ? 'opacity-40 grayscale' : ''}`}
                              >
                                {option.value}
                              </div>
                              <span className={`absolute -bottom-7 w-max text-xs font-bold transition-all duration-300 ${isSelected ? 'text-[#2C2C2C] opacity-100 translate-y-0' : 'text-gray-400 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                                }`}>
                                {option.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Bottom submit bar (Sticky) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 p-4 md:p-6 z-30 transform transition-transform duration-500 ease-out shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">สถานะ</span>
              <span className={`text-lg font-black ${isAllComplete() ? 'text-green-500' : 'text-[#F2B33D]'}`}>
                {isAllComplete() ? 'ทำครบทุกข้อแล้ว พร้อมส่งคำตอบ!' : `เหลืออีก ${questions.length - answers.size} ข้อ`}
              </span>
            </div>
            <Button
              size="lg"
              className={`w-full sm:w-auto px-10 h-14 font-black shadow-lg transition-transform ${isAllComplete()
                  ? 'bg-[#F2B33D] text-[#2C2C2C] hover:scale-105 hover:bg-[#e0a331]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              endContent={isAllComplete() && <FiCheck className="w-5 h-5" />}
              onClick={handleSubmit}
              isDisabled={!isAllComplete()}
              isLoading={submitting}
              radius="full"
            >
              ส่งคำตอบดูผลลัพธ์
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
