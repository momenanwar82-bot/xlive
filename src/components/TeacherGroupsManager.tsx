import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  PlusCircle, 
  PhoneCall, 
  UserPlus, 
  UserMinus, 
  Trash2, 
  Sparkles, 
  Video, 
  X, 
  Zap, 
  Search, 
  Check, 
  GraduationCap, 
  Dumbbell, 
  Globe, 
  Code,
  Layers,
  AlertCircle
} from 'lucide-react';
import { CategoryType, GroupMember, TeacherGroup } from '../types';
import { CATEGORIES } from '../data/mockData';

export const TeacherGroupsManager: React.FC = () => {
  const { 
    currentUser, 
    groups, 
    allStudents, 
    createTeacherGroup, 
    deleteTeacherGroup, 
    addMemberToGroup, 
    removeMemberFromGroup, 
    startGroupLiveCall,
    openExpandGroupsModal 
  } = useApp();

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState<CategoryType>('fitness');
  const [newGroupCoverColor, setNewGroupCoverColor] = useState('from-emerald-500 to-teal-600');
  const [createError, setCreateError] = useState<string | null>(null);

  // Member management modal state
  const [activeManagingGroup, setActiveManagingGroup] = useState<TeacherGroup | null>(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Quick custom student add
  const [customStudentName, setCustomStudentName] = useState('');

  if (!currentUser) return null;

  const myGroups = groups.filter(g => g.teacherId === currentUser.id);
  const maxAllowed = currentUser.maxGroupsAllowed || 3;
  const isLimitReached = myGroups.length >= maxAllowed;

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!newGroupName.trim()) {
      setCreateError('يرجى كتابة اسم المجموعة');
      return;
    }

    const res = createTeacherGroup({
      name: newGroupName,
      description: newGroupDescription,
      category: newGroupCategory,
      coverColor: newGroupCoverColor
    });

    if (!res.success && res.error) {
      setCreateError(res.error);
    } else {
      setNewGroupName('');
      setNewGroupDescription('');
      setIsCreatingGroup(false);
    }
  };

  const handleAddCustomStudent = (groupId: string) => {
    if (!customStudentName.trim()) return;
    const newStudent: GroupMember = {
      id: 'student-' + Date.now(),
      name: customStudentName.trim(),
      email: `${customStudentName.trim().replace(/\s+/g, '.').toLowerCase()}@live.com`,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`,
      role: 'student',
      joinedAt: 'الآن'
    };
    addMemberToGroup(groupId, newStudent);
    setCustomStudentName('');
  };

  // Helper to get current updated group object
  const currentOpenGroup = activeManagingGroup 
    ? groups.find(g => g.id === activeManagingGroup.id) || activeManagingGroup
    : null;

  const filteredPlatformStudents = allStudents.filter(s => 
    s.name.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Group Allowance Meter */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>مجموعات المعلم واللايفات التفاعلية</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {myGroups.length} من {maxAllowed} مجموعات
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              أنشئ مجموعات خاصة لطلابك، أضف أو أزل الأعضاء، واضغط <strong>زر الاتصال داخل المجموعة</strong> لبدء لايف فوري معهم!
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* 30 EGP Expansion button */}
            <button
              onClick={openExpandGroupsModal}
              id="btn-expand-groups-top"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              title="توسيع سعة المجموعات بـ 30 ج.م فقط"
            >
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>توسيع المجموعات (30 ج.م)</span>
            </button>

            {/* Create Group button */}
            <button
              onClick={() => {
                if (isLimitReached) {
                  openExpandGroupsModal();
                } else {
                  setIsCreatingGroup(true);
                }
              }}
              id="btn-create-new-group"
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                isLimitReached 
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isLimitReached ? 'توسيع لإنشاء رابعة (30 ج)' : 'إنشاء مجموعة جديدة'}</span>
            </button>
          </div>
        </div>

        {/* Limit Warning banner if 3/3 reached */}
        {isLimitReached && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-300 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                لقد أنشأت الحد الأقصى الافتراضي (<strong>{maxAllowed} مجموعات</strong>). يمكنك توسيع إنشاء المجموعات بـ <strong>30 ج.م فقط</strong> وإضافة مجموعات بلا حدود.
              </span>
            </div>
            <button
              onClick={openExpandGroupsModal}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shrink-0"
            >
              توسيع الآن بـ 30 ج.م
            </button>
          </div>
        )}
      </div>

      {/* Groups Grid */}
      {myGroups.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">لم تقم بإنشاء أي مجموعة بعد</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              ابدأ الآن بإنشاء أول مجموعة لك (مثلاً: مجموعة تدريب اللياقة، أو فصل ثانوية عامة)، وأضف الطلاب ثم ابدأ معهم لايف بضغطة زر الاتصال.
            </p>
          </div>
          <button
            onClick={() => setIsCreatingGroup(true)}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إنشاء مجموعتك الأولى مجاناً</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myGroups.map(group => {
            const categoryObj = CATEGORIES.find(c => c.id === group.category);

            return (
              <div 
                key={group.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-lg hover:border-slate-700 transition-all group"
                id={`teacher-group-${group.id}`}
              >
                {/* Card Header with gradient background */}
                <div className={`p-4 bg-gradient-to-r ${group.coverColor || 'from-emerald-600 to-teal-600'} text-white relative`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-black/30 backdrop-blur-sm text-white">
                      {categoryObj?.label || 'مجموعة عامة'}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف مجموعة "${group.name}"؟`)) {
                          deleteTeacherGroup(group.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-black/20 hover:bg-rose-500 text-white transition-colors"
                      title="حذف المجموعة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="font-extrabold text-base text-white mt-2 line-clamp-1">
                    {group.name}
                  </h3>
                  <p className="text-[11px] text-white/80 line-clamp-2 mt-1 leading-relaxed">
                    {group.description}
                  </p>
                </div>

                {/* Group Body: Members preview */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  
                  {/* Members count & avatars */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>الأعضاء المشتركون ({group.members.length})</span>
                      </span>
                      <button
                        onClick={() => setActiveManagingGroup(group)}
                        className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        إدارة الأعضاء (إضافة/إزالة)
                      </button>
                    </div>

                    {group.members.length === 0 ? (
                      <div className="p-3 bg-slate-950 rounded-xl border border-dashed border-slate-800 text-center">
                        <p className="text-[11px] text-slate-500">لا يوجد طلاب في هذه المجموعة بعد</p>
                        <button
                          onClick={() => setActiveManagingGroup(group)}
                          className="mt-1.5 text-[10px] text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>إضافة أول طالب للمجموعة</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 overflow-hidden py-1">
                        <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                          {group.members.slice(0, 5).map(m => (
                            <img
                              key={m.id}
                              src={m.avatar}
                              alt={m.name}
                              title={m.name}
                              className="w-8 h-8 rounded-full ring-2 ring-slate-900 object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ))}
                        </div>
                        {group.members.length > 5 && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
                            +{group.members.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* PROMINENT LIVE CALL BUTTON INSIDE GROUP */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <button
                      onClick={() => startGroupLiveCall(group.id)}
                      id={`btn-call-group-${group.id}`}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all group-hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-950/20 flex items-center justify-center animate-pulse">
                        <PhoneCall className="w-4 h-4 text-slate-950 fill-slate-950" />
                      </div>
                      <span>📞 زر الاتصال (بدء لايف المجموعة الآن)</span>
                    </button>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                      <span className="flex items-center gap-1">
                        <Video className="w-3 h-3 text-cyan-400" />
                        <span>غرفة تفاعلية شبه الماسنجر</span>
                      </span>
                      <span>أنشئت: {group.createdAt}</span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {isCreatingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white relative">
              <button
                onClick={() => setIsCreatingGroup(false)}
                className="absolute top-4 left-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-black flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                <span>إنشاء مجموعة جديدة للمعلم</span>
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                متبقي لك {maxAllowed - myGroups.length} مجموعات من باقتك الحالية ({maxAllowed} مجموعات).
              </p>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  اسم المجموعة <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="مثال: مجموعة تحدي اللياقة البدنية، أو أبطال محادثة الإنجليزي"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  وصف المجموعة وهدف اللايفات بها
                </label>
                <textarea
                  value={newGroupDescription}
                  onChange={e => setNewGroupDescription(e.target.value)}
                  rows={2}
                  placeholder="وصف مختصر لمواعيد اللايفات وما سيتم تناوله في المكالمات المباشرة..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  القسم والتصنيف
                </label>
                <select
                  value={newGroupCategory}
                  onChange={e => setNewGroupCategory(e.target.value as CategoryType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  لون غلاف المجموعة
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { label: 'أخضر', value: 'from-emerald-500 to-teal-600' },
                    { label: 'برتقالي', value: 'from-amber-500 to-orange-600' },
                    { label: 'أزرق', value: 'from-cyan-500 to-blue-600' },
                    { label: 'بنفسجي', value: 'from-purple-500 to-indigo-600' },
                    { label: 'وردي', value: 'from-rose-500 to-pink-600' }
                  ].map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNewGroupCoverColor(c.value)}
                      className={`h-8 flex-1 rounded-xl bg-gradient-to-r ${c.value} transition-all flex items-center justify-center ${
                        newGroupCoverColor === c.value ? 'ring-2 ring-white scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {newGroupCoverColor === c.value && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingGroup(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  id="btn-confirm-create-group"
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20"
                >
                  إنشاء المجموعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMBER MANAGEMENT MODAL (إضافة / إزالة من يريد) */}
      {currentOpenGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    إدارة أعضاء المجموعة: {currentOpenGroup.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    يمكنك إضافة من تريد أو إزالة من تريد من طلاب المجموعة
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveManagingGroup(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Quick Add Custom Student */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  إضافة طالب جديد مباشرة بالاسم:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customStudentName}
                    onChange={e => setCustomStudentName(e.target.value)}
                    placeholder="اسم الطالب (مثال: محمد سعيد)..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomStudent(currentOpenGroup.id);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomStudent(currentOpenGroup.id)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>إضافة</span>
                  </button>
                </div>
              </div>

              {/* Current Members Section (مع خيار الإزالة) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>الأعضاء الحاليون في المجموعة ({currentOpenGroup.members.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    يمكنك إزالة أي عضو في أي وقت
                  </span>
                </div>

                {currentOpenGroup.members.length === 0 ? (
                  <div className="p-4 bg-slate-950/50 rounded-xl text-center text-xs text-slate-500 border border-slate-800">
                    لا يوجد أعضاء حالياً في هذه المجموعة. استخدم القائمة أدناه لإضافة الطلاب.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentOpenGroup.members.map(member => (
                      <div 
                        key={member.id}
                        className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-xs font-bold text-white">{member.name}</p>
                            <p className="text-[10px] text-slate-400">{member.email}</p>
                          </div>
                        </div>

                        {/* زر الإزالة كما طلب المستخدم بدقة (إزالة من يريد) */}
                        <button
                          onClick={() => removeMemberFromGroup(currentOpenGroup.id, member.id)}
                          className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          title="إزالة الطالب من المجموعة"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>إزالة</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Platform Students to Add (إضافة من يريد) */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-cyan-400" />
                    <span>طلاب مسجلين بالمنصة للإضافة السريعة</span>
                  </h4>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={studentSearchTerm}
                    onChange={e => setStudentSearchTerm(e.target.value)}
                    placeholder="ابحث عن طالب بالاسم..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-9 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {filteredPlatformStudents.map(student => {
                    const isAlreadyInGroup = currentOpenGroup.members.some(m => m.id === student.id);

                    return (
                      <div 
                        key={student.id}
                        className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-xs font-bold text-white">{student.name}</p>
                            <p className="text-[10px] text-slate-400">{student.email}</p>
                          </div>
                        </div>

                        {isAlreadyInGroup ? (
                          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10">
                            <Check className="w-3.5 h-3.5" />
                            <span>مضاف بالمجموعة</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => addMemberToGroup(currentOpenGroup.id, student)}
                            className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>إضافة للمجموعة</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400">
                إجمالي الأعضاء الآن: <strong>{currentOpenGroup.members.length}</strong> طالب
              </span>
              <button
                onClick={() => setActiveManagingGroup(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                تم والعودة للمجموعات
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
