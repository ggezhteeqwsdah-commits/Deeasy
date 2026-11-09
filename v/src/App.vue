
<template>
  <div v-if="auth.user" class="layout">
    <aside class="sidebar">
      <h2 class="brand">PERSONNEL+</h2>
      <p class="muted">{{ auth.user.username }} · {{ auth.user.role }}</p>
      <nav class="nav" aria-label="เมนูหลัก">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/staff">งานบุคลากร</RouterLink>
        <RouterLink to="/employee">ผู้เข้ารับการประเมิน</RouterLink>
        <RouterLink to="/committee">กรรมการผู้ประเมิน</RouterLink>
        <button class="logout" type="button" @click="logout">ออกจากระบบ</button>
      </nav>
    </aside>
    <main class="content">
      <RouterView />
    </main>
  </div>
  <RouterView v-else />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  void router.replace('/login')
}
</script>