export type ButtonStatus = "pending" | "approved" | "rejected";

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "ghost" | "default" | "outline";
  className?: string;
  status?: ButtonStatus;
  disabled?: boolean;
}

export class ButtonDecorator {
  private props: ButtonProps;

  constructor(props: ButtonProps) {
    this.props = {
      ...props,
      variant: props.variant ?? "default",
      className: props.className ?? "",
    };
  }

  applyBaseStyle(): this {
    const baseStyle =
      "flex items-center gap-2 text-sm mt-5 hover:underline hover:cursor-pointer";
    this.props.className = `${baseStyle} ${this.props.className}`.trim();
    return this;
  }

  applyStatusTheme(): this {
    const statusTheme: Record<ButtonStatus, string> = {
      pending: "text-yellow-600",
      approved: "text-green-600",
      rejected: "text-red-600",
    };

    if (this.props.status) {
      this.props.className += ` ${statusTheme[this.props.status]}`;
    }

    return this;
  }

  withLogging(): this {
    const originalOnClick = this.props.onClick;
    this.props.onClick = () => {
      console.log(`[Button Clicked] ${this.props.label}`);
      originalOnClick();
    };
    return this;
  }

  validate(): this {
    if (!this.props.label || typeof this.props.onClick !== "function") {
      throw new Error("Invalid button configuration");
    }
    return this;
  }

  decorate(): ButtonProps {
    return {
      ...this.props,
    };
  }
}
