import cors from 'cors'
import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import mysql from 'mysql2/promise'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'

const app = express()
const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'ktcm_db',
  waitForConnections: true,
  connectionLimit: 10,
})

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))

function getText(body: unknown, key: string): string {
  if (typeof body !== 'object' || body === null || !(key in body)) return ''
  const value = (body as Record<string, unknown>)[key]
  return typeof value === 'string' ? value.trim() : ''
}

function getId(value: string): number | null {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

const evaluationFields = [
  'full_name', 'employee_code', 'position', 'department', 'phone', 'email',
  'responsibilities', 'tenure', 'achievements', 'projects', 'success',
  'challenges', 'development_goals',
] as const

function readEvaluation(body: unknown): string[] | null {
  if (typeof body !== 'object' || body === null) return null
  const values = evaluationFields.map((field) => getText(body, field))
  if (!values[0] || !values[1] || !values[2] || !values[3]) return null
  return values
}

function handleError(res: Response, error: unknown) {
  console.error(error)
  if (error instanceof Error && 'code' in error && error.code === 'ER_DUP_ENTRY') {
    res.status(409).json({ error: 'รหัสบุคลากรหรือชื่อผู้ใช้งานนี้มีในระบบแล้ว' })
    return
  }
  res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูล' })
}

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.post('/api/login', async (req: Request, res: Response) => {
  const username = getText(req.body, 'username')
  const password = getText(req.body, 'password')
  if (!username || !password) {
    res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน' })
    return
  }

  try {
    interface UserRow extends RowDataPacket {
      user_id: number
      username: string
      password: string
      role: string
    }
    const [rows] = await pool.execute<UserRow[]>(
      'SELECT user_id, username, password, role FROM `USER` WHERE username = ? LIMIT 1',
      [username],
    )
    const user = rows[0]
    if (!user || user.password !== password) {
      res.status(401).json({ error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' })
      return
    }
    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: { id: user.user_id, username: user.username, role: user.role },
    })
  } catch (error) {
    handleError(res, error)
  }
})

app.get('/api/dashboard', async (_req: Request, res: Response) => {
  try {
    const [[staffRows], [sentRows], [pendingRows], [completedRows]] = await Promise.all([
      pool.query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM staff'),
      pool.query<RowDataPacket[]>("SELECT COUNT(*) AS total FROM evaluations WHERE status IN ('submitted', 'completed')"),
      pool.query<RowDataPacket[]>("SELECT COUNT(*) AS total FROM evaluations WHERE status = 'submitted'"),
      pool.query<RowDataPacket[]>("SELECT COUNT(*) AS total FROM evaluations WHERE status = 'completed'"),
    ])
    res.json({
      staffTotal: Number(staffRows[0]?.total ?? 0),
      evaluationsSent: Number(sentRows[0]?.total ?? 0),
      pending: Number(pendingRows[0]?.total ?? 0),
      completed: Number(completedRows[0]?.total ?? 0),
    })
  } catch (error) {
    handleError(res, error)
  }
})

app.get('/api/staff', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT staff_id, full_name, employee_code, position, department FROM staff ORDER BY staff_id DESC',
    )
    res.json(rows)
  } catch (error) {
    handleError(res, error)
  }
})

app.post('/api/staff', async (req: Request, res: Response) => {
  const fullName = getText(req.body, 'full_name')
  const employeeCode = getText(req.body, 'employee_code')
  const position = getText(req.body, 'position')
  const department = getText(req.body, 'department')
  if (!fullName || !employeeCode || !position || !department) {
    res.status(400).json({ error: 'กรุณากรอกชื่อ รหัสบุคลากร ตำแหน่ง และแผนกให้ครบ' })
    return
  }
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO staff (full_name, employee_code, position, department) VALUES (?, ?, ?, ?)',
      [fullName, employeeCode, position, department],
    )
    res.status(201).json({ staff_id: result.insertId })
  } catch (error) {
    handleError(res, error)
  }
})

