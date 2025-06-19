import { Activity, ActivityType } from "../entities/Activity";
import { User } from "../entities/User";

export function formatActivities(activities: Activity[], userMap: Record<number, User>) {
  return activities.map(activity => {
    let actionText = '';
    const referencedUser = userMap[activity.reference_id];

    switch (activity.type) {
      case ActivityType.POST_CREATED:
        actionText =  `You created post ${activity.reference_id}`;
        break;
      case ActivityType.POST_DELETED:
        actionText = `You deleted post ${activity.reference_id}`;
        break;
      case ActivityType.POST_LIKED:
        actionText = `You liked post ${activity.reference_id}`;
        break;
      case ActivityType.USER_FOLLOWED:
        actionText = `You started following ${referencedUser?.firstName || 'a user'}`;
        break;
      case ActivityType.USER_UNFOLLOWED:
        actionText = `You unfollowed ${referencedUser?.firstName || 'a user'}`;
        break;
      case ActivityType.FOLLOWED_BY:
        actionText = `${referencedUser?.firstName || 'Someone'} started following you`;
        break;
      case ActivityType.UNFOLLOWED_BY:
        actionText = `${referencedUser?.firstName || 'Someone'} unfollowed you`;
        break;
      default:
        actionText = 'Unknown activity';
    }

    return {
      id: activity.id,
      action: actionText,
      createdAt: activity.createdAt,
    };
  });
}