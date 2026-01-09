-- AlterTable
ALTER TABLE "queues" ADD COLUMN     "promptId" INTEGER;

-- AlterTable
ALTER TABLE "whatsapps" ADD COLUMN     "promptId" INTEGER;

-- CreateTable
CREATE TABLE "prompts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "maxTokens" INTEGER NOT NULL DEFAULT 1000,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "voice" TEXT,
    "voiceKey" TEXT,
    "voiceRegion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "whatsapps" ADD CONSTRAINT "whatsapps_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "prompts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "prompts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
