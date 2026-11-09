import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import StaffView from '../views/StaffView.vue'
import EmployeeView from '../views/EmployeeView.vue'
import CommitteeView from '../views/CommitteeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', component: LoginView },
    { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/staff', component: StaffView, meta: { requiresAuth: true } },
    { path: '/employee', component: EmployeeView, meta: { requiresAuth: true } },
    { path: '/committee', component: CommitteeView, meta: { requiresAuth: true } },
    { path: '/', redirect: '/dashboard' },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.user) return '/login'
  if (to.path === '/login' && auth.user) return '/dashboard'
})

export default router
