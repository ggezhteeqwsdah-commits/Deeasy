<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { api, type Staff } from '../api'

const staff = ref<Staff[]>([])
const form = reactive({ full_name: '', employee_code: '', position: '', department: '' })
const error = ref('')
const notice = ref('')
const loading = ref(false)

async function loadStaff() {
  staff.value = await api<Staff[]>('/staff')
}

async function addStaff() {
  error.value = ''
  notice.value = ''
  loading.value = true
  try {
    await api('/staff', { method: 'POST', body: JSON.stringify(form) })
    Object.assign(form, { full_name: '', employee_code: '', position: '', department: '' })
    await loadStaff()
    notice.value = 'เพิ่มบุคลากรเรียบร้อยแล้ว'
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'บันทึกข้อมูลไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    await loadStaff()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'โหลดรายชื่อไม่สำเร็จ'
  }
})
</script>

<template>
  <section>
    <header class="page-heading"><h1>งานบุคลากร</h1><p>เพิ่มและดูรายชื่อบุคลากร</p></header>
    <form class="panel" @submit.prevent="addStaff">
      <h2>เพิ่มบุคลากร</h2>
      <div class="form-grid">
        <div><label for="full_name">ชื่อ-นามสกุล</label><input id="full_name" v-model.trim="form.full_name" required></div>
        <div><label for="employee_code">รหัสบุคลากร</label><input id="employee_code" v-model.trim="form.employee_code" required></div>
        <div><label for="position">ตำแหน่ง</label><input id="position" v-model.trim="form.position" required></div>
        <div><label for="department">แผนก</label><input id="department" v-model.trim="form.department" required></div>
      </div>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <p v-if="notice" class="success" role="status">{{ notice }}</p>
      <button type="submit" :disabled="loading">{{ loading ? 'กำลังบันทึก…' : 'เพิ่มบุคลากร' }}</button>
    </form>
    <section class="panel">
      <h2>รายชื่อบุคลากร</h2>
      <p v-if="!staff.length" class="empty">ยังไม่มีรายชื่อบุคลากร</p>
      <div v-else class="table-wrap">
        <table>
          <thead><tr><th>รหัส</th><th>ชื่อ</th><th>ตำแหน่ง</th><th>แผนก</th></tr></thead>
          <tbody>
            <tr v-for="person in staff" :key="person.staff_id">
              <td>{{ person.employee_code }}</td><td>{{ person.full_name }}</td>
              <td>{{ person.position }}</td><td>{{ person.department }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>
