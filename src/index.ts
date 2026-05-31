import * as readline from "readline";

// LED segment definitions for digits 0-9
const LED_SEGMENTS: Record<number, string[]> = {
  0: ["Top", "Top Left", "Top Right", "Bottom Left", "Bottom Right", "Bottom"],
  1: ["Top Right", "Bottom Right"],
  2: ["Top", "Top Right", "Middle", "Bottom Left", "Bottom"],
  3: ["Top", "Top Right", "Middle", "Bottom Right", "Bottom"],
  4: ["Top Left", "Top Right", "Middle", "Bottom Right"],
  5: ["Top", "Top Left", "Middle", "Bottom Right", "Bottom"],
  6: ["Top", "Top Left", "Middle", "Bottom Left", "Bottom Right", "Bottom"],
  7: ["Top", "Top Right", "Bottom Right"],
  8: ["Top", "Top Left", "Top Right", "Middle", "Bottom Left", "Bottom Right", "Bottom"],
  9: ["Top", "Top Left", "Top Right", "Middle", "Bottom Right", "Bottom"],
};

interface LEDKey {
  position: string;
  segment: string;
}

interface ClockState {
  hour: number;
  minute: number;
  hourTensDigit: number | null;
  hourOnesDigit: number;
  minuteTensDigit: number;
  minuteOnesDigit: number;
}

function getClockState(totalMinutes: number): ClockState {
  let hour = 12;
  let minute = 0;

  // Add the total minutes
  minute += totalMinutes;

  // Convert to hours and minutes
  hour += Math.floor(minute / 60);
  minute = minute % 60;

  // Handle 12-hour wraparound
  if (hour > 12) {
    hour -= 12;
  }

  // Determine digits
  let hourTensDigit: number | null = null;
  let hourOnesDigit: number;

  if (hour >= 10) {
    hourTensDigit = Math.floor(hour / 10);
    hourOnesDigit = hour % 10;
  } else {
    hourTensDigit = null; // No leading zero
    hourOnesDigit = hour;
  }

  const minuteTensDigit = Math.floor(minute / 10);
  const minuteOnesDigit = minute % 10;

  return {
    hour,
    minute,
    hourTensDigit,
    hourOnesDigit,
    minuteTensDigit,
    minuteOnesDigit,
  };
}

function formatTime(state: ClockState): string {
  const hourStr =
    state.hourTensDigit !== null
      ? `${state.hourTensDigit}${state.hourOnesDigit}`
      : `${state.hourOnesDigit}`;
  const minuteStr = `${state.minuteTensDigit}${state.minuteOnesDigit}`.padStart(2, "0");
  return `${hourStr}:${minuteStr}`;
}

function getLEDsForTime(state: ClockState): LEDKey[] {
  const ledsOn: LEDKey[] = [];

  // Hour Tens (may be null)
  if (state.hourTensDigit !== null) {
    const segments = LED_SEGMENTS[state.hourTensDigit];
    segments.forEach((segment) => {
      ledsOn.push({ position: "Hour Tens", segment });
    });
  }

  // Hour Ones
  {
    const segments = LED_SEGMENTS[state.hourOnesDigit];
    segments.forEach((segment) => {
      ledsOn.push({ position: "Hour Ones", segment });
    });
  }

  // Minute Tens
  {
    const segments = LED_SEGMENTS[state.minuteTensDigit];
    segments.forEach((segment) => {
      ledsOn.push({ position: "Minute Tens", segment });
    });
  }

  // Minute Ones
  {
    const segments = LED_SEGMENTS[state.minuteOnesDigit];
    segments.forEach((segment) => {
      ledsOn.push({ position: "Minute Ones", segment });
    });
  }

  return ledsOn;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("🕐 LED Clock Simulator - 12 Hour Cycle");
  console.log("======================================\n");

  const ledCounts: Map<string, number> = new Map();

  // Initialize all 28 LEDs
  const positions = ["Hour Tens", "Hour Ones", "Minute Tens", "Minute Ones"];
  const segments = [
    "Top",
    "Top Left",
    "Top Right",
    "Middle",
    "Bottom Left",
    "Bottom Right",
    "Bottom",
  ];

  for (const position of positions) {
    for (const segment of segments) {
      const key = `${position} | ${segment}`;
      ledCounts.set(key, 0);
    }
  }

  // Simulate 12 hours (720 minutes)
  const totalMinutesInPeriod = 12 * 60; // 720 minutes
  const delayPerMinute = 40; // milliseconds

  console.log("Starting simulation...\n");

  for (let i = 0; i < totalMinutesInPeriod; i++) {
    const state = getClockState(i);
    const ledsOn = getLEDsForTime(state);

    // Count this minute for each LED that's ON
    ledsOn.forEach((led) => {
      const key = `${led.position} | ${led.segment}`;
      ledCounts.set(key, (ledCounts.get(key) || 0) + 1);
    });

    // Display update (every minute)
    process.stdout.write(`\rTime: ${formatTime(state)} | Progress: ${((i + 1) / totalMinutesInPeriod * 100).toFixed(1)}%`);

    // Small delay to stretch the simulation to 30-45 seconds
    await sleep(delayPerMinute);
  }

  // Final state
  const finalState = getClockState(totalMinutesInPeriod - 1);
  process.stdout.write(`\rTime: ${formatTime(finalState)} | Progress: 100.0%\n`);

  console.log("\n======================================");
  console.log("✅ Simulation Complete!\n");
  console.log(
    "Sorted LED Results (by minutes ON):\n"
  );

  // Sort by count (ascending)
  const sortedResults = Array.from(ledCounts.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([key, count]) => {
      const [position, segment] = key.split(" | ");
      return { position, segment, count };
    });

  // Display as table
  console.log("| Position | LED Segment | Minutes ON |");
  console.log("|----------|-------------|-----------|");
  sortedResults.forEach(({ position, segment, count }) => {
    console.log(`| ${position} | ${segment} | ${count} |`);
  });

  console.log("\n📊 Summary Statistics:");
  console.log(`Total LEDs: ${ledCounts.size}`);
  console.log(
    `Most used LED: ${sortedResults[sortedResults.length - 1].position} - ${sortedResults[sortedResults.length - 1].segment} (${sortedResults[sortedResults.length - 1].count} minutes)`
  );
  console.log(
    `Least used LEDs: ${sortedResults.filter((r) => r.count === sortedResults[0].count).map((r) => `${r.position} - ${r.segment}`).join(", ")} (${sortedResults[0].count} minutes)`
  );
}

main().catch(console.error);
