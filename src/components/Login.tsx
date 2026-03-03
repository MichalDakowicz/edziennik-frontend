import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getCurrentUser } from "../services/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/Card";
import { Button } from "./ui/Button";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getCurrentUser()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Nie udało się zalogować";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-0 shadow-lg border-border/50">
        <form onSubmit={onSubmit}>
          <CardHeader className="space-y-1 p-6 pb-4">
            <CardTitle className="text-2xl font-bold">Logowanie</CardTitle>
            <CardDescription className="text-muted-foreground">
              Wprowadź swoje dane uwierzytelniające
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium leading-none">Nazwa użytkownika</label>
              <input
                id="username"
                className="input-base"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Jan_Kowalski"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">Hasło</label>
              <input
                id="password"
                type="password"
                className="input-base"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error ? <p className="text-destructive text-sm font-medium">{error}</p> : null}
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Logowanie..." : "Zaloguj"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}