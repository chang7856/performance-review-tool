import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { 
  Trophy, 
  AlertTriangle, 
  TrendingUp, 
  User, 
  ClipboardList, 
  BarChart2,
  Brain,
  Target,
  Calendar,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Users,
  ChevronRight,
  Lock,
  ArrowLeft,
  Clock,
  Star,
  Loader2,
  Save,
  LogOut
} from 'lucide-react';

// --- Firebase Initialization Strategy ---
const getFirebaseConfig = () => {
  if (typeof __firebase_config !== 'undefined') {
    return JSON.parse(__firebase_config);
  }
  // 如果在本地開發，請在這裡填入您的 Firebase 設定
  const firebaseConfig = {
    apiKey: "AIzaSyA6LJI2j_RjDG3SZ4nSpVVPGjcCcYC6lGY",
    authDomain: "hr-system-7f00d.firebaseapp.com",
    projectId: "hr-system-7f00d",
    storageBucket: "hr-system-7f00d.firebasestorage.app",
    messagingSenderId: "808573268826",
    appId: "1:808573268826:web:415836f6204b1768bcb963",
    measurementId: "G-JS5Z18HSKC"
  };
  
};

const getAppId = () => {
  if (typeof __app_id !== 'undefined') {
    return __app_id;
  }
  return 'default-app-id';
};

const firebaseConfig = getFirebaseConfig();
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = getAppId();

// --- Shared Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "slate" }) => {
  const colors = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    blue: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    red: "bg-rose-50 text-rose-600 border border-rose-100",
    yellow: "bg-amber-50 text-amber-600 border border-amber-100",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};

// --- Login Component ---
const LoginScreen = ({ onLogin }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
      <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
        <Users size={32} />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">歡迎來到績效管理中心</h1>
        <p className="text-slate-500 mt-2 text-sm">請登入以存取您的團隊資料 (Google Auth)</p>
      </div>
      <button 
        onClick={onLogin}
        className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all hover:shadow-lg hover:-translate-y-0.5"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        使用 Google 帳號登入
      </button>
    </div>
  </div>
);

