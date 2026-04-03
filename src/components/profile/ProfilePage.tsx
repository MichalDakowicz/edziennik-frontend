import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserSettings, updateUserSettings } from "../../services/api";
import { getCurrentUser } from "../../services/auth";
import { keys } from "../../services/queryKeys";
import { ErrorState } from "../ui/ErrorState";
import { Spinner } from "../ui/Spinner";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

type Theme = "light" | "dark" | "system";

const applyTheme = (theme: Theme) => {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    return;
  }
  if (theme === "light") {
    document.documentElement.classList.remove("dark");
    return;
  }
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", isDark);
};

export default function ProfilePage() {
  const user = getCurrentUser();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: user ? keys.userProfile(user.id) : ["profile", "na"],
    queryFn: () => getUserSettings(user?.id as number),
    enabled: Boolean(user),
  });

  const updateMutation = useMutation({
    mutationFn: ({ profileId, theme }: { profileId: number; theme: Theme }) =>
      updateUserSettings(profileId, { theme_preference: theme }),
    onSuccess: () => {
      toast.success("Zapisano preferencje");
      if (user) queryClient.invalidateQueries({ queryKey: keys.userProfile(user.id) });
    },
    onError: () => {
      toast.error("Nie udało się zapisać preferencji");
    },
  });

  useEffect(() => {
    const currentTheme = profileQuery.data?.[0]?.theme_preference;
    if (!currentTheme) return;
    applyTheme(currentTheme);
    if (currentTheme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [profileQuery.data]);

  if (!user) return <ErrorState message="Brak zalogowanego użytkownika" />;
  if (profileQuery.isPending) return <Spinner />;
  if (profileQuery.isError) return <ErrorState message={profileQuery.error.message} />;

  const profile = profileQuery.data?.[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">Profil</h1>
        </div>
      </div>

      <Card>
        <h2 className="section-title mb-3">Dane osobowe</h2>
        <p>Imię i nazwisko: {user.firstName} {user.lastName}</p>
        <p>Nazwa użytkownika: {user.username}</p>
        <p>E-mail: {user.email}</p>
        <div className="mt-2"><Badge variant="info">{user.role}</Badge></div>
      </Card>

      <Card>
        <h2 className="section-title mb-3">Preferencje</h2>
        {profile ? (
          <div className="flex gap-2">
            {([
              ["Jasny", "light"],
              ["Ciemny", "dark"],
              ["Systemowy", "system"],
            ] as const).map(([label, value]) => (
              <button
                key={value}
                className={profile.theme_preference === value ? "btn-primary" : "btn-ghost"}
                onClick={() => {
                  applyTheme(value);
                  updateMutation.mutate({ profileId: profile.id, theme: value });
                }}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-on-surface-variant font-body">Brak ustawień profilu</p>
        )}
      </Card>

      <Card>
        <h2 className="section-title mb-3">Bezpieczeństwo</h2>
        <p className="text-on-surface-variant font-body">Zmiana hasła jest możliwa poprzez administratora systemu.</p>
      </Card>
    </div>
  );
}