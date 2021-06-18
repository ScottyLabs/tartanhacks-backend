import { IEvent } from "../_types/Event";
import Event from "../models/Event";

declare global {
  // eslint-disable-next-line no-var
  var tartanhacks: IEvent;
}

/**
 * Get the TartanHacks event document singleton
 */
export const getTartanHacks = async (): Promise<IEvent> => {
  if (global.tartanhacks != null) {
    return global.tartanhacks;
  }
  const event = await Event.findOne({ name: "TartanHacks" });
  if (event == null) {
    const tartanhacks = new Event({
      name: "TartanHacks",
      website: "http://tartanhacks.com/",
      enableCheckin: true,
      enableProjects: true,
      enableTeams: true,
      enableSponsors: true,
    });
    await tartanhacks.save();

    global.tartanhacks = tartanhacks;
    return tartanhacks;
  } else {
    global.tartanhacks = event;
    return event;
  }
};
