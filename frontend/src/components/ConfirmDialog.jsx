import Modal from './Modal.jsx';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
  loading = false,
  danger = true,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      description={description}
      maxWidth="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={danger ? 'btn-danger' : 'btn-primary'}
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    />
  );
}
