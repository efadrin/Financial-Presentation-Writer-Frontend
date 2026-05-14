import React, { useState, useEffect, useRef } from "react";
import {
  makeStyles,
  tokens,
  Text,
  Spinner,
  Avatar,
  Textarea,
  Button,
  Badge,
} from "@fluentui/react-components";
import { Send20Regular, Dismiss20Regular } from "@fluentui/react-icons";
import { formatDistanceToNow } from "date-fns";
import {
  useGetDocumentCommentsQuery,
  useAddDocumentCommentMutation,
} from "@/services/apiSlice";
import {
  DocumentListResponse,
  DocumentCommentResponse,
} from "@/interfaces/DocumentList";
import { BottomSheet } from "../common/BottomSheet";
import { useAppSelector } from "@/store";

const useStyles = makeStyles({
  commentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    minHeight: "200px",
  },
  commentItem: {
    display: "flex",
    gap: "10px",
    padding: "10px",
    borderRadius: "8px",
    backgroundColor: tokens.colorNeutralBackground2,
  },
  commentContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  commentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commentUser: {
    fontWeight: 600,
    fontSize: "13px",
  },
  commentTime: {
    fontSize: "11px",
    color: tokens.colorNeutralForeground3,
  },
  commentText: {
    fontSize: "13px",
    lineHeight: "1.5",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px",
    color: tokens.colorNeutralForeground3,
  },
  inputArea: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-end",
    width: "100%",
  },
});

interface CommentsBottomSheetProps {
  document: DocumentListResponse;
  open: boolean;
  onClose: () => void;
}

export const CommentsBottomSheet: React.FC<CommentsBottomSheetProps> = ({
  document,
  open,
  onClose,
}) => {
  const styles = useStyles();
  const settings = useAppSelector((state) => state.setting);
  const [newComment, setNewComment] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const accountName = settings.account?.AccountName || "";
  const srvrID = parseInt(settings.account?.SrvrID || "0", 10);
  const userID = parseInt(settings.account?.UserID?.toString() || "0", 10);
  const accountID = parseInt(settings.account?.AccountID || "0", 10);

  const {
    data: commentsResponse,
    isLoading,
    refetch,
  } = useGetDocumentCommentsQuery(
    { accountName, docID: document.DocID, srvrID },
    { skip: !open || !accountName || !srvrID },
  );
  const comments: DocumentCommentResponse[] = commentsResponse?.Data || [];

  const [addComment, { isLoading: adding }] = useAddDocumentCommentMutation();

  useEffect(() => {
    if (open && accountName) {
      refetch();
    }
  }, [open, accountName, refetch]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addComment({
        AccountName: accountName,
        SrvrID: srvrID,
        DocID: document.DocID,
        UserID: userID,
        AccountID: accountID,
        Comment: newComment,
        DocVersion: 1,
        StatusName: document.StatusName || "Review",
      }).unwrap();
      setNewComment("");
      refetch();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Commentary"
      subtitle={document.DocName}
      maxHeight="80vh"
      footer={
        <div className={styles.inputArea}>
          <Textarea
            value={newComment}
            onChange={(_, data) => setNewComment(data.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment..."
            style={{ flex: 1, minHeight: "36px" }}
          />
          <Button
            appearance="primary"
            icon={adding ? <Spinner size="tiny" /> : <Send20Regular />}
            onClick={handleAddComment}
            disabled={!newComment.trim() || adding}
            style={{ minWidth: "36px", height: "36px" }}
          />
        </div>
      }
    >
      <div ref={scrollRef} className={styles.commentsList}>
        {isLoading ? (
          <div className={styles.emptyState}>
            <Spinner size="small" />
          </div>
        ) : comments.length === 0 ? (
          <div className={styles.emptyState}>
            <Text>No comments yet</Text>
          </div>
        ) : (
          comments.map((comment, index) => (
            <div key={index} className={styles.commentItem}>
              <Avatar name={comment.FullName} size={32} color="colorful" />
              <div className={styles.commentContent}>
                <div className={styles.commentHeader}>
                  <Text className={styles.commentUser}>{comment.FullName}</Text>
                  <Text className={styles.commentTime}>
                    {formatDistanceToNow(new Date(comment.TimeRecord), {
                      addSuffix: true,
                    })}
                  </Text>
                </div>
                <Text className={styles.commentText}>{comment.Comment}</Text>
                <Badge appearance="outline" size="small">
                  {comment.StatusName} • v{comment.DocVersion}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </BottomSheet>
  );
};
