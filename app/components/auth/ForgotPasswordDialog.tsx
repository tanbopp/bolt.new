import { Button } from '~/components/ui/Button';
import { Dialog, DialogDescription, DialogRoot, DialogTitle } from '~/components/ui/Dialog';

export type ForgotPasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Penjelasan untuk tautan "Lupa password?" pada form login.
 *
 * Reset password via email (Supabase `resetPasswordForEmail`) **tidak** termasuk
 * scope Tahapan 1 (lihat PRD §2.1) sehingga alurnya belum dibuat. Dialog ini
 * dipakai supaya tautan pada struktur visual §7.1 tetap tersedia tanpa
 * mengarah ke route yang belum ada.
 */
export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <Dialog onClose={() => onOpenChange(false)}>
        <DialogTitle>Lupa password</DialogTitle>
        <DialogDescription>
          Reset password lewat email belum tersedia pada tahap ini. Hubungi admin platform untuk mengatur ulang akses
          akun kamu.
        </DialogDescription>
        <div className="flex justify-end gap-2 px-5 pb-5">
          <Button variant="secondary" size="md" onClick={() => onOpenChange(false)}>
            Mengerti
          </Button>
        </div>
      </Dialog>
    </DialogRoot>
  );
}
