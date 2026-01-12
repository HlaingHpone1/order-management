import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteModalStore } from "@/stores/useDeleteStore";
import { CircleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

type DeleteDialogProps = {
  title: string;
  description: string;
  handleDelete: () => void;
};

const DeleteDialog = ({
  title,
  description,
  handleDelete,
}: DeleteDialogProps) => {
  const t = useTranslations();

  const open = useDeleteModalStore((state) => state.open);

  const setOpen = useDeleteModalStore((state) => state.setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="hide-scroll-bar min-h-[20vh] w-full overflow-y-auto border-none p-8 pt-6 sm:max-w-sm">
        <div className="flex justify-center">
          <CircleAlert className="text-destructive size-24" />
        </div>
        <DialogHeader>
          <DialogTitle className="font-roboto-slab text-center text-3xl">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex gap-5">
          <Button
            className="flex-1"
            variant="destructive"
            onClick={handleDelete}
          >
            {t("button.delete")}
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setOpen(false)}
          >
            {t("button.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
