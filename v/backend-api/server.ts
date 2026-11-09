import express from 'express';
import type { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'ktcm_db'
});

app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const [rows]: any = await pool.execute(
      'SELECT * FROM USER WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length > 0) {
      const user = rows[0];
      res.status(200).json({
        message: 'เข้าสู่ระบบสำเร็จ!',
        user: {
          id: user.user_id,
          username: user.username,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ error: 'ชื่อผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง' });
    }
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
});

app.listen(3000, () => {
  console.log('Backend API running on port 3000');
});