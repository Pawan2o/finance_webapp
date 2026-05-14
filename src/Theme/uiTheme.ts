export const uiTheme = {
  buttons: {
    primary: "rounded-lg",
    secondary: "rounded-lg",
    destructive: "rounded-lg",
  },
  fields: {
    input: "rounded-lg border-slate-200 bg-white text-slate-900",
    select:
      "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-[border-color,box-shadow] focus:border-ring focus:ring-[3px] focus:ring-ring/50",
    textarea:
      "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-[border-color,box-shadow] focus:border-ring focus:ring-[3px] focus:ring-ring/50",
    checkbox: "w-4 h-4 rounded border-slate-300 text-primary",
    helperText: "mt-1 text-xs text-slate-600",
    label: "mb-1 block text-sm font-medium text-slate-800",
  },
  surfaces: {
    pageCard: "rounded-xl bg-white p-6 shadow-sm",
    modal: "rounded-xl bg-white p-6",
  },
  text: {
    sectionTitle: "text-xl font-semibold text-slate-900",
    modalTitle: "text-lg font-semibold text-slate-950",
    tableHead: "text-xs font-medium uppercase text-slate-700",
    bodyMuted: "text-slate-700",
    bodySubtle: "text-slate-600",
  },
} as const;
