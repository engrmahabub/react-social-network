import { User } from 'domain/users'

import { Comment } from 'domain/comments'

/**
 * Comment service interface
 *
 * @export
 * @interface ICommentService
 */
export interface ICommentService {

  addComment: (postId: string, comment: Comment) => Promise<string>
  getComments: (callback: (resultComments: { [postId: string]: { [commentId: string]: Comment } }) => void) => void
  updateComment: (commentId: string, postId: string, comment: Comment) => Promise<void>
  deleteComment: (commentId: string, postId: string) => Promise<void>

}
