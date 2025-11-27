<<<<<<< HEAD
<template>
  <div class="p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
    <!-- <h1 class="text-3xl font-bold mb-8" style="color: #1e293b">Main Home</h1> -->

    <!-- 통계 카드 -->
    <section class="mb-12">
      <h2 class="text-lg font-semibold mb-6" style="color: #1e293b">당일 보관함 현황</h2>
      <div v-if="loading" class="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
        통계 로딩 중...
      </div>
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="미사용"
          :value="stats.available"
          icon="fi-rr-box"
          variant="gradient-blue"
        />
        <StatCard label="사용중" :value="stats.inUse" icon="fi-rr-lock" variant="gradient-black" />
        <StatCard
          label="사용률"
          :value="`${stats.usageRate}%`"
          icon="fi-rr-chart-pie"
          variant="gradient-blue"
        />
        <StatCard
          label="활성 예약"
          :value="stats.activeReservations"
          icon="fi-rr-calendar-check"
          variant="gradient-black"
        />
        <div class="hidden lg:block">
          <StatCard
            label="총 고객"
            :value="stats.totalCustomers"
            icon="fi-rr-users"
            variant="gradient-blue"
          />
        </div>
      </div>
    </section>

    <!-- 두 컬럼 레이아웃 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      <!-- 좌측: 최근 예약 + 차트 -->
      <div>
        <!-- 최근 예약 테이블 -->
        <section class="mb-8">
          <h2 class="text-lg font-semibold mb-4" style="color: #1e293b">최근 예약</h2>
          <div
            v-if="loading"
            class="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-600 dark:text-slate-400"
          >
            예약 로딩 중...
          </div>
          <table
            v-else
            class="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden text-sm"
          >
            <thead class="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th class="px-4 py-3 text-left font-semibold" style="color: #1e293b">접수시간</th>
                <th class="px-4 py-3 text-left font-semibold" style="color: #1e293b">이름</th>
                <th class="px-4 py-3 text-left font-semibold" style="color: #1e293b">보관함</th>
                <th class="px-4 py-3 text-left font-semibold" style="color: #1e293b">상태</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="reservation in recentReservations.slice(0, 5)"
                :key="reservation.id"
                class="border-t border-slate-200 dark:border-slate-700"
              >
                <td class="px-4 py-3 text-slate-900 dark:text-slate-100">
                  {{ formatDateTime(reservation.createdAt) }}
                </td>
                <td class="px-4 py-3 text-slate-900 dark:text-slate-100">
                  {{ reservation.customerName }}
                </td>
                <td class="px-4 py-3 text-slate-900 dark:text-slate-100">
                  {{ reservation.lockerNumber }}
                </td>
                <td class="px-4 py-3">
                  <StatusChip :status="getReservationStatus(reservation.status)" />
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- 차트 영역 -->
        <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h2 class="text-lg font-semibold mb-4" style="color: #1e293b">보관함 상태 분포</h2>
          <div class="h-64">
            <Bar :data="chartData" :options="chartOptions" />
          </div>
        </section>
      </div>

      <!-- 우측: 회원 등급별 현황 + 사용 고객 목록 -->
      <div>
        <!-- 회원 등급별 현황 -->
        <section class="mb-8">
          <h2 class="text-lg font-semibold mb-4" style="color: #1e293b">회원 등급별 현황</h2>
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
            <div class="h-64">
              <Doughnut :data="membershipChartData" :options="doughnutChartOptions" />
            </div>
          </div>
        </section>

        <!-- 사용 고객 목록 -->
        <section>
          <h2 class="text-lg font-semibold mb-4" style="color: #1e293b">현재 사용 고객</h2>
          <div
            v-if="loading"
            class="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-600 dark:text-slate-400"
          >
            고객 정보 로딩 중...
          </div>
          <div v-else class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-slate-100 dark:bg-slate-700">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold" style="color: #1e293b">고객명</th>
                  <th class="px-4 py-3 text-left font-semibold" style="color: #1e293b">보관함</th>
                  <th class="px-4 py-3 text-left font-semibold" style="color: #1e293b">등급</th>
                  <th class="px-4 py-3 text-left font-semibold" style="color: #1e293b">전화번호</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="customer in activeCustomers.slice(0, 6)"
                  :key="customer.id"
                  class="border-t border-slate-200 dark:border-slate-700"
                >
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">
                    {{ customer.name }}
                  </td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">
                    {{ customer.lockerNumber }}
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="px-2 py-1 rounded-full text-xs font-medium"
                      :class="getMembershipClass(customer.membershipLevel)"
                    >
                      {{ getMembershipLabel(customer.membershipLevel) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">
                    {{ customer.phone }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import StatusChip from '@/components/common/StatusChip.vue'
import StatCard from '@/components/common/StatCard.vue'
import lockersData from '@/data/lockers.json'
import reservationsData from '@/data/reservations.json'
import customersData from '@/data/customers.json'

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

// 로딩 상태
const loading = ref(true)

// 데이터
const lockers = ref([])
const reservations = ref([])
const customers = ref([])

// 통계 계산
const stats = computed(() => {
  const total = lockers.value.length
  const available = lockers.value.filter((l) => l.status === 'available').length
  const inUse = lockers.value.filter((l) => l.status === 'in-use').length
  const activeReservations = reservations.value.filter((r) => r.status === 'active').length
  const usageRate = total > 0 ? Math.round((inUse / total) * 100) : 0

  return {
    available,
    inUse,
    usageRate,
    activeReservations,
    totalCustomers: customers.value.length,
  }
})

// 최근 예약 목록
const recentReservations = computed(() => {
  return [...reservations.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
})

// 현재 사용중인 고객 정보
const activeCustomers = computed(() => {
  const activeRes = reservations.value.filter((r) => r.status === 'active')
  return activeRes.map((res) => {
    const customer = customers.value.find((c) => c.id === res.customerId)
    return {
      ...customer,
      lockerNumber: res.lockerNumber,
    }
  })
})

// 보관함 상태 차트 데이터
const chartData = computed(() => {
  const statusCounts = {
    available: 0,
    'in-use': 0,
    maintenance: 0,
    broken: 0,
  }

  lockers.value.forEach((locker) => {
    if (statusCounts[locker.status] !== undefined) {
      statusCounts[locker.status]++
    }
  })

  return {
    labels: ['미사용', '사용중', '정비중', '고장'],
    datasets: [
      {
        label: '보관함 수',
        data: [
          statusCounts.available,
          statusCounts['in-use'],
          statusCounts.maintenance,
          statusCounts.broken,
        ],
        backgroundColor: ['#007aff', '#000000', '#ff9500', '#ff3b30'],
        borderRadius: 8,
      },
    ],
  }
})

// 차트 옵션
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
    },
  },
}

// 회원 등급별 차트 데이터
const membershipChartData = computed(() => {
  const membershipCounts = {
    platinum: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
  }

  customers.value.forEach((customer) => {
    if (membershipCounts[customer.membershipLevel] !== undefined) {
      membershipCounts[customer.membershipLevel]++
    }
  })

  return {
    labels: ['플래티넘', '골드', '실버', '브론즈'],
    datasets: [
      {
        data: [
          membershipCounts.platinum,
          membershipCounts.gold,
          membershipCounts.silver,
          membershipCounts.bronze,
        ],
        backgroundColor: ['#000000', '#ffd700', '#c0c0c0', '#cd7f32'],
      },
    ],
  }
})

// 도넛 차트 옵션
const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
}

