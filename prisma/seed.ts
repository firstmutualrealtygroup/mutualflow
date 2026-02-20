/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hashSync } from "bcryptjs";
import path from "path";

// Database is in project root (one level up from prisma/)
const dbPath = path.join(__dirname, "..", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` } as any);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding database...");

  const brokerPassword = hashSync("Broker2024!", 12);
  const broker = await (prisma as any).user.upsert({
    where: { email: "edgar@firstmutualrealtygroup.com" },
    update: {},
    create: {
      name: "Edgar Escobedo",
      email: "edgar@firstmutualrealtygroup.com",
      password: brokerPassword,
      role: "BROKER",
      phone: "(555) 100-0001",
      licenseNumber: "DRE#01234567",
    },
  });
  console.log("Broker:", broker.email);

  const agentPassword = hashSync("Agent2024!", 12);
  const agent1 = await (prisma as any).user.upsert({
    where: { email: "sarah@firstmutualrealtygroup.com" },
    update: {},
    create: {
      name: "Sarah Johnson",
      email: "sarah@firstmutualrealtygroup.com",
      password: agentPassword,
      role: "AGENT",
      phone: "(555) 200-0002",
      licenseNumber: "DRE#02345678",
    },
  });

  const agent2 = await (prisma as any).user.upsert({
    where: { email: "michael@firstmutualrealtygroup.com" },
    update: {},
    create: {
      name: "Michael Torres",
      email: "michael@firstmutualrealtygroup.com",
      password: agentPassword,
      role: "AGENT",
      phone: "(555) 300-0003",
      licenseNumber: "DRE#03456789",
    },
  });
  console.log("Agents: Sarah Johnson, Michael Torres");

  const client1 = await (prisma as any).client.upsert({
    where: { id: "demo-client-1" },
    update: {},
    create: {
      id: "demo-client-1",
      firstName: "Robert",
      lastName: "Williams",
      email: "robert.williams@example.com",
      phone: "(555) 400-0004",
      address: "1234 Oak Street",
      city: "Pasadena",
      state: "CA",
      zipCode: "91101",
      agentId: agent1.id,
    },
  });

  await (prisma as any).client.upsert({
    where: { id: "demo-client-2" },
    update: {},
    create: {
      id: "demo-client-2",
      firstName: "Maria",
      lastName: "Garcia",
      email: "maria.garcia@example.com",
      phone: "(555) 500-0005",
      address: "5678 Elm Avenue",
      city: "Burbank",
      state: "CA",
      zipCode: "91501",
      agentId: agent2.id,
    },
  });
  console.log("Clients: Robert Williams, Maria Garcia");

  const existingTx = await (prisma as any).transaction.findUnique({
    where: { id: "demo-tx-1" },
  });

  if (!existingTx) {
    await (prisma as any).transaction.create({
      data: {
        id: "demo-tx-1",
        clientId: client1.id,
        agentId: agent1.id,
        type: "PURCHASE",
        propertyAddress: "789 Maple Drive",
        propertyCity: "Pasadena",
        propertyState: "CA",
        propertyZip: "91103",
        purchasePrice: 650000,
        mlsNumber: "MLS-12345",
        escrowNumber: "ESC-67890",
        currentStage: "DUE_DILIGENCE",
        status: "ACTIVE",
        closingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        stages: {
          create: [
            { stageName: "DUE_DILIGENCE", status: "ACTIVE", startDate: new Date() },
            { stageName: "APPRAISAL", status: "PENDING" },
            { stageName: "LOAN_CONTINGENCY", status: "PENDING" },
            { stageName: "CLOSE_OF_ESCROW", status: "PENDING" },
          ],
        },
        tasks: {
          create: [
            { title: "Schedule home inspection", priority: "HIGH" },
            { title: "Review seller disclosures", priority: "HIGH" },
            { title: "Confirm earnest money deposit", priority: "MEDIUM" },
          ],
        },
      },
    });
    console.log("Sample transaction: 789 Maple Drive");
  }

  console.log("\n=== SEED COMPLETE ===");
  console.log("Broker:  edgar@firstmutualrealtygroup.com / Broker2024!");
  console.log("Agent 1: sarah@firstmutualrealtygroup.com / Agent2024!");
  console.log("Agent 2: michael@firstmutualrealtygroup.com / Agent2024!");
}

main()
  .catch(console.error)
  .finally(() => (prisma as any).$disconnect());
