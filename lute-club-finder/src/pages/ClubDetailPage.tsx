import { useParams } from 'react-router-dom';

export default function ClubDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Club Detail</h1>
      <p className="text-gray-600">
        Club detail page for <strong>{id}</strong> will be implemented in Phase 2.
      </p>
    </div>
  );
}
