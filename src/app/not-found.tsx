import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-400">404</span>
          </div>
        </div>
        
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Página não encontrada
        </h2>
        
        <p className="text-gray-600 mb-4">
          A página que você está procurando não existe ou foi movida.
        </p>
        
        <Link href="/dashboard" className="btn-primary w-full">
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}
