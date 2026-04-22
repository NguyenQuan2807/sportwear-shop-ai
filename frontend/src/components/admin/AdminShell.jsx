export const AdminPageHeader = ({ title, description, action, breadcrumbs = [] }) => {
  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white px-6 py-6 shadow-sm sm:px-7">
      {breadcrumbs.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-400">
          {breadcrumbs.map((item, index) => (
            <div key={`${item}-${index}`} className="flex items-center gap-2">
              <span className={index === breadcrumbs.length - 1 ? "font-medium text-slate-600" : ""}>{item}</span>
              {index < breadcrumbs.length - 1 ? <span>/</span> : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
};

export const AdminCard = ({ title, description, action, children, className = "" }) => {
  return (
    <section className={`rounded-[28px] border border-slate-200/70 bg-white shadow-sm ${className}`}>
      {(title || description || action) && (
        <div className="flex flex-col gap-4 border-b border-slate-200/70 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <h2 className="text-lg font-semibold text-slate-900">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
};

export const AdminMetricCard = ({ label, value, helper, tone = "brand", icon }) => {
  const tones = {
    brand: "from-indigo-600 via-indigo-500 to-blue-500",
    emerald: "from-emerald-600 via-emerald-500 to-teal-500",
    amber: "from-amber-500 via-orange-500 to-red-500",
    violet: "from-violet-600 via-fuchsia-500 to-pink-500",
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200/60 bg-white p-5 shadow-sm">
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${tones[tone] || tones.brand}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
          {helper ? <p className="mt-2 text-sm text-slate-500">{helper}</p> : null}
        </div>
        {icon ? <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">{icon}</div> : null}
      </div>
    </div>
  );
};

export const AdminTableShell = ({ children }) => {
  return <div className="overflow-hidden rounded-[24px] border border-slate-200/80">{children}</div>;
};

export const AdminButton = ({ children, className = "", variant = "primary", ...props }) => {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    light: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    brand: "bg-indigo-600 text-white hover:bg-indigo-700",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    warning: "bg-amber-400 text-slate-900 hover:bg-amber-500",
    danger: "bg-rose-500 text-white hover:bg-rose-600",
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
};

export const AdminAlert = ({ type = "info", children }) => {
  const tones = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    error: "border-rose-200 bg-rose-50 text-rose-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${tones[type] || tones.info}`}>{children}</div>;
};

export const AdminFilterLabel = ({ children }) => (
  <label className="mb-2 block text-sm font-medium text-slate-700">{children}</label>
);

export const adminInputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100";

export const adminTextareaClassName = `${adminInputClassName} min-h-[120px] resize-y`;

export const statusPillClassName = (tone = "neutral") => {
  const tones = {
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
  };

  return `inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone] || tones.neutral}`;
};
