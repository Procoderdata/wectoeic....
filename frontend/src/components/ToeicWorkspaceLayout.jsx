import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/toeic/home', label: 'Trang chủ', icon: 'HM' },
  { to: '/toeic/tests', label: 'Luyện thi', icon: 'EX' },
  { to: '/toeic/ranking', label: 'Xếp hạng', icon: 'LB' },
  { to: '/toeic/tasks', label: 'Nhiệm vụ', icon: 'TS' },
  { to: '/toeic/profile', label: 'Hồ sơ', icon: 'PR' },
  { to: '/toeic/settings', label: 'Cài đặt', icon: 'ST' },
];

export default function ToeicWorkspaceLayout({ title, subtitle, children }) {
  return (
    <div className="toeic-workspace">
      <aside className="toeic-side-menu">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `toeic-side-link ${isActive ? 'active' : ''}`}
          >
            <span className="toeic-side-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </aside>

      <section className="toeic-workspace-main">
        <header className="toeic-workspace-head">
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </header>
        {children}
      </section>
    </div>
  );
}
