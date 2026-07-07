import { useState } from 'react';
import './home.css';

export const ScheduleTabs = () => {
  const [activeTab, setActiveTab] = useState('Thứ Hai');

  const tabs = [
    { id: 'Mới Cập Nhật', label: 'Mới Cập Nhật', isHighlight: true },
    { id: 'Thứ Hai', label: 'Thứ Hai', badge: 'Hôm nay' },
    { id: 'Thứ Ba', label: 'Thứ Ba' },
    { id: 'Thứ Tư', label: 'Thứ Tư' },
    { id: 'Thứ Năm', label: 'Thứ Năm' },
    { id: 'Thứ Sáu', label: 'Thứ Sáu' },
    { id: 'Thứ Bảy', label: 'Thứ Bảy' },
    { id: 'Chủ Nhật', label: 'Chủ Nhật' },
  ];

  return (
    <section className="schedule-section">
      <div className="container">
        <div className="schedule-tabs-container">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`schedule-tab ${activeTab === tab.id ? 'active' : ''} ${tab.isHighlight ? 'highlight' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.badge && <span className="tab-badge">{tab.badge}</span>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
