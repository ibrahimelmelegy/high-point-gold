<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4 mb-6">
      <button @click="$emit('back')" class="p-2 rounded-lg hover:bg-white/5">
        <span class="text-xl">←</span>
      </button>
      <div>
        <h2 class="text-xl font-bold text-white">{{ t('title') }}</h2>
        <p class="text-sm text-slate-500">{{ t('desc') }}</p>
      </div>
    </div>

    <!-- Add Goal Button -->
    <button @click="showModal = true" class="btn-primary w-full">
      + {{ t('addGoal') }}
    </button>

    <!-- Goals List -->
    <div class="space-y-4">
      <div v-for="(goal, idx) in goals" :key="idx" class="card p-5">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ goal.icon }}</span>
            <div>
              <p class="font-bold text-white">{{ goal.name }}</p>
              <p class="text-xs text-slate-500">{{ lang === 'ar' ? 'الهدف' : 'Target' }}: {{ (goal.targetAmount || 0).toLocaleString() }} {{ currency }}</p>
            </div>
          </div>
          <button @click="removeGoal(idx)" class="text-slate-500 hover:text-red-400">
            <span class="text-xl">🗑️</span>
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="flex justify-between text-xs text-slate-400 mb-2">
            <span>{{ lang === 'ar' ? 'التقدم' : 'Progress' }}: {{ (goal.currentAmount || 0).toLocaleString() }}</span>
            <span>{{ progressPercent(goal).toFixed(1) }}%</span>
          </div>
          <div class="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div 
              :class="[
                'h-full rounded-full transition-all duration-500',
                progressPercent(goal) >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-yellow-500'
              ]"
              :style="{ width: Math.min(progressPercent(goal), 100) + '%' }"
            ></div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3">
          <div class="p-2 rounded-xl bg-[var(--bg-tertiary)]">
            <p class="text-[10px] text-slate-500 mb-1">{{ lang === 'ar' ? 'متبقي' : 'Remaining' }}</p>
            <p class="font-bold text-white text-sm">{{ (goal.targetAmount - goal.currentAmount || 0).toLocaleString() }}</p>
          </div>
          <div class="p-2 rounded-xl bg-[var(--bg-tertiary)]">
            <p class="text-[10px] text-slate-500 mb-1">{{ lang === 'ar' ? 'شهريًا' : 'Monthly' }}</p>
            <p class="font-bold text-amber-400 text-sm">{{ (monthlyRequired(goal) || 0).toLocaleString() }}</p>
          </div>
          <div class="p-2 rounded-xl bg-[var(--bg-tertiary)]">
            <p class="text-[10px] text-slate-500 mb-1">{{ lang === 'ar' ? 'أيام' : 'Days' }}</p>
            <p class="font-bold text-blue-400 text-sm">{{ daysUntilDeadline(goal) }}</p>
          </div>
        </div>

        <!-- Add Progress Button -->
        <button 
          @click="showAddProgress(idx)"
          class="w-full mt-3 py-2 rounded-xl bg-[var(--bg-tertiary)] text-slate-400 hover:text-amber-400 hover:border-amber-500 border border-[var(--border-primary)] transition-all text-sm font-semibold"
        >
          + {{ lang === 'ar' ? 'تحديث التقدم' : 'Update Progress' }}
        </button>

        <!-- Achievement Badge -->
        <div v-if="progressPercent(goal) >= 100" class="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <p class="text-sm font-bold text-emerald-400">🎉 {{ lang === 'ar' ? 'تم تحقيق الهدف!' : 'Goal Achieved!' }}</p>
        </div>
      </div>

      <div v-if="goals.length === 0" class="text-center py-8 text-slate-500">
        <span class="text-4xl mb-2 block">🎯</span>
        {{ lang === 'ar' ? 'لا توجد أهداف بعد' : 'No goals yet' }}
      </div>
    </div>

    <!-- Add Goal Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="closeModal"></div>
          
          <div class="relative bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-white">{{ editingGoalIdx === null ? t('addGoal') : t('updateProgress') }}</h3>
              <button @click="closeModal" class="p-2 hover:bg-white/5 rounded-lg">
                <span class="text-xl text-slate-400">✕</span>
              </button>
            </div>

            <!-- Add Goal Form -->
            <div v-if="editingGoalIdx === null" class="space-y-4">
              <div>
                <label class="block text-xs text-slate-500 mb-2 font-medium">{{ t('goalName') }}</label>
                <input 
                  v-model="newGoal.name" 
                  type="text" 
                  :placeholder="lang === 'ar' ? 'مثال: شراء 100 جرام ذهب' : 'e.g., Buy 100g Gold'"
                  class="input w-full"
                />
              </div>

              <div>
                <label class="block text-xs text-slate-500 mb-2 font-medium">{{ t('targetAmount') }}</label>
                <input 
                  v-model.number="newGoal.targetAmount" 
                  type="number" 
                  :placeholder="t('enterAmount')"
                  class="input w-full"
                />
              </div>

              <div>
                <label class="block text-xs text-slate-500 mb-2 font-medium">{{ t('currentAmount') }}</label>
                <input 
                  v-model.number="newGoal.currentAmount" 
                  type="number" 
                  :placeholder="lang === 'ar' ? 'المبلغ الحالي' : 'Current amount'"
                  class="input w-full"
                />
              </div>

              <div>
                <label class="block text-xs text-slate-500 mb-2 font-medium">{{ t('deadline') }}</label>
                <input 
                  v-model="newGoal.deadline" 
                  type="date" 
                  class="input w-full"
                />
              </div>

              <div>
                <label class="block text-xs text-slate-500 mb-2 font-medium">{{ t('icon') }}</label>
                <div class="flex gap-2">
                  <button 
                    v-for="icon in goalIcons" 
                    :key="icon"
                    @click="newGoal.icon = icon"
                    :class="[
                      'w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all',
                      newGoal.icon === icon ? 'bg-amber-500/20 border-2 border-amber-500' : 'bg-[var(--bg-tertiary)] border border-[var(--border-primary)]'
                    ]"
                  >
                    {{ icon }}
                  </button>
                </div>
              </div>

              <div class="flex gap-3 pt-2">
                <button @click="closeModal" class="btn-secondary flex-1">{{ t('cancel') }}</button>
                <button 
                  @click="addGoal" 
                  :disabled="!newGoal.name || !newGoal.targetAmount"
                  class="btn-primary flex-1 disabled:opacity-50"
                >
                  {{ t('create') }}
                </button>
              </div>
            </div>

            <!-- Update Progress Form -->
            <div v-else class="space-y-4">
              <div>
                <label class="block text-xs text-slate-500 mb-2 font-medium">{{ t('addAmount') }}</label>
                <input 
                  v-model.number="progressAmount" 
                  type="number" 
                  :placeholder="t('enterAmount')"
                  class="input w-full"
                />
              </div>

              <div class="flex gap-3">
                <button @click="closeModal" class="btn-secondary flex-1">{{ t('cancel') }}</button>
                <button @click="updateProgress" class="btn-primary flex-1">{{ t('update') }}</button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
