-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "lastContact" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "hireDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "salary" DOUBLE PRECISION,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';