app.post('/api/evaluations', async (req: Request, res: Response) => {
  const values = readEvaluation(req.body)
  if (!values) {
    res.status(400).json({ error: 'กรุณากรอกชื่อ รหัสบุคลากร ตำแหน่ง และแผนกให้ครบ' })
    return
  }
  const status = getText(req.body, 'status') === 'submitted' ? 'submitted' : 'draft'
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO evaluations
        (full_name, employee_code, position, department, phone, email, responsibilities, tenure,
         achievements, projects, work_success, challenges, development_goals, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...values, status],
    )
    res.status(201).json({ evaluation_id: result.insertId, status })
  } catch (error) {
    handleError(res, error)
  }
})

app.put('/api/evaluations/:id', async (req: Request, res: Response) => {
  const id = getId(Array.isArray(req.params.id) ? req.params.id[0] ?? '' : req.params.id)
  const values = readEvaluation(req.body)
  if (!id || !values) {
    res.status(400).json({ error: 'รหัสหรือข้อมูลแบบประเมินไม่ถูกต้อง' })
    return
  }
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE evaluations SET full_name = ?, employee_code = ?, position = ?, department = ?, phone = ?,
       email = ?, responsibilities = ?, tenure = ?, achievements = ?, projects = ?, work_success = ?,
       challenges = ?, development_goals = ? WHERE evaluation_id = ? AND status = 'draft'`,
      [...values, id],
    )
    if (!result.affectedRows) {
      res.status(409).json({ error: 'ไม่พบฉบับร่าง หรือแบบประเมินถูกส่งไปแล้ว' })
      return
    }
    res.json({ message: 'บันทึกฉบับร่างแล้ว' })
  } catch (error) {
    handleError(res, error)
  }
})

app.patch('/api/evaluations/:id/submit', async (req: Request, res: Response) => {
  const id = getId(Array.isArray(req.params.id) ? req.params.id[0] ?? '' : req.params.id)
  if (!id) {
    res.status(400).json({ error: 'รหัสแบบประเมินไม่ถูกต้อง' })
    return
  }
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE evaluations SET status = 'submitted', submitted_at = NOW() WHERE evaluation_id = ? AND status = 'draft'",
      [id],
    )
    if (!result.affectedRows) {
      res.status(409).json({ error: 'ไม่พบฉบับร่าง หรือแบบประเมินถูกส่งไปแล้ว' })
      return
    }
    res.json({ message: 'ส่งแบบประเมินแล้ว' })
  } catch (error) {
    handleError(res, error)
  }
})

app.get('/api/committee/pending', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT evaluation_id, full_name, employee_code, position, department, responsibilities, tenure,
       achievements, projects, work_success, challenges, development_goals, status
       FROM evaluations WHERE status = 'submitted' ORDER BY submitted_at`,
    )
    res.json(rows)
  } catch (error) {
    handleError(res, error)
  }
})

app.post('/api/committee/scores', async (req: Request, res: Response) => {
  const id = getId(String(req.body?.evaluation_id ?? ''))
  const score = Number(req.body?.score)
  const comment = getText(req.body, 'comment')
  if (!id || !Number.isInteger(score) || score < 1 || score > 5) {
    res.status(400).json({ error: 'กรุณาเลือกรายการและให้คะแนนตั้งแต่ 1 ถึง 5' })
    return
  }
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE evaluations SET score = ?, committee_comment = ?, status = 'completed', evaluated_at = NOW()
       WHERE evaluation_id = ? AND status = 'submitted'`,
      [score, comment, id],
    )
    if (!result.affectedRows) {
      res.status(409).json({ error: 'ไม่พบรายการรอประเมินนี้ หรือรายการถูกประเมินแล้ว' })
      return
    }
    res.json({ message: 'บันทึกผลการประเมินแล้ว' })
  } catch (error) {
    handleError(res, error)
  }
})

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  handleError(res, error)
})

const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => console.log(`Backend API running at http://localhost:${port}`))
