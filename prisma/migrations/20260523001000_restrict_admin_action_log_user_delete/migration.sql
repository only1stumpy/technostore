ALTER TABLE "AdminActionLog" DROP CONSTRAINT IF EXISTS "AdminActionLog_adminId_fkey";
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
