import { format, formatDistanceToNow, parseISO } from "date-fns";
import { pl } from "date-fns/locale";

export const formatDate = (iso: string): string =>
  format(parseISO(iso), "dd.MM.yyyy", { locale: pl });

export const formatDateTime = (iso: string): string =>
  format(parseISO(iso), "dd.MM.yyyy HH:mm", { locale: pl });

export const formatRelative = (iso: string): string =>
  formatDistanceToNow(parseISO(iso), { locale: pl, addSuffix: true });