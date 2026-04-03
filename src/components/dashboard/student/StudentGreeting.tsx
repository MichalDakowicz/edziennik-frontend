import { Link } from "react-router-dom";

type StudentGreetingProps = {
    firstName: string;
    weightedAverage: number;
    unreadCount: number;
};

export default function StudentGreeting({
    firstName,
    weightedAverage,
    unreadCount,
}: StudentGreetingProps) {
    return (
        <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface font-headline tracking-tight">
                    Dzień dobry, {firstName}
                </h1>
                <p className="mt-2 text-on-surface-variant text-lg font-body">
                    Twój dzisiejszy przegląd postępów akademickich.
                </p>
            </div>

            <div className="flex flex-wrap gap-4">
                <div className="bg-surface-container-lowest px-6 py-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)]">
                    <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-1 font-body">
                        Średnia ocen
                    </p>
                    <p className="text-2xl font-black text-primary font-headline">
                        {weightedAverage.toFixed(2)}
                    </p>
                </div>

                <Link
                    to="/dashboard/messages"
                    className="bg-surface-container-lowest px-6 py-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] transition-all hover:shadow-[0_12px_36px_-4px_rgba(25,28,29,0.12)]"
                >
                    <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-1 font-body">
                        Nieprzeczytane
                    </p>
                    <p className="text-2xl font-black text-on-surface font-headline">
                        {unreadCount}
                    </p>
                </Link>
            </div>
        </section>
    );
}
