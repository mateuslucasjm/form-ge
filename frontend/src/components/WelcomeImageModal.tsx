import { type FC } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

interface WelcomeImageModalProps {
  open: boolean;
  onClose: () => void;
}

export const WelcomeImageModal: FC<WelcomeImageModalProps> = ({
  open,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            m: { xs: 1.5, sm: 2 },
            width: "100%",
            maxWidth: { xs: "min(380px, calc(100vw - 24px))", sm: 400, md: 420 },
            borderRadius: { xs: 2.5, sm: 3 },
            overflow: "hidden",
            bgcolor: "background.paper",
            boxShadow: "0 16px 48px rgba(0, 0, 0, 0.22)",
          },
        },
        backdrop: {
          sx: { backdropFilter: "blur(4px)", bgcolor: "rgba(0, 0, 0, 0.45)" },
        },
      }}
    >
      <IconButton
        onClick={onClose}
        aria-label="Fechar"
        sx={{
          position: "absolute",
          right: 6,
          top: 6,
          zIndex: 1,
          bgcolor: "rgba(0,0,0,0.45)",
          color: "common.white",
          "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
        }}
        size="small"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <DialogContent
        sx={{
          p: 0,
          position: "relative",
          display: "flex",
          justifyContent: "center",
          bgcolor: "grey.100",
        }}
      >
        <Box
          component="img"
          src="/fim-ge.jpeg"
          alt="Informações do fim de GE"
          sx={{
            display: "block",
            width: "100%",
            height: "auto",
            maxHeight: { xs: "min(68dvh, 480px)", sm: "min(72vh, 520px)" },
            objectFit: "contain",
            verticalAlign: "bottom",
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
