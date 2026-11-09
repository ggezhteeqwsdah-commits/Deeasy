import { defineStore } from 'pinia'

export interface AuthUser {
  id: number
  username: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const savedUser = sessionStorage.getItem('personnel-user')
  const user = ref<AuthUser | null>(savedUser ? JSON.parse(savedUser) as AuthUser : null)

  function login(nextUser: AuthUser) {
    user.value = nextUser
    sessionStorage.setItem('personnel-user', JSON.stringify(nextUser))
  }

  function logout() {
    user.value = null
    sessionStorage.removeItem('personnel-user')
  }

  return { user, login, logout }
})

import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    const data = await res.json()

    if (res.ok && data.success) {
      // เซฟข้อมูลไว้ในเครื่อง แล้วเด้งไปหน้า Dashboard
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/dashboard')
    } else {
      errorMessage.value = data.message
    }
  } catch (err) {
    errorMessage.value = 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'
  }
}