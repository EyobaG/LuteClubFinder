interface QuizProgressProps {
  current: number;   // 0-based index
  total: number;
}

export default function QuizProgress({ current, total }: QuizProgressProps) {
  const pct = ((current + 1) / total) * 100;

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      {/* Label */}
      <p className="text-sm font-medium text-gray-500 mb-2 text-center">
        Question {current + 1} of {total}
      </p>

      {/* Bar */}
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
              i <= current ? 'bg-amber-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
