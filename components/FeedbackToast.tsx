'use client';

interface FeedbackToastProps {
  message: string | null;
}

export default function FeedbackToast({ message }: FeedbackToastProps) {
  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-toast-in">
      <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-sm">
        {message}
      </div>
    </div>
  );
}
