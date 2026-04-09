import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiActivity,
  FiBookOpen,
  FiClock,
  FiDatabase,
  FiDownload,
  FiEye,
  FiFileText,
  FiFilter,
  FiGlobe,
  FiGrid,
  FiLayers,
  FiLogOut,
  FiMapPin,
  FiRefreshCw,
  FiSave,
  FiTrash2,
  FiUploadCloud,
  FiUsers,
} from 'react-icons/fi';
import { adminAPI, adminAuthAPI } from '../services/api';

const SECTION_META = {
  listening: {
    label: 'Listening',
    duration: 45,
    start: 1,
    parts: [1, 2, 3, 4],
  },
  reading: {
    label: 'Reading',
    duration: 75,
    start: 101,
    parts: [5, 6, 7],
  },
};

const PART_META = {
  listening: {
    1: { title: 'Photographs', type: 'Photo Description' },
    2: { title: 'Question-Response', type: 'Spoken Response' },
    3: { title: 'Conversations', type: 'Conversation Set' },
    4: { title: 'Talks', type: 'Talk Set' },
  },
  reading: {
    5: { title: 'Incomplete Sentences', type: 'Sentence Completion' },
    6: { title: 'Text Completion', type: 'Text + Blank' },
    7: { title: 'Reading Comprehension', type: 'Single / Double / Triple Passage' },
  },
};

const TOEIC_OFFICIAL_FORMAT = [
  { key: 'l1', label: 'Part 1', title: 'Photographs', count: 6, detail: 'Listening • 45 phút' },
  { key: 'l2', label: 'Part 2', title: 'Question-Response', count: 25, detail: 'Listening • audio only' },
  { key: 'l3', label: 'Part 3', title: 'Conversations', count: 39, detail: '13 đoạn hội thoại, 3 câu / đoạn' },
  { key: 'l4', label: 'Part 4', title: 'Talks', count: 30, detail: '10 bài nói, 3 câu / đoạn' },
  { key: 'r5', label: 'Part 5', title: 'Incomplete Sentences', count: 30, detail: 'Reading • câu đơn' },
  { key: 'r6', label: 'Part 6', title: 'Text Completion', count: 16, detail: 'Reading • đoạn văn có chỗ trống' },
  { key: 'r7', label: 'Part 7', title: 'Reading Comprehension', count: 54, detail: 'Single / double / triple passage' },
];

const sidebarItems = [
  { key: 'overview', label: 'Tổng quan', icon: FiGrid },
  { key: 'exams', label: 'Quản lý đề thi', icon: FiBookOpen },
  { key: 'import', label: 'Import & Preview', icon: FiUploadCloud },
  { key: 'students', label: 'Học viên', icon: FiUsers },
];

const defaultFormState = {
  id: '',
  series: 'ETS 2026',
  title: '',
  questions: 200,
  duration_minutes: 120,
  status: 'Chua lam',
  focus: '',
  partsText: JSON.stringify(
    [
      { part: 'Part 1', count: 6, type: 'Photographs' },
      { part: 'Part 2', count: 25, type: 'Question-Response' },
      { part: 'Part 3', count: 39, type: 'Conversations' },
      { part: 'Part 4', count: 30, type: 'Talks' },
      { part: 'Part 5', count: 30, type: 'Incomplete Sentences' },
      { part: 'Part 6', count: 16, type: 'Text Completion' },
      { part: 'Part 7', count: 54, type: 'Reading Comprehension' },
    ],
    null,
    2,
  ),
};

