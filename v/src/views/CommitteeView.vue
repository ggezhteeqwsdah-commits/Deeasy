<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api, type Evaluation } from '../api'

const pending = ref<Evaluation[]>([])
const selectedId = ref<number | null>(null)
const score = ref<number | ''>('')
const comment = ref('')
const error = ref('')
const notice = ref('')
const loading = ref(false)
const selectedEvaluation = computed(() =>
  pending.value.find((item) => item.evaluation_id === selectedId.value),
)

async function loadPending() {
  pending.value = await api<Evaluation[]>('/committee/pending')
  if (!pending.value.some((item) => item.evaluation_id === selectedId.value)) {
    selectedId.value = pending.value[0]?.evaluation_id ?? null
  }
}

async function submitScore() {
  if (selectedId.value === null || score.value === '') return
  error.value = ''
  notice.value = ''
  loading.value = true
  try {
    await api('/committee/scores', {
      method: 'POST',
      body: JSON.stringify({
        evaluation_id: selectedId.value,
        score: score.value,
        comment: comment.value,
      }),
    })
    score.value = ''
    comment.value = ''
    notice.value = 'บันทึกผลการประเมินแล้ว'
    await loadPending()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'บันทึกผลไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    await loadPending()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'โหลดรายการไม่สำเร็จ'
  }
})
</script>

<template>
  <section>
    <header class="page-heading"><h1>กรรมการผู้ประเมิน</h1><p>รายการรอประเมินและบันทึกคะแนน</p></header>
    <p v-if="error && !pending.length" class="error" role="alert">{{ error }}</p>
    <section class="panel">
      <h2>รายการรอประเมิน</h2>
      <p v-if="!pending.length" class="empty">ไม่มีรายการรอประเมิน</p>
      <div v-else class="table-wrap">
        <table>
          <thead><tr><th>ชื่อบุคลากร</th><th>รหัส</th><th>แผนก</th><th>สถานะ</th></tr></thead>
          <tbody>
            <tr v-for="item in pending" :key="item.evaluation_id">
              <td>{{ item.full_name }}</td><td>{{ item.employee_code }}</td>
              <td>{{ item.department }}</td><td><span class="status">รอประเมิน</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <section v-if="selectedEvaluation" class="panel">
      <h2>ข้อมูลประกอบการประเมิน</h2>
      <dl class="evaluation-details">
        <dt>ชื่อ / รหัส</dt><dd>{{ selectedEvaluation.full_name }} / {{ selectedEvaluation.employee_code }}</dd>
        <dt>ตำแหน่ง / แผนก</dt><dd>{{ selectedEvaluation.position }} / {{ selectedEvaluation.department }}</dd>
        <dt>หน้าที่รับผิดชอบ</dt><dd>{{ selectedEvaluation.responsibilities || '—' }}</dd>
        <dt>อายุงาน</dt><dd>{{ selectedEvaluation.tenure || '—' }}</dd>
        <dt>ผลงาน</dt><dd>{{ selectedEvaluation.achievements || '—' }}</dd>
        <dt>โครงการ</dt><dd>{{ selectedEvaluation.projects || '—' }}</dd>
        <dt>ความสำเร็จ</dt><dd>{{ selectedEvaluation.work_success || '—' }}</dd>
        <dt>ปัญหา / อุปสรรค</dt><dd>{{ selectedEvaluation.challenges || '—' }}</dd>
        <dt>สิ่งที่ต้องการพัฒนา</dt><dd>{{ selectedEvaluation.development_goals || '—' }}</dd>
      </dl>
    </section>
    <form v-if="pending.length" class="panel" @submit.prevent="submitScore">
      <h2>ให้คะแนนการประเมิน</h2>
      <label for="evaluation">เลือกบุคลากร</label>
      <select id="evaluation" v-model.number="selectedId" required>
        <option v-for="item in pending" :key="item.evaluation_id" :value="item.evaluation_id">
          {{ item.full_name }} ({{ item.employee_code }})
        </option>
      </select>
      <label for="score">คะแนน (1–5)</label>
      <select id="score" v-model.number="score" required>
        <option disabled value="">เลือกคะแนน</option>
        <option v-for="value in [1, 2, 3, 4, 5]" :key="value" :value="value">{{ value }}</option>
      </select>
      <label for="comment">ความคิดเห็น</label>
      <textarea id="comment" v-model.trim="comment" placeholder="ข้อเสนอแนะ"></textarea>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <p v-if="notice" class="success" role="status">{{ notice }}</p>
      <button type="submit" :disabled="loading">{{ loading ? 'กำลังบันทึก…' : 'บันทึกผล' }}</button>
    </form>
    <p v-else-if="notice" class="success" role="status">{{ notice }}</p>
  </section>
</template>
