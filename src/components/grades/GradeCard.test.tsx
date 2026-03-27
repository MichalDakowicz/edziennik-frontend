import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Grade } from "../../types/api";
import GradeCard from "./GradeCard";

const grades: Grade[] = [
  {
    id: 1,
    wartosc: "5",
    waga: 2,
    opis: "Kartkówka",
    data_wystawienia: "2026-03-20",
    czy_punkty: false,
    czy_opisowa: false,
    czy_do_sredniej: true,
    uczen: 10,
    nauczyciel: 11,
    przedmiot: 12,
  },
  {
    id: 2,
    wartosc: "4",
    waga: 1,
    opis: null,
    data_wystawienia: "2026-03-22",
    czy_punkty: false,
    czy_opisowa: false,
    czy_do_sredniej: true,
    uczen: 10,
    nauczyciel: 11,
    przedmiot: 12,
  },
];

describe("GradeCard", () => {
  it("renderuje średnią i listę ocen", () => {
    render(<GradeCard subjectName="Matematyka" grades={grades} onSelect={vi.fn()} />);

    expect(screen.getByText("Matematyka")).toBeInTheDocument();
    expect(screen.getByText("Średnia: 4.67")).toBeInTheDocument();
    expect(screen.getByText("Propozycja: 4")).toBeInTheDocument();
    expect(screen.getByText("Kartkówka")).toBeInTheDocument();
    expect(screen.getByText("Ocena cząstkowa")).toBeInTheDocument();
  });

  it("wywołuje onSelect po kliknięciu w wiersz", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<GradeCard subjectName="Matematyka" grades={grades} onSelect={onSelect} />);

    await user.click(screen.getByText("Kartkówka"));

    expect(onSelect).toHaveBeenCalledWith(grades[0]);
  });
});
