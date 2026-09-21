import { CalendarCheck, Navigation } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { Button, ButtonLink } from "../ui/Button";
import { ContentAction } from "../ContentAction";
import { useSite } from "../../content/ContentContext";
import { useActionLayer } from "../../actions/ActionLayer";
import { PhoneIcon } from "../ui/ContactIcons";

export function PlayBottomSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const site = useSite();
  const { requestContact } = useActionLayer();
  return (
    <BottomSheet open={open} onClose={onClose} title={site.mobileActions.quickActionsTitle}>
      <div className="flex flex-col gap-3">
        <ContentAction action={{ mode: "booking", label: site.mobileActions.bookCourtLabel }} onAction={onClose} modalDelayMs={300} variant="primary" size="lg" fullWidth icon={<CalendarCheck size={18} />} className="px-5 text-left" />
        <Button data-analytics-action="phone" onClick={() => { onClose(); window.setTimeout(() => requestContact('phone'), 300) }} variant="neutral" size="lg" fullWidth icon={<PhoneIcon size={18} />} className="justify-between px-5 text-left">{site.mobileActions.callLabel}</Button>
        <ButtonLink
          href={site.contacts.directionsURL ?? undefined}
          data-analytics-action="directions"
          target="_blank"
          rel="noreferrer"
          variant="neutral"
          size="lg"
          fullWidth
          icon={<Navigation size={18} />}
          className="justify-between px-5"
        >
          {site.mobileActions.directionsLabel}
        </ButtonLink>
      </div>
    </BottomSheet>
  );
}
