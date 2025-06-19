import { Post } from '../entities/Post';

export function formatPosts(posts: Post[]) {
  return posts.map(post => ({
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    author: {
      id: post.user_id?.id || 0,
      firstName: post.user_id?.firstName || '',
      lastName: post.user_id?.lastName || '',
      email: post.user_id?.email || '',
    },
    likeCount: post.likes?.length || 0,
    hashtags: post.hashtags?.map(tag => tag.tag) || [],
  }));
}
