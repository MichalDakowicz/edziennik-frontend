import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { getInboxMessages, getSentMessages, getTeachers, getUserProfile, markMessageRead, sendMessage } from "../../services/api";
import { getCurrentUser } from "../../services/auth";
import { keys } from "../../services/queryKeys";
import { POLL_INTERVAL_MS } from "../../constants";
import { Spinner } from "../ui/Spinner";
import { ErrorState } from "../ui/ErrorState";
import type { Message } from "../../types/api";
import MessageList from "./MessageList";
import MessageDetail from "./MessageDetail";
import ComposeMessage from "./ComposeMessage";

type Tab = "inbox" | "sent" | "announcements";

export default function MessagesPage() {
  const user = getCurrentUser();
  const queryClient = useQueryClient();
  const { messageId } = useParams();
  
  const [tab, setTab] = useState<Tab>("inbox");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const inboxQuery = useQuery({
    queryKey: user ? keys.inbox(user.id) : ["inbox", "na"],
    queryFn: () => getInboxMessages(user?.id as number),
    enabled: Boolean(user),
    refetchInterval: tab === "inbox" ? POLL_INTERVAL_MS : false,
  });

  const sentQuery = useQuery({
    queryKey: user ? keys.sent(user.id) : ["sent", "na"],
    queryFn: () => getSentMessages(user?.id as number),
    enabled: Boolean(user),
  });

  const teachersQuery = useQuery({ queryKey: keys.teachers(), queryFn: getTeachers });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => markMessageRead(id),
    onError: () => toast.error("Nie udało się oznaczyć wiadomości jako przeczytanej"),
    onSuccess: () => {
      if (user) queryClient.invalidateQueries({ queryKey: keys.inbox(user.id) });
    },
  });

  useEffect(() => {
    if (messageId && inboxQuery.data) {
      const idNum = Number(messageId);
      const message = inboxQuery.data.find((m) => m.id === idNum);
      if (message) {
        setSelectedMessage(message);
        if (!message.przeczytana && tab === "inbox") {
          markReadMutation.mutate(message.id);
        }
      }
    } else if (!messageId) {
      setSelectedMessage(null);
    }
  }, [messageId, inboxQuery.data, tab]);

  const userIds = useMemo(() => {
    const fromInbox = inboxQuery.data?.flatMap((message) => [message.nadawca, message.odbiorca]) ?? [];
    const fromSent = sentQuery.data?.flatMap((message) => [message.nadawca, message.odbiorca]) ?? [];
    return [...new Set([...fromInbox, ...fromSent])];
  }, [inboxQuery.data, sentQuery.data]);

  const usersQuery = useQuery({
    queryKey: ["message-users", userIds],
    queryFn: async () => {
      const entries = await Promise.all(userIds.map(async (id) => ({ id, user: await getUserProfile(id) })));
      return new Map(entries.map((entry) => [entry.id, `${entry.user.first_name} ${entry.user.last_name}`]));
    },
    enabled: userIds.length > 0,
  });

  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onError: () => toast.error("Nie udało się wysłać wiadomości"),
    onSuccess: () => {
      toast.success("Wiadomość wysłana");
      if (user) queryClient.invalidateQueries({ queryKey: keys.sent(user.id) });
    },
  });

  const unreadCount = useMemo(() => inboxQuery.data?.filter((m) => !m.przeczytana).length ?? 0, [inboxQuery.data]);

  const filteredMessages = useMemo(() => {
    const active = tab === "inbox" ? (inboxQuery.data ?? []) : tab === "sent" ? (sentQuery.data ?? []) : [];
    if (!searchQuery.trim()) return active;
    const userNameMapFallback = usersQuery.data ?? new Map<number, string>();
    const resolveFallback = (id: number) => userNameMapFallback.get(id) ?? `Użytkownik #${id}`;
    const q = searchQuery.toLowerCase();
    return active.filter(
      (m) =>
        m.temat.toLowerCase().includes(q) ||
        m.tresc.toLowerCase().includes(q) ||
        resolveFallback(m.nadawca).toLowerCase().includes(q) ||
        resolveFallback(m.odbiorca).toLowerCase().includes(q),
    );
  }, [tab, inboxQuery.data, sentQuery.data, searchQuery, usersQuery.data]);

  if (!user) return <ErrorState message="Brak zalogowanego użytkownika" />;
  if ([inboxQuery, sentQuery, teachersQuery].some((q) => q.isPending)) return <Spinner />;
  const firstError = [inboxQuery, sentQuery, teachersQuery, usersQuery].find((q) => q.isError);
  if (firstError?.isError) return <ErrorState message={firstError.error.message} />;

  const userNameMap = usersQuery.data ?? new Map<number, string>();
  const resolveUserName = (id: number) => userNameMap.get(id) ?? `Użytkownik #${id}`;

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.przeczytana && tab === "inbox") {
      markReadMutation.mutate(message.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">Wiadomości</h1>
          <p className="text-on-surface-variant font-body text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} nieprzeczytanych wiadomości` : "Skrzynka odbiorcza"}
          </p>
        </div>
        <button
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          onClick={() => setComposeOpen(true)}
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>edit</span>
          Nowa wiadomość
        </button>
      </header>

      {/* Two-pane message area */}
      <div className="flex h-[calc(100vh-16rem)] min-h-[500px] overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest shadow-sm">
        {/* Left Pane: Thread List */}
        <section className="w-full md:w-[380px] flex flex-col bg-surface border-r border-outline-variant/15">
          {/* Tabs + Search */}
          <div className="p-4 pb-2 space-y-3">
            <div className="flex gap-2">
              <button
                className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all ${
                  tab === "inbox"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                }`}
                onClick={() => setTab("inbox")}
              >
                Odebrane
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all ${
                  tab === "sent"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                }`}
                onClick={() => setTab("sent")}
              >
                Wysłane
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all ${
                  tab === "announcements"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                }`}
                onClick={() => setTab("announcements")}
              >
                Ogłoszenia
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
              <input
                className="w-full bg-surface-container-lowest border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                placeholder="Szukaj w wiadomościach..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {tab === "inbox" && unreadCount > 0 && (
              <div className="flex items-center justify-between px-2">
                <h3 className="font-headline font-bold text-sm text-on-surface-variant">Ostatnie</h3>
                <span className="text-xs font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded-full">{unreadCount} nieprzeczytanych</span>
              </div>
            )}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto px-3 space-y-1.5 pb-4">
            {tab === "announcements" ? (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 text-outline">campaign</span>
                <p className="text-sm font-medium">Brak ogłoszeń</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 text-outline">mail</span>
                <p className="text-sm font-medium">Brak wiadomości</p>
              </div>
            ) : (
              <MessageList messages={filteredMessages} mode={tab} onOpen={openMessage} resolveUserName={resolveUserName} selectedId={selectedMessage?.id ?? null} />
            )}
          </div>
        </section>

        {/* Right Pane: Active Conversation */}
        <section className="hidden md:flex flex-1 flex-col bg-surface-container-low relative">
          {selectedMessage ? (
            <>
              {/* Header */}
              <div className="px-6 py-3 bg-white/50 border-b border-outline-variant/15 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-surface-variant font-bold text-sm">
                    {resolveUserName(tab === "inbox" ? selectedMessage.nadawca : selectedMessage.odbiorca).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-headline font-bold text-base leading-tight text-on-surface">
                      {resolveUserName(tab === "inbox" ? selectedMessage.nadawca : selectedMessage.odbiorca)}
                    </h2>
                    <p className="text-xs text-secondary">{selectedMessage.temat}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-outline"
                    onClick={() => setSelectedMessage(null)}
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>
              {/* Message Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <MessageDetail
                  message={selectedMessage}
                  open={true}
                  onClose={() => setSelectedMessage(null)}
                  resolveUserName={resolveUserName}
                  inline
                />
              </div>
              {/* Reply Input */}
              <div className="p-4 bg-white/50 border-t border-outline-variant/15">
                <div className="flex items-end gap-3 bg-surface-container-high rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all">
                  <textarea
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2.5 px-3 resize-none max-h-24 overflow-y-auto"
                    placeholder="Napisz odpowiedź..."
                    rows={1}
                  />
                  <button
                    className="bg-primary text-white p-2.5 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    onClick={() => setComposeOpen(true)}
                  >
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-3 text-outline">draft</span>
              <p className="text-base font-bold font-headline text-on-surface-variant/60">Wybierz wiadomość</p>
              <p className="text-xs text-on-surface-variant/40 mt-1">Kliknij na wątek po lewej, aby wyświetlić rozmowę</p>
            </div>
          )}
        </section>
      </div>

      <MessageDetail
        message={selectedMessage}
        open={false}
        onClose={() => setSelectedMessage(null)}
        resolveUserName={resolveUserName}
      />

      <ComposeMessage
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        teachers={teachersQuery.data ?? []}
        loading={sendMutation.isPending}
        onSubmit={async (values) => {
          await sendMutation.mutateAsync({
            nadawca: user.id,
            odbiorca: values.odbiorca,
            temat: values.temat,
            tresc: values.tresc,
          });
        }}
      />
    </div>
  );
}
