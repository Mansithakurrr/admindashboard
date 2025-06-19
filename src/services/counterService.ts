// import Counter from "@/models/Counter";

// export async function getNextSequenceValue(counterName: string): Promise<number> {
//   const counter = await Counter.findOneAndUpdate(
//     { name: counterName },
//     { $inc: { value: 1 } },
//     { new: true, upsert: true }
//   );
//   if (!counter) throw new Error("Failed to get next sequence value");
//   return counter.value;
// }

// export function formatSerialNumber(num: number): string {
//   return `TICK-${num.toString().padStart(5, "0")}`;
// }
