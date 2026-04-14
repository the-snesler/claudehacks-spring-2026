import * as cheerio from "cheerio";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import * as fs from "fs";

dayjs.extend(customParseFormat);

const matchesAny = (strs: string[], regexes: RegExp[]) =>
  regexes.some((regex) => strs.some((str) => str && regex.test(str)));

const categorize = (title: string, subtitle: string, description: string, locations: { name: string }[], dropIn: boolean) => {
  if (dropIn) return "All Day";
  if (matchesAny([title, subtitle], [/Let's Talk/i, /Table/i])) return "Let's Talk";
  if (matchesAny([title, subtitle, description], [/Meeting/i, /WUD/i, /Club/i, /Committee/i])) return "Club";
  if (matchesAny([title, subtitle], [/Lecture/i, /Speaker/i, /Talk/i, /Seminar/i])) return "Lecture";
  if (matchesAny([title, subtitle], [/Office Hours/i, /Drop.In/i])) return "Drop-in";
  if (matchesAny([title, subtitle], [/Meeting/i, /Meetup/i, /Breakfast/i, /Lunch/i, /Dinner/i])) return "Meetup";
  if (matchesAny([title, subtitle, locations[0]?.name ?? ""], [
    /Stadium/i, /Field House/i, /Randall/i, /Gym/i, /Court/i, /UW vs\./i, /Wisconsin vs\./i,
    /Football/i, /Softball/i, /Tennis/i, /Hockey/i, /Soccer/i, /Volleyball/i, /Basketball/i, /Wrestling/i,
  ])) return "Sports";
  return "Other";
};

const getEventDescription = async (id: string): Promise<string> => {
  const res = await fetch("http://today.wisc.edu/events/view/" + id);
  const $ = cheerio.load(await res.text());
  return $("div.event-description").find("br").replaceWith("\n").end().text().trim();
};

const getEventsForPage = async (date: string, page: number) => {
  const res = await fetch(`http://today.wisc.edu/events/day/${date}?page=${page}`);
  const $ = cheerio.load(await res.text());
  const rows = $("div.events-list > ul.day-row > li.event-row");
  const events = [];

  for (const el of rows) {
    const title = $(el).find("h3.event-title > a").text();

    let start: string, end: string, allDay: boolean, dropIn: boolean;
    if ($(el).find("p:not([class])").text().trim() === "All day") {
      allDay = true;
      dropIn = false;
      start = dayjs(date).startOf("day").toISOString();
      end = dayjs(date).endOf("day").toISOString();
    } else {
      allDay = false;
      const time = $(el).find("p.event-time").text().replace(/[\s\.]/g, "");
      const timeParts = time.split("-");
      if (timeParts.length === 1) timeParts[1] = timeParts[0];
      const endParsed = dayjs(date + " " + timeParts[1], ["YYYY-MM-DD h:mma", "YYYY-MM-DD ha"]);
      if (!timeParts[0].endsWith("m")) {
        timeParts[0] += timeParts[1].substring(timeParts[1].length - 2);
      }
      const startParsed = dayjs(date + " " + timeParts[0], ["YYYY-MM-DD h:mma", "YYYY-MM-DD ha"]);
      if (!startParsed.isValid() || !endParsed.isValid()) {
        console.warn(`  Skipping unparseable time: "${time}" (${title})`);
        continue;
      }
      start = startParsed.toISOString();
      end = endParsed.toISOString();
      dropIn = endParsed.diff(startParsed, "hours") >= 6;
    }

    const subtitle = $(el).find("p.subtitle").text().replace(/[\n\.]/g, "");
    const locations = $(el).find("p.event-location > a").map((_, a) => ({
      name: $(a).text(),
      link: $(a).attr("href") as string,
    })).get();

    let link = $(el).find("h3.event-title > a").attr("href")!;
    if (link?.startsWith("/")) link = "https://today.wisc.edu" + link;

    const id = $(el).attr("id")!;
    const description = await getEventDescription(id);
    const type = categorize(title, subtitle, description, locations, dropIn);

    events.push({ id, date, title, subtitle, description, time: { start, end, allDay, dropIn }, locations, link, type });
  }

  return { events, done: rows.length < 20 };
};

const getEventsForDate = async (date: string) => {
  const all = [];
  for (let page = 1; ; page++) {
    const { events, done } = await getEventsForPage(date, page);
    all.push(...events);
    if (done) break;
  }
  return all;
};

const main = async () => {
  const startDate = dayjs("2026-04-14");
  const allEvents: any[] = [];

  for (let i = 0; i < 10; i++) {
    const date = startDate.add(i, "day").format("YYYY-MM-DD");
    console.log(`Fetching ${date}...`);
    try {
      const events = await getEventsForDate(date);
      console.log(`  ${events.length} events`);
      allEvents.push(...events);
    } catch (err) {
      console.warn(`  Failed: ${err}`);
    }
  }

  fs.writeFileSync("events.json", JSON.stringify(allEvents, null, 2));
  console.log(`\nWrote ${allEvents.length} events to events.json`);
};

main();
