import { useState } from 'react';
import ToeicWorkspaceLayout from '../components/ToeicWorkspaceLayout';

export default function ToeicSettingsPage() {
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [showHints, setShowHints] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <ToeicWorkspaceLayout
      title="Cài Đặt TOEIC"
      subtitle="Thiết lập trải nghiệm học phù hợp với bạn"
    >
      <section className="soft-card toeic-settings-board">
        <div className="toeic-setting-item">
          <div>
            <h4>Tự động phát audio</h4>
            <p>Áp dụng cho phần listening và mini practice.</p>
          </div>
          <button className="tag-btn" onClick={() => setAutoPlayAudio((prev) => !prev)}>
            {autoPlayAudio ? 'Bật' : 'Tắt'}
          </button>
        </div>

        <div className="toeic-setting-item">
          <div>
            <h4>Hiển thị gợi ý</h4>
            <p>Bật/tắt các gợi ý nhanh trong module học.</p>
          </div>
          <button className="tag-btn" onClick={() => setShowHints((prev) => !prev)}>
            {showHints ? 'Bật' : 'Tắt'}
          </button>
        </div>

        <div className="toeic-setting-item">
          <div>
            <h4>Chế độ cô đọng</h4>
            <p>Giảm bớt thành phần phụ trên màn hình học.</p>
          </div>
          <button className="tag-btn" onClick={() => setCompactMode((prev) => !prev)}>
            {compactMode ? 'Bật' : 'Tắt'}
          </button>
        </div>
      </section>
    </ToeicWorkspaceLayout>
  );
}
