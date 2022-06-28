import client from "../../client";
import { protectedResolver } from "../../users/users.utils";
import { processHashtags } from "../photo.utils";

export default {
  Mutation: {
    uploadPhoto: protectedResolver(
      async (_, { file, caption }, { loggedInUser }) => {
        let hashtagObj = [];
        if (caption) {
          hashtagObj = processHashtags(caption);
          console.log(hashtagObj);
        }
        return client.photo.create({
          data: {
            file,
            caption,
            user: { connect: { id: loggedInUser.id } },
            ...(hashtagObj.length > 0 && {
              hashtags: {
                connectOrCreate: hashtagObj,
              },
            }),
          },
        });
        //save the photo with the paresed hashtags
        //add the phtoo to the hashtag
      }
    ),
  },
};
