import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import HomeworkCard from "./HomeworkCard";

describe("HomeworkCard", () => {
  it("renderuje dane i wywołuje onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <HomeworkCard
        item={{
          id: 1,
          klasa: 1,
          przedmiot: 2,
          nauczyciel: 3,
          opis: "Przeczytaj rozdział 3",
          data_wystawienia: "2026-03-25",
          termin: "2026-03-29",
        }}
        subject={{ id: 2, nazwa: "Matematyka" }}
        onClick={onClick}
      />, 
    );

    expect(screen.getByText("Matematyka")).toBeInTheDocument();
    expect(screen.getByText("Przeczytaj rozdział 3")).toBeInTheDocument();

    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("pokazuje badge zaległe dla przeterminowanego terminu", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-27T12:00:00Z"));

    render(
      <HomeworkCard
        item={{
          id: 2,
          klasa: 1,
          przedmiot: 2,
          nauczyciel: 3,
          opis: "Zadanie",
          data_wystawienia: "2026-03-20",
          termin: "2026-03-21",
        }}
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText(/zaległe/i)).toBeInTheDocument();

    vi.useRealTimers();
  });
});
