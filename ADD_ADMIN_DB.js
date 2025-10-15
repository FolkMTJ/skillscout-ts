// MongoDB Shell Commands
// Copy & Paste ลงใน MongoDB Shell

// 1. เชื่อมต่อ database
use skillscout

// 2. เพิ่ม admin user
db.users.insertOne({
  email: "folkmtj.one@gmail.com",
  name: "Admin",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})

// 3. ตรวจสอบ
db.users.findOne({ email: "folkmtj.one@gmail.com" })

// Output ควรเป็น:
// {
//   _id: ObjectId("..."),
//   email: "folkmtj.one@gmail.com",
//   name: "Admin",
//   role: "admin",
//   createdAt: ISODate("2024-10-15..."),
//   updatedAt: ISODate("2024-10-15...")
// }
