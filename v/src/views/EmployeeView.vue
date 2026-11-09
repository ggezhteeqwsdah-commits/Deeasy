<script setup lang="ts">
import { reactive, ref } from 'vue'
import { api, type EvaluationForm } from '../api'

const form = reactive<EvaluationForm>({
  full_name: '', employee_code: '', position: '', department: '', phone: '', email: '',
  responsibilities: '', tenure: '', achievements: '', projects: '', success: '',
  challenges: '', development_goals: '',
})
const evaluationId = ref<number | null>(null)
const submitted = ref(false)
const error = ref('')
const notice = ref('')
const loading = ref(false)

async function save(status: 'draft' | 'submitted') {
  error.value = ''
  notice.value = ''
  loading.value = true
  try {
    if (evaluationId.value === null) {
      const result = await api<{ evaluation_id: number }>('/evaluations', {
        method: 'POST',
        body: JSON.stringify({ ...form, status }),
      })
      evaluationId.value = result.evaluation_id
    } else {
      await api(`/evaluations/${evaluationId.value}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      })
      if (status === 'submitted') {
        await api(`/evaluations/${evaluationId.value}/submit`, { method: 'PATCH' })
      }
    }
    submitted.value = status === 'submitted'
    notice.value = status === 'submitted' ? 'ส่งข้อมูลให้กรรมการแล้ว' : 'บันทึกฉบับร่างแล้ว'
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'บันทึกข้อมูลไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section>
    <header class="page-heading">
      <h1>ผู้เข้ารับการประเมิน</h1>
      <p>กรอกข้อมูลส่วนตัวและผลงานเพื่อประกอบการประเมิน</p>
    </header>
    <form @submit.prevent="save('draft')">
      <section class="panel">
        <h2>1. ข้อมูลส่วนตัว</h2>
        <div class="form-grid">
          <div><label for="name">ชื่อ-นามสกุล</label><input id="name" v-model.trim="form.full_name" required></div>
          <div><label for="code">รหัสบุคลากร</label><input id="code" v-model.trim="form.employee_code" required></div>
          <div><label for="job">ตำแหน่ง</label><input id="job" v-model.trim="form.position" required></div>
          <div><label for="department">แผนก / ฝ่าย</label><input id="department" v-model.trim="form.department" required></div>
          <div><label for="phone">เบอร์โทรศัพท์</label><input id="phone" v-model.trim="form.phone" type="tel"></div>
          <div><label for="email">อีเมล</label><input id="email" v-model.trim="form.email" type="email"></div>
        </div>
      </section>
      <section class="panel">
        <h2>2. ข้อมูลการปฏิบัติงาน</h2>
        <label for="responsibilities">หน้าที่และความรับผิดชอบ</label>
        <textarea id="responsibilities" v-model.trim="form.responsibilities"></textarea>
        <label for="tenure">ระยะเวลาการทำงาน</label>
        <input id="tenure" v-model.trim="form.tenure" placeholder="เช่น 3 ปี 6 เดือน">
        <label for="achievements">ผลงานที่ผ่านมา</label>
        <textarea id="achievements" v-model.trim="form.achievements"></textarea>
        <label for="projects">โครงการที่รับผิดชอบ</label>
        <textarea id="projects" v-model.trim="form.projects"></textarea>
      </section>
      <section class="panel">
        <h2>3. ข้อมูลประกอบการประเมิน</h2>
        <label for="success">ความสำเร็จในการทำงาน</label>
        <textarea id="success" v-model.trim="form.success"></textarea>
        <label for="challenges">ปัญหาและอุปสรรค</label>
        <textarea id="challenges" v-model.trim="form.challenges"></textarea>
        <label for="goals">สิ่งที่ต้องการพัฒนา</label>
        <textarea id="goals" v-model.trim="form.development_goals"></textarea>
      </section>
      <section class="panel">
        <h2>4. ส่งข้อมูลเพื่อรับการประเมิน</h2>
        <p class="muted">บันทึกฉบับร่างก่อน หรือส่งข้อมูลให้กรรมการประเมิน</p>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <p v-if="notice" class="success" role="status">{{ notice }}</p>
        <div class="form-actions">
          <button class="secondary" type="submit" :disabled="loading || submitted">บันทึกฉบับร่าง</button>
          <button type="button" :disabled="loading || submitted" @click="save('submitted')">
            {{ submitted ? 'ส่งข้อมูลแล้ว' : 'ส่งให้กรรมการ' }}
          </button>
        </div>
      </section>
    </form>
  </section>
</template>
