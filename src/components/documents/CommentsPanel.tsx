import React, { useState, useEffect } from "react";
import {
  makeStyles,
  tokens,
  Button,
  Textarea,
  Spinner,
  Badge,
  Text,
  Divider,
} from "@fluentui/react-components";
import {
  Add20Regular,
  Dismiss20Regular,
  ArrowLeft20Regular,
} from "@fluentui/react-icons";
import {
  useGetDocumentCommentsQuery,
  useAddDocumentCommentMutation,
} from "@/services/apiSlice";
import { formatDistanceToNow } from "date-fns";

const useStyles = makeStyles({
  panel: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  headerTitle: {
    fontSize: "16px",
    fontWeight: 600,
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  commentItem: {
    padding: "12px",
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: "6px",
    borderLeft: `3px solid ${tokens.colorBrandBackground}`,
  },
  commentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  commentUser: {
    fontWeight: 600,
    fontSize: "13px",
    color: tokens.colorNeutralForeground1,
  },
  commentTime: {
    fontSize: "11px",
    color: tokens.colorNeutralForeground3,
  },
  commentText: {
    fontSize: "13px",
    lineHeight: "1.5",
    marginBottom: "8px",
    color: tokens.colorNeutralForeground2,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    textAlign: "center",
    color: tokens.colorNeutralForeground3,
  },
  addCommentSection: {
    padding: "16px",
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  textarea: {
    width: "100%",
    minHeight: "80px",
    marginBottom: "8px",
  },
});

interface CommentsPanelProps {
  docId: number;
  docName: string;
  onClose: () => void;
}

export const CommentsPanel: React.FC<CommentsPanelProps> = ({
  docId,
  docName,
  onClose,
}) => {
  const styles = useStyles();
  const [newComment, setNewComment] = useState("");

  const {
    data: comments = [],
    isLoading: commentsLoading,
    refetch: refetchComments,
  } = useGetDocumentCommentsQuery(docId, {
    skip: !docId,
  });

  const [addComment, { isLoading: addingComment }] =
    useAddDocumentCommentMutation();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment({
        DocID: docId,
        Comment: newComment.trim(),
      }).unwrap();
      setNewComment("");
      refetchComments();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <Button
          appearance="subtle"
          icon={<ArrowLeft20Regular />}
          onClick={onClose}
          size="small"
        />
        <div style={{ flex: 1, marginLeft: "12px" }}>
          <Text className={styles.headerTitle}>Commentary</Text>
          <div
            style={{ fontSize: "12px", color: tokens.colorNeutralForeground3 }}
          >
            {docName}
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className={styles.content}>
        {commentsLoading ? (
          <div className={styles.emptyState}>
            <Spinner size="medium" />
          </div>
        ) : comments.length === 0 ? (
          <div className={styles.emptyState}>
            <Text>No comments yet</Text>
            <Text style={{ fontSize: "12px", marginTop: "8px" }}>
              Be the first to add a comment
            </Text>
          </div>
        ) : (
          (comments as any[]).map((comment, index) => (
            <div key={index} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <Text className={styles.commentUser}>{comment.FullName}</Text>
                <Text className={styles.commentTime}>
                  {formatDistanceToNow(new Date(comment.TimeRecord), {
                    addSuffix: true,
                  })}
                </Text>
              </div>
              <Text className={styles.commentText}>{comment.Comment}</Text>
              <Badge
                appearance="outline"
                size="small"
                style={{ marginTop: "4px" }}
              >
                {comment.StatusName} • v{comment.DocVersion}
              </Badge>
            </div>
          ))
        )}
      </div>

      {/* Add Comment */}
      <div className={styles.addCommentSection}>
        <Textarea
          className={styles.textarea}
          value={newComment}
          onChange={(_, data) => setNewComment(data.value)}
          placeholder="Add a comment..."
        />
        <Button
          appearance="primary"
          icon={addingComment ? <Spinner size="tiny" /> : <Add20Regular />}
          onClick={handleAddComment}
          disabled={!newComment.trim() || addingComment}
        >
          {addingComment ? "Adding..." : "Add Comment"}
        </Button>
      </div>
    </div>
  );
};
