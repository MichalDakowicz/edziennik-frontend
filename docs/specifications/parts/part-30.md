## Part 30 – Known API Quirks / Field Name Notes

These inconsistencies exist in the current API and must be handled defensively in the frontend:

1. **Subject `nazwa` field**: `Przedmiot` model uses `nazwa` (lowercase). The API may return it as `nazwa` or `Nazwa` depending on serializer. Access as `s.nazwa ?? s.Nazwa`.

2. **Attendance status**: The `status` field in `Frekwencja` API response may be an object `{ id, Wartosc }` or just an integer ID. Normalize:

    ```typescript
    function resolveStatusName(
        status: Attendance["status"],
        statusMap: Map<number, string>,
    ): string {
        if (status == null) return "";
        if (typeof status === "object")
            return status.Wartosc ?? statusMap.get(status.id ?? 0) ?? "";
        return statusMap.get(Number(status)) ?? "";
    }
    ```

3. **TimetableEntry fields**: use both `entry.dzien_tygodnia` and fallback `entry.DzienTygodnia`.

4. **ClassInfo**: `klasa.numer` may be null; `klasa.nazwa` may be null. Display as `${numer} ${nazwa}` or just `nazwa` or `#${id}`.

5. **Grade `wartosc`**: stored as `DecimalField` string. Polish grade scale: `1.00`=1, `3.50`=3+, `4.75`=5-, `5.00`=5, `6.00`=6.

6. **Message `nadawca` / `odbiorca`**: these are `user.id` values (from `User` model), NOT `uczen.id` or `nauczyciel.id`. Use `/users/<id>/` to resolve names.

7. **`PlanyZajec.wpisy`**: an array of PlanWpis IDs, but `GET /plan-wpisy/?plan_id=<id>` fetches the actual entries. Use the second form.

---

