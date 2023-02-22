import {
  IgApiClient,
  AccountRepositoryLoginResponseLogged_in_user,
} from "instagram-private-api";

export const login = async (
  username: string,
  password: string,
  ig: IgApiClient
): Promise<AccountRepositoryLoginResponseLogged_in_user | undefined> => {
  try {
    const loggedInUser = await ig.account.login(username, password);

    return loggedInUser;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
