<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '../api'

interface DashboardSummary {
  staffTotal: number
  evaluationsSent: number
  pending: number
  completed: number
}

const summary = ref<DashboardSummary | null>(null)
const error = ref('')

onMounted(async () => {
  try {
    summary.value = await api<DashboardSummary>('/dashboard')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'โหลดข้อมูลไม่สำเร็จ'
  }
})
</script>

<template>
  <section>
    <header class="page-heading">
      <h1>Dashboard</h1>
      <p>ภาพรวมระบบประเมินบุคลากร</p>
    </header>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <div v-if="summary" class="cards">
      <article class="card"><span>บุคลากรทั้งหมด</span><strong>{{ summary.staffTotal }}</strong></article>
      <article class="card"><span>แบบประเมินที่ส่งแล้ว</span><strong>{{ summary.evaluationsSent }}</strong></article>
      <article class="card"><span>รอประเมิน</span><strong>{{ summary.pending }}</strong></article>
      <article class="card"><span>ประเมินเสร็จแล้ว</span><strong>{{ summary.completed }}</strong></article>
    </div>
    <p v-else-if="!error" class="muted">กำลังโหลดข้อมูล…</p>
  </section>
</template>
