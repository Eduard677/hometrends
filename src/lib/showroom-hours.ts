const formatter = new Intl.DateTimeFormat("en-IE", { timeZone: "Europe/Dublin", weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function showroomStatus(now: Date) {
  const parts = formatter.formatToParts(now);
  const part = (key: string) => parts.find(p => p.type === key)?.value ?? "";
  const day = days.indexOf(part("weekday"));
  const minutes = Number(part("hour")) * 60 + Number(part("minute"));
  if (day === 0) return "Closed, opens 9:30am Monday";
  if (minutes < 570) return "Closed, opens at 9:30am today";
  if (minutes < 1080) return "Open until 6pm today";
  return `Closed, opens 9:30am ${day === 6 ? "Monday" : days[day + 1]}`;
}
