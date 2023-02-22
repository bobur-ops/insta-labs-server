import { IgApiClient } from "instagram-private-api";

export const getCurrentUser = async (ig: IgApiClient) => {
  try {
    const currentUser = await ig.account.currentUser();

    const info = await ig.user.info(currentUser.pk);

    const data = {
      ...currentUser,
      followingCount: info.following_count,
      followersCount: info.follower_count,
    };

    return data;
  } catch (error) {
    console.log(error);
  }
};
