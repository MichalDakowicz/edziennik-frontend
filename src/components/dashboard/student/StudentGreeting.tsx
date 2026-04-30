type StudentGreetingProps = {
    firstName: string;
};

export default function StudentGreeting({ firstName }: StudentGreetingProps) {
    return (
        <section>
            <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface font-headline tracking-tight">
                Dzień dobry, {firstName}
            </h1>
            <p className="mt-2 text-on-surface-variant text-lg font-body">
                Twój dzisiejszy przegląd postępów akademickich.
            </p>
        </section>
    );
}
