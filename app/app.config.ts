export default defineAppConfig({
  ui: {
    colors: {
      primary: "sky",
      secondary: "cyan",
      success: "emerald",
      warning: "orange",
      error: "red",
      info: "cyan",
      neutral: "slate",
    },
    button: {
      defaultVariants: {
        color: "primary",
      },
    },
    card: {
      slots: {
        root: "rounded-xl",
      },
    },
    input: {
      defaultVariants: {
        color: "primary",
        size: "lg",
      },
      slots: {
        root: "w-full",
      },
    },
  },
});
