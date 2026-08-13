export const USER_CREATED_EVENT = "user.created";

export interface UserCreatedEvent {
  eventId: string;
  eventType: typeof USER_CREATED_EVENT;
  timestamp: string;
  data: {
    userId: string;
    name: string;
    email: string;
  };
}