const props = defineProps({
  currency: { type: String, default: 'USD' },
  lang: { type: String, default: 'ar' }
});

const showModal = ref(false);
const goals = ref([]);
const editingGoalIdx = ref(null);
const progressAmount = ref(0);

const goalIcons = ['🎯', '🏆', '💰', '💎', '🥇', '📈'];

const newGoal = ref({
  name: '',
  targetAmount: null,
  currentAmount: 0,
  deadline: '',
  icon: '🎯'
});

const translations = {
  ar: {
    title: 'الأهداف الاستثمارية',
    desc: 'حدد أهدافك وتتبع تقدمك',
    addGoal: 'إضافة هدف',
    goalName: 'اسم الهدف',
    targetAmount: 'المبلغ المستهدف',
    currentAmount: 'المبلغ الحالي',
    deadline: 'الموعد النهائي',
    icon: 'الرمز',
    enterAmount: 'أدخل المبلغ',
    cancel: 'إلغاء',
    create: 'إنشاء',
    updateProgress: 'تحديث التقدم',
    addAmount: 'أضف مبلغ',
    update: 'تحديث'
  },
  en: {
    title: 'Investment Goals',
    desc: 'Set your goals and track progress',
    addGoal: 'Add Goal',
    goalName: 'Goal Name',
    targetAmount: 'Target Amount',
    currentAmount: 'Current Amount',
    deadline: 'Deadline',
    icon: 'Icon',
    enterAmount: 'Enter amount',
    cancel: 'Cancel',
    create: 'Create',
    updateProgress: 'Update Progress',
    addAmount: 'Add Amount',
    update: 'Update'
  }
};

const t = (key) => translations[props.lang]?.[key] || key;

const progressPercent = (goal) => {
  return (goal.currentAmount / goal.targetAmount) * 100;
};

const monthlyRequired = (goal) => {
  const days = daysUntilDeadline(goal);
  if (days <= 0) return 0;
  const months = days / 30;
  const remaining = goal.targetAmount - goal.currentAmount;
  return Math.ceil(remaining / months);
};

const daysUntilDeadline = (goal) => {
  if (!goal.deadline) return 0;
  const deadline = new Date(goal.deadline);
  const today = new Date();
  const diff = deadline - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const addGoal = () => {
  if (!newGoal.value.name || !newGoal.value.targetAmount) return;
  
  goals.value.push({ ...newGoal.value });
  saveGoals();
  
  newGoal.value = {
    name: '',
    targetAmount: null,
    currentAmount: 0,
    deadline: '',
    icon: '🎯'
  };
  
  closeModal();
};

const removeGoal = (idx) => {
  goals.value.splice(idx, 1);
  saveGoals();
};

const showAddProgress = (idx) => {
  editingGoalIdx.value = idx;
  progressAmount.value = 0;
  showModal.value = true;
};

const updateProgress = () => {
  if (editingGoalIdx.value !== null && progressAmount.value) {
    goals.value[editingGoalIdx.value].currentAmount += progressAmount.value;
    saveGoals();
  }
  closeModal();
};

const closeModal = () => {
  showModal.value = false;
  editingGoalIdx.value = null;
  progressAmount.value = 0;
};

const saveGoals = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('investment_goals', JSON.stringify(goals.value));
  }
};

const loadGoals = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('investment_goals');
    if (saved) {
      goals.value = JSON.parse(saved);
    }
  }
};

onMounted(() => {
  loadGoals();
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
