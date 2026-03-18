import React, {
  createContext,
  ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  Toaster,
  Toast,
  ToastTitle,
  ToastBody,
  ToastTrigger,
  useId,
  useToastController,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  dialogActionsClassNames,
  makeStyles,
} from "@fluentui/react-components";
import { Dismiss12Regular } from "@fluentui/react-icons";

export interface ConfirmationDialogAttribute {
  title: string;
  message?: string;
  action: {
    label: string;
    function?: (inputValue: string | null) => void;
  };
  cancelAction?: {
    label: string;
    function: () => void;
  };
  input?: {
    placeholder?: string;
    defaultValue?: string;
    inputType?: "text" | "number" | "email";
  };
}

export type UIOverlayContextType = {
  showToast: (
    title: string,
    message?: string,
    intent?: "success" | "error" | "info" | "warning",
  ) => void;
  showDialogPrompt: (
    props: ConfirmationDialogAttribute,
  ) => Promise<string | null>;
  toggleLoading: (state?: boolean) => void;
};

export const UIOverlayContext = createContext<UIOverlayContextType | undefined>(
  undefined,
);

const useStyles = makeStyles({
  dialog: {
    "@media screen and (max-width: 480px)": {
      maxWidth: "90vw",
    },
    [`& .${dialogActionsClassNames.root}`]: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
  },
  closeButton: {
    minWidth: "unset",
    padding: "2px",
    height: "20px",
    width: "20px",
  },
});

const UIOverlayProvider = ({ children }: { children: ReactNode }) => {
  const styles = useStyles();
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);
  const inputRef = useRef<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmationDialogAttribute, setConfirmationDialogAttribute] =
    useState<ConfirmationDialogAttribute | null>(null);

  const showDialogPrompt = useCallback(
    (attr: ConfirmationDialogAttribute): Promise<string | null> => {
      return new Promise((resolve) => {
        inputRef.current = attr.input?.defaultValue || "";

        const handleConfirm = () => {
          const inputValue = inputRef.current || null;
          resolve(inputValue);
          setOpen(false);
          if (attr.action?.function) {
            if (attr.action.function.length > 0) {
              attr.action.function(inputValue);
            } else {
              attr.action.function(null);
            }
          }
        };

        const handleCancel = () => {
          resolve(null);
          setOpen(false);
        };

        const updatedAttr: ConfirmationDialogAttribute = {
          ...attr,
          action: {
            ...attr.action,
            function: handleConfirm,
          },
          cancelAction: {
            label: "Cancel",
            function: handleCancel,
          },
        };

        setConfirmationDialogAttribute(updatedAttr);
        setOpen(true);
      });
    },
    [],
  );

  const showToast = useCallback(
    (
      title?: string,
      message?: string,
      intent: "success" | "error" | "info" | "warning" = "info",
    ) => {
      dispatchToast(
        <Toast>
          <ToastTitle
            action={
              <ToastTrigger>
                <Button
                  appearance="subtle"
                  icon={<Dismiss12Regular />}
                  size="small"
                  className={styles.closeButton}
                  aria-label="Close notification"
                />
              </ToastTrigger>
            }
          >
            {title}
          </ToastTitle>
          {message && <ToastBody>{message}</ToastBody>}
        </Toast>,
        {
          intent: intent,
          position: "top-end",
          timeout: 7000,
        },
      );
    },
    [dispatchToast, styles.closeButton],
  );

  const loadingCounter = useRef<number>(0);

  const toggleLoading = useCallback((state?: boolean) => {
    if (state === undefined) {
      if (loadingCounter.current > 0) {
        loadingCounter.current = Math.max(0, loadingCounter.current - 1);
      } else {
        loadingCounter.current++;
      }
    } else if (state) {
      loadingCounter.current++;
    } else {
      loadingCounter.current = Math.max(0, loadingCounter.current - 1);
    }
    setLoading(loadingCounter.current > 0);
  }, []);

  return (
    <UIOverlayContext.Provider
      value={{ showToast, showDialogPrompt, toggleLoading }}
    >
      {children}
      <Toaster
        toasterId={toasterId}
        position="top-end"
        offset={{ horizontal: 20, vertical: 20 }}
      />

      <Dialog
        open={open}
        onOpenChange={(_, data) => {
          if (!data.open) {
            setOpen(false);
            confirmationDialogAttribute?.cancelAction?.function?.();
          }
        }}
      >
        <DialogSurface className={styles.dialog}>
          <DialogBody>
            <DialogTitle>{confirmationDialogAttribute?.title}</DialogTitle>
            {confirmationDialogAttribute?.message && (
              <DialogContent>
                <p>{confirmationDialogAttribute.message}</p>
              </DialogContent>
            )}
            {confirmationDialogAttribute?.input && (
              <DialogContent
                style={{
                  display: "flex",
                  flexDirection: "column-reverse",
                  padding: "initial",
                }}
              >
                <input
                  type={confirmationDialogAttribute.input.inputType || "text"}
                  placeholder={
                    confirmationDialogAttribute.input.placeholder || ""
                  }
                  defaultValue={inputRef.current}
                  onChange={(e) => (inputRef.current = e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "90px",
                    boxSizing: "border-box",
                  }}
                />
              </DialogContent>
            )}
            <DialogActions>
              <Button
                appearance="primary"
                onClick={() => {
                  if (confirmationDialogAttribute?.action.function) {
                    confirmationDialogAttribute.action.function(
                      inputRef.current || null,
                    );
                  }
                }}
              >
                {confirmationDialogAttribute?.action.label || "OK"}
              </Button>
              <Button
                appearance="secondary"
                onClick={() => {
                  confirmationDialogAttribute?.cancelAction?.function?.();
                }}
              >
                {confirmationDialogAttribute?.cancelAction?.label || "Cancel"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </UIOverlayContext.Provider>
  );
};

export default UIOverlayProvider;
