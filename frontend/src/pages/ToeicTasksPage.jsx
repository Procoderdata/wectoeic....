import { useMemo } from 'react';
import ToeicWorkspaceLayout from '../components/ToeicWorkspaceLayout';
import { useProgress } from '../hooks/useProgress';

export default function ToeicTasksPage() {
  const { progress, streak } = useProgress();

  const tasks = useMemo(
    () => [
      {
        id: 'task-search',
        title: 'Tra một từ mới',
        done: (progress.moduleCounts.search || 0) > 0,
        note: 'Mở từ điển và ghi chú 1 từ xuất hiện trong đề.',
      },
      {
        id: 'task-flashcard',
        title: 'Lật flashcard',
        done: (progress.moduleCounts.flashcard || 0) > 0,
        note: 'Ôn tối thiểu 10 thẻ để giữ nhịp ghi nhớ.',
      },
      {
        id: 'task-quiz',
        title: 'Làm quiz',
        done: (progress.moduleCounts.quiz || 0) > 0,
        note: 'Hoàn thành ít nhất 1 lượt quiz từ vựng.',
      },
      {
        id: 'task-grammar',
        title: 'Ôn ngữ pháp',
        done: (progress.moduleCounts.grammar || 0) > 0,
        note: 'Làm một bài grammar theo chủ điểm yếu.',
      },
      {
        id: 'task-streak',
        title: 'Giữ streak',
        done: streak > 0,
        note: 'Đảm bảo hôm nay có hoạt động học để duy trì streak.',
      },
    ],
    [progress.moduleCounts, streak]
  );

  const doneCount = tasks.filter((item) => item.done).length;

  return (
    <ToeicWorkspaceLayout
      title="Nhiệm Vụ TOEIC"
      subtitle="Checklist theo ngày để duy trì tiến độ học"
    >
      <section className="soft-card toeic-tasks-board">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Daily checklist</p>
            <h4>{doneCount}/{tasks.length} nhiệm vụ hoàn thành</h4>
          </div>
          <span className="pill pastel-green">Streak {streak} ngày</span>
        </div>

        <div className="toeic-task-list">
          {tasks.map((task) => (
            <article key={task.id} className={`toeic-task-item ${task.done ? 'done' : ''}`}>
              <div>
                <h4>{task.title}</h4>
                <p>{task.note}</p>
              </div>
              <strong>{task.done ? 'Đã xong' : 'Chưa xong'}</strong>
            </article>
          ))}
        </div>
      </section>
    </ToeicWorkspaceLayout>
  );
}
