export type Role = "uczen" | "nauczyciel" | "rodzic" | "admin";

export interface TokenPayload {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  uczen_id?: number;
  klasa_id?: number;
  nauczyciel_id?: number;
  rodzic_id?: number;
  dzieci_ids?: number[];
  exp: number;
}

export interface CurrentUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  studentId?: number;
  classId?: number;
  teacherId?: number;
  parentId?: number;
  childrenIds?: number[];
}