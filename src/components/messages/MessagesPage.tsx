import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
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

type Tab = "inbox" | "sent";

export default function MessagesPage() {
  const user = getCurrentUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { messageId } = useParams();
  
  const [tab, setTab] = useState<Tab>("inbox");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

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

  if (!user) return <ErrorState message="Brak zalogowanego użytkownika" />;
  if ([inboxQuery, sentQuery, teachersQuery].some((q) => q.isPending)) return <Spinner />;
  const firstError = [inboxQuery, sentQuery, teachersQuery, usersQuery].find((q) => q.isError);
  if (firstError?.isError) return <ErrorState message={firstError.error.message} />;

  const inbox = inboxQuery.data ?? [];
  const sent = sentQuery.data ?? [];
  const active = tab === "inbox" ? inbox : sent;
  const userNameMap = usersQuery.data ?? new Map<number, string>();
  const resolveUserName = (id: number) => userNameMap.get(id) ?? `Użytkownik #${id}`;

  const openMessage = (message: Message) => {
    navigate(`/dashboard/messages/${message.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">Wiadomości</h1>
        </div>
      </div>
      <div className="flex gap-4 pb-2">
        <button className={tab === "inbox" ? "tab-active" : "tab-inactive"} onClick={() => setTab("inbox")}>Odebrane</button>
        <button className={tab === "sent" ? "tab-active" : "tab-inactive"} onClick={() => setTab("sent")}>Wysłane</button>
      </div>

      <MessageList messages={active} mode={tab} onOpen={openMessage} resolveUserName={resolveUserName} />

      <button
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
        aria-label="Nowa wiadomość"
        onClick={() => setComposeOpen(true)}
      >
        <Pencil size={18} />
      </button>

      <MessageDetail
        message={selectedMessage}
        open={Boolean(selectedMessage)}
        onClose={() => navigate("/dashboard/messages")}
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