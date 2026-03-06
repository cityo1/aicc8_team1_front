import { useNotification } from '../../contexts/NotificationContext';
import { Bell, BellOff, Info } from 'lucide-react';

export default function Alert() {
  const { notificationEnabled } = useNotification();

  // 샘플 알림 데이터 (추후 API 연동 시 교체)
  const sampleNotifications = [
    {
      id: 1,
      type: 'meal',
      title: '식사 기록 알림',
      message: '오늘 아침 식사를 기록해보세요.',
      time: '오전 8:00',
      read: false,
    },
    {
      id: 2,
      type: 'report',
      title: '주간 리포트',
      message: '이번 주 영양 점수가 업데이트되었어요.',
      time: '어제',
      read: true,
    },
    {
      id: 3,
      type: 'tip',
      title: '영양 팁',
      message: '단백질 섭취를 늘리면 포만감이 오래 유지돼요.',
      time: '2일 전',
      read: true,
    },
  ];

  return (
    <div className="p-2 min-h-screen">
      <div className="bg-[#F2F9F5] text-[#1E2923] w-full max-w-2xl mx-auto rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b-0 pb-0">
            알림
          </h2>
          {!notificationEnabled && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
              <BellOff size={18} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                알림이 꺼져 있습니다
              </span>
            </div>
          )}
        </div>

        {notificationEnabled ? (
          <div className="space-y-3">
            {sampleNotifications.length > 0 ? (
              sampleNotifications.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${
                    !item.read ? 'border-l-4 border-l-[#FF8243]' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        item.type === 'meal'
                          ? 'bg-orange-100'
                          : item.type === 'report'
                          ? 'bg-emerald-100'
                          : 'bg-sky-100'
                      }`}
                    >
                      <Info size={20} className="text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-0.5">{item.message}</p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {item.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">알림이 없습니다</p>
                <p className="text-gray-400 text-sm mt-1">
                  새로운 알림이 오면 여기에 표시됩니다.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <BellOff size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">알림이 꺼져 있습니다</p>
            <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
              환경설정에서 알림을 켜면 식사 기록, 주간 리포트 등 유용한 알림을
              받을 수 있어요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
