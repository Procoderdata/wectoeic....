import { useEffect, useMemo, useState } from 'react';
import ToeicWorkspaceLayout from '../components/ToeicWorkspaceLayout';
import { toeicAPI } from '../services/api';
import { useProgress } from '../hooks/useProgress';

const defaultSeries = ['ETS 2026'];
const PART_PATTERN = /part\s*(\d+)/i;

function getPartNumber(partLabel = '') {
  const match = PART_PATTERN.exec(String(partLabel));
  if (!match) return 0;
  return Number(match[1]) || 0;
}

function normalizePartList(parts = []) {
  if (!Array.isArray(parts)) return [];
  return parts
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      part: String(item.part || '').trim(),
      count: Number(item.count) || 0,
      type: String(item.type || '').trim(),
    }))
    .filter((item) => item.part);
}

export default function ToeicTestsPage() {
  const [seriesList, setSeriesList] = useState(defaultSeries);
  const [selectedSeries, setSelectedSeries] = useState(defaultSeries[0]);
  const [query, setQuery] = useState('');
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [launchingId, setLaunchingId] = useState('');
  const [practicePicker, setPracticePicker] = useState({
    isOpen: false,
    test: null,
    selectedParts: [],
  });
  const { refreshProgress } = useProgress();

  useEffect(() => {
    toeicAPI.getFullTests()
      .then((data) => {
        const incomingSeries = data.series?.length ? data.series : defaultSeries;
        setSeriesList(incomingSeries);
        setSelectedSeries((current) => (incomingSeries.includes(current) ? current : incomingSeries[0]));
        setPacks(data.items || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedSeries) return;
    toeicAPI.getFullTests(selectedSeries, query)
      .then((data) => {
        setPacks(data.items || []);
      })
      .catch((err) => setError(err.message));
  }, [query, selectedSeries]);

  const filteredPacks = useMemo(() => packs, [packs]);

  const launchTest = async (mode, packId, options = {}) => {
    if (launchingId) return;
    setLaunchingId(packId);
    try {
      await toeicAPI.launchFullTest(packId, mode, 'demo-user', options.selectedParts || []);
      await refreshProgress();
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLaunchingId('');
    }
  };

  const openPracticePicker = (test) => {
    const normalizedParts = normalizePartList(test?.parts);
    setPracticePicker({
      isOpen: true,
      test,
      selectedParts: normalizedParts.map((item) => item.part),
    });
    setError('');
  };

  const closePracticePicker = () => {
    setPracticePicker({
      isOpen: false,
      test: null,
      selectedParts: [],
    });
  };

  const pickerParts = useMemo(
    () => normalizePartList(practicePicker.test?.parts),
    [practicePicker.test]
  );

  const pickerPartBuckets = useMemo(() => {
    const listening = [];
    const reading = [];
    const extra = [];
    pickerParts.forEach((item) => {
      const partNumber = getPartNumber(item.part);
      if (partNumber >= 1 && partNumber <= 4) {
        listening.push(item);
      } else if (partNumber >= 5 && partNumber <= 7) {
        reading.push(item);
      } else {
        extra.push(item);
      }
    });
    return { listening, reading, extra };
  }, [pickerParts]);

  const pickerQuestionCount = useMemo(() => {
    const selected = new Set(practicePicker.selectedParts);
    return pickerParts.reduce((sum, item) => {
      if (!selected.has(item.part)) return sum;
      return sum + (Number(item.count) || 0);
    }, 0);
  }, [pickerParts, practicePicker.selectedParts]);

  const allPickerPartsSelected =
    pickerParts.length > 0 && practicePicker.selectedParts.length === pickerParts.length;

  const togglePickerPart = (partLabel) => {
    setPracticePicker((current) => {
      const selected = new Set(current.selectedParts);
      if (selected.has(partLabel)) {
        selected.delete(partLabel);
      } else {
        selected.add(partLabel);
      }
      return {
        ...current,
        selectedParts: Array.from(selected),
      };
    });
  };

  const toggleSelectAllPickerParts = () => {
    setPracticePicker((current) => {
      const availablePartLabels = normalizePartList(current.test?.parts).map((item) => item.part);
      if (!availablePartLabels.length) {
        return current;
      }
      const shouldSelectAll = current.selectedParts.length !== availablePartLabels.length;
      return {
        ...current,
        selectedParts: shouldSelectAll ? availablePartLabels : [],
      };
    });
  };

  const resetPickerSelection = () => {
    setPracticePicker((current) => {
      const availablePartLabels = normalizePartList(current.test?.parts).map((item) => item.part);
      return {
        ...current,
        selectedParts: availablePartLabels,
      };
    });
  };

  const startPracticeWithSelectedParts = async () => {
    if (!practicePicker.test) return;
    if (!practicePicker.selectedParts.length) {
      setError('Chọn ít nhất 1 part để bắt đầu luyện tập.');
      return;
    }

    await launchTest('practice', practicePicker.test.id, {
      selectedParts: practicePicker.selectedParts,
    });
    closePracticePicker();
  };

  return (
    <ToeicWorkspaceLayout
      title="Chinh phục TOEIC Full Test"
      subtitle="Luyện đề thi thật và chấm điểm tự động"
    >
      <section className="soft-card toeic-tests-board">
        <div className="search-bar-soft full-test-search">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm kiếm bộ đề..."
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setQuery(event.currentTarget.value);
              }
            }}
          />
          <button className="primary-btn" onClick={() => setQuery((value) => value)}>Tìm</button>
        </div>

        <div className="full-test-series-row">
          {seriesList.map((series) => (
            <button
              key={series}
              className={`full-test-series-btn ${selectedSeries === series ? 'active' : ''}`}
              onClick={() => setSelectedSeries(series)}
            >
              {series}
            </button>
          ))}
        </div>

        {loading ? <div className="state-card">Đang tải danh sách đề...</div> : null}

        {!loading ? (
          <div className="full-test-card-list">
            {filteredPacks.map((test) => (
              <article key={test.id} className="full-test-card">
                <div className="full-test-card-head">
                  <div>
                    <h4>{test.title}</h4>
                    <p className="subtle">📝 {test.questions} câu • ⏱ {test.duration_minutes} phút</p>
                  </div>
                  <span className="pill pastel-pink">{test.status}</span>
                </div>

                <p className="subtle">{test.focus}</p>

                <div className="full-test-actions">
                  <button
                    className="ghost-btn wide-btn"
                    onClick={() => launchTest('exam', test.id)}
                    disabled={launchingId === test.id}
                  >
                    ▷ Luyện thi
                  </button>

                  <button
                    className="secondary-btn wide-btn"
                    onClick={() => openPracticePicker(test)}
                    disabled={launchingId === test.id}
                  >
                    📖 Luyện tập
                  </button>
                </div>
              </article>
            ))}

            {!filteredPacks.length ? (
              <article className="state-card">Không tìm thấy bộ đề phù hợp.</article>
            ) : null}
          </div>
        ) : null}

        {error ? <div className="feedback-card">{error}</div> : null}
      </section>

      {practicePicker.isOpen ? (
        <div className="overlay-sheet toeic-part-picker-backdrop" onClick={closePracticePicker}>
          <article className="overlay-panel toeic-part-picker-panel" onClick={(event) => event.stopPropagation()}>
            <div className="toeic-part-picker-head">
              <div>
                <p className="section-kicker">Luyện tập theo Part</p>
                <h3>{practicePicker.test?.title || 'TOEIC Practice'}</h3>
                <p>Chọn part cụ thể để luyện tập trước khi làm tiếp.</p>
              </div>
              <div className="toeic-part-picker-actions">
                <button className="ghost-btn" onClick={resetPickerSelection}>↺ Làm lại</button>
                <button
                  className="primary-btn"
                  onClick={startPracticeWithSelectedParts}
                  disabled={!practicePicker.selectedParts.length || launchingId === practicePicker.test?.id}
                >
                  {launchingId === practicePicker.test?.id ? 'Đang tạo phiên...' : '▶ Làm tiếp'}
                </button>
              </div>
            </div>

            <button className={`toeic-part-select-all ${allPickerPartsSelected ? 'active' : ''}`} onClick={toggleSelectAllPickerParts}>
              <span>{allPickerPartsSelected ? '✓' : '○'}</span>
              <strong>{allPickerPartsSelected ? 'Bỏ chọn tất cả Part' : 'Chọn tất cả Part'}</strong>
              <small>{pickerParts.reduce((sum, item) => sum + item.count, 0)} câu</small>
            </button>

            {pickerPartBuckets.listening.length ? (
              <section className="toeic-part-section">
                <p className="section-kicker">Listening</p>
                <div className="toeic-part-grid">
                  {pickerPartBuckets.listening.map((item) => {
                    const selected = practicePicker.selectedParts.includes(item.part);
                    return (
                      <button
                        key={item.part}
                        className={`toeic-part-choice ${selected ? 'active' : ''}`}
                        onClick={() => togglePickerPart(item.part)}
                      >
                        <span className="toeic-part-choice-mark">{selected ? '✓' : '○'}</span>
                        <div className="toeic-part-choice-copy">
                          <strong>{item.part}</strong>
                          <small>{item.type}</small>
                        </div>
                        <span className="toeic-part-choice-count">{item.count} câu</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {pickerPartBuckets.reading.length ? (
              <section className="toeic-part-section">
                <p className="section-kicker">Reading</p>
                <div className="toeic-part-grid">
                  {pickerPartBuckets.reading.map((item) => {
                    const selected = practicePicker.selectedParts.includes(item.part);
                    return (
                      <button
                        key={item.part}
                        className={`toeic-part-choice ${selected ? 'active' : ''}`}
                        onClick={() => togglePickerPart(item.part)}
                      >
                        <span className="toeic-part-choice-mark">{selected ? '✓' : '○'}</span>
                        <div className="toeic-part-choice-copy">
                          <strong>{item.part}</strong>
                          <small>{item.type}</small>
                        </div>
                        <span className="toeic-part-choice-count">{item.count} câu</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {pickerPartBuckets.extra.length ? (
              <section className="toeic-part-section">
                <p className="section-kicker">Khác</p>
                <div className="toeic-part-grid">
                  {pickerPartBuckets.extra.map((item) => {
                    const selected = practicePicker.selectedParts.includes(item.part);
                    return (
                      <button
                        key={item.part}
                        className={`toeic-part-choice ${selected ? 'active' : ''}`}
                        onClick={() => togglePickerPart(item.part)}
                      >
                        <span className="toeic-part-choice-mark">{selected ? '✓' : '○'}</span>
                        <div className="toeic-part-choice-copy">
                          <strong>{item.part}</strong>
                          <small>{item.type}</small>
                        </div>
                        <span className="toeic-part-choice-count">{item.count} câu</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            <footer className="toeic-part-picker-foot">
              <span className="pill pastel-pink">{pickerQuestionCount} câu</span>
              <strong>Đã chọn {practicePicker.selectedParts.length} part</strong>
            </footer>
          </article>
        </div>
      ) : null}
    </ToeicWorkspaceLayout>
  );
}
