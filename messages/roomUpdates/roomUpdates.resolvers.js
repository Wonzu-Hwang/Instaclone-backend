import { NEW_MESSAGE } from "../../constants";
import pubsub from "../../pubusb";

export default {
  Subscription: {
    roomUpdates: {
      subscribe: () => pubsub.asyncIterator(NEW_MESSAGE),
    },
  },
};
