<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  try {
    // 1. ยิง API ไปหา Node.js หลังบ้าน
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: username.value, 
        password: password.value 
      })
    })
    const data = await res.json()

    // 2. ถ้าล็อกอินผ่าน (สำเร็จ)
    if (res.ok && data.success) {
      localStorage.setItem('user', JSON.stringify(data.user)) // บันทึกข้อมูลผู้ใช้
      router.push('/dashboard') // เด้งไปหน้า Dashboard
    } else {
      errorMessage.value = data.message // แสดงข้อความ Error
    }
  } catch (err) {
    errorMessage.value = 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'
  }
}
</script>
</script>

<template>
  <main class="login">
    <form class="login-box" @submit.prevent="login">
      <h1>PERSONNEL+</h1>
      <p class="muted">ระบบประเมินบุคลากร</p>
      <label for="username">ชื่อผู้ใช้งาน</label>
      <input id="username" v-model.trim="username" autocomplete="username" required>
      <label for="password">รหัสผ่าน</label>
      <input id="password" v-model="password" type="password" autocomplete="current-password" required>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <button class="primary" type="submit" :disabled="loading">
        {{ loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ' }}
      </button>
    </form>
  </main>
</template>
