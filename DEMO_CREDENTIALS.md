# Demo User Credentials

After running the seed script (`npm run prisma:seed`), you can use these credentials to login:

## Admin User
- **Email**: `admin@demo.com`
- **Password**: `admin@123`
- **Role**: ADMIN

## Regular User
- **Email**: `user@demo.com`
- **Password**: `user@123`
- **Role**: USER

## Additional Test User
- **Email**: `jane@nexus.com`
- **Password**: `password123`
- **Role**: USER

---

**Note**: All passwords are securely hashed using bcrypt with a salt round of 10 before being stored in the database.

## To Use

1. Run the seed script:
   ```bash
   npm run prisma:seed
   ```

2. Use the credentials above to test authentication in your application

3. When implementing authentication, use bcrypt to compare passwords:
   ```typescript
   import * as bcrypt from 'bcrypt';
   
   const isValid = await bcrypt.compare(plainPassword, user.password);
   ```
