import { forwardRef, useState } from 'react';
import { IconButton, type IconButtonProps } from '../icon-button';
import { BarcodeScannerDialog, type BarcodeScannerDialogProps } from '../barcode-scanner-dialog';
import type { BarcodeFormat } from '../barcode-scanner-dialog';
import barCodeSvg from '../../assets/icons/bar-code.svg?raw';
import { svgIcon } from '../../icons/svgIcon';

export interface BarcodeScannerButtonProps
  extends Omit<IconButtonProps, 'icon' | 'label'>,
    Pick<BarcodeScannerDialogProps, 'onScanError' | 'formats' | 'allowManualEntry' | 'scanInterval' | 'decoder' | 'createDecoder'> {
  /** Called with the scanned (or manually entered) text and its format. */
  onScanSuccess: (text: string, format: BarcodeFormat | 'manual') => void;
  /** Accessible name and tooltip of the button. @default 'Scan barcode' */
  label?: string;
  /** Closes the scanner after a successful scan. @default true */
  closeOnScan?: boolean;
  /** Text overrides for the scanner dialog. */
  dialogLabels?: BarcodeScannerDialogProps['labels'];
  /** Called when the scanner dialog opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * An icon-only button (SAP `bar-code` icon) that opens the BarcodeScannerDialog and reports the result.
 * The camera starts only while the dialog is open.
 */
export const BarcodeScannerButton = forwardRef<HTMLButtonElement, BarcodeScannerButtonProps>(function BarcodeScannerButton(
  {
    onScanSuccess, onScanError, formats, allowManualEntry, scanInterval, decoder, createDecoder,
    label = 'Scan barcode', closeOnScan = true, dialogLabels, onOpenChange, onClick, ...rest
  },
  ref,
) {
  const [open, setOpen] = useState(false);
  const change = (next: boolean) => { setOpen(next); onOpenChange?.(next); };
  return (
    <>
      <IconButton
        ref={ref}
        icon={svgIcon(barCodeSvg, 'bar-code')}
        label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) change(true); }}
        {...rest}
      />
      <BarcodeScannerDialog
        open={open}
        onClose={() => change(false)}
        onScanSuccess={(text, format) => { onScanSuccess(text, format); if (closeOnScan) change(false); }}
        onScanError={onScanError}
        formats={formats}
        allowManualEntry={allowManualEntry}
        scanInterval={scanInterval}
        decoder={decoder}
        createDecoder={createDecoder}
        labels={dialogLabels}
      />
    </>
  );
});
