const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const body: unknown = await response.json()
  if (!response.ok) {
    const message = typeof body === 'object' && body !== null && 'error' in body
      ? String(body.error)
      : `Request failed (${response.status})`
    throw new Error(message)
  }
  return body as T
}

export interface Staff {
  staff_id: number
  full_name: string
  position: string
  department: string
  employee_code: string
}

export interface Evaluation {
  evaluation_id: number
  full_name: string
  employee_code: string
  department: string
  status: 'draft' | 'submitted' | 'completed'
  position: string
  responsibilities: string
  tenure: string
  achievements: string
  projects: string
  work_success: string
  challenges: string
  development_goals: string
}

export interface EvaluationForm {
  full_name: string
  employee_code: string
  position: string
  department: string
  phone: string
  email: string
  responsibilities: string
  tenure: string
  achievements: string
  projects: string
  success: string
  challenges: string
  development_goals: string
}
