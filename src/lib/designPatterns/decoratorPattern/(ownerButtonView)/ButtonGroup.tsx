import { Button } from "@/components/ui/button";
import { ButtonDecorator , ButtonStatus} from "@/lib/designPatterns/decoratorPattern/(ownerButtonView)/ButtonDecorate";

type Props = {
  fetchProducts: (status: "pending" | "approved" | "rejected") => void;
};

export default function ButtonGroup({ fetchProducts }: Props) {
  const buttons = [
    { label: "Approved", status: "approved" },
    { label: "Pending", status: "pending" },
    { label: "Rejected", status: "rejected" },
  ];

  return (
    <div className="flex justify-start">
      {buttons.map(({ label, status }, index) => {
        const decorator = new ButtonDecorator({
          label,
          status: status as ButtonStatus,
          onClick: () => fetchProducts(status as "approved" | "pending" | "rejected"),
          variant: "ghost",
          className: index > 0 ? "ml-3" : "",
        });

        const props = decorator
          .validate()
          .applyBaseStyle()
          .applyStatusTheme()
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
            {props.label}
          </Button>
        );
      })}
    </div>
  );
}
