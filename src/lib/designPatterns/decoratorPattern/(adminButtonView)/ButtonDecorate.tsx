import React from "react";

type ButtonStatus = "pending" | "approved" | "rejected" | "active" | "inactive";

interface ButtonProps {
  label?: string;
  icon?: React.ReactNode;
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

  validate(): this {
    if (!this.props.onClick || typeof this.props.onClick !== "function") {
      throw new Error("Button must have a valid onClick function");
    }
    return this;
  }

  applyBaseIconStyle(): this {
    const base = "flex items-center gap-2 text-sm font-extrabold ml-3 mt-2";
    this.props.className = `${base} ${this.props.className}`.trim();
    return this;
  }

  applyStatusColor(): this {
    const colorMap: Record<ButtonStatus, string> = {
      pending: "text-yellow-500 bg-yellow-100",
      approved: "text-green-500 bg-green-100",
      rejected: "text-red-500 bg-red-100",
      active: "text-blue-500 bg-blue-100",
      inactive: "text-gray-500 bg-gray-100",
    };

    if (this.props.status) {
      this.props.className += ` ${colorMap[this.props.status]}`;
    }

    return this;
  }

  withLogging(): this {
    const original = this.props.onClick;
    this.props.onClick = () => {
      console.log(`[Button Clicked: ${this.props.status}]`);
      original();
    };
    return this;
  }

  decorate(): ButtonProps {
    return {
      ...this.props,
    };
  }
}
