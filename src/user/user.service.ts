import { db } from "../utils/db.server";

export type User = {
  id: number;
  username: string;
  createdAt: Date;
  password: string;
  pk: string;
};

export const listUsers = async (): Promise<User[]> => {
  return db.user.findMany({
    select: {
      createdAt: true,
      id: true,
      username: true,
      password: true,
      pk: true,
    },
  });
};

export const getUser = async (id: number): Promise<User | null> => {
  return db.user.findUnique({
    where: {
      id,
    },
  });
};

export const createUser = async (
  user: Omit<User, "id">
): Promise<User | null> => {
  const { username, password, pk } = user;

  const userExists = await db.user.findFirst({
    where: {
      username,
    },
  });

  if (userExists) return null;

  return db.user.create({
    data: {
      username,
      password,
      pk,
    },
  });
};