// 유틸리티 함수
const getReservationStatus = (status) => {
  const statusMap = {
    active: 'in-use',
    completed: 'available',
    cancelled: 'broken',
    expired: 'maintenance',
  }
  return statusMap[status] || status
}

const formatDateTime = (dateTimeStr) => {
  const date = new Date(dateTimeStr)
  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getMembershipLabel = (level) => {
  const labels = {
    platinum: '플래티넘',
    gold: '골드',
    silver: '실버',
    bronze: '브론즈',
  }
  return labels[level] || level
}

const getMembershipClass = (level) => {
  const classes = {
    platinum: 'bg-black text-white',
    gold: 'bg-yellow-400 text-black',
    silver: 'bg-gray-300 text-black',
    bronze: 'bg-orange-600 text-white',
  }
  return classes[level] || 'bg-gray-200 text-black'
}

// 데이터 로드
const loadData = () => {
  loading.value = true
  try {
    lockers.value = lockersData.lockers
    reservations.value = reservationsData.reservations
    customers.value = customersData.customers
  } finally {
    loading.value = false
  }
}

// 초기 데이터 로드
onMounted(() => {
  loadData()
})
</script>
=======
<template>
  <div class="p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
    <h1 class="text-3xl font-bold mb-8" style="color: #1E293B">Main Home</h1>

    <!-- 통계 카드 -->
    <section class="mb-12">
      <h2 class="text-lg font-semibold mb-6" style="color: #1E293B">당일 보관함 현황</h2>
      <div v-if="statsLoading" class="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm">통계 로딩 중...</div>
      <div v-else-if="statsError" class="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-red-500">{{ statsError }}</div>
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <!-- Blue Card -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #007AFF 0%, #007AFF 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">미사용</div>
              <div class="text-3xl font-bold mt-2">{{ dashboardStats.totalLockers || 14 }}</div>
            </div>
            <i class="fi fi-rr-arrow-up-right text-xl"></i>
          </div>
        </div>

        <!-- Dark Card -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #000000 0%, #000000 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">예약 대기</div>
              <div class="text-3xl font-bold mt-2">{{ dashboardStats.inUseLockers || 14 }}</div>
            </div>
            <i class="fi fi-rr-arrow-down-left text-xl"></i>
          </div>
        </div>

        <!-- Blue Card -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #007AFF 0%, #007AFF 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">사용중 대여액</div>
              <div class="text-3xl font-bold mt-2">{{ dashboardStats.availableLockers || 80 }}%</div>
            </div>
            <i class="fi fi-rr-arrow-up-right text-xl"></i>
          </div>
        </div>

        <!-- Dark Card -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #000000 0%, #000000 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">예약 대기</div>
              <div class="text-3xl font-bold mt-2">{{ dashboardStats.usageRate || 14 }}</div>
            </div>
            <i class="fi fi-rr-arrow-down-left text-xl"></i>
          </div>
        </div>

        <!-- Blue Card -->
        <div class="text-white p-6 rounded-3xl shadow-sm hidden lg:block" style="background: linear-gradient(135deg, #007AFF 0%, #007AFF 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">예약 대기</div>
              <div class="text-3xl font-bold mt-2">{{ dashboardStats.todayReservations || 0 }}%</div>
            </div>
            <i class="fi fi-rr-arrow-up-right text-xl"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- 두 컬럼 레이아웃 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      <!-- 좌측: 최근 예약 + 차트 -->
      <div>
        <!-- 최근 예약 테이블 -->
        <section class="mb-8">
          <h2 class="text-lg font-semibold mb-4" style="color: #1E293B">당일 입반</h2>
          <div v-if="reservationsLoading" class="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-600 dark:text-slate-400">예약 로딩 중...</div>
          <div v-else-if="reservationsError" class="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-red-500">{{ reservationsError }}</div>
          <table v-else class="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden text-sm">
            <thead class="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">접수시간</th>
                <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">성함</th>
                <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">입반</th>
                <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">상태</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reservation in recentReservations.slice(0, 5)" :key="reservation.id" class="border-t border-slate-200 dark:border-slate-700">
                <td class="px-4 py-3 text-slate-900 dark:text-slate-100">{{ formatDateTime(reservation.startTime).split(' ')[0] }}</td>
                <td class="px-4 py-3 text-slate-900 dark:text-slate-100">{{ reservation.customerName }}</td>
                <td class="px-4 py-3 text-slate-900 dark:text-slate-100">{{ reservation.lockerNumber }}</td>
                <td class="px-4 py-3">
                  <StatusChip :status="getReservationStatus(reservation.status)" />
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- 차트 영역 -->
        <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h2 class="text-lg font-semibold mb-4" style="color: #1E293B">주간 통계</h2>
          <div class="h-48 flex items-center justify-center text-slate-500 dark:text-slate-400">
            차트 영역 (Chart Library 필요)
          </div>
        </section>
      </div>

      <!-- 우측: 사물함 현황 + 다른 영역 -->
      <div>
        <!-- 테이블 섹션 -->
        <section class="mb-8">
          <h2 class="text-lg font-semibold mb-4" style="color: #1E293B">금주 입반</h2>
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-slate-100 dark:bg-slate-700">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">입반 일자</th>
                  <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">성함</th>
                  <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">입반번호</th>
                  <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">금액</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-t border-slate-200 dark:border-slate-700">
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">2025-11-16</td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">이연준</td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">집장 KESPO번</td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">1500 건</td>
                </tr>
                <tr class="border-t border-slate-200 dark:border-slate-700">
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">2025-11-16</td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">방용 준</td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">집장 KESPO번</td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">5000 건</td>
                </tr>
                <tr class="border-t border-slate-200 dark:border-slate-700">
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">2025-11-16</td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">나종우 유</td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">-</td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">700</td>
                </tr>
                <tr class="border-t border-slate-200 dark:border-slate-700">
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">2025-11-16</td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">APEC 영실 위령</td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">집장 KESPO번</td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">5000 건</td>
                </tr>
                <tr class="border-t border-slate-200 dark:border-slate-700">
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">2025-11-16</td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">OOZ 족재</td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">집장 KESPO번</td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">5000 건</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 우측 카드 영역 -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-blue-500 text-white p-6 rounded-2xl shadow-md">
            <div class="text-sm font-medium opacity-90 mb-3">예약 확인</div>
            <div class="text-4xl font-bold">↻</div>
          </div>
          <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
            <div class="text-sm font-semibold mb-3" style="color: #1E293B">통계</div>
            <div class="flex gap-2">
              <div class="w-8 h-16 bg-blue-500 rounded"></div>
              <div class="w-8 h-12 bg-gray-300 rounded"></div>
              <div class="w-8 h-10 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { lockerService } from '@/api/lockerService'
import { reservationService } from '@/api/reservationService'
import { statsService } from '@/api/statsService'
import StatusChip from '@/components/common/StatusChip.vue'

// 상태 관리
const dashboardStats = ref({})
const lockers = ref([])
const recentReservations = ref([])
const lockerFilter = ref('')

// 로딩 상태
const statsLoading = ref(false)
const lockersLoading = ref(false)
const reservationsLoading = ref(false)

// 에러 상태
const statsError = ref(null)
const lockersError = ref(null)
const reservationsError = ref(null)

// 통계 조회
const fetchDashboardStats = async () => {
  statsLoading.value = true
  statsError.value = null

  try {
    const response = await statsService.getDashboard()
    dashboardStats.value = response.data
  } catch (err) {
    statsError.value = '통계를 불러오는데 실패했습니다.'
    console.error(err)
  } finally {
    statsLoading.value = false
  }
}

// 사물함 조회
const fetchLockers = async () => {
  lockersLoading.value = true
  lockersError.value = null

  try {
    const params = {}
    if (lockerFilter.value) {
      params.status = lockerFilter.value
    }

    const response = await lockerService.getAll(params)
    lockers.value = response.data
  } catch (err) {
    lockersError.value = '사물함 목록을 불러오는데 실패했습니다.'
    console.error(err)
  } finally {
    lockersLoading.value = false
  }
}

// 예약 조회
const fetchReservations = async () => {
  reservationsLoading.value = true
  reservationsError.value = null

  try {
    const response = await reservationService.getAll()
    // 최근 10개만 표시
    recentReservations.value = response.data.slice(0, 10)
  } catch (err) {
    reservationsError.value = '예약 목록을 불러오는데 실패했습니다.'
    console.error(err)
  } finally {
    reservationsLoading.value = false
  }
}

// 유틸리티 함수
const getSizeLabel = (size) => {
  const sizeMap = {
    small: '소형',
    medium: '중형',
    large: '대형',
  }
  return sizeMap[size] || size
}

const getReservationStatus = (status) => {
  const statusMap = {
    active: 'in-use',
    completed: 'available',
    cancelled: 'broken',
    expired: 'maintenance',
  }
  return statusMap[status] || status
}

const formatDateTime = (dateTimeStr) => {
  const date = new Date(dateTimeStr)
  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 초기 데이터 로드
onMounted(() => {
  fetchDashboardStats()
  fetchLockers()
  fetchReservations()
})
</script>
>>>>>>> a080d41cc329b14adb800ca3e46fd8c151a500d6
