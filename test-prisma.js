const { PrismaClient } = require("@prisma/client");

async function main() {
  try {
    console.log("Trying with datasourceUrl...");
    const p = new PrismaClient({ datasourceUrl: "file:./prisma/dev.db" });
    const count = await p.user.count();
    console.log("User count:", count);
    await p.$disconnect();
  } catch(e) {
    console.error("Error with datasourceUrl:", e.message);
  }

  try {
    console.log("\nTrying with adapter approach...");
    const p2 = new PrismaClient({ log: ["warn", "error"] });
    const count2 = await p2.user.count();
    console.log("User count:", count2);
    await p2.$disconnect();
  } catch(e) {
    console.error("Error with empty:", e.message.substring(0, 500));
  }
}

main();
