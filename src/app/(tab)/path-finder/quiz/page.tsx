// src/app/(tab)/path-finder/quiz/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Button, Progress, Spinner, RadioGroup, Radio } from '@heroui/react';
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import { Question } from '@/data/path-finder';
import { PathFinderAnswer } from '@/types';

export default function PathFinderQuizPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const questionsPerPage = 3;
  const totalPages = Math.ceil(18 / questionsPerPage);

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
    setAnswers(new Map(answers.set(questionId, rating)));
  };

  const getCurrentQuestions = () => {
    const start = currentPage * questionsPerPage;
    const end = start + questionsPerPage;
    return questions.slice(start, end);
  };

  const isCurrentPageComplete = () => {
    const currentQuestions = getCurrentQuestions();
    return currentQuestions.every(q => answers.has(q.id));
  };

  const isAllComplete = () => {
    return answers.size === questions.length;
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
        const data = await res.json();
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

  const progress = (answers.size / questions.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="warning" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="light"
            startContent={<FiArrowLeft className="w-5 h-5" />}
            onClick={() => router.push('/path-finder')}
            className="mb-4"
          >
            กลับ
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            แบบทดสอบความถนัด Path Finder
          </h1>
          
          <p className="text-gray-600 mb-6">
            ให้คะแนนความเห็นด้วยกับข้อความต่อไปนี้ จาก 1 (ไม่เห็นด้วยอย่างยิ่ง) ถึง 5 (เห็นด้วยอย่างยิ่ง)
          </p>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>ความคืบหน้า</span>
              <span>{answers.size} / {questions.length} ข้อ</span>
            </div>
            <Progress
              value={progress}
              color="warning"
              className="h-3"
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {getCurrentQuestions().map((question, index) => {
            const globalIndex = currentPage * questionsPerPage + index;
            const currentAnswer = answers.get(question.id);

            return (
              <Card
                key={question.id}
                className="shadow-md hover:shadow-lg transition-shadow"
              >
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#F2B33D] rounded-full flex items-center justify-center font-bold text-white">
                      {globalIndex + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg mb-4">{question.text}</p>
                      
                      <RadioGroup
                        value={currentAnswer?.toString()}
                        onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
                        orientation="horizontal"
                        className="gap-3"
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Radio
                            key={rating}
                            value={rating.toString()}
                          >
                            <span className="font-semibold">{rating}</span>
                          </Radio>
                        ))}
                      </RadioGroup>
                      
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>ไม่เห็นด้วยอย่างยิ่ง</span>
                        <span>เห็นด้วยอย่างยิ่ง</span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="bordered"
            startContent={<FiArrowLeft className="w-5 h-5" />}
            onClick={handlePrevious}
            isDisabled={currentPage === 0}
          >
            ย้อนกลับ
          </Button>

          <div className="text-sm text-gray-600">
            หน้า {currentPage + 1} / {totalPages}
          </div>

          {currentPage < totalPages - 1 ? (
            <Button
              color="warning"
              endContent={<FiArrowRight className="w-5 h-5" />}
              onClick={handleNext}
              isDisabled={!isCurrentPageComplete()}
            >
              ถัดไป
            </Button>
          ) : (
            <Button
              color="success"
              endContent={<FiCheck className="w-5 h-5" />}
              onClick={handleSubmit}
              isDisabled={!isAllComplete()}
              isLoading={submitting}
            >
              ส่งคำตอบ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
