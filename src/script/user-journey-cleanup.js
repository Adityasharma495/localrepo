const { UserJourneyRepository } = require("../../shared/c_repositories");
const userJourneyRepo = new UserJourneyRepository();
const { Logger } = require("../../shared/config");

async function deleteOldUserJourneyData() {
  try {
    const deletedCount = await userJourneyRepo.deleteOldRecords(60);
    Logger.info(
      `Deleted ${deletedCount} old user_journey records`
    );
  } catch (err) {
    Logger.error(
      `Error deleting old user_journey data:, error: ${JSON.stringify(err)}`
    );
    console.error("Error deleting old user_journey data:", err);
  }
}

function getMsUntilNextRun() {
  const now = new Date();
  const next = new Date();

  next.setHours(23, 59, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);

  return next - now;
}

function scheduleCleanup() {
  const msUntilNextRun = getMsUntilNextRun();
  Logger.info(
    `Next user journey cleanup for older than 60 days scheduled in ${Math.round(
      msUntilNextRun / 1000 / 60
    )} minutes`
  );

  setTimeout(async () => {
    await deleteOldUserJourneyData();
    scheduleCleanup();
  }, msUntilNextRun);
}

scheduleCleanup();