const sampleImportJson = JSON.stringify(
  {
    exam_documents: [
      {
        id: 'ets-2026-blueprint',
        series: 'ETS 2026',
        title: 'Test 1 Blueprint',
        form: 'Form A',
        locale: 'US',
        month: 'May',
        year: '2026',
        questions: 14,
        duration_minutes: 120,
        status: 'Dang hoc',
        description: 'Schema mẫu cho import TOEIC Listening & Reading với live preview từng part.',
        listening: {
          duration_minutes: 45,
          parts: [
            {
              part: 1,
              groups: [
                {
                  id: 'p1-photo-1',
                  title: 'Photo 1',
                  notes: 'Listening Part 1 dùng ảnh + 4 câu mô tả bằng audio.',
                  questions: [
                    {
                      id: 'q1',
                      number: 1,
                      prompt: 'Which statement best describes the photograph?',
                      choices: [
                        'A man is checking a departure board.',
                        'Two travelers are speaking at a service counter.',
                        'Some passengers are boarding a train.',
                        'A worker is carrying a suitcase down the stairs.',
                      ],
                      answer_key: 'B',
                      explanation: 'The scene focuses on two people speaking at a counter in a station lobby.',
                    },
                  ],
                },
              ],
            },
            {
              part: 2,
              groups: [
                {
                  id: 'p2-response-1',
                  title: 'Prompt 1',
                  transcript: 'Where should visitors sign in for the seminar?',
                  notes: 'Part 2 thường không in sẵn đáp án trên đề thật; preview vẫn có thể hiện choices nếu bạn nhập script.',
                  questions: [
                    {
                      id: 'q7',
                      number: 7,
                      prompt: 'Choose the best response.',
                      choices: [
                        'At the desk beside the elevators.',
                        'Yes, the seminar was useful.',
                        'I signed the contract yesterday.',
                      ],
                      answer_key: 'A',
                    },
                  ],
                },
              ],
            },
            {
              part: 3,
              groups: [
                {
                  id: 'p3-conv-1',
                  title: 'Conversation 1',
                  transcript:
                    'Woman: The supplier moved our shipment to Friday. Man: Then we need to update the client this afternoon. Woman: I will revise the delivery notice now.',
                  questions: [
                    {
                      id: 'q32',
                      number: 32,
                      prompt: 'Why are the speakers talking?',
                      choices: [
                        'To approve a refund',
                        'To discuss a delayed shipment',
                        'To compare price quotes',
                        'To schedule a training session',
                      ],
                      answer_key: 'B',
                    },
                    {
                      id: 'q33',
                      number: 33,
                      prompt: 'What will the woman do next?',
                      choices: [
                        'Call the warehouse',
                        'Revise a notice',
                        'Meet a vendor',
                        'Cancel an invoice',
                      ],
                      answer_key: 'B',
                    },
                    {
                      id: 'q34',
                      number: 34,
                      prompt: 'What is implied about the shipment?',
                      choices: [
                        'It will arrive late.',
                        'It has already been returned.',
                        'It contains damaged items.',
                        'It was sent to the wrong office.',
                      ],
                      answer_key: 'A',
                    },
                  ],
                },
              ],
            },
            {
              part: 4,
              groups: [
                {
                  id: 'p4-talk-1',
                  title: 'Talk 1',
                  transcript:
                    'Good morning, everyone. The maintenance team has finished repairing the west entrance, so visitors may use that door again starting at noon. Please move the temporary signs before lunch.',
                  questions: [
                    {
                      id: 'q71',
                      number: 71,
                      prompt: 'What is the announcement mainly about?',
                      choices: [
                        'A new security rule',
                        'An updated entrance schedule',
                        'A delayed lunch delivery',
                        'A visitor registration issue',
                      ],
                      answer_key: 'B',
                    },
                    {
                      id: 'q72',
                      number: 72,
                      prompt: 'When may visitors use the west entrance again?',
                      choices: ['This morning', 'At noon', 'Tomorrow', 'Next week'],
                      answer_key: 'B',
                    },
                    {
                      id: 'q73',
                      number: 73,
                      prompt: 'What are listeners asked to do?',
                      choices: [
                        'Print more signs',
                        'Inspect the repair area',
                        'Move temporary signs',
                        'Contact the maintenance team',
                      ],
                      answer_key: 'C',
                    },
                  ],
                },
              ],
            },
          ],
        },
        reading: {
          duration_minutes: 75,
          parts: [
            {
              part: 5,
              questions: [
                {
                  id: 'q101',
                  number: 101,
                  prompt: 'All reimbursement forms must be ------- by the department manager before payment can be issued.',
                  choices: ['approve', 'approved', 'approving', 'approval'],
                  answer_key: 'B',
                },
                {
                  id: 'q102',
                  number: 102,
                  prompt: 'The museum will extend its weekend hours ------- visitor demand remains high this month.',
                  choices: ['unless', 'since', 'if', 'during'],
                  answer_key: 'C',
                },
              ],
            },
            {
              part: 6,
              groups: [
                {
                  id: 'p6-email-1',
                  title: 'Email Draft',
                  passages: [
                    {
                      label: 'Email',
                      title: 'Staff Training Reminder',
                      content:
                        'To all branch managers,\n\nPlease remind your teams that the new inventory workshop begins next Tuesday. Employees who complete the workshop will receive access to the updated tracking dashboard. -------. Thank you for encouraging full participation.',
                    },
                  ],
                  questions: [
                    {
                      id: 'q131',
                      number: 131,
                      prompt: 'Which word best completes the second sentence?',
                      choices: ['attend', 'attends', 'attending', 'attended'],
                      answer_key: 'A',
                    },
                    {
                      id: 'q132',
                      number: 132,
                      prompt: 'Which sentence best completes the blank?',
                      choices: [
                        'The workshop fee was reduced last quarter.',
                        'Managers should submit the final attendance list by Friday.',
                        'The office cafeteria menu will change next week.',
                        'Several vendors have already renewed their contracts.',
                      ],
                      answer_key: 'B',
                    },
                  ],
                },
              ],
            },
            {
              part: 7,
              groups: [
                {
                  id: 'p7-double-1',
                  title: 'Double Passage',
                  passages: [
                    {
                      label: 'Email',
                      title: 'Shipment Update',
                      content:
                        'Ms. Ortega,\n\nThe office chairs you ordered will arrive on Thursday instead of Wednesday because of heavy rain near the distribution hub. We apologize for the delay.\n\nRegards,\nNorthline Furnishings',
                    },
                    {
                      label: 'Notice',
                      title: 'Office Move Plan',
                      content:
                        'Facilities Notice: The marketing department will move to the renovated fourth floor on Friday morning. New chairs must be delivered before 10 A.M. so desks can be arranged that afternoon.',
                    },
                  ],
                  questions: [
                    {
                      id: 'q147',
                      number: 147,
                      prompt: 'Why will the chairs arrive late?',
                      choices: [
                        'A supplier changed the model.',
                        'A road closure affected delivery.',
                        'The order form was incomplete.',
                        'The office requested extra items.',
                      ],
                      answer_key: 'B',
                    },
                    {
                      id: 'q148',
                      number: 148,
                      prompt: 'What is suggested about the marketing department?',
                      choices: [
                        'It recently reduced its staff.',
                        'It is preparing to relocate.',
                        'It ordered new computers.',
                        'It will share desks with another team.',
                      ],
                      answer_key: 'B',
                    },
                    {
                      id: 'q149',
                      number: 149,
                      prompt: 'What is most likely true if the chairs arrive on Thursday?',
                      choices: [
                        'The move can remain on schedule.',
                        'The renovation must be postponed.',
                        'The chairs will be returned.',
                        'The fourth floor will close to visitors.',
                      ],
                      answer_key: 'A',
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
  },
  null,
  2,
);

function formatRelativeDay(lastActivityDate) {
  if (!lastActivityDate) return 'Never';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(lastActivityDate);
  const safeTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.round((today - safeTarget) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

function toText(value, fallback = '') {
  const text = `${value ?? ''}`.trim();
  return text || fallback;
}

function toInt(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeChoice(choice, index) {
  const fallbackKey = String.fromCharCode(65 + index);
  if (choice && typeof choice === 'object' && !Array.isArray(choice)) {
    return {
      key: toText(choice.key || choice.id, fallbackKey).toUpperCase(),
      text: toText(choice.text || choice.label, `Choice ${fallbackKey}`),
    };
  }

  return {
    key: fallbackKey,
    text: toText(choice, `Choice ${fallbackKey}`),
  };
}

function deriveAnswerKey(question, choices) {
  const answerKey = toText(question.answer_key).toUpperCase();
  if (answerKey) return answerKey;

  const answer = toText(question.answer);
  if (answer) {
    if (answer.length === 1) return answer.toUpperCase();
    const matchedChoice = choices.find((choice) => choice.text.toLowerCase() === answer.toLowerCase());
    if (matchedChoice) return matchedChoice.key;
  }

  const index = typeof question.answer_index === 'number' ? question.answer_index : Number.parseInt(question.answer_index, 10);
  if (Number.isFinite(index) && index >= 0 && index < choices.length) {
    return choices[index].key;
  }

  return '';
}

function normalizeImportQuestion(question, skill, partNumber, fallbackNumber) {
  const choicesInput = Array.isArray(question?.choices)
    ? question.choices
    : Array.isArray(question?.options)
      ? question.options
      : [];
  const choices = choicesInput.map((choice, index) => normalizeChoice(choice, index));
  const number = Math.max(1, toInt(question?.number, fallbackNumber));

  return {
    id: toText(question?.id, `${skill}-part-${partNumber}-q-${number}`),
    number,
    prompt: toText(question?.prompt || question?.question || question?.stem),
    choices,
    answer_key: deriveAnswerKey(question || {}, choices),
    explanation: toText(question?.explanation || question?.rationale),
    note: toText(question?.note),
    support_text: toText(question?.support_text || question?.context),
  };
}

function normalizeImportGroup(group, skill, partNumber, nextQuestionNumber) {
  const directQuestions = Array.isArray(group?.questions) ? group.questions : [];
  const questionLikeGroup =
    directQuestions.length === 0 &&
    (group?.prompt || group?.question || group?.stem || group?.choices || group?.options);
  const questionsInput = questionLikeGroup ? [group] : directQuestions;

  let runningNumber = nextQuestionNumber;
  const questions = questionsInput
    .filter((question) => question && typeof question === 'object')
    .map((question) => {
      const normalizedQuestion = normalizeImportQuestion(question, skill, partNumber, runningNumber);
      runningNumber = normalizedQuestion.number + 1;
      return normalizedQuestion;
    });

  const passages = Array.isArray(group?.passages)
    ? group.passages.map((passage, index) => ({
        id: toText(passage?.id, `${skill}-part-${partNumber}-passage-${index + 1}`),
        label: toText(passage?.label, `Passage ${index + 1}`),
        title: toText(passage?.title),
        content: toText(passage?.content || passage?.text || passage?.body || passage),
      }))
    : [];

  const questionNumbers = questions.map((question) => question.number);
  const questionRange = questionNumbers.length
    ? questionNumbers.length === 1
      ? `${questionNumbers[0]}`
      : `${questionNumbers[0]}-${questionNumbers[questionNumbers.length - 1]}`
    : '';
  const partTitle = PART_META?.[skill]?.[partNumber]?.title || `Part ${partNumber}`;

  return {
    group: {
      id: toText(group?.id, `${skill}-part-${partNumber}-${questionRange || nextQuestionNumber}`),
      title: toText(group?.title, `${partTitle}${questionRange ? ` ${questionRange}` : ''}`),
      directions: toText(group?.directions),
      transcript: toText(group?.transcript || group?.audio_script),
      image_url: toText(group?.image_url),
      audio_url: toText(group?.audio_url),
      notes: toText(group?.notes || group?.note),
      passages,
      questions,
      question_range: questionRange,
    },
    nextQuestionNumber: runningNumber,
  };
}

function normalizeImportPart(partInput, skill, fallbackNumber, nextQuestionNumber) {
  const partNumber = toInt(partInput?.part || partInput?.part_number, fallbackNumber);
  const partMeta = PART_META?.[skill]?.[partNumber] || {};
  const groupsInput = Array.isArray(partInput?.groups) ? partInput.groups : [];
  const directQuestions = Array.isArray(partInput?.questions) ? partInput.questions : [];
  let normalizedGroupsInput = groupsInput;

  if (!normalizedGroupsInput.length && directQuestions.length) {
    const sharedGroup = {
      title: partInput?.group_title,
      directions: partInput?.group_directions,
      transcript: partInput?.transcript || partInput?.audio_script,
      image_url: partInput?.image_url,
      notes: partInput?.notes || partInput?.note,
      passages: partInput?.passages,
    };

    normalizedGroupsInput = [1, 2, 5].includes(partNumber)
      ? directQuestions.map((question) => ({ ...sharedGroup, questions: [question] }))
      : [{ ...sharedGroup, questions: directQuestions }];
  }

  let runningNumber = nextQuestionNumber;
  const groups = normalizedGroupsInput
    .filter((group) => group && typeof group === 'object')
    .map((group) => {
      const normalizedGroup = normalizeImportGroup(group, skill, partNumber, runningNumber);
      runningNumber = normalizedGroup.nextQuestionNumber;
      return normalizedGroup.group;
    })
    .filter((group) => group.questions.length);

  return {
    part: {
      part_number: partNumber,
      part_key: `${skill}-part-${partNumber}`,
      title: toText(partInput?.title, partMeta.title || `Part ${partNumber}`),
      type: toText(partInput?.type || partInput?.kind, partMeta.type || 'Practice'),
      directions: toText(partInput?.directions),
      groups,
      question_count: groups.reduce((sum, group) => sum + group.questions.length, 0),
    },
    nextQuestionNumber: runningNumber,
  };
}

function normalizeImportSection(sectionInput, skill) {
  const partsInput = Array.isArray(sectionInput?.parts) ? sectionInput.parts : [];
  let runningNumber = SECTION_META[skill].start;
  const parts = partsInput
    .filter((part) => part && typeof part === 'object')
    .map((part, index) => {
      const fallbackNumber = skill === 'listening' ? index + 1 : index + 5;
      const normalizedPart = normalizeImportPart(part, skill, fallbackNumber, runningNumber);
      runningNumber = normalizedPart.nextQuestionNumber;
      return normalizedPart.part;
    })
    .filter((part) => part.question_count > 0);

  return {
    skill,
    label: SECTION_META[skill].label,
    duration_minutes: Math.max(toInt(sectionInput?.duration_minutes, SECTION_META[skill].duration), 1),
    parts,
    question_count: parts.reduce((sum, part) => sum + part.question_count, 0),
  };
}

function buildPartsSummary(sections) {
  return ['listening', 'reading'].flatMap((skill) =>
    (sections?.[skill]?.parts || []).map((part) => ({
      part: `Part ${part.part_number}`,
      count: part.question_count,
      type: part.title,
    })),
  );
}

function normalizeImportDocument(document) {
  const sections = {
    listening: normalizeImportSection(document?.sections?.listening || document?.listening, 'listening'),
    reading: normalizeImportSection(document?.sections?.reading || document?.reading, 'reading'),
  };
  const documentQuestionCount = sections.listening.question_count + sections.reading.question_count;
  const parts = buildPartsSummary(sections);

  return {
    id: toText(document?.id, 'toeic-import-document'),
    series: toText(document?.series, 'Custom TOEIC'),
    title: toText(document?.title, 'Untitled TOEIC Test'),
    form: toText(document?.form || document?.version, 'Form A'),
    locale: toText(document?.locale || document?.market, 'Global'),
    month: toText(document?.month),
    year: toText(document?.year),
    status: toText(document?.status, 'Dang hoc'),
    focus: toText(document?.focus || document?.description, 'Imported TOEIC blueprint'),
    description: toText(document?.description || document?.focus),
    notes: toText(document?.notes),
    questions: Math.max(toInt(document?.questions, documentQuestionCount), documentQuestionCount),
    duration_minutes: Math.max(
      toInt(document?.duration_minutes, sections.listening.duration_minutes + sections.reading.duration_minutes),
      1,
    ),
    parts,
    sections,
    document_available: documentQuestionCount > 0,
    document_question_count: documentQuestionCount,
    source: 'draft',
  };
}

function parseImportBundle(source) {
  const trimmed = source.trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: 'JSON import đang trống.',
      payload: null,
      documents: [],
      legacy: null,
    };
  }

  try {
    const payload = JSON.parse(trimmed);
    const documents = Array.isArray(payload?.exam_documents)
      ? payload.exam_documents
          .filter((document) => document && typeof document === 'object')
          .map((document) => normalizeImportDocument(document))
      : [];

    const legacy = {
      packs: Array.isArray(payload?.packs) ? payload.packs.length : 0,
      themes: Array.isArray(payload?.themes) ? payload.themes.length : 0,
      questionGroups:
        payload?.question_bank && typeof payload.question_bank === 'object'
          ? Object.values(payload.question_bank).reduce((sum, skillMap) => {
              if (!skillMap || typeof skillMap !== 'object') return sum;
              return (
                sum +
                Object.values(skillMap).reduce(
                  (innerSum, items) => innerSum + (Array.isArray(items) ? items.length : 0),
                  0,
                )
              );
            }, 0)
          : 0,
    };

    return {
      isValid: true,
      error: '',
      payload,
      documents,
      legacy,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error?.message || 'Invalid JSON',
      payload: null,
      documents: [],
      legacy: null,
    };
  }
}

function buildFormStateFromPack(pack) {
  const parts = Array.isArray(pack?.parts) ? pack.parts : [];
  return {
    id: pack?.id || '',
    series: pack?.series || 'ETS 2026',
    title: pack?.title || '',
    questions: pack?.questions || 0,
    duration_minutes: pack?.duration_minutes || 120,
    status: pack?.status || 'Chua lam',
    focus: pack?.focus || pack?.description || '',
    partsText: JSON.stringify(parts, null, 2),
  };
}

function getAvailableSkills(document) {
  return ['listening', 'reading'].filter((skill) => (document?.sections?.[skill]?.parts || []).length);
}

function getPartList(document, skill) {
  return document?.sections?.[skill]?.parts || [];
}

function getFirstQuestionId(document, skill, partKey) {
  const part = getPartList(document, skill).find((item) => item.part_key === partKey);
  if (!part) return '';
  for (const group of part.groups) {
    if (group.questions?.[0]?.id) return group.questions[0].id;
  }
  return '';
}

function getSelectionContext(document, skill, partKey, questionId) {
  const activePart = getPartList(document, skill).find((item) => item.part_key === partKey) || null;
  if (!activePart) {
    return {
      part: null,
      group: null,
      question: null,
      questionItems: [],
    };
  }

  const questionItems = activePart.groups.flatMap((group) =>
    (group.questions || []).map((question) => ({
      group,
      question,
    })),
  );
  const selectedItem = questionItems.find((item) => item.question.id === questionId) || questionItems[0] || null;

  return {
    part: activePart,
    group: selectedItem?.group || activePart.groups?.[0] || null,
    question: selectedItem?.question || null,
    questionItems,
  };
}

function getFallbackPrompt(skill, partNumber) {
  if (skill === 'listening' && partNumber === 1) return 'Which statement best describes the photograph?';
  if (skill === 'listening' && partNumber === 2) return 'Choose the best response.';
  return 'Select the best answer.';
}

function renderChoiceList(question) {
  if (!question?.choices?.length) {
    return (
      <div className="toeic-admin-audio-note">
        Part 1 và Part 2 trên đề TOEIC thật thường không in sẵn đáp án. Nếu muốn preview script đáp án, hãy thêm `choices`.
      </div>
    );
  }

  return (
    <div className="toeic-admin-choice-list">
      {question.choices.map((choice) => (
        <div
          key={`${question.id}-${choice.key}`}
          className={`toeic-admin-choice ${choice.key === question.answer_key ? 'correct' : ''}`}
        >
          <span>{choice.key}</span>
          <p>{choice.text}</p>
        </div>
      ))}
    </div>
  );
}

function renderPreviewPane(document, skill, context, sourceLabel) {
  if (!document) {
    return <div className="state-card">Chưa có document để preview.</div>;
  }

  const { part, group, question } = context;

  if (!part || !group || !question) {
    return <div className="state-card">Document này chưa có question group hợp lệ.</div>;
  }

  return (
    <div className="toeic-admin-preview-surface">
      <div className="toeic-admin-preview-head">
        <div>
          <p className="toeic-admin-preview-kicker">Live Preview</p>
          <h3>{document.title}</h3>
          <p>{document.series} • {document.form} • {document.locale}</p>
        </div>
        <span className="toeic-admin-badge admin">{sourceLabel}</span>
      </div>

      <div className="toeic-admin-pill-row">
        <span className="toeic-admin-pill">{SECTION_META[skill].label}</span>
        <span className="toeic-admin-pill">Part {part.part_number}</span>
        <span className="toeic-admin-pill">{part.title}</span>
        <span className="toeic-admin-pill">Q{question.number}</span>
      </div>

      {group.image_url ? (
        <img className="toeic-admin-preview-image" src={group.image_url} alt={group.title} />
      ) : skill === 'listening' && part.part_number === 1 ? (
        <div className="toeic-admin-image-placeholder">
          <strong>Photograph Placeholder</strong>
          <p>Phần TOEIC Part 1 nên nhập `image_url` nếu muốn preview ảnh thật.</p>
        </div>
      ) : null}

      {group.transcript ? (
        <div className="toeic-admin-preview-block">
          <span>Audio Transcript / Script</span>
          <p>{group.transcript}</p>
        </div>
      ) : skill === 'listening' ? (
        <div className="toeic-admin-audio-note">
          Đây là phần nghe. Bạn có thể thêm `transcript` hoặc `audio_url` trong group để preview sát hơn.
        </div>
      ) : null}

      {group.passages?.length ? (
        <div className="toeic-admin-passage-stack">
          {group.passages.map((passage) => (
            <article key={passage.id} className="toeic-admin-passage-card">
              <div className="toeic-admin-passage-label">
                <strong>{passage.label}</strong>
                {passage.title ? <span>{passage.title}</span> : null}
              </div>
              <p>{passage.content}</p>
            </article>
          ))}
        </div>
      ) : null}

      {question.support_text ? (
        <div className="toeic-admin-preview-block">
          <span>Support Text</span>
          <p>{question.support_text}</p>
        </div>
      ) : null}

      <div className="toeic-admin-preview-question">
        <span>{`Question ${question.number}`}</span>
        <h4>{question.prompt || getFallbackPrompt(skill, part.part_number)}</h4>
      </div>

      {renderChoiceList(question)}

      {question.answer_key ? (
        <div className="toeic-admin-answer-box">
          <strong>Đáp án</strong>
          <span>{question.answer_key}</span>
        </div>
      ) : null}

      {question.explanation ? (
        <div className="toeic-admin-preview-block subtle">
          <span>Explanation</span>
          <p>{question.explanation}</p>
        </div>
      ) : null}
    </div>
  );
}

export default function ToeicAdminPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [examCatalog, setExamCatalog] = useState([]);
  const [selectedPackId, setSelectedPackId] = useState('');
  const [selectedPackDetail, setSelectedPackDetail] = useState(null);
  const [formState, setFormState] = useState(defaultFormState);
  const [importText, setImportText] = useState(sampleImportJson);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('listening');
  const [selectedPartKey, setSelectedPartKey] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const parsedImport = useMemo(() => parseImportBundle(importText), [importText]);
  const draftDocument = useMemo(() => {
    if (!parsedImport.documents.length) return null;
    return (
      parsedImport.documents.find((document) => document.id === selectedPackId) ||
      parsedImport.documents[0]
    );
  }, [parsedImport.documents, selectedPackId]);

  const loadAdminData = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [overviewData, examData] = await Promise.all([
        adminAPI.getOverview(),
        adminAPI.getFullTests(),
      ]);
      setDashboard(overviewData);
      setExamCatalog(examData.items || []);
      setError('');
    } catch (err) {
      if (err?.status === 401) {
        await adminAuthAPI.logout().catch(() => {});
        navigate('/admin/login', { replace: true });
        return;
      }
      setError(err.message || 'Không thể tải trang admin');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadPackDetail = async (packId) => {
    if (!packId) return null;
    setLoadingDetail(true);
    try {
      const detail = await adminAPI.getFullTestDetail(packId);
      setSelectedPackDetail(detail);
      setError('');
      return detail;
    } catch (err) {
      if (err?.status === 401) {
        await adminAuthAPI.logout().catch(() => {});
        navigate('/admin/login', { replace: true });
        return null;
      }
      setError(err.message || 'Không thể tải chi tiết bộ đề');
      return null;
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (!selectedPackId && examCatalog.length) {
      setSelectedPackId(examCatalog[0].id);
    }
  }, [examCatalog, selectedPackId]);

  useEffect(() => {
    if (!selectedPackId) return;
    loadPackDetail(selectedPackId);
  }, [selectedPackId]);

  useEffect(() => {
    if (!selectedPackDetail?.item) return;
    setFormState(buildFormStateFromPack(selectedPackDetail.item));
  }, [selectedPackDetail]);

  const filteredExams = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    if (!normalizedQuery) return examCatalog;

    return examCatalog.filter((item) => {
      const haystack = [
        item.id,
        item.series,
        item.title,
        item.focus,
        item.status,
        item.form,
        item.locale,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [examCatalog, search]);

  const overview = dashboard?.overview || {
    total_exams: 0,
    total_questions: 0,
    total_students: 0,
    average_score: 0,
    visitors_today: 0,
    online_today: 0,
    uploaded_exams: 0,
    active_themes: 0,
  };
  const studentSummary = dashboard?.student_activity?.summary || {
    total_students: 0,
    online_today: 0,
    away_today: 0,
    offline_today: 0,
  };
  const studentActivity = dashboard?.student_activity?.items || [];
  const recentImports = dashboard?.recent_imports || [];

  const currentWorkspaceDocument = selectedPackDetail?.document || null;
  const currentDocument = activeSection === 'import' ? draftDocument : currentWorkspaceDocument;
  const availableSkills = getAvailableSkills(currentDocument);

  useEffect(() => {
    if (!currentDocument) {
      setSelectedQuestionId('');
      setSelectedPartKey('');
      return;
    }

    const nextSkill = availableSkills.includes(selectedSkill) ? selectedSkill : availableSkills[0] || 'listening';
    const parts = getPartList(currentDocument, nextSkill);
    const nextPartKey = parts.some((part) => part.part_key === selectedPartKey)
      ? selectedPartKey
      : parts[0]?.part_key || '';
    const nextQuestion = getSelectionContext(currentDocument, nextSkill, nextPartKey, selectedQuestionId).question;

    if (nextSkill !== selectedSkill) setSelectedSkill(nextSkill);
    if (nextPartKey !== selectedPartKey) setSelectedPartKey(nextPartKey);
    if (nextQuestion?.id && nextQuestion.id !== selectedQuestionId) setSelectedQuestionId(nextQuestion.id);
  }, [availableSkills, currentDocument, selectedPartKey, selectedQuestionId, selectedSkill]);

  const selectionContext = useMemo(
    () => getSelectionContext(currentDocument, selectedSkill, selectedPartKey, selectedQuestionId),
    [currentDocument, selectedPartKey, selectedQuestionId, selectedSkill],
  );

  const handleInputChange = (key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveExam = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const parts = JSON.parse(formState.partsText || '[]');
      const payload = {
        id: formState.id || undefined,
        series: formState.series,
        title: formState.title,
        questions: Number(formState.questions || 0),
        duration_minutes: Number(formState.duration_minutes || 120),
        status: formState.status,
        focus: formState.focus,
        parts,
      };
      const result = await adminAPI.saveFullTest(payload);
      setMessage(result.message || 'Đã lưu metadata bộ đề TOEIC');
      await loadAdminData({ silent: true });
      if (result?.item?.id) {
        setSelectedPackId(result.item.id);
        await loadPackDetail(result.item.id);
      }
    } catch (err) {
      setError(err.message || 'Không thể lưu bộ đề');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExam = async (packId) => {
    const confirmed = window.confirm(`Xóa bộ đề ${packId}?`);
    if (!confirmed) return;

    try {
      const result = await adminAPI.deleteFullTest(packId);
      setMessage(result.message || 'Đã xóa bộ đề');
      setError('');
      setSelectedPackDetail(null);
      if (selectedPackId === packId) {
        setSelectedPackId('');
      }
      await loadAdminData({ silent: true });
    } catch (err) {
      setError(err.message || 'Không thể xóa bộ đề');
    }
  };

  const handleImportJson = async () => {
    if (!parsedImport.isValid || !parsedImport.payload) {
      setError(parsedImport.error || 'JSON không hợp lệ');
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const result = await adminAPI.importJson(parsedImport.payload);
      const importedId = result?.exam_documents?.[0]?.id || result?.packs?.[0]?.id || '';
      setMessage(
        result.message ||
          `Đã import ${result?.documents_imported || 0} document và ${result?.packs_imported || 0} pack.`,
      );
      await loadAdminData({ silent: true });
      if (importedId) {
        setSelectedPackId(importedId);
        await loadPackDetail(importedId);
      }
      setActiveSection('exams');
    } catch (err) {
      setError(err.message || 'Không thể import JSON');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSample = () => {
    setImportText(sampleImportJson);
    setActiveSection('import');
    setMessage('Đã nạp sample schema TOEIC vào editor.');
    setError('');
  };

  const handleLoadFileToEditor = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const raw = await file.text();
      setImportText(raw);
      setActiveSection('import');
      setMessage(`Đã nạp ${file.name} vào editor để preview.`);
      setError('');
    } catch (err) {
      setError(err.message || 'Không thể đọc file JSON');
    } finally {
      event.target.value = '';
    }
  };

  const handleExportBundle = async () => {
    try {
      const data = await adminAPI.exportBundle();
      downloadJson('toeic-admin-export.json', data);
      setMessage('Đã export toàn bộ catalog TOEIC hiện tại.');
      setError('');
    } catch (err) {
      setError(err.message || 'Không thể export dữ liệu');
    }
  };

  const handleApplyDraftToForm = () => {
    if (!draftDocument) return;
    setFormState(buildFormStateFromPack(draftDocument));
    setMessage(`Đã áp metadata từ JSON draft: ${draftDocument.title}`);
    setError('');
  };

  const handleSelectExam = (exam, nextSection = activeSection) => {
    setSelectedPackId(exam.id);
    setActiveSection(nextSection);
  };

  const handleResetForm = () => {
    if (selectedPackDetail?.item) {
      setFormState(buildFormStateFromPack(selectedPackDetail.item));
      return;
    }
    setFormState(defaultFormState);
  };

  const handleLogout = async () => {
    try {
      await adminAuthAPI.logout();
    } finally {
      navigate('/admin/login', { replace: true });
    }
  };

  if (loading) {
    return <div className="state-card">Đang tải TOEIC admin...</div>;
  }

  return (
    <div className="toeic-admin-page">
      <aside className="toeic-admin-sidebar">
        <div className="toeic-admin-brand">
          <div className="toeic-admin-brand-icon">⚡</div>
          <div>
            <h2>TOEIC Admin</h2>
            <p>Import + preview + catalog</p>
          </div>
        </div>

        <nav className="toeic-admin-nav">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`toeic-admin-nav-item ${activeSection === item.key ? 'active' : ''}`}
                onClick={() => setActiveSection(item.key)}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="toeic-admin-main">
        <header className="toeic-admin-header">
          <div>
            <p className="toeic-admin-kicker">TOEIC Control Room</p>
            <h1>
              {activeSection === 'overview'
                ? 'Quản lý đề thi'
                : activeSection === 'exams'
                  ? 'Workspace đề TOEIC'
                  : activeSection === 'import'
                    ? 'Import & Live Preview'
                    : 'Học viên'}
            </h1>
            <p className="toeic-admin-subtitle">
              Màn admin này dùng format TOEIC Listening & Reading riêng, không preview theo layout Digital SAT.
            </p>
          </div>

          <div className="toeic-admin-header-actions">
            <button className="toeic-admin-refresh" onClick={() => loadAdminData({ silent: true })} disabled={refreshing}>
              <FiRefreshCw className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Đang tải...' : 'Refresh'}</span>
            </button>
            <button className="toeic-admin-chip" onClick={handleExportBundle}>
              <FiDownload />
              <span>Export</span>
            </button>
            <button className="toeic-admin-chip danger" onClick={handleLogout}>
              <FiLogOut />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        {message ? <div className="toeic-admin-alert success">{message}</div> : null}
        {error ? <div className="toeic-admin-alert error">{error}</div> : null}

        {activeSection === 'overview' ? (
          <>
            <section className="toeic-admin-stats-grid">
              <article className="toeic-admin-stat-card accent-blue">
                <span className="toeic-admin-stat-icon"><FiFileText /></span>
                <div>
                  <p>Tổng đề thi</p>
                  <strong>{overview.total_exams}</strong>
                </div>
              </article>
              <article className="toeic-admin-stat-card accent-green">
                <span className="toeic-admin-stat-icon"><FiDatabase /></span>
                <div>
                  <p>Tổng câu hỏi</p>
                  <strong>{overview.total_questions}</strong>
                </div>
              </article>
              <article className="toeic-admin-stat-card accent-amber">
                <span className="toeic-admin-stat-icon"><FiUploadCloud /></span>
                <div>
                  <p>Đề đã import</p>
                  <strong>{overview.uploaded_exams}</strong>
                </div>
              </article>
            </section>

            <section className="toeic-admin-panel">
              <div className="toeic-admin-panel-head">
                <div>
                  <h3>Exam Library</h3>
                  <p>Tổng quan bộ đề hiện có, click vào từng card để đi vào workspace quản lý.</p>
                </div>
                <div className="toeic-admin-overview-tools">
                  <div className="toeic-admin-search">
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Tìm theo series, title, form, locale..."
                    />
                  </div>
                  <button className="toeic-admin-chip" onClick={() => setActiveSection('import')}>
                    <FiUploadCloud />
                    <span>Import đề</span>
                  </button>
                </div>
              </div>

              <div className="toeic-admin-card-grid">
                {filteredExams.map((exam) => (
                  <article key={exam.id} className="toeic-admin-library-card">
                    <div className="toeic-admin-library-card-top">
                      <span className={`toeic-admin-badge ${exam.document_available ? 'admin' : 'system'}`}>
                        {exam.document_available ? 'Có document' : 'Metadata'}
                      </span>
                      <span className="toeic-admin-library-meta">{exam.source === 'admin' ? 'Admin' : 'System'}</span>
                    </div>
                    <h4>{exam.title}</h4>
                    <p>{exam.series}</p>
                    <div className="toeic-admin-library-pills">
                      <span><FiGlobe /> {exam.locale || 'Global'}</span>
                      <span><FiLayers /> {exam.form || 'Form A'}</span>
                      <span><FiClock /> {exam.duration_minutes} phút</span>
                    </div>
                    <div className="toeic-admin-library-footer">
                      <strong>{exam.questions} câu</strong>
                      <button className="toeic-admin-chip" onClick={() => handleSelectExam(exam, 'exams')}>
                        <FiEye />
                        <span>Quản lý</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {!filteredExams.length ? <div className="state-card">Không tìm thấy bộ đề.</div> : null}
            </section>

            <section className="toeic-admin-panel">
              <div className="toeic-admin-panel-head">
                <div>
                  <h3>TOEIC Official Structure</h3>
                  <p>Dùng để kiểm tra nhanh JSON import có đi đúng layout TOEIC L&R hay chưa.</p>
                </div>
              </div>
              <div className="toeic-admin-guide-grid">
                {TOEIC_OFFICIAL_FORMAT.map((item) => (
                  <article key={item.key} className="toeic-admin-guide-card">
                    <span>{item.label}</span>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                    <small>{item.count} câu</small>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {activeSection === 'exams' ? (
          <>
            <section className="toeic-admin-panel">
              <div className="toeic-admin-panel-head">
                <div>
                  <h3>{selectedPackDetail?.item?.title || 'Chọn một bộ đề'}</h3>
                  <p>
                    {selectedPackDetail?.item
                      ? `${selectedPackDetail.item.series} • ${selectedPackDetail.item.form || 'Form A'} • ${selectedPackDetail.item.locale || 'Global'}`
                      : 'Chọn một bộ đề từ library để xem outline, metadata và live preview.'}
                  </p>
                </div>
                <div className="toeic-admin-mini-actions">
                  <button className="toeic-admin-chip" onClick={() => setActiveSection('overview')}>
                    <FiGrid />
                    <span>Về overview</span>
                  </button>
                  <button className="toeic-admin-chip" onClick={() => setActiveSection('import')}>
                    <FiUploadCloud />
                    <span>Import thêm</span>
                  </button>
                  {selectedPackId ? (
                    <button className="toeic-admin-chip danger" onClick={() => handleDeleteExam(selectedPackId)}>
                      <FiTrash2 />
                      <span>Xóa đề</span>
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="toeic-admin-pill-row">
                {selectedPackDetail?.item?.parts?.map((part) => (
                  <span key={`${part.part}-${part.count}`} className="toeic-admin-pill">
                    {part.part} • {part.count}
                  </span>
                ))}
              </div>
            </section>

            {currentWorkspaceDocument ? (
              <>
                <div className="toeic-admin-tab-row">
                  {availableSkills.map((skill) => (
                    <button
                      key={skill}
                      className={`toeic-admin-tab ${selectedSkill === skill ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedSkill(skill);
                        setSelectedPartKey(getPartList(currentWorkspaceDocument, skill)[0]?.part_key || '');
                      }}
                    >
                      {SECTION_META[skill].label}
                    </button>
                  ))}
                </div>

                <div className="toeic-admin-part-tabs">
                  {getPartList(currentWorkspaceDocument, selectedSkill).map((part) => (
                    <button
                      key={part.part_key}
                      className={`toeic-admin-part-tab ${selectedPartKey === part.part_key ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedPartKey(part.part_key);
                        setSelectedQuestionId(getFirstQuestionId(currentWorkspaceDocument, selectedSkill, part.part_key));
                      }}
                    >
                      {`Part ${part.part_number} • ${part.title}`}
                    </button>
                  ))}
                </div>

                <section className="toeic-admin-studio-grid">
                  <div className="toeic-admin-studio-column">
                    <div className="toeic-admin-panel">
                      <div className="toeic-admin-panel-head">
                        <div>
                          <h3>Exam Library</h3>
                          <p>Chuyển nhanh giữa các bộ đề.</p>
                        </div>
                      </div>
                      <div className="toeic-admin-library-list">
                        {filteredExams.map((exam) => (
                          <button
                            key={exam.id}
                            className={`toeic-admin-library-row ${selectedPackId === exam.id ? 'active' : ''}`}
                            onClick={() => handleSelectExam(exam, 'exams')}
                          >
                            <strong>{exam.title}</strong>
                            <span>{exam.series}</span>
                            <small>{exam.document_available ? 'Có document' : 'Metadata only'}</small>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="toeic-admin-panel">
                      <div className="toeic-admin-panel-head">
                        <div>
                          <h3>Question Outline</h3>
                          <p>{selectionContext.part?.title || 'Chọn part'}</p>
                        </div>
                      </div>
                      <div className="toeic-admin-outline-list">
                        {selectionContext.questionItems.map((item) => (
                          <button
                            key={item.question.id}
                            className={`toeic-admin-outline-row ${selectedQuestionId === item.question.id ? 'active' : ''}`}
                            onClick={() => setSelectedQuestionId(item.question.id)}
                          >
                            <strong>{`Question ${item.question.number}`}</strong>
                            <span>{item.question.prompt || getFallbackPrompt(selectedSkill, selectionContext.part?.part_number)}</span>
                            <small>{item.group.title}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="toeic-admin-studio-column">
                    <div className="toeic-admin-panel">
                      <div className="toeic-admin-panel-head">
                        <div>
                          <h3>Question Inspector</h3>
                          <p>{selectionContext.group?.title || 'Chưa có question group'}</p>
                        </div>
                      </div>
                      {selectionContext.group ? (
                        <div className="toeic-admin-inspector-stack">
                          <div className="toeic-admin-inspector-block">
                            <span>Part Summary</span>
                            <strong>{selectionContext.part?.title}</strong>
                            <p>{selectionContext.part?.type}</p>
                          </div>
                          {selectionContext.group.transcript ? (
                            <div className="toeic-admin-inspector-block">
                              <span>Transcript</span>
                              <p>{selectionContext.group.transcript}</p>
                            </div>
                          ) : null}
                          {selectionContext.group.passages?.length ? (
                            <div className="toeic-admin-inspector-block">
                              <span>Passages</span>
                              <p>{selectionContext.group.passages.map((passage) => passage.label).join(' • ')}</p>
                            </div>
                          ) : null}
                          {selectionContext.question ? (
                            <div className="toeic-admin-inspector-block">
                              <span>{`Question ${selectionContext.question.number}`}</span>
                              <strong>{selectionContext.question.prompt || getFallbackPrompt(selectedSkill, selectionContext.part?.part_number)}</strong>
                              {selectionContext.question.explanation ? <p>{selectionContext.question.explanation}</p> : null}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="state-card">Document chưa có dữ liệu để hiển thị inspector.</div>
                      )}
                    </div>

                    <form className="toeic-admin-panel toeic-admin-form" onSubmit={handleSaveExam}>
                      <div className="toeic-admin-panel-head">
                        <div>
                          <h3>Exam Metadata</h3>
                          <p>Metadata lưu cho catalog và route `/toeic/tests`.</p>
                        </div>
                        <button type="button" className="toeic-admin-chip" onClick={handleResetForm}>
                          Reset
                        </button>
                      </div>

                      <label>
                        ID bộ đề
                        <input value={formState.id} onChange={(event) => handleInputChange('id', event.target.value)} placeholder="ets-2026-test-1" />
                      </label>
                      <label>
                        Series
                        <input value={formState.series} onChange={(event) => handleInputChange('series', event.target.value)} required />
                      </label>
                      <label>
                        Tiêu đề
                        <input value={formState.title} onChange={(event) => handleInputChange('title', event.target.value)} required />
                      </label>
                      <div className="toeic-admin-form-row">
                        <label>
                          Số câu
                          <input type="number" value={formState.questions} onChange={(event) => handleInputChange('questions', event.target.value)} min="0" />
                        </label>
                        <label>
                          Thời lượng
                          <input type="number" value={formState.duration_minutes} onChange={(event) => handleInputChange('duration_minutes', event.target.value)} min="1" />
                        </label>
                      </div>
                      <label>
                        Trạng thái
                        <select value={formState.status} onChange={(event) => handleInputChange('status', event.target.value)}>
                          <option value="Chua lam">Chưa làm</option>
                          <option value="Dang hoc">Đang học</option>
                          <option value="Da lam">Đã làm</option>
                        </select>
                      </label>
                      <label>
                        Focus
                        <textarea value={formState.focus} onChange={(event) => handleInputChange('focus', event.target.value)} rows={3} />
                      </label>
                      <label>
                        Parts JSON
                        <textarea value={formState.partsText} onChange={(event) => handleInputChange('partsText', event.target.value)} rows={8} />
                      </label>
                      <button type="submit" className="toeic-admin-primary-btn" disabled={saving}>
                        <FiSave />
                        <span>{saving ? 'Đang lưu...' : 'Lưu metadata'}</span>
                      </button>
                    </form>
                  </div>

                  <div className="toeic-admin-studio-column">
                    <div className="toeic-admin-panel">
                      <div className="toeic-admin-panel-head">
                        <div>
                          <h3>Saved Document Preview</h3>
                          <p>{loadingDetail ? 'Đang tải chi tiết đề...' : 'Preview đề đã lưu trong admin store.'}</p>
                        </div>
                      </div>
                      {loadingDetail ? <div className="state-card">Đang tải document...</div> : renderPreviewPane(currentWorkspaceDocument, selectedSkill, selectionContext, 'Saved')}
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <div className="state-card">
                Bộ đề này mới có metadata hoặc chưa import document. Chuyển sang tab `Import & Preview` để nạp cấu trúc TOEIC Part 1-7.
              </div>
            )}
          </>
        ) : null}

        {activeSection === 'import' ? (
          <>
            {draftDocument ? (
              <>
                <div className="toeic-admin-tab-row">
                  {getAvailableSkills(draftDocument).map((skill) => (
                    <button
                      key={skill}
                      className={`toeic-admin-tab ${selectedSkill === skill ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedSkill(skill);
                        setSelectedPartKey(getPartList(draftDocument, skill)[0]?.part_key || '');
                      }}
                    >
                      {SECTION_META[skill].label}
                    </button>
                  ))}
                </div>
                <div className="toeic-admin-part-tabs">
                  {getPartList(draftDocument, selectedSkill).map((part) => (
                    <button
                      key={part.part_key}
                      className={`toeic-admin-part-tab ${selectedPartKey === part.part_key ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedPartKey(part.part_key);
                        setSelectedQuestionId(getFirstQuestionId(draftDocument, selectedSkill, part.part_key));
                      }}
                    >
                      {`Part ${part.part_number} • ${part.title}`}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            <section className="toeic-admin-import-grid">
              <div className="toeic-admin-panel">
                <div className="toeic-admin-panel-head">
                  <div>
                    <h3>Import JSON Bundle</h3>
                    <p>
                      Preview chi tiết cần `exam_documents`. Legacy bundle `packs/themes/question_bank` vẫn import được nhưng không render đầy đủ workspace TOEIC.
                    </p>
                  </div>
                  <div className="toeic-admin-mini-actions">
                    <button className="toeic-admin-chip" onClick={handleLoadSample}>
                      <FiLayers />
                      <span>Load sample</span>
                    </button>
                    <button className="toeic-admin-chip" onClick={handleApplyDraftToForm} disabled={!draftDocument}>
                      <FiSave />
                      <span>Áp metadata</span>
                    </button>
                  </div>
                </div>

                <textarea
                  className="toeic-admin-import-textarea"
                  value={importText}
                  onChange={(event) => setImportText(event.target.value)}
                  rows={28}
                />

                <div className="toeic-admin-import-actions">
                  <button className="toeic-admin-primary-btn" onClick={handleImportJson} disabled={saving || !parsedImport.isValid}>
                    <FiUploadCloud />
                    <span>{saving ? 'Đang import...' : 'Import vào hệ thống'}</span>
                  </button>
                  <label className="toeic-admin-upload-btn">
                    <FiUploadCloud />
                    <span>Nạp file vào editor</span>
                    <input type="file" accept=".json,application/json" onChange={handleLoadFileToEditor} />
                  </label>
                </div>

                <div className="toeic-admin-import-summary">
                  <div className={`toeic-admin-inline-note ${parsedImport.isValid ? 'success' : 'error'}`}>
                    {parsedImport.isValid
                      ? parsedImport.documents.length
                        ? `Draft hợp lệ • ${parsedImport.documents.length} exam document`
                        : 'JSON hợp lệ nhưng chưa có `exam_documents` để preview chi tiết.'
                      : `JSON lỗi • ${parsedImport.error}`}
                  </div>
                  {parsedImport.legacy ? (
                    <div className="toeic-admin-legacy-grid">
                      <span>{parsedImport.legacy.packs} packs</span>
                      <span>{parsedImport.legacy.themes} themes</span>
                      <span>{parsedImport.legacy.questionGroups} question-bank items</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="toeic-admin-studio-column">
                <div className="toeic-admin-panel">
                  <div className="toeic-admin-panel-head">
                    <div>
                      <h3>Draft Preview</h3>
                      <p>{draftDocument ? `${draftDocument.title} • ${draftDocument.series}` : 'Chưa có document hợp lệ trong JSON.'}</p>
                    </div>
                  </div>
                  {draftDocument ? (
                    renderPreviewPane(draftDocument, selectedSkill, selectionContext, 'Draft')
                  ) : (
                    <div className="state-card">
                      Thêm `exam_documents` theo schema TOEIC để xem live preview Part 1-7 ngay trong admin.
                    </div>
                  )}
                </div>

                <div className="toeic-admin-panel">
                  <div className="toeic-admin-panel-head">
                    <div>
                      <h3>Format Guide</h3>
                      <p>Thiết kế import bám cấu trúc TOEIC Listening & Reading thay vì SAT passage/question block.</p>
                    </div>
                  </div>
                  <div className="toeic-admin-guide-grid compact">
                    {TOEIC_OFFICIAL_FORMAT.map((item) => (
                      <article key={item.key} className="toeic-admin-guide-card">
                        <span>{item.label}</span>
                        <strong>{item.title}</strong>
                        <small>{item.count} câu</small>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}

        {activeSection === 'students' ? (
          <section className="toeic-admin-panel">
            <div className="toeic-admin-panel-head">
              <div>
                <h3>Danh sách học viên</h3>
                <p>Đọc từ tài khoản đã đăng ký trong Web toeic.</p>
              </div>
            </div>

            <div className="toeic-admin-student-summary">
              <article className="toeic-admin-summary-card active">
                <span>Total</span>
                <strong>{studentSummary.total_students}</strong>
              </article>
              <article className="toeic-admin-summary-card online">
                <span>Online</span>
                <strong>{studentSummary.online_today}</strong>
              </article>
              <article className="toeic-admin-summary-card offline">
                <span>Offline</span>
                <strong>{studentSummary.offline_today}</strong>
              </article>
            </div>

            <div className="toeic-admin-student-list">
              {studentActivity.map((student) => (
                <article key={student.user_id} className="toeic-admin-student-row expanded">
                  <div className="toeic-admin-student-left">
                    <div className="toeic-admin-avatar">
                      {(student.display_name || student.email || 'T').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{student.display_name}</strong>
                      <p>{student.email}</p>
                    </div>
                  </div>

                  <div className="toeic-admin-student-stats">
                    <span>{student.total_xp} XP</span>
                    <span>{student.activities_count} hoạt động</span>
                    <span>{student.streak_days} ngày streak</span>
                    <span>{formatRelativeDay(student.last_activity_date)}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </div>
  );
}