// --- Sub-Component: Employee List (Dashboard) ---
const EmployeeList = ({ employees, onSelect, onAdd, onDelete, loading, onLogout }) => {
  const [newEmpName, setNewEmpName] = useState('');

  const handleAdd = () => {
    if (!newEmpName.trim()) return;
    onAdd(newEmpName);
    setNewEmpName('');
  };

  const getStatusConfig = (level) => {
    switch(level) {
      case 'top': return { text: '卓越表現', color: 'green' };
      case 'middle': return { text: '穩定貢獻', color: 'blue' };
      case 'low': return { text: '需改善', color: 'red' };
      default: return { text: '尚未評估', color: 'slate' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400 bg-slate-50">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p>正在從資料庫載入團隊資料...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center md:justify-start gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-200">
              <Users size={24} />
            </div>
            團隊績效管理中心
          </h1>
          <p className="text-slate-500 mt-2 ml-1">高效率的主管儀表板：追蹤、評估與發展您的團隊。</p>
        </div>
        
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 text-sm font-medium transition-colors shadow-sm self-center md:self-end"
        >
          <LogOut size={16} /> 登出
        </button>
      </div>

      {/* Action Bar */}
      <div className="relative mb-8 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Plus className="text-slate-400" size={20} />
        </div>
        <input 
          type="text" 
          placeholder="輸入新員工姓名並按 Enter..." 
          className="w-full pl-11 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-lg"
          value={newEmpName}
          onChange={(e) => setNewEmpName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button 
          onClick={handleAdd}
          className="absolute right-2 top-2 bottom-2 bg-slate-900 hover:bg-slate-800 text-white px-6 rounded-xl font-medium transition-colors shadow-md"
        >
          新增
        </button>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <Users size={48} className="mb-4 opacity-20" />
            <p className="text-lg">目前沒有員工資料</p>
            <p className="text-sm opacity-60">請在上方輸入姓名開始</p>
          </div>
        ) : (
          employees.map(emp => {
            const status = getStatusConfig(emp.performanceLevel);
            return (
              <div 
                key={emp.id} 
                onClick={() => onSelect(emp.id)}
                className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden"
              >
                {/* Decorative top gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 font-bold text-xl shadow-inner">
                    {emp.info.name.charAt(0)}
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-slate-400 uppercase tracking-wider font-semibold">總分</span>
                    <span className="text-2xl font-bold text-slate-800">{emp.totalScore || '0.0'}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-xl text-slate-800 mb-1">{emp.info.name}</h3>
                  <div className="text-sm text-slate-500 h-5">{emp.info.role || '未設定職位'}</div>
                </div>
                  
                <div className="flex flex-wrap gap-2 items-center justify-between pt-4 border-t border-slate-50">
                  <Badge color={status.color}>{status.text}</Badge>
                  
                  {/* Attendance Mini Indicators */}
                  <div className="flex gap-1">
                      {emp.attendance?.late > 0 && <span className="w-2 h-2 rounded-full bg-amber-400" title={`遲到 ${emp.attendance.late} 次`} />}
                      {emp.attendance?.unexcused > 0 && <span className="w-2 h-2 rounded-full bg-rose-500" title={`曠職 ${emp.attendance.unexcused} 次`} />}
                  </div>
                </div>

                {/* Trash Button - MOVED to bottom-right to avoid overlap */}
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(emp.id); }}
                  className="absolute bottom-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                  title="刪除員工"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// --- Sub-Component: Employee Detail ---
const EmployeeDetail = ({ employee, onUpdate, onBack }) => {
  // Unpack employee data to local state for editing
  const [employeeInfo, setEmployeeInfo] = useState(employee.info);
  const [performanceLevel, setPerformanceLevel] = useState(employee.performanceLevel);
  const [scores, setScores] = useState(employee.scores);
  const [checkIns, setCheckIns] = useState(employee.checkIns);
  const [attendance, setAttendance] = useState(employee.attendance || { sick: 0, personal: 0, late: 0, unexcused: 0 }); 
  const [selfAssessment, setSelfAssessment] = useState(employee.selfAssessment);
  const [answers, setAnswers] = useState(employee.answers);
  const [isSaving, setIsSaving] = useState(false);
  
  // UI State
  const [newCheckIn, setNewCheckIn] = useState({ date: new Date().toISOString().slice(0, 10), note: '', score: 5 });
  const [showAllCheckIns, setShowAllCheckIns] = useState(false);

  // Sync Logic
  useEffect(() => {
    setIsSaving(true);
    const timer = setTimeout(() => {
      onUpdate({
        ...employee,
        info: employeeInfo,
        performanceLevel,
        scores,
        checkIns,
        attendance,
        selfAssessment,
        answers,
        totalScore: calculateTotalScore(),
        updatedAt: Date.now()
      });
      setIsSaving(false);
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [employeeInfo, performanceLevel, scores, checkIns, attendance, selfAssessment, answers]);

  useEffect(() => {
    if (checkIns.length > 0) {
      const sum = checkIns.reduce((acc, curr) => acc + parseInt(curr.score), 0);
      const avg = Math.round(sum / checkIns.length);
      if (scores.kpi !== avg) {
        setScores(prev => ({ ...prev, kpi: avg }));
      }
    }
  }, [checkIns]);

  const calculateTotalScore = () => {
    const total = (scores.kpi * 0.4) + (scores.behavior * 0.3) + (scores.potential * 0.2) + (scores.difficulty * 0.1);
    return total.toFixed(1);
  };

  const getAverageCheckInScore = () => {
    if (checkIns.length === 0) return 0;
    const sum = checkIns.reduce((acc, curr) => acc + parseInt(curr.score), 0);
    return (sum / checkIns.length).toFixed(1);
  };

  const handleAddCheckIn = () => {
    if (!newCheckIn.note) return;
    const newEntry = { ...newCheckIn, id: Date.now() };
    setCheckIns([newEntry, ...checkIns]);
    setNewCheckIn({ ...newCheckIn, note: '', score: 5 });
    setShowAllCheckIns(false);
  };

  const handleDeleteCheckIn = (id) => {
    setCheckIns(checkIns.filter(c => c.id !== id));
  };

  const handleAttendanceChange = (type, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setAttendance(prev => ({ ...prev, [type]: numValue }));
  };

  // Questions Config
  const questionsConfig = {
    top: {
      title: "針對卓越表現者",
      color: "bg-emerald-50 text-emerald-900 border-emerald-200",
      accent: "text-emerald-600",
      icon: <Trophy className="w-6 h-6 text-emerald-500" />,
      description: "重點在於「留才」與「複製成功模式」。",
      questions: [
        { id: 'q1', label: "他們做對了什麼？這個成功模式能否複製給團隊其他人？", placeholder: "例如：他在專案管理上的SOP非常清晰..." },
        { id: 'q2', label: "目前的工作是否還有挑戰性？是否需要擴大職責？", placeholder: "評估是否讓他帶新人或負責更難的專案..." },
        { id: 'q3', label: "如何確保他們不會離職？（激勵因子是什麼？）", placeholder: "加薪？升遷？更多自由度？" }
      ]
    },
    middle: {
      title: "針對穩定貢獻者",
      color: "bg-indigo-50 text-indigo-900 border-indigo-200",
      accent: "text-indigo-600",
      icon: <TrendingUp className="w-6 h-6 text-indigo-500" />,
      description: "重點在於「提升標準」與「找出成長阻礙」。",
      questions: [
        { id: 'q1', label: "從「好」到「卓越」的具體差距在哪裡？", placeholder: "是技能不足，還是主動性不夠？" },
        { id: 'q2', label: "這是一個「能力（Skill）」問題還是「意願（Will）」問題？", placeholder: "如果是能力，安排培訓；如果是意願，溝通動機..." },
        { id: 'q3', label: "設定什麼樣的短期目標可以讓他們獲得「小贏」的信心？", placeholder: "下個月的具體KPI..." }
      ]
    },
    low: {
      title: "針對需改善者",
      color: "bg-rose-50 text-rose-900 border-rose-200",
      accent: "text-rose-600",
      icon: <AlertTriangle className="w-6 h-6 text-rose-500" />,
      description: "重點在於「釐清期望」與「設定底線」。",
      questions: [
        { id: 'q1', label: "員工本人是否清楚知道自己的表現未達標？", placeholder: "有沒有具體的數據或事件證明？" },
        { id: 'q2', label: "是否存在外部阻礙（資源不足、權責不清）導致表現不佳？", placeholder: "排除非戰之罪..." },
        { id: 'q3', label: "具體的改進計畫 (PIP) 與時間表為何？", placeholder: "一個月內需要達成的具體事項..." },
        { id: 'q4', label: "如果情況未改善，後續行動是什麼？", placeholder: "調職？資遣？降級？" }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {employeeInfo.name || '新員工'}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium border border-slate-200">
                {employeeInfo.role || '職位未定'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-end gap-1">
               {isSaving ? <span className="flex items-center text-indigo-400"><Loader2 size={10} className="animate-spin mr-1"/> 儲存中...</span> : <span className="flex items-center text-emerald-500"><Save size={10} className="mr-1"/> 已儲存</span>}
            </div>
            <div className="text-2xl font-black text-indigo-600 leading-none">{calculateTotalScore()}</div>
          </div>
          <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
            <BarChart2 size={20} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* --- LEFT COLUMN (First Session): Stats & Data --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              
              {/* 1. Basic Info Card */}
              <Card className="p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User size={14} /> 基本資料
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">姓名</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      value={employeeInfo.name}
                      onChange={e => setEmployeeInfo({...employeeInfo, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">職位</label>
                      <input 
                        type="text" 
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        value={employeeInfo.role}
                        onChange={e => setEmployeeInfo({...employeeInfo, role: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">考核月份</label>
                      <input 
                        type="month" 
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        value={employeeInfo.reviewPeriod}
                        onChange={e => setEmployeeInfo({...employeeInfo, reviewPeriod: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* 2. Scoring Card */}
              <Card className="p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Target size={14} /> 量化指標評分
                </h3>
                
                <div className="space-y-8">
                  {/* KPI Slider (Locked) */}
                  <div className="relative pt-2">
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                        KPI 達成率 <span className="text-xs font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">40%</span>
                      </label>
                      <div className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-1 rounded text-xs font-bold">
                        <Lock size={10} /> {scores.kpi}
                      </div>
                    </div>
                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-slate-300 w-full opacity-50" /> {/* Disabled track look */}
                      <div className="absolute top-0 left-0 h-full bg-indigo-500" style={{ width: `${scores.kpi * 10}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <TrendingUp size={10} /> 自動同步自平時考核
                    </p>
                  </div>

                  {/* Manual Sliders */}
                  {[
                    { label: '核心行為/價值觀', weight: '30%', key: 'behavior', color: 'bg-emerald-500' },
                    { label: '發展潛力', weight: '20%', key: 'potential', color: 'bg-blue-500' },
                    { label: '任務難度係數', weight: '10%', key: 'difficulty', color: 'bg-purple-500' }
                  ].map((metric) => (
                    <div key={metric.key} className="relative">
                      <div className="flex justify-between items-end mb-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                          {metric.label} <span className="text-xs font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{metric.weight}</span>
                        </label>
                        <span className="text-sm font-bold text-slate-800">{scores[metric.key]}</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" max="10" 
                        value={scores[metric.key]} 
                        onChange={(e) => setScores({...scores, [metric.key]: parseInt(e.target.value)})} 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800 hover:accent-indigo-600 transition-all" 
                      />
                      <div className="flex justify-between mt-1 text-[10px] text-slate-300 px-1">
                        <span>1</span><span>5</span><span>10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* --- RIGHT COLUMN (Second Session): Content & Log --- */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Check-ins (Timeline Style) - Moved to TOP of Second Session */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Calendar size={18} />
                  </div>
                  平時考核紀錄
                </h3>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                  平均分數: {getAverageCheckInScore()}
                </div>
              </div>

              {/* Input Area */}
              <div className="flex flex-col sm:flex-row gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl mb-6">
                <input 
                  type="date" 
                  value={newCheckIn.date}
                  onChange={e => setNewCheckIn({...newCheckIn, date: e.target.value})}
                  className="p-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                />
                <input 
                  type="text" 
                  placeholder="紀錄關鍵事件..." 
                  value={newCheckIn.note}
                  onChange={e => setNewCheckIn({...newCheckIn, note: e.target.value})}
                  className="flex-1 p-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                />
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="1" max="10" 
                    placeholder="分"
                    value={newCheckIn.score}
                    onChange={e => setNewCheckIn({...newCheckIn, score: e.target.value})}
                    className="w-16 p-2 border border-slate-200 rounded-lg text-sm bg-white text-center focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                  <button 
                    onClick={handleAddCheckIn}
                    className="p-2 bg-slate-800 hover:bg-indigo-600 text-white rounded-lg transition-colors shadow-sm"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Timeline List */}
              <div className="space-y-4 relative pl-2">
                {checkIns.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    尚無紀錄，請建立第一筆資料
                  </div>
                ) : (
                  <>
                    <div className="absolute top-0 bottom-0 left-[19px] w-0.5 bg-slate-100" /> {/* Vertical Line */}
                    {(showAllCheckIns ? checkIns : checkIns.slice(0, 4)).map((checkIn) => (
                      <div key={checkIn.id} className="relative pl-8 group">
                        {/* Timeline Dot */}
                        <div className={`absolute left-3 top-3 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${checkIn.score >= 8 ? 'bg-emerald-400' : checkIn.score <= 4 ? 'bg-rose-400' : 'bg-slate-400'}`} />
                        
                        <div className="bg-white border border-slate-100 p-4 rounded-xl hover:shadow-md transition-shadow flex justify-between items-start">
                          <div>
                            <div className="text-xs text-slate-400 font-mono mb-1">{checkIn.date}</div>
                            <p className="text-slate-700 text-sm font-medium leading-relaxed">{checkIn.note}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-4">
                             <span className={`text-sm font-bold ${checkIn.score >= 8 ? 'text-emerald-600' : checkIn.score <= 4 ? 'text-rose-600' : 'text-indigo-600'}`}>
                              {checkIn.score} <span className="text-[10px] text-slate-400 font-normal">分</span>
                            </span>
                            <button 
                              onClick={() => handleDeleteCheckIn(checkIn.id)}
                              className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {checkIns.length > 4 && (
                      <button 
                        onClick={() => setShowAllCheckIns(!showAllCheckIns)}
                        className="w-full py-3 text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 rounded-xl border border-dashed border-slate-200 mt-4 transition-colors z-10 relative"
                      >
                        {showAllCheckIns ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {showAllCheckIns ? '收合紀錄' : `顯示其餘 ${checkIns.length - 4} 筆紀錄`}
                      </button>
                    )}
                  </>
                )}
              </div>
            </Card>

            {/* 2. Attendance Card - Moved BELOW Check-ins in Second Session */}
            <Card className="p-5">
              <h3 className="text-base font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock size={18} className="text-slate-600" /> 出缺勤統計
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: '病假', key: 'sick', color: 'bg-slate-50 text-slate-700' },
                  { label: '事假', key: 'personal', color: 'bg-slate-50 text-slate-700' },
                  { label: '遲到', key: 'late', color: attendance.late > 0 ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-slate-50 text-slate-700' },
                  { label: '曠職', key: 'unexcused', color: attendance.unexcused > 0 ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' : 'bg-slate-50 text-slate-700' }
                ].map((item) => (
                  <div key={item.key} className={`rounded-xl p-3 flex flex-col items-center justify-center transition-colors ${item.color}`}>
                    <span className="text-xs font-medium opacity-70 mb-1">{item.label}</span>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full bg-transparent text-center text-2xl font-bold outline-none focus:scale-110 transition-transform p-0 m-0 border-none shadow-none"
                      value={attendance[item.key]}
                      onChange={(e) => handleAttendanceChange(item.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* 3. Self Assessment */}
            <Card className="p-6 bg-gradient-to-br from-white to-slate-50">
              <h3 className="text-base font-bold text-slate-700 mb-6 flex items-center gap-2">
                 <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                    <Brain size={18} />
                  </div>
                員工自評整合
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <Star size={12} className="text-amber-400 fill-amber-400" /> 優點與成就 (Strengths)
                  </label>
                  <textarea 
                    className="w-full p-4 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-100 focus:border-amber-300 outline-none transition-all shadow-sm"
                    rows="3"
                    placeholder="紀錄員工自述..."
                    value={selfAssessment.strengths}
                    onChange={e => setSelfAssessment({...selfAssessment, strengths: e.target.value})}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <AlertTriangle size={12} className="text-slate-400" /> 盲點與挑戰 (Blind Spots)
                  </label>
                  <textarea 
                    className="w-full p-4 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none transition-all shadow-sm"
                    rows="2"
                    placeholder="紀錄員工自述..."
                    value={selfAssessment.blindSpots}
                    onChange={e => setSelfAssessment({...selfAssessment, blindSpots: e.target.value})}
                  />
                </div>
              </div>
            </Card>

            {/* 4. Performance Level Selection */}
            <section>
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                  <div className="p-1.5 bg-slate-800 text-white rounded-lg">
                    <ClipboardList size={18} />
                  </div>
                  績效定位
                </h3>
                <span className="text-xs text-slate-400">請點選下方卡片選擇</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { id: 'top', icon: <Trophy size={24} />, label: '卓越表現', sub: 'Top Performer', color: 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200' },
                  { id: 'middle', icon: <TrendingUp size={24} />, label: '穩定貢獻', sub: 'Middle Performer', color: 'border-indigo-500 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-200' },
                  { id: 'low', icon: <AlertTriangle size={24} />, label: '需改善', sub: 'Low Performer', color: 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-200' }
                ].map((option) => (
                  <button 
                    key={option.id}
                    onClick={() => setPerformanceLevel(option.id)}
                    className={`relative p-5 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${performanceLevel === option.id ? `${option.color} shadow-lg scale-105 z-10` : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <div className={performanceLevel === option.id ? '' : 'grayscale opacity-60'}>{option.icon}</div>
                    <div className="text-center">
                      <span className="block font-bold text-lg">{option.label}</span>
                      <span className="text-[10px] uppercase tracking-widest opacity-70">{option.sub}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Dynamic Questions Panel */}
              {performanceLevel && (
                <div className={`rounded-2xl p-6 md:p-8 border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ${questionsConfig[performanceLevel].color}`}>
                  <div className="flex items-start gap-4 mb-8">
                    <div className="p-3 bg-white rounded-xl shadow-sm">{questionsConfig[performanceLevel].icon}</div>
                    <div>
                      <h4 className={`font-bold text-xl ${questionsConfig[performanceLevel].accent}`}>{questionsConfig[performanceLevel].title}</h4>
                      <p className="text-sm opacity-80 mt-1 max-w-lg leading-relaxed">{questionsConfig[performanceLevel].description}</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {questionsConfig[performanceLevel].questions.map((q, idx) => (
                      <div key={q.id} className="bg-white/60 p-4 rounded-xl border border-white/50 shadow-sm focus-within:shadow-md focus-within:bg-white transition-all">
                        <label className="block font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-white text-xs">{idx + 1}</span>
                          {q.label}
                        </label>
                        <textarea
                          className="w-full p-3 bg-transparent border-b-2 border-slate-200 focus:border-slate-800 rounded-none text-sm outline-none min-h-[80px] transition-colors resize-none placeholder:text-slate-400"
                          placeholder={q.placeholder}
                          value={answers[q.id] || ''}
                          onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
const PerformanceReviewApp = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Auth Init
  useEffect(() => {
    const initAuth = async () => {
      // Prioritize system token (for embedding), otherwise wait for user action
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } 
      // Removed automatic anonymous login to support Google Auth request
    };
    initAuth();
    
    // Auth State Observer
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false); // Stop loading once auth is determined (logged in or out)
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Sync
  useEffect(() => {
    if (!user) {
      setEmployees([]);
      return;
    }
    
    setLoading(true);
    // Path: /artifacts/{appId}/users/{userId}/employees
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'employees');
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort manually
      data.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setEmployees(data);
      setLoading(false);
    }, (error) => {
      console.error("Fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Handlers
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
      // Fallback for preview envs where popups might be blocked
      alert("登入失敗: " + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setSelectedEmpId(null);
  };

  const handleSelectEmployee = (id) => setSelectedEmpId(id);
  
  const handleAddEmployee = async (name) => {
    if (!user) return;
    const newId = String(Date.now());
    const newEmp = {
      info: { name, role: '', department: '', reviewPeriod: new Date().toISOString().slice(0, 7) },
      performanceLevel: null,
      scores: { kpi: 5, behavior: 5, potential: 5, difficulty: 5 },
      attendance: { sick: 0, personal: 0, late: 0, unexcused: 0 },
      checkIns: [],
      selfAssessment: { strengths: '', blindSpots: '' },
      answers: {},
      updatedAt: Date.now()
    };
    
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'employees', newId), newEmp);
    } catch (e) {
      console.error("Error adding:", e);
    }
  };

  const handleUpdateEmployee = async (updatedEmp) => {
    if (!user) return;
    const { id, ...data } = updatedEmp;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'employees', id), {
        ...data,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {
      console.error("Error updating:", e);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!user) return;
    if (window.confirm('確定要刪除這位員工的資料嗎？此動作無法復原。')) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'employees', id));
        if (selectedEmpId === id) setSelectedEmpId(null);
      } catch (e) {
        console.error("Error deleting:", e);
      }
    }
  };

  // 4. Render Logic
  if (loading && !user) {
    // Initial loading state
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400 bg-slate-50">
        <Loader2 className="animate-spin mb-4" size={48} />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (selectedEmpId) {
    const targetEmployee = employees.find(e => e.id === selectedEmpId);
    if (!targetEmployee) {
      if (!loading) setSelectedEmpId(null);
      return null;
    }

    return (
      <EmployeeDetail 
        key={targetEmployee.id}
        employee={targetEmployee} 
        onUpdate={handleUpdateEmployee}
        onBack={() => setSelectedEmpId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <EmployeeList 
        employees={employees} 
        onSelect={handleSelectEmployee} 
        onAdd={handleAddEmployee}
        onDelete={handleDeleteEmployee}
        loading={loading}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default PerformanceReviewApp;