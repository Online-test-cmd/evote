import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          The Future of Event Voting
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Secure, real-time, and beautifully designed. Empower your audience to vote seamlessly on any device.
        </p>
        <div className="space-x-4">
          <Link href="/events">
            <Button size="lg">Explore Events</Button>
          </Link>
          <Link href="/dashboard/events/create">
            <Button variant="outline" size="lg">
              Create Event
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
