import Link from 'next/link';

export default function Home() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Nova Poshta</h1>
        <p className='text-gray-600 mb-8'>Створення декларації відправлення</p>

        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Прогрес розробки</h2>
          <div className='space-y-3'>
            <div className='flex items-center gap-3'>
              <span className='shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm'>
                ✓
              </span>
              <span className='text-gray-700'>Ініціалізація проєкту</span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm'>
                ✓
              </span>
              <span className='text-gray-700'>API сервісний шар</span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm'>
                ✓
              </span>
              <span className='text-gray-700'>Автозаповнення міст</span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='shrink-0 w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm'>
                4
              </span>
              <span className='text-gray-500'>Вибір відділення</span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='shrink-0 w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm'>
                5
              </span>
              <span className='text-gray-500'>Форма декларації</span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='shrink-0 w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm'>
                6
              </span>
              <span className='text-gray-500'>
                Підтвердження та обробка помилок
              </span>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Демонстрації</h2>
          <Link
            href='/city-demo'
            className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium'
          >
            <span>Тест пошуку міст</span>
            <span>→</span>
          </Link>
        </div>

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h3 className='font-semibold text-blue-900 mb-2'>Наступні кроки</h3>
          <p className='text-blue-800 text-sm'>
            Фаза 4 додасть компонент вибору відділення з фільтрацією по обраному
            місту та можливостями пошуку.
          </p>
        </div>
      </div>
    </div>
  );
}
