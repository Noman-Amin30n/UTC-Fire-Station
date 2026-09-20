import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) throw new Error("Usage: npx tsx scripts/hash-password.ts <password>");

bcrypt.hash(password, 10).then((hash) => console.log(hash));