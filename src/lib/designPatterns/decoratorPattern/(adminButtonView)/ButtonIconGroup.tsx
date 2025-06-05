import { Button } from "@/components/ui/button";
import { ButtonDecorator } from "@/lib/designPatterns/decoratorPattern/(adminButtonView)/ButtonDecorate";
import {
  Clock,
  CheckCircle2,
  XCircle,
  PowerIcon,
  PowerOff,
} from "lucide-react";

type Props = {
  fetchProducts: (status: "pending" | "approved" | "rejected" | "active" | "inactive") => void;
};

export default function StatusIconButtonGroup({ fetchProducts }: Props) {
  const buttons = [
    { status: "pending", icon: <Clock className="h-4 w-4" /> },
    { status: "approved", icon: <CheckCircle2 className="h-4 w-4" /> },
    { status: "rejected", icon: <XCircle className="h-4 w-4" /> },
    { status: "active", icon: <PowerIcon className="h-4 w-4" /> },
    { status: "inactive", icon: <PowerOff className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="flex justify-end">
      {buttons.map(({ status, icon }) => {
        const decorator = new ButtonDecorator({
          icon,
          status,
          onClick: () => fetchProducts(status),
          variant: "ghost",
        });

        const props = decorator
          .validate()
          .applyBaseIconStyle()
          .applyStatusColor()
          .withLogging()
          .decorate();

        return (
          <Button
            key={status}
            onClick={props.onClick}
            variant={props.variant}
            className={props.className}
            disabled={props.disabled}
          >
            {props.icon}
          </Button>
        );
      })}
    </div>
  );
}
