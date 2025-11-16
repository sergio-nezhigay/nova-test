export default function Home() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Nova Poshta</h1>
        <p className='text-gray-600 mb-8'>Створення декларації відправлення</p>

        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Статус API</h2>
          <p className='text-gray-700 mb-4'>
            API-сервіси Nova Poshta готові до використання.
          </p>
          <div className='space-y-2 text-sm'>
            <div className='flex items-center gap-2'>
              <span className='w-2 h-2 bg-green-500 rounded-full'></span>
              <code className='text-gray-600'>/api/nova-poshta/cities</code>
              <span className='text-gray-500'>- Пошук міст</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-2 h-2 bg-green-500 rounded-full'></span>
              <code className='text-gray-600'>/api/nova-poshta/warehouses</code>
              <span className='text-gray-500'>- Відділення міста</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-2 h-2 bg-green-500 rounded-full'></span>
              <code className='text-gray-600'>/api/nova-poshta/health</code>
              <span className='text-gray-500'>- Перевірка налаштувань</span>
            </div>
          </div>
        </div>

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h3 className='font-semibold text-blue-900 mb-2'>Наступні кроки</h3>
          <p className='text-blue-800 text-sm'>
            Фаза 3 додасть компонент автозаповнення для пошуку міст з підтримкою
            клавіатури та української мови.
          </p>
        </div>
      </div>
    </div>
  );
}
