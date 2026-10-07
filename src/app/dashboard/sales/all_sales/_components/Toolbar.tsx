import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import React from "react";

const ModalEditor = () => {
  return (
    <div>
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Editor</DialogTitle>
          AAAA
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModalEditor;
