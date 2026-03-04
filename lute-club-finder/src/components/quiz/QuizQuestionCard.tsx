import type { QuizQuestion } from '../../types';

interface QuizQuestionCardProps {
  question: QuizQuestion;
  /** Currently selected value(s) — string for single_choice, string[] for multiple_choice */
  value: string | string[];
  /** Called when the user selects / toggles an option */
  onChange: (value: string | string[]) => void;
}

export default function QuizQuestionCard({
  question,
  value,
  onChange,
}: QuizQuestionCardProps) {
  const isSingle = question.type === 'single_choice';
  const selectedSet = new Set(
    Array.isArray(value) ? value : value ? [value] : [],
  );

  function handleSelect(optionValue: string) {
    if (isSingle) {
      onChange(optionValue);
    } else {
      // Toggle
      const next = new Set(selectedSet);
      if (next.has(optionValue)) {
        next.delete(optionValue);
      } else {
        next.add(optionValue);
      }
      onChange(Array.from(next));
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Question text */}
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
        {question.question}
      </h2>

      {!isSingle && (
        <p className="text-sm text-gray-500 text-center mb-6">
          Select all that apply
        </p>
      )}
      {isSingle && (
        <p className="text-sm text-gray-500 text-center mb-6">
          Choose one
        </p>
      )}

      {/* Option cards */}
      <div className="grid gap-3">
        {question.options.map((opt) => {
          const isSelected = selectedSet.has(opt.value);

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`
                w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
                ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {/* Selection indicator */}
                <span
                  className={`
                    flex-shrink-0 flex items-center justify-center
                    ${isSingle ? 'h-5 w-5 rounded-full border-2' : 'h-5 w-5 rounded-md border-2'}
                    transition-colors duration-200
                    ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-gray-300 bg-white'
                    }
                  `}
                >
                  {isSelected && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>

                {/* Label */}
                <span
                  className={`text-base font-medium ${
                    isSelected ? 'text-amber-900' : 'text-gray-700'
                  }`}
                >
                  {opt.text}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
