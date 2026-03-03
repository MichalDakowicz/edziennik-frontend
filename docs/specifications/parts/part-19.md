## Part 19 – Messages Page

File: `src/components/messages/MessagesPage.tsx`

### Tab structure

Two tabs: **Odebrane** (inbox) | **Wysłane** (sent)

### Data fetched

```typescript
// Inbox
const { data: inbox, refetch: refetchInbox } = useQuery({
    queryKey: keys.inbox(userId),
    queryFn: () => getInboxMessages(userId),
    refetchInterval: POLL_INTERVAL_MS,
});

// Sent
const { data: sent } = useQuery({
    queryKey: keys.sent(userId),
    queryFn: () => getSentMessages(userId),
});
```

### Message list item

```
[blue dot if unread | grey dot if read]
[Subject in bold]
[From: sender name]              [relative time]
[Preview of first 120 chars of tresc]
```

Clicking opens `MessageDetail` modal with full content and marks as read via `PATCH /wiadomosci/<id>/`.

### Compose button

Floating action button (bottom-right corner) with `+` (Pencil icon). Opens `ComposeMessage` modal.

### ComposeMessage modal

Fields (use `react-hook-form` + `zod`):

- **Odbiorca** – searchable dropdown of teachers (fetched from `/nauczyciele/`). Display: `Jan Kowalski`. Value: `teacher.user.id`.
- **Temat** – text input, max 255 chars, required
- **Treść** – textarea, required

On submit: calls `sendMessage({ nadawca: currentUser.id, odbiorca, temat, tresc })`.
On success: `toast.success('Wiadomość wysłana')`, invalidate `keys.sent(userId)`, close modal.
On error: `toast.error('Nie udało się wysłać wiadomości')`.

```typescript
const schema = z.object({
    odbiorca: z.number({ required_error: "Wybierz odbiorcę" }),
    temat: z.string().min(1, "Temat jest wymagany").max(255),
    tresc: z.string().min(1, "Treść jest wymagana"),
});
```

---

